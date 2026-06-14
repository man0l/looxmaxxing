export const MILESTONES = [7, 14, 30, 90];

export interface HeatCell {
  key: string;
  level: number;
  future: boolean;
  isToday: boolean;
}

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function seedHistory(): Record<string, number> {
  const out: Record<string, number> = {};
  const set = (n: number, tasks: number) => {
    out[dateKey(daysAgo(n))] = Math.min(4, Math.max(1, tasks));
  };
  for (let d = 1; d <= 11; d++) set(d, 1 + ((d * 7) % 4));
  for (let d = 20; d <= 40; d++) set(d, 1 + ((d * 3) % 4));
  for (let d = 41; d <= 110; d++) {
    if ((d * 5) % 3 === 0) set(d, 1 + (d % 3));
  }
  return out;
}

export function levelFor(count: number): number {
  if (count <= 0) return 0;
  return Math.min(4, count);
}

export function currentStreakDay(history: Record<string, number>): number {
  let run = 0;
  let d = 1;
  while (d < 400) {
    if ((history[dateKey(daysAgo(d))] ?? 0) > 0) {
      run++;
      d++;
    } else {
      break;
    }
  }
  return run + 1;
}

export function longestStreak(history: Record<string, number>, todayActive: boolean): number {
  let longest = 0;
  let run = 0;
  for (let d = 200; d >= 0; d--) {
    const active = d === 0 ? todayActive : (history[dateKey(daysAgo(d))] ?? 0) > 0;
    if (active) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  return longest;
}

export function reachedMilestone(day: number): number | null {
  const passed = MILESTONES.filter((m) => m <= day);
  return passed.length > 0 ? passed[passed.length - 1] : null;
}

export function nextMilestone(day: number): number | null {
  return MILESTONES.find((m) => m > day) ?? null;
}

export function buildHeatmap(
  history: Record<string, number>,
  todayCount: number,
  weeks: number,
): HeatCell[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWeekday = today.getDay();
  const todayKey = dateKey(today);

  const start = new Date(today);
  start.setDate(today.getDate() - ((weeks - 1) * 7 + todayWeekday));

  const grid: HeatCell[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let wd = 0; wd < 7; wd++) {
      const key = dateKey(cursor);
      const isToday = key === todayKey;
      const future = cursor.getTime() > today.getTime();
      const count = isToday ? todayCount : history[key] ?? 0;
      col.push({ key, level: future ? 0 : levelFor(count), future, isToday });
      cursor.setDate(cursor.getDate() + 1);
    }
    grid.push(col);
  }
  return grid;
}
