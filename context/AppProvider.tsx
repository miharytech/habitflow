import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import * as Haptics from 'expo-haptics';

import { isAdMobAvailable, showInterstitial, showRewardedAd } from '@/lib/ads';
import { createId, isOnLocalDay, msUntilNextLocalMidnight, todayKey } from '@/lib/dates';
import {
  applyTodayAwards,
  celebrationIsEmpty,
  dailyGoalProgress,
  habitStreak,
  hasTrackableContent,
  isDailyGoalMet,
  settleStreak,
  syncWaterDay,
  waterMlOnDay,
  type Celebration,
} from '@/lib/gamification';
import { ThemePreferenceProvider } from '@/context/ThemeContext';
import { syncReminderPlan, syncWaterReminders } from '@/lib/notifications';
import { emptyState, loadState, scheduleSave } from '@/lib/storage';
import {
  DEFAULT_REMINDER_HOURS,
  FREE_HABIT_LIMIT,
  MAX_EXTRA_HABIT_SLOTS,
  MAX_HABIT_NAME_LENGTH,
  MAX_STREAK_FREEZES,
  MAX_WATER_GOAL_ML,
  MIN_WATER_GOAL_ML,
  REWARD_EXTRA_SLOTS,
  XP_PER_HABIT,
  type DailyGoalCount,
  type Habit,
  type PersistedState,
  type ThemePreference,
} from '@/lib/types';

