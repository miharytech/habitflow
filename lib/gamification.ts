import { addDays, localDayOf } from '@/lib/dates';
import {
  GEMS_DAILY_GOAL,
  GEMS_PERFECT_DAY,
  MAX_STREAK_FREEZES,
  XP_DAILY_BONUS,
  XP_PER_LEVEL,
  XP_WATER_GOAL,
  type DailyGoalCount,
  type PersistedState,
} from '@/lib/types';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
};

export type Celebration = {
  dailyGoal: boolean;
  perfectDay: boolean;
  levelUpTo?: number;
  achievements: Achievement[];
  xpDelta: number;
  gemsDelta: number;
  streak: number;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_goal', title: 'First win', description: 'Hit your daily goal', emoji: '🎯' },
  { id: 'streak_3', title: 'On a roll', description: 'Reach a 3-day streak', emoji: '🔥' },
  { id: 'streak_7', title: 'Week warrior', description: 'Reach a 7-day streak', emoji: '🗓️' },
  { id: 'streak_14', title: 'Two-week flame', description: 'Reach a 14-day streak', emoji: '🌟' },
  { id: 'streak_30', title: 'Monthly legend', description: 'Reach a 30-day streak', emoji: '🏆' },
  { id: 'streak_100', title: 'Centurion', description: 'Reach a 100-day streak', emoji: '💯' },
  { id: 'first_perfect', title: 'Perfect day', description: 'Finish every habit and water', emoji: '✨' },
  { id: 'level_5', title: 'Level 5', description: 'Reach level 5', emoji: '⭐' },
  { id: 'level_10', title: 'Level 10', description: 'Reach level 10', emoji: '💎' },
  { id: 'hydrate_7', title: 'Hydrated week', description: 'Hit your water goal 7 days in a row', emoji: '💧' },
];

const ACHIEVEMENT_BY_ID = new Map(ACHIEVEMENTS.map((item) => [item.id, item]));
const STREAK_FREEZE_MILESTONES = [7, 30];
const MAX_SETTLE_DAYS = 400;

export function requiredHabitCount(state: PersistedState) {
  if (state.habits.length === 0) return 0;
  if (state.dailyGoalCount === 'all') return state.habits.length;
  return Math.min(state.dailyGoalCount, state.habits.length);
}

export function hasTrackableContent(state: PersistedState) {
  return state.habits.length > 0 || state.waterTrackingEnabled;
}

export function waterMlOnDay(state: PersistedState, date: string) {
  return state.waterLogs
    .filter((log) => localDayOf(log.at) === date)
    .reduce((sum, log) => sum + log.ml, 0);
}

export function habitsDoneOn(state: PersistedState, date: string) {
  const ids = new Set(state.habits.map((habit) => habit.id));
  const done = new Set<string>();
  for (const item of state.completions) {
    if (item.date === date && ids.has(item.habitId)) done.add(item.habitId);
  }
  return done.size;
}

export function isWaterGoalMet(state: PersistedState, date: string) {
  if (!state.waterTrackingEnabled) return false;
  return waterMlOnDay(state, date) >= state.waterGoalMl;
}

export function isDailyGoalMet(state: PersistedState, date: string) {
  if (!hasTrackableContent(state)) return false;
  const need = requiredHabitCount(state);
  if (need === 0 && state.waterTrackingEnabled) return isWaterGoalMet(state, date);
  if (habitsDoneOn(state, date) < need) return false;
  if (state.waterTrackingEnabled && state.includeWaterInDailyGoal) return isWaterGoalMet(state, date);
  return true;
}

export function isPerfectDay(state: PersistedState, date: string) {
  if (state.habits.length === 0) {
    return state.waterTrackingEnabled && isWaterGoalMet(state, date);
  }
  const allHabits = habitsDoneOn(state, date) === state.habits.length;
  if (!allHabits) return false;
  if (!state.waterTrackingEnabled) return true;
  return isWaterGoalMet(state, date);
}

export type DailyGoalProgress = {
  done: number;
  need: number;
  waterRequired: boolean;
  waterMet: boolean;
  met: boolean;
  perfect: boolean;
};

