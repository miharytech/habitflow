export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(next.getDate() + days);
  return todayKey(next);
}

export function localDayOf(iso: string) {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  return todayKey(parsed);
}

export function isOnLocalDay(iso: string, day: string) {
  return localDayOf(iso) === day;
}

export function msUntilNextLocalMidnight(from = new Date()) {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  return Math.max(next.getTime() - from.getTime(), 1000);
}

export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatMl(ml: number) {
  if (ml >= 1000) {
    const liters = ml / 1000;
    return `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1)} L`;
  }
  return `${ml} ml`;
}

export function recentDayKeys(today: string, count: number) {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    days.push(addDays(today, -i));
  }
  return days;
}

export function localDateFromKey(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
