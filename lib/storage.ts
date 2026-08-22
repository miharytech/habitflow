import AsyncStorage from '@react-native-async-storage/async-storage';

import { addDays, localDayOf, todayKey } from '@/lib/dates';
import { clampFreezes, parseDailyGoalCount } from '@/lib/gamification';
import {
  COMPLETION_RETENTION_DAYS,
  DEFAULT_DAILY_GOAL_COUNT,
  DEFAULT_GLASS_ML,
  DEFAULT_REMINDER_HOURS,
  DEFAULT_THEME_PREFERENCE,
  DEFAULT_WATER_GOAL_ML,
  MAX_EXTRA_HABIT_SLOTS,
  MAX_HABIT_NAME_LENGTH,
  MAX_WATER_DAILY_ENTRIES,
  MAX_WATER_GOAL_ML,
  MIN_WATER_GOAL_ML,
  WATER_LOG_RETENTION_DAYS,
  type Habit,
  type HabitCompletion,
  type PersistedState,
  type ThemePreference,
  type WaterLog,
} from '@/lib/types';

const KEY = 'habitflow.state.v1';
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

let writing = false;
let queued: PersistedState | null = null;

export const emptyState = (): PersistedState => ({
  waterGoalMl: DEFAULT_WATER_GOAL_ML,
  glassMl: DEFAULT_GLASS_ML,
  extraHabitSlots: 0,
  remindersEnabled: false,
  reminderHours: DEFAULT_REMINDER_HOURS,
  habits: [
    { id: 'stretch', name: 'Stretch 5 min', emoji: '🧘', createdAt: new Date().toISOString() },
    { id: 'read', name: 'Read 10 min', emoji: '📖', createdAt: new Date().toISOString() },
    { id: 'walk', name: 'Take a walk', emoji: '🚶', createdAt: new Date().toISOString() },
    { id: 'sleep', name: 'Sleep on time', emoji: '😴', createdAt: new Date().toISOString() },
  ],
  waterLogs: [],
  completions: [],
  waterDaily: {},
  waterTrackingEnabled: true,
  xpTotal: 0,
  gems: 0,
  streakFreezes: 0,
  dailyGoalCount: DEFAULT_DAILY_GOAL_COUNT,
  themePreference: DEFAULT_THEME_PREFERENCE,
  includeWaterInDailyGoal: false,
  appStreak: 0,
  longestStreak: 0,
  unlockedAchievementIds: [],
});

export async function loadState(): Promise<PersistedState> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return emptyState();
  try {
    return pruneState(parseState(JSON.parse(raw)));
  } catch {
    return emptyState();
  }
}

export async function saveState(state: PersistedState) {
  await AsyncStorage.setItem(KEY, JSON.stringify(pruneState(state)));
}

export function scheduleSave(state: PersistedState) {
  queued = state;
  void flushSaves();
}

async function flushSaves() {
  if (writing) return;
  writing = true;
  try {
    while (queued) {
      const next = queued;
      queued = null;
      await saveState(next);
    }
  } catch {
    // Keep any snapshot queued while this write failed.
  } finally {
    writing = false;
    if (queued) void flushSaves();
  }
}

export function pruneState(state: PersistedState, today = todayKey()): PersistedState {
  const waterCutoff = addDays(today, -WATER_LOG_RETENTION_DAYS);
  const completionCutoff = addDays(today, -COMPLETION_RETENTION_DAYS);
  return {
    ...state,
    extraHabitSlots: clampSlots(state.extraHabitSlots),
    waterDaily: rollUpWater(state, waterCutoff),
    waterLogs: state.waterLogs.filter((log) => {
      const day = localDayOf(log.at);
      return Boolean(day) && day >= waterCutoff;
    }),
    completions: state.completions.filter((item) => item.date >= completionCutoff),
  };
}

/**
 * Folds the sip logs into the all-time day totals right before the old ones
 * are dropped, so history outlives the 90-day log window. Inside that window
 * the logs are authoritative — a day whose sips were all undone loses its
 * entry — while older entries are kept untouched, forever.
 */
function rollUpWater(state: PersistedState, waterCutoff: string): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const [day, ml] of Object.entries(state.waterDaily ?? {})) {
    if (day < waterCutoff) totals[day] = ml;
  }
  for (const log of state.waterLogs) {
    const day = localDayOf(log.at);
    if (!day) continue;
    totals[day] = (totals[day] ?? 0) + log.ml;
  }
  return totals;
}