export function dailyGoalProgress(state: PersistedState, date: string): DailyGoalProgress {
  const need = requiredHabitCount(state);
  const done = habitsDoneOn(state, date);
  const waterRequired = state.waterTrackingEnabled && (state.includeWaterInDailyGoal || need === 0);
  const waterMet = isWaterGoalMet(state, date);
  return {
    done,
    need,
    waterRequired,
    waterMet,
    met: isDailyGoalMet(state, date),
    perfect: isPerfectDay(state, date),
  };
}

export function levelFromXp(xp: number) {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
}

export function xpIntoLevel(xp: number) {
  return Math.max(0, xp) % XP_PER_LEVEL;
}

export function celebrationIsEmpty(celebration: Celebration) {
  return (
    !celebration.dailyGoal &&
    !celebration.perfectDay &&
    celebration.levelUpTo == null &&
    celebration.achievements.length === 0
  );
}

export function settleStreak(state: PersistedState, today: string): PersistedState {
  if (state.lastSettledDate === today) return state;

  if (!state.lastSettledDate || state.lastSettledDate > today) {
    return { ...state, lastSettledDate: today };
  }

  let next = { ...state };
  let cursor = addDays(state.lastSettledDate, 1);
  let steps = 0;

  while (cursor < today && steps < MAX_SETTLE_DAYS) {
    if (!hasTrackableContent(next)) {
      cursor = addDays(cursor, 1);
      steps += 1;
      continue;
    }

    if (next.lastStreakDate === cursor) {
      cursor = addDays(cursor, 1);
      steps += 1;
      continue;
    }

    if (isDailyGoalMet(next, cursor)) {
      const previousStreak = next.appStreak;
      next = grantStreakFreezes(previousStreak, incrementStreak(next, cursor));
    } else if (next.appStreak > 0 && next.streakFreezes > 0) {
      next = {
        ...next,
        streakFreezes: next.streakFreezes - 1,
        lastStreakDate: cursor,
      };
    } else {
      next = { ...next, appStreak: 0 };
    }

    cursor = addDays(cursor, 1);
    steps += 1;
  }

  return { ...next, lastSettledDate: today };
}

export function applyTodayAwards(
  state: PersistedState,
  today: string,
  previousXp = state.xpTotal
): {
  state: PersistedState;
  celebration: Celebration;
} {
  const goalMet = isDailyGoalMet(state, today);
  const perfect = isPerfectDay(state, today);
  const waterMet = isWaterGoalMet(state, today);
  const previousLevel = levelFromXp(previousXp);

  let next = { ...state };
  let xpDelta = 0;
  let gemsDelta = 0;
  let dailyGoal = false;
  let perfectDay = false;

  if (waterMet && next.waterXpAwardedDate !== today) {
    next = { ...next, xpTotal: next.xpTotal + XP_WATER_GOAL, waterXpAwardedDate: today };
    xpDelta += XP_WATER_GOAL;
  } else if (!waterMet && next.waterXpAwardedDate === today) {
    next = {
      ...next,
      xpTotal: Math.max(0, next.xpTotal - XP_WATER_GOAL),
      waterXpAwardedDate: undefined,
    };
    xpDelta -= XP_WATER_GOAL;
  }

  if (goalMet && next.dailyGoalAwardedDate !== today) {
    const streaked = incrementStreak(next, today);
    next = {
      ...streaked,
      xpTotal: streaked.xpTotal + XP_DAILY_BONUS,
      gems: streaked.gems + GEMS_DAILY_GOAL,
      dailyGoalAwardedDate: today,
    };
    xpDelta += XP_DAILY_BONUS;
    gemsDelta += GEMS_DAILY_GOAL;
    dailyGoal = true;
  } else if (!goalMet && next.dailyGoalAwardedDate === today) {
    next = reverseTodayStreak(next, today);
    next = {
      ...next,
      xpTotal: Math.max(0, next.xpTotal - XP_DAILY_BONUS),
      gems: Math.max(0, next.gems - GEMS_DAILY_GOAL),
      dailyGoalAwardedDate: undefined,
    };
    xpDelta -= XP_DAILY_BONUS;
    gemsDelta -= GEMS_DAILY_GOAL;
  }

  if (perfect && next.perfectDayAwardedDate !== today) {
    next = {
      ...next,
      gems: next.gems + GEMS_PERFECT_DAY,
      perfectDayAwardedDate: today,
    };
    gemsDelta += GEMS_PERFECT_DAY;
    perfectDay = true;
  } else if (!perfect && next.perfectDayAwardedDate === today) {
    next = {
      ...next,
      gems: Math.max(0, next.gems - GEMS_PERFECT_DAY),
      perfectDayAwardedDate: undefined,
    };
    gemsDelta -= GEMS_PERFECT_DAY;
  }

  next = grantStreakFreezes(state.appStreak, next);
  const unlocked = newlyUnlockedAchievements(next, today);
  if (unlocked.length) {
    next = {
      ...next,
      unlockedAchievementIds: [...next.unlockedAchievementIds, ...unlocked.map((item) => item.id)],
    };
  }

  const levelUpTo = levelFromXp(next.xpTotal);
  const celebration: Celebration = {
    dailyGoal,
    perfectDay,
    levelUpTo: levelUpTo > previousLevel ? levelUpTo : undefined,
    achievements: unlocked,
    xpDelta,
    gemsDelta,
    streak: next.appStreak,
  };

  return { state: next, celebration };
}

