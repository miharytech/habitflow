import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import * as Haptics from 'expo-haptics';

import { isAdMobAvailable, showInterstitial, showRewardedAd } from '@/lib/ads';
import { addDays, todayKey } from '@/lib/dates';
import { syncWaterReminders } from '@/lib/notifications';
import { loadState, saveState } from '@/lib/storage';
import {
  FREE_HABIT_LIMIT,
  REWARD_EXTRA_SLOTS,
  type Habit,
  type PersistedState,
} from '@/lib/types';

type AppContextValue = {
  ready: boolean;
  today: string;
  state: PersistedState;
  waterTodayMl: number;
  habitLimit: number;
  canAddHabit: boolean;
  addWater: (ml: number) => Promise<void>;
  undoWater: () => void;
  toggleHabit: (id: string) => void;
  isHabitDone: (id: string) => boolean;
  streak: (id: string) => number;
  addHabit: (name: string, emoji: string) => 'ok' | 'limit';
  deleteHabit: (id: string) => void;
  unlockMoreHabits: () => Promise<boolean>;
  setWaterGoal: (ml: number) => void;
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedState | null>(null);
  const today = todayKey();

  useEffect(() => {
    loadState().then((loaded) => {
      setState(loaded);
      setReady(true);
      if (loaded.remindersEnabled) {
        syncWaterReminders(true, loaded.reminderHours).catch(() => undefined);
      }
    });
  }, []);

  useEffect(() => {
    if (!state) return;
    saveState(state).catch(() => undefined);
  }, [state]);

  const update = useCallback((recipe: (current: PersistedState) => PersistedState) => {
    setState((current) => (current ? recipe(current) : current));
  }, []);

  const waterTodayMl = useMemo(() => {
    if (!state) return 0;
    return state.waterLogs
      .filter((log) => log.at.startsWith(today))
      .reduce((sum, log) => sum + log.ml, 0);
  }, [state, today]);

  const habitLimit = (state?.extraHabitSlots ?? 0) + FREE_HABIT_LIMIT;
  const canAddHabit = (state?.habits.length ?? 0) < habitLimit;

  const value = useMemo<AppContextValue>(() => {
    const current = state ?? {
      waterGoalMl: 2000,
      glassMl: 250,
      extraHabitSlots: 0,
      remindersEnabled: false,
      reminderHours: [],
      habits: [],
      waterLogs: [],
      completions: [],
    };

    return {
      ready,
      today,
      state: current,
      waterTodayMl,
      habitLimit,
      canAddHabit,
      addWater: async (ml) => {
        const nextTotal = waterTodayMl + ml;
        const reachedGoal =
          waterTodayMl < current.waterGoalMl && nextTotal >= current.waterGoalMl;
        update((prev) => ({
          ...prev,
          waterLogs: [
            ...prev.waterLogs,
            { id: `${Date.now()}`, ml, at: new Date().toISOString() },
          ],
        }));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        if (reachedGoal && current.lastGoalAdDate !== today) {
          const shown = await showInterstitial();
          if (shown) {
            update((prev) => ({ ...prev, lastGoalAdDate: today }));
          }
        }
      },
      undoWater: () => {
        update((prev) => {
          const todayLogs = prev.waterLogs.filter((log) => log.at.startsWith(today));
          const last = todayLogs[todayLogs.length - 1];
          if (!last) return prev;
          return { ...prev, waterLogs: prev.waterLogs.filter((log) => log.id !== last.id) };
        });
      },
      toggleHabit: (id) => {
        Haptics.selectionAsync().catch(() => undefined);
        update((prev) => {
          const exists = prev.completions.some(
            (item) => item.habitId === id && item.date === today
          );
          return {
            ...prev,
            completions: exists
              ? prev.completions.filter((item) => !(item.habitId === id && item.date === today))
              : [...prev.completions, { habitId: id, date: today }],
          };
        });
      },
      isHabitDone: (id) =>
        current.completions.some((item) => item.habitId === id && item.date === today),
      streak: (id) => {
        const done = new Set(
          current.completions.filter((item) => item.habitId === id).map((item) => item.date)
        );
        let cursor = today;
        if (!done.has(today)) cursor = addDays(today, -1);
        let count = 0;
        while (done.has(cursor)) {
          count += 1;
          cursor = addDays(cursor, -1);
        }
        return count;
      },
      addHabit: (name, emoji) => {
        if (current.habits.length >= current.extraHabitSlots + FREE_HABIT_LIMIT) return 'limit';
        update((prev) => ({
          ...prev,
          habits: [
            ...prev.habits,
            {
              id: `${Date.now()}`,
              name: name.trim(),
              emoji: emoji.trim() || '✅',
              createdAt: new Date().toISOString(),
            },
          ],
        }));
        return 'ok';
      },
      deleteHabit: (id) => {
        update((prev) => ({
          ...prev,
          habits: prev.habits.filter((habit) => habit.id !== id),
          completions: prev.completions.filter((item) => item.habitId !== id),
        }));
      },
      unlockMoreHabits: async () => {
        if (!isAdMobAvailable()) {
          if (__DEV__) {
            update((prev) => ({
              ...prev,
              extraHabitSlots: prev.extraHabitSlots + REWARD_EXTRA_SLOTS,
            }));
            return true;
          }
          return false;
        }
        const rewarded = await showRewardedAd();
        if (!rewarded) return false;
        update((prev) => ({ ...prev, extraHabitSlots: prev.extraHabitSlots + REWARD_EXTRA_SLOTS }));
        return true;
      },
      setWaterGoal: (ml) => {
        update((prev) => ({ ...prev, waterGoalMl: Math.max(500, ml) }));
      },
      setRemindersEnabled: async (enabled) => {
        await syncWaterReminders(enabled, current.reminderHours);
        update((prev) => ({ ...prev, remindersEnabled: enabled }));
      },
    };
  }, [canAddHabit, habitLimit, ready, state, today, update, waterTodayMl]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

export function useHabits(): Habit[] {
  return useApp().state.habits;
}