function parseState(value: unknown): PersistedState {
  const fallback = emptyState();
  if (!isRecord(value)) return fallback;

  const habits = Array.isArray(value.habits)
    ? value.habits.map(parseHabit).filter((habit): habit is Habit => habit !== null)
    : fallback.habits;
  const waterLogs = Array.isArray(value.waterLogs)
    ? value.waterLogs.map(parseWaterLog).filter((log): log is WaterLog => log !== null)
    : [];
  const completions = Array.isArray(value.completions)
    ? value.completions
        .map(parseCompletion)
        .filter((item): item is HabitCompletion => item !== null)
    : [];

  const lastGoalAdDate = parseDay(value.lastGoalAdDate);
  const waterTrackingEnabled = value.waterTrackingEnabled !== false;

  return {
    waterGoalMl: clamp(
      asFiniteNumber(value.waterGoalMl, DEFAULT_WATER_GOAL_ML),
      MIN_WATER_GOAL_ML,
      MAX_WATER_GOAL_ML
    ),
    glassMl: clamp(asFiniteNumber(value.glassMl, DEFAULT_GLASS_ML), 50, 2000),
    extraHabitSlots: clampSlots(asFiniteNumber(value.extraHabitSlots, 0)),
    remindersEnabled: value.remindersEnabled === true && waterTrackingEnabled,
    reminderHours: parseHours(value.reminderHours),
    habits,
    waterLogs,
    completions,
    waterDaily: parseWaterDaily(value.waterDaily),
    lastGoalAdDate,
    waterTrackingEnabled,
    xpTotal: Math.max(0, Math.floor(asFiniteNumber(value.xpTotal, 0))),
    gems: Math.max(0, Math.floor(asFiniteNumber(value.gems, 0))),
    streakFreezes: clampFreezes(asFiniteNumber(value.streakFreezes, 0)),
    dailyGoalCount: parseDailyGoalCount(value.dailyGoalCount),
    themePreference: parseThemePreference(value.themePreference),
    includeWaterInDailyGoal: waterTrackingEnabled && value.includeWaterInDailyGoal === true,
    appStreak: Math.max(0, Math.floor(asFiniteNumber(value.appStreak, 0))),
    longestStreak: Math.max(
      Math.max(0, Math.floor(asFiniteNumber(value.longestStreak, 0))),
      Math.max(0, Math.floor(asFiniteNumber(value.appStreak, 0)))
    ),
    lastStreakDate: parseDay(value.lastStreakDate),
    lastSettledDate: parseDay(value.lastSettledDate),
    dailyGoalAwardedDate: parseDay(value.dailyGoalAwardedDate),
    perfectDayAwardedDate: parseDay(value.perfectDayAwardedDate),
    waterXpAwardedDate: parseDay(value.waterXpAwardedDate),
    unlockedAchievementIds: parseAchievementIds(value.unlockedAchievementIds),
  };
}

/** Day totals are the only all-time record, so they are validated key by key. */
function parseWaterDaily(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const totals: Record<string, number> = {};
  let kept = 0;
  for (const day of Object.keys(value).sort().reverse()) {
    if (kept >= MAX_WATER_DAILY_ENTRIES) break;
    if (!DAY_KEY.test(day)) continue;
    const ml = asFiniteNumber(value[day], 0);
    if (ml <= 0) continue;
    totals[day] = Math.min(Math.round(ml), MAX_WATER_GOAL_ML * 20);
    kept += 1;
  }
  return totals;
}

function parseThemePreference(value: unknown): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  return DEFAULT_THEME_PREFERENCE;
}

function parseDay(value: unknown) {
  return typeof value === 'string' && DAY_KEY.test(value) ? value : undefined;
}

function parseAchievementIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 64)
    .filter((id, index, all) => all.indexOf(id) === index);
}

function parseHabit(value: unknown): Habit | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return null;
  const name = value.name.trim().slice(0, MAX_HABIT_NAME_LENGTH);
  if (!name) return null;
  return {
    id: value.id.slice(0, 64),
    name,
    emoji: typeof value.emoji === 'string' && value.emoji.trim() ? value.emoji.trim().slice(0, 8) : '✅',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
  };
}

function parseWaterLog(value: unknown): WaterLog | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || typeof value.at !== 'string') return null;
  const ml = asFiniteNumber(value.ml, NaN);
  if (!Number.isFinite(ml) || ml <= 0 || ml > 5000) return null;
  if (!localDayOf(value.at)) return null;
  return { id: value.id.slice(0, 64), ml, at: value.at };
}

function parseCompletion(value: unknown): HabitCompletion | null {
  if (!isRecord(value)) return null;
  if (typeof value.habitId !== 'string' || typeof value.date !== 'string') return null;
  if (!DAY_KEY.test(value.date)) return null;
  return { habitId: value.habitId.slice(0, 64), date: value.date };
}

function parseHours(value: unknown): number[] {
  if (!Array.isArray(value)) return DEFAULT_REMINDER_HOURS;
  const hours = value
    .filter((hour): hour is number => typeof hour === 'number' && Number.isInteger(hour) && hour >= 0 && hour <= 23)
    .filter((hour, index, all) => all.indexOf(hour) === index)
    .sort((a, b) => a - b);
  return hours.length ? hours : DEFAULT_REMINDER_HOURS;
}

function clampSlots(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_EXTRA_HABIT_SLOTS, Math.max(0, Math.floor(value)));
}

function asFiniteNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
