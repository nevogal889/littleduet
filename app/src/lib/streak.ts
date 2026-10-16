import { localDay, weekStart } from './stickers';

export interface Streak {
  /** Days in a row with the daily goal (1 class) met; weekends never break it. */
  days: number;
  playedToday: boolean;
  /** A weekday was missed: show "Welcome back!" (never "streak lost"). */
  welcomeBack: boolean;
  /** Monday..Sunday of this week: goal met that day. */
  week: boolean[];
}

const DAY = 86400000;
const isWeekend = (t: number) => {
  const d = new Date(t).getDay();
  return d === 0 || d === 6;
};

/**
 * Kind streak. Today still open counts as alive; an unplayed Saturday or Sunday is skipped
 * (protected); an unplayed weekday ends the run and the next session starts again at 1.
 */
export function streak(goalDays: string[], now: number): Streak {
  const set = new Set(goalDays);
  const noon = (t: number) => {
    const d = new Date(t);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime();
  };
  const today = noon(now);
  const playedToday = set.has(localDay(today));
  let days = 0;
  let t = playedToday ? today : today - DAY;
  for (let guard = 0; guard < 4000; guard++, t -= DAY) {
    if (set.has(localDay(t))) days++;
    else if (isWeekend(t)) continue;
    else break;
  }
  const start = weekStart(now);
  const week = Array.from({ length: 7 }, (_, i) => set.has(localDay(start + i * DAY + 12 * 3600000)));
  return { days, playedToday, welcomeBack: days === 0 && set.size > 0, week };
}
