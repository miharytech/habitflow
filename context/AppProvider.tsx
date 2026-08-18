import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import * as Haptics from 'expo-haptics';

import { isAdMobAvailable, showInterstitial, showRewardedAd } from '@/lib/ads';
import { addDays, createId, isOnLocalDay, msUntilNextLocalMidnight, todayKey } from '@/lib/dates';
import { syncWaterReminders } from '@/lib/notifications';
import { emptyState, loadState, scheduleSave } from '@/lib/storage';
import {
  DEFAULT_REMINDER_HOURS,
  FREE_HABIT_LIMIT,
  MAX_EXTRA_HABIT_SLOTS,
  MAX_HABIT_NAME_LENGTH,
  MAX_WATER_GOAL_ML,
  MIN_WATER_GOAL_ML,
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

function useLocalToday() {
  const [today, setToday] = useState(() => todayKey());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const schedule = () => {
      timeout = setTimeout(() => {
        setToday(todayKey());
        schedule();
      }, msUntilNextLocalMidnight());
    };

    schedule();
    const sub = AppState.addEventListener('change', (status) => {
      if (status === 'active') setToday(todayKey());
    });

    return () => {
      clearTimeout(timeout);
      sub.remove();
    };
  }, []);

  return today;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<PersistedState | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const today = useLocalToday();

  useEffect(() => {
    loadState()
      .then((loaded) => {
        setState(loaded);
        setReady(true);
        if (loaded.remindersEnabled) {
          syncWaterReminders(true, loaded.reminderHours)
            .then((scheduled) => {
              if (!scheduled) {
                setState((current) =>
                  current ? { ...current, remindersEnabled: false } : current
                );
              }
            })
            .catch(() => undefined);
        }
      })
      .catch(() => {
        setState(emptyState());
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!state) return;
    scheduleSave(state);
  }, [state]);

  const update = useCallback((recipe: (current: PersistedState) => PersistedState) => {
    setState((current) => (current ? recipe(current) : current));
  }, []);

  const waterTodayMl = useMemo(() => {
    if (!state) return 0;
    return state.waterLogs
      .filter((log) => isOnLocalDay(log.at, today))
      .reduce((sum, log) => sum + log.ml, 0);
  }, [state, today]);

  const habitLimit = (state?.extraHabitSlots ?? 0) + FREE_HABIT_LIMIT;
  const canAddHabit = (state?.habits.length ?? 0) < habitLimit;

  const value = useMemo<AppContextValue>(() => {
    const current = state ?? emptyState();

    return {
      ready,
      today,
      state: current,
      waterTodayMl,
      habitLimit,
      canAddHabit,
      addWater: async (ml) => {
        if (!Number.isFinite(ml) || ml <= 0) return;
        let shouldShowAd = false;
        update((prev) => {
          const todayMl = prev.waterLogs
            .filter((log) => isOnLocalDay(log.at, today))
            .reduce((sum, log) => sum + log.ml, 0);
          const nextTotal = todayMl + ml;
          const reachedGoal = todayMl < prev.waterGoalMl && nextTotal >= prev.waterGoalMl;
          const alreadyShown = prev.lastGoalAdDate === today;
          if (reachedGoal && !alreadyShown) shouldShowAd = true;
          return {
            ...prev,
            waterLogs: [...prev.waterLogs, { id: createId(), ml, at: new Date().toISOString() }],
            lastGoalAdDate: reachedGoal && !alreadyShown ? today : prev.lastGoalAdDate,
          };
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        if (shouldShowAd) {
          await showInterstitial();
        }
      },
      undoWater: () => {
        update((prev) => {
          const todayLogs = prev.waterLogs.filter((log) => isOnLocalDay(log.at, today));
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
        const trimmed = name.trim().slice(0, MAX_HABIT_NAME_LENGTH);
        if (!trimmed) return 'limit';
        let result: 'ok' | 'limit' = 'limit';
        setState((prev) => {
          if (!prev) return prev;
          if (prev.habits.length >= prev.extraHabitSlots + FREE_HABIT_LIMIT) {
            result = 'limit';
            return prev;
          }
          result = 'ok';
          return {
            ...prev,
            habits: [
              ...prev.habits,
              {
                id: createId(),
                name: trimmed,
                emoji: emoji.trim() || '✅',
                createdAt: new Date().toISOString(),
              },
            ],
          };
        });
        return result;
      },
      deleteHabit: (id) => {
        update((prev) => ({
          ...prev,
          habits: prev.habits.filter((habit) => habit.id !== id),
          completions: prev.completions.filter((item) => item.habitId !== id),
        }));
      },
      unlockMoreHabits: async () => {
        const grantSlots = () => {
          let granted = false;
          update((prev) => {
            if (prev.extraHabitSlots >= MAX_EXTRA_HABIT_SLOTS) {
              granted = true;
              return prev;
            }
            granted = true;
            return {
              ...prev,
              extraHabitSlots: Math.min(
                MAX_EXTRA_HABIT_SLOTS,
                prev.extraHabitSlots + REWARD_EXTRA_SLOTS
              ),
            };
          });
          return granted;
        };

        if (!isAdMobAvailable()) {
          if (__DEV__) return grantSlots();
          return false;
        }
        const rewarded = await showRewardedAd();
        if (!rewarded) return false;
        return grantSlots();
      },
      setWaterGoal: (ml) => {
        const next = Math.min(MAX_WATER_GOAL_ML, Math.max(MIN_WATER_GOAL_ML, ml));
        update((prev) => ({ ...prev, waterGoalMl: next }));
      },
      setRemindersEnabled: async (enabled) => {
        const hours = stateRef.current?.reminderHours ?? DEFAULT_REMINDER_HOURS;
        const scheduled = await syncWaterReminders(enabled, hours);
        update((prev) => ({ ...prev, remindersEnabled: enabled && scheduled }));
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
