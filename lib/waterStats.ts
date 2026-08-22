import { addDays, localDateFromKey, todayKey } from '@/lib/dates';
import { waterTotalsByDay } from '@/lib/gamification';
import type { PersistedState } from '@/lib/types';

export type WaterRange = '7d' | '30d' | '1y' | 'all';

export type WaterBucket = 'day' | 'week' | 'month';

export type WaterPoint = {
  /** First day in the bucket. */
  key: string;
  label: string;
  /** Millilitres a day: the day's own total, or the bucket's daily average. */
  ml: number;
  days: number;
  met: boolean;
};

export type WaterSeries = {
  range: WaterRange;
  bucket: WaterBucket;
  points: WaterPoint[];
  from: string;
  to: string;
  daysInRange: number;
  daysTracked: number;
  daysMet: number;
  totalMl: number;
  averageMl: number;
  bestDay?: { date: string; ml: number };
  firstDay?: string;
};

export const WATER_RANGES: WaterRange[] = ['7d', '30d', '1y', 'all'];

/** Axis labels are formatted by the caller so they follow the app language. */
export type WaterLabels = {
  day: (date: Date) => string;
  month: (date: Date) => string;
};

/** History is unbounded by design; this only stops a corrupt far-past date from looping forever. */
const MAX_RANGE_DAYS = 366 * 25;

export function waterHistoryStart(state: PersistedState): string | undefined {
  const totals = waterTotalsByDay(state);
  for (const [day, ml] of totals) {
    if (ml > 0) return day;
  }
  return undefined;
}

/**
 * Long ranges are bucketed before they are drawn: a year of daily points on a
 * phone-width chart is noise, and the question a year answers is "how is my
 * average moving", not "what did I drink on the 3rd".
 */
export function buildWaterSeries(
  state: PersistedState,
  range: WaterRange,
  labels: WaterLabels,
  today = todayKey()
): WaterSeries {
  const totals = waterTotalsByDay(state);
  const goal = Math.max(state.waterGoalMl, 1);
  const firstDay = waterHistoryStart(state);

  const from = rangeStart(range, today, firstDay);
  const days: { date: string; ml: number }[] = [];
  let cursor = from;
  let guard = 0;
  while (cursor <= today && guard < MAX_RANGE_DAYS) {
    days.push({ date: cursor, ml: totals.get(cursor) ?? 0 });
    cursor = addDays(cursor, 1);
    guard += 1;
  }

  let totalMl = 0;
  let daysTracked = 0;
  let daysMet = 0;
  let bestDay: { date: string; ml: number } | undefined;
  for (const day of days) {
    totalMl += day.ml;
    if (day.ml > 0) daysTracked += 1;
    if (day.ml >= goal) daysMet += 1;
    if (!bestDay || day.ml > bestDay.ml) bestDay = day;
  }

  const bucket = bucketFor(days.length);
  const points = groupDays(days, bucket, goal, labels);

  return {
    range,
    bucket,
    points,
    from,
    to: today,
    daysInRange: days.length,
    daysTracked,
    daysMet,
    totalMl,
    averageMl: days.length ? Math.round(totalMl / days.length) : 0,
    bestDay: bestDay && bestDay.ml > 0 ? bestDay : undefined,
    firstDay,
  };
}

function rangeStart(range: WaterRange, today: string, firstDay?: string) {
  if (range === '7d') return addDays(today, -6);
  if (range === '30d') return addDays(today, -29);
  if (range === '1y') return addDays(today, -364);
  if (!firstDay || firstDay > today) return addDays(today, -6);
  return firstDay;
}

function bucketFor(dayCount: number): WaterBucket {
  if (dayCount <= 45) return 'day';
  if (dayCount <= 400) return 'week';
  return 'month';
}

function groupDays(
  days: { date: string; ml: number }[],
  bucket: WaterBucket,
  goal: number,
  labels: WaterLabels
): WaterPoint[] {
  if (bucket === 'day') {
    return days.map((day) => ({
      key: day.date,
      label: labels.day(localDateFromKey(day.date)),
      ml: day.ml,
      days: 1,
      met: day.ml >= goal,
    }));
  }

  const points: WaterPoint[] = [];
  let current: { key: string; sum: number; days: number } | null = null;

  for (const day of days) {
    const id = bucket === 'week' ? weekIdOf(day.date) : day.date.slice(0, 7);
    if (!current || weekOrMonthId(current.key, bucket) !== id) {
      current = { key: day.date, sum: 0, days: 0 };
      points.push({ key: day.date, label: '', ml: 0, days: 0, met: false });
    }
    current.sum += day.ml;
    current.days += 1;
    const point = points[points.length - 1];
    point.ml = Math.round(current.sum / current.days);
    point.days = current.days;
    point.met = point.ml >= goal;
    point.label =
      bucket === 'week'
        ? labels.day(localDateFromKey(point.key))
        : labels.month(localDateFromKey(point.key));
  }

  return points;
}

function weekOrMonthId(key: string, bucket: WaterBucket) {
  return bucket === 'week' ? weekIdOf(key) : key.slice(0, 7);
}

/** Weeks are keyed by the Monday that starts them, so buckets never split a week. */
function weekIdOf(key: string) {
  const date = localDateFromKey(key);
  const weekday = (date.getDay() + 6) % 7;
  return addDays(key, -weekday);
}

/** Evenly spaced tick indexes, always including the first and last point. */
export function tickIndexes(count: number, max = 4) {
  if (count <= 0) return [];
  if (count <= max) return Array.from({ length: count }, (_, i) => i);
  const step = (count - 1) / (max - 1);
  const ticks = new Set<number>();
  for (let i = 0; i < max; i += 1) ticks.add(Math.round(i * step));
  return [...ticks].sort((a, b) => a - b);
}
