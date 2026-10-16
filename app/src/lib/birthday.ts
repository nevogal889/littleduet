// Child birthday: stored on this device only (never synced; the server sees just the age).
import type { ChildProfile } from '../types';

export const MIN_AGE = 2;
export const MAX_AGE = 6;

/** 'YYYY-MM-DD' -> [y, m (1-12), d] or null. */
export function parseDay(s: string | undefined | null): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? '');
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo)) return null;
  return [y, mo, d];
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

export function toDay(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Whole years old on `now` (local time). Feb 29 birthdays count from Mar 1 in other years. */
export function ageOn(birthday: string, now: number): number | null {
  const b = parseDay(birthday);
  if (!b) return null;
  const n = new Date(now);
  let age = n.getFullYear() - b[0];
  const before = n.getMonth() + 1 < b[1] || (n.getMonth() + 1 === b[1] && n.getDate() < b[2]);
  if (before) age -= 1;
  return age;
}

/** True on the birthday (Feb 29 birthdays celebrate on Feb 28 in non-leap years). */
export function isBirthday(birthday: string | undefined, now: number): boolean {
  const b = parseDay(birthday);
  if (!b) return false;
  const n = new Date(now);
  const y = n.getFullYear();
  const [, m, d] = b;
  const dd = m === 2 && d === 29 && daysInMonth(y, 2) === 28 ? 28 : d;
  return n.getMonth() + 1 === m && n.getDate() === dd;
}

/** The age the app uses for songs: from the birthday when set, clamped to the 2-6 catalog. */
export function childAge(child: Pick<ChildProfile, 'age' | 'birthday'> | null | undefined, now: number): number {
  if (!child) return 3;
  const a = child.birthday ? ageOn(child.birthday, now) : null;
  const raw = a ?? child.age ?? 3;
  return Math.min(MAX_AGE, Math.max(MIN_AGE, raw));
}

/** Birth years offered in the picker: children aged 1-7 today (so 2-6 plus a little slack). */
export function birthYears(now: number): number[] {
  const y = new Date(now).getFullYear();
  return Array.from({ length: 7 }, (_, i) => y - 7 + i).reverse();
}
