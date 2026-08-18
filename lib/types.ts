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

export type PersistedState = {
  waterGoalMl: number;
  glassMl: number;
  extraHabitSlots: number;
  remindersEnabled: boolean;
  reminderHours: number[];
  habits: Habit[];
  waterLogs: WaterLog[];
  completions: HabitCompletion[];
  lastGoalAdDate?: string;
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
export const COMPLETION_RETENTION_DAYS = 400;
export const MAX_HABIT_NAME_LENGTH = 80;