type AppContextValue = {
  ready: boolean;
  today: string;
  state: PersistedState;
  waterTodayMl: number;
  habitLimit: number;
  canAddHabit: boolean;
  celebration: Celebration | null;
  addWater: (ml: number) => Promise<void>;
  undoWater: () => void;
  toggleHabit: (id: string) => void;
  isHabitDone: (id: string) => boolean;
  streak: (id: string) => number;
  addHabit: (name: string, emoji: string) => 'ok' | 'limit';
  editHabit: (id: string, name: string, emoji: string) => boolean;
  deleteHabit: (id: string) => void;
  unlockMoreHabits: () => Promise<boolean>;
  unlockStreakFreeze: () => Promise<'ok' | 'full' | 'failed'>;
  setWaterGoal: (ml: number) => void;
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
  setWaterTrackingEnabled: (enabled: boolean) => Promise<void>;
  setDailyGoalCount: (count: DailyGoalCount) => void;
  setIncludeWaterInDailyGoal: (enabled: boolean) => void;
  setThemePreference: (preference: ThemePreference) => void;
  resetAllData: () => Promise<void>;
  dismissCelebration: () => void;
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
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const stateRef = useRef<PersistedState | null>(null);
  const pendingWaterAd = useRef(false);
  const today = useLocalToday();

  // Every write goes through `commit` so `stateRef` stays the single source of
  // truth callers can read back synchronously. Deriving the next state inside a
  // `setState` updater instead would be unreliable: React only evaluates an
  // updater eagerly when no other update is pending, so anything a caller reads
  // right afterwards (a celebration, an unlock result) could silently be lost.
  const commit = useCallback((next: PersistedState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const update = useCallback(
    (recipe: (current: PersistedState) => PersistedState) => {
      const current = stateRef.current;
      if (!current) return;
      commit(recipe(current));
    },
    [commit]
  );

  const applyMutation = useCallback(
    (
      recipe: (current: PersistedState) => PersistedState,
      options?: { celebrate?: boolean; extraXp?: number }
    ): Celebration | null => {
      const current = stateRef.current;
      if (!current) return null;

      const previousXp = current.xpTotal;
      let mutated = recipe(current);
      if (options?.extraXp) {
        mutated = { ...mutated, xpTotal: Math.max(0, mutated.xpTotal + options.extraXp) };
      }
      const awarded = applyTodayAwards(mutated, today, previousXp);
      const nextCelebration: Celebration = {
        ...awarded.celebration,
        xpDelta: awarded.celebration.xpDelta + (options?.extraXp ?? 0),
      };
      commit(awarded.state);

      if (options?.celebrate && !celebrationIsEmpty(nextCelebration)) {
        setCelebration(nextCelebration);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
        return nextCelebration;
      }
      return null;
    },
    [commit, today]
  );

  useEffect(() => {
    let cancelled = false;
    loadState()
      .then((loaded) => {
        const day = todayKey();
        return applyTodayAwards(settleStreak(loaded, day), day).state;
      })
      .catch(() => emptyState())
      .then((next) => {
        if (cancelled) return;
        commit(next);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [commit]);

  useEffect(() => {
    if (!ready) return;
    update((prev) => applyTodayAwards(settleStreak(prev, today), today).state);
  }, [ready, today, update]);

  useEffect(() => {
    if (!state) return;
    scheduleSave(state);
  }, [state]);

  // Rescheduling means cancelling and re-registering every reminder, so key the
  // effect on the plan's contents rather than on `state`: a single sip of water
  // used to tear down and rebuild the whole notification set.
  const reminderPlan = useMemo(() => {
    if (!state) return null;
    return {
      waterEnabled: state.waterTrackingEnabled && state.remindersEnabled,
      waterHours: state.reminderHours,
      streakAtRisk:
        state.appStreak > 0 && !isDailyGoalMet(state, today) && hasTrackableContent(state),
      streakCount: state.appStreak,
    };
  }, [state, today]);
  const reminderPlanKey = reminderPlan ? JSON.stringify(reminderPlan) : '';
  const reminderPlanRef = useRef(reminderPlan);
  reminderPlanRef.current = reminderPlan;

  useEffect(() => {
    const plan = reminderPlanRef.current;
    if (!ready || !plan) return;
    void syncReminderPlan(plan).then((result) => {
      if (plan.waterEnabled && !result.waterScheduled) {
        update((prev) => ({ ...prev, remindersEnabled: false }));
      }
    });
  }, [ready, reminderPlanKey, update]);

  const waterTodayMl = useMemo(() => {
    if (!state) return 0;
    return waterMlOnDay(state, today);
  }, [state, today]);

  const habitLimit = (state?.extraHabitSlots ?? 0) + FREE_HABIT_LIMIT;
  const canAddHabit = (state?.habits.length ?? 0) < habitLimit;

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
    if (pendingWaterAd.current) {
      pendingWaterAd.current = false;
      void showInterstitial();
    }
  }, []);

  const value = useMemo<AppContextValue>(() => {
    const current = state ?? emptyState();

    return {
      ready,
      today,
      state: current,
      waterTodayMl,
      habitLimit,
      canAddHabit,
      celebration,
      addWater: async (ml) => {
        if (!Number.isFinite(ml) || ml <= 0) return;
        if (!current.waterTrackingEnabled) return;
        let shouldShowAd = false;
        const shown = applyMutation(
          (prev) => {
            const todayMl = prev.waterLogs
              .filter((log) => isOnLocalDay(log.at, today))
              .reduce((sum, log) => sum + log.ml, 0);
            const nextTotal = todayMl + ml;
            const reachedGoal = todayMl < prev.waterGoalMl && nextTotal >= prev.waterGoalMl;
            const alreadyShown = prev.lastGoalAdDate === today;
            if (reachedGoal && !alreadyShown) shouldShowAd = true;
            return syncWaterDay(
              {
                ...prev,
                waterLogs: [
                  ...prev.waterLogs,
                  { id: createId(), ml, at: new Date().toISOString() },
                ],
                lastGoalAdDate: reachedGoal && !alreadyShown ? today : prev.lastGoalAdDate,
              },
              today
            );
          },
          { celebrate: true }
        );
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
        if (shouldShowAd) {
          if (shown) pendingWaterAd.current = true;
          else await showInterstitial();
        }
      },
      undoWater: () => {
        applyMutation((prev) => {
          const todayLogs = prev.waterLogs.filter((log) => isOnLocalDay(log.at, today));
          const last = todayLogs[todayLogs.length - 1];
          if (!last) return prev;
          return syncWaterDay(
            { ...prev, waterLogs: prev.waterLogs.filter((log) => log.id !== last.id) },
            today
          );
        });
      },
      toggleHabit: (id) => {
        Haptics.selectionAsync().catch(() => undefined);
        const exists = current.completions.some((item) => item.habitId === id && item.date === today);
        applyMutation(
          (prev) => ({
            ...prev,
            completions: exists
              ? prev.completions.filter((item) => !(item.habitId === id && item.date === today))
              : [...prev.completions, { habitId: id, date: today }],
          }),
          { celebrate: !exists, extraXp: exists ? -XP_PER_HABIT : XP_PER_HABIT }
        );
      },
      isHabitDone: (id) =>
        current.completions.some((item) => item.habitId === id && item.date === today),
      streak: (id) => habitStreak(current, id, today),
      addHabit: (name, emoji) => {
        const trimmed = name.trim().slice(0, MAX_HABIT_NAME_LENGTH);
        if (!trimmed) return 'limit';
        let result: 'ok' | 'limit' = 'limit';
        applyMutation((prev) => {
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
      editHabit: (id, name, emoji) => {
        const trimmed = name.trim().slice(0, MAX_HABIT_NAME_LENGTH);
        if (!trimmed) return false;
        let found = false;
        update((prev) => ({
          ...prev,
          habits: prev.habits.map((habit) => {
            if (habit.id !== id) return habit;
            found = true;
            return { ...habit, name: trimmed, emoji: emoji.trim() || '✅' };
          }),
        }));
        return found;
      },
      deleteHabit: (id) => {
        const doneToday = current.completions.some((item) => item.habitId === id && item.date === today);
        applyMutation(
          (prev) => ({
            ...prev,
            habits: prev.habits.filter((habit) => habit.id !== id),
            completions: prev.completions.filter((item) => item.habitId !== id),
          }),
          { extraXp: doneToday ? -XP_PER_HABIT : 0 }
        );
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
      unlockStreakFreeze: async () => {
        if ((stateRef.current?.streakFreezes ?? 0) >= MAX_STREAK_FREEZES) return 'full';
        const grant = () => {
          let result: 'ok' | 'full' = 'full';
          update((prev) => {
            if (prev.streakFreezes >= MAX_STREAK_FREEZES) {
              result = 'full';
              return prev;
            }
            result = 'ok';
            return { ...prev, streakFreezes: prev.streakFreezes + 1 };
          });
          return result;
        };
        if (!isAdMobAvailable()) {
          if (__DEV__) return grant();
          return 'failed';
        }
        const rewarded = await showRewardedAd();
        if (!rewarded) return 'failed';
        return grant();
      },
      setWaterGoal: (ml) => {
        const next = Math.min(MAX_WATER_GOAL_ML, Math.max(MIN_WATER_GOAL_ML, ml));
        applyMutation((prev) => ({ ...prev, waterGoalMl: next }), { celebrate: true });
      },
      setRemindersEnabled: async (enabled) => {
        if (!stateRef.current?.waterTrackingEnabled) {
          update((prev) => ({ ...prev, remindersEnabled: false }));
          return;
        }
        const hours = stateRef.current?.reminderHours ?? DEFAULT_REMINDER_HOURS;
        const scheduled = await syncWaterReminders(enabled, hours);
        update((prev) => ({ ...prev, remindersEnabled: enabled && scheduled }));
      },
      setWaterTrackingEnabled: async (enabled) => {
        if (!enabled) {
          await syncWaterReminders(false, stateRef.current?.reminderHours ?? DEFAULT_REMINDER_HOURS);
        }
        applyMutation((prev) => ({
          ...prev,
          waterTrackingEnabled: enabled,
          includeWaterInDailyGoal: enabled ? prev.includeWaterInDailyGoal : false,
          remindersEnabled: enabled ? prev.remindersEnabled : false,
        }));
      },
      setDailyGoalCount: (count) => {
        applyMutation((prev) => ({ ...prev, dailyGoalCount: count }), { celebrate: true });
      },
      setIncludeWaterInDailyGoal: (enabled) => {
        applyMutation(
          (prev) => ({
            ...prev,
            includeWaterInDailyGoal: prev.waterTrackingEnabled && enabled,
          }),
          { celebrate: true }
        );
      },
      setThemePreference: (preference) => {
        update((prev) => ({ ...prev, themePreference: preference }));
      },
      resetAllData: async () => {
        await syncWaterReminders(false, stateRef.current?.reminderHours ?? DEFAULT_REMINDER_HOURS);
        setCelebration(null);
        commit(emptyState());
      },
      dismissCelebration,
    };
  }, [
    applyMutation,
    canAddHabit,
    celebration,
    commit,
    dismissCelebration,
    habitLimit,
    ready,
    state,
    today,
    update,
    waterTodayMl,
  ]);

  return (
    <AppContext.Provider value={value}>
      <ThemePreferenceProvider preference={value.state.themePreference}>
        {children}
      </ThemePreferenceProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

export function useHabits(): Habit[] {
  return useApp().state.habits;
}

export function useDailyProgress() {
  const { state, today } = useApp();
  return dailyGoalProgress(state, today);
}
