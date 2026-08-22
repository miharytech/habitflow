export type Habit = {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
};

export type WaterLog = {
  id: string;
  ml: number;
  at: string;
};

export type HabitCompletion = {
  habitId: string;
  date: string;
};

export type DailyGoalCount = 1 | 2 | 3 | 'all';

export type PersistedState = {
  waterGoalMl: number;
  glassMl: number;
  extraHabitSlots: number;
  remindersEnabled: boolean;
  reminderHours: number[];
  habits: Habit[];
  waterLogs: WaterLog[];
  completions: HabitCompletion[];
  /**
   * All-time water history: local day key -> millilitres. Individual sips are
   * only kept for `WATER_LOG_RETENTION_DAYS`, so this rolled-up total is what
   * survives for long-range charts. Days with no water carry no entry.
   */
  waterDaily: Record<string, number>;
  lastGoalAdDate?: string;
  waterTrackingEnabled: boolean;
  xpTotal: number;
  gems: number;
  streakFreezes: number;
  dailyGoalCount: DailyGoalCount;
  includeWaterInDailyGoal: boolean;
  appStreak: number;
  longestStreak: number;
  lastStreakDate?: string;
  lastSettledDate?: string;
  dailyGoalAwardedDate?: string;
  perfectDayAwardedDate?: string;
  waterXpAwardedDate?: string;
  unlockedAchievementIds: string[];
};

export const FREE_HABIT_LIMIT = 4;
export const REWARD_EXTRA_SLOTS = 3;
export const MAX_EXTRA_HABIT_SLOTS = 30;
export const DEFAULT_WATER_GOAL_ML = 2000;
export const DEFAULT_GLASS_ML = 250;
export const MIN_WATER_GOAL_ML = 500;
export const MAX_WATER_GOAL_ML = 10000;
export const DEFAULT_REMINDER_HOURS = [8, 11, 14, 17, 20];
export const QUICK_ADD_ML = [150, 250, 350, 500];
export const WATER_LOG_RETENTION_DAYS = 90;
/** ~55 years of daily totals; a guard against a corrupt blob, not a real limit. */
export const MAX_WATER_DAILY_ENTRIES = 20000;
export const COMPLETION_RETENTION_DAYS = 400;
export const MAX_HABIT_NAME_LENGTH = 80;
export const DEFAULT_DAILY_GOAL_COUNT: DailyGoalCount = 2;
export const MAX_STREAK_FREEZES = 2;
export const XP_PER_HABIT = 10;
export const XP_WATER_GOAL = 10;
export const XP_DAILY_BONUS = 20;
export const XP_PER_LEVEL = 100;
export const GEMS_DAILY_GOAL = 5;
export const GEMS_PERFECT_DAY = 5;
export const STREAK_RISK_HOUR = 21;