export function habitStreak(state: PersistedState, habitId: string, today: string) {
  const done = new Set(
    state.completions.filter((item) => item.habitId === habitId).map((item) => item.date)
  );
  let cursor = today;
  if (!done.has(today)) cursor = addDays(today, -1);
  let count = 0;
  while (done.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function waterGoalStreak(state: PersistedState, today: string) {
  if (!state.waterTrackingEnabled) return 0;
  let cursor = today;
  if (!isWaterGoalMet(state, today)) cursor = addDays(today, -1);
  let count = 0;
  while (isWaterGoalMet(state, cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function parseDailyGoalCount(value: unknown): DailyGoalCount {
  if (value === 'all' || value === 1 || value === 2 || value === 3) return value;
  return 2;
}

export function clampFreezes(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_STREAK_FREEZES, Math.max(0, Math.floor(value)));
}

function incrementStreak(state: PersistedState, date: string): PersistedState {
  if (state.lastStreakDate === date) return state;
  const appStreak = state.appStreak + 1;
  return {
    ...state,
    appStreak,
    longestStreak: Math.max(state.longestStreak, appStreak),
    lastStreakDate: date,
  };
}

function reverseTodayStreak(state: PersistedState, today: string): PersistedState {
  if (state.lastStreakDate !== today) return state;
  const appStreak = Math.max(0, state.appStreak - 1);
  return {
    ...state,
    appStreak,
    lastStreakDate: appStreak > 0 ? addDays(today, -1) : undefined,
  };
}

function grantStreakFreezes(previousStreak: number, state: PersistedState): PersistedState {
  let extra = 0;
  for (const milestone of STREAK_FREEZE_MILESTONES) {
    if (previousStreak < milestone && state.appStreak >= milestone) extra += 1;
  }
  if (!extra) return state;
  return { ...state, streakFreezes: clampFreezes(state.streakFreezes + extra) };
}

function newlyUnlockedAchievements(state: PersistedState, today: string): Achievement[] {
  const have = new Set(state.unlockedAchievementIds);
  const unlocked: Achievement[] = [];
  const maybe = (id: string, ok: boolean) => {
    const def = ACHIEVEMENT_BY_ID.get(id);
    if (ok && def && !have.has(id)) unlocked.push(def);
  };

  maybe('first_goal', Boolean(state.dailyGoalAwardedDate));
  maybe('streak_3', state.appStreak >= 3 || state.longestStreak >= 3);
  maybe('streak_7', state.appStreak >= 7 || state.longestStreak >= 7);
  maybe('streak_14', state.appStreak >= 14 || state.longestStreak >= 14);
  maybe('streak_30', state.appStreak >= 30 || state.longestStreak >= 30);
  maybe('streak_100', state.appStreak >= 100 || state.longestStreak >= 100);
  maybe('first_perfect', Boolean(state.perfectDayAwardedDate));
  maybe('level_5', levelFromXp(state.xpTotal) >= 5);
  maybe('level_10', levelFromXp(state.xpTotal) >= 10);
  maybe('hydrate_7', waterGoalStreak(state, today) >= 7);
  return unlocked;
}
