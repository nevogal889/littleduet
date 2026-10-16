import { ageOn, birthYears, childAge, isBirthday, parseDay } from '@/lib/birthday';
import { discover, newThisWeek } from '@/lib/catalog';
import { makeLesson, makeSong } from './fixtures';

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).getTime();

describe('birthday', () => {
  it('parses and rejects bad dates', () => {
    expect(parseDay('2022-03-14')).toEqual([2022, 3, 14]);
    expect(parseDay('2022-02-30')).toBeNull();
    expect(parseDay('nope')).toBeNull();
  });
  it('computes age on a date', () => {
    expect(ageOn('2022-10-16', at(2026, 10, 15))).toBe(3);
    expect(ageOn('2022-10-16', at(2026, 10, 16))).toBe(4);
  });
  it('knows the birthday, including Feb 29 in non-leap years', () => {
    expect(isBirthday('2022-10-16', at(2026, 10, 16))).toBe(true);
    expect(isBirthday('2022-10-16', at(2026, 10, 17))).toBe(false);
    expect(isBirthday('2020-02-29', at(2026, 2, 28))).toBe(true);
    expect(isBirthday('2020-02-29', at(2028, 2, 28))).toBe(false);
    expect(isBirthday(undefined, at(2026, 1, 1))).toBe(false);
  });
  it('uses the birthday for the app age, clamped to 2-6, falling back to the stored age', () => {
    expect(childAge({ age: 3, birthday: '2022-01-01' }, at(2026, 6, 1))).toBe(4);
    expect(childAge({ age: 3, birthday: '2025-01-01' }, at(2026, 6, 1))).toBe(2);
    expect(childAge({ age: 3, birthday: '2018-01-01' }, at(2026, 6, 1))).toBe(6);
    expect(childAge({ age: 5 }, at(2026, 6, 1))).toBe(5);
  });
  it('offers seven birth years, newest first', () => {
    expect(birthYears(at(2026, 10, 16))).toEqual([2025, 2024, 2023, 2022, 2021, 2020, 2019]);
  });
});

describe('home rows', () => {
  const songs = ['a', 'b', 'c', 'd', 'e', 'f'].map((id, i) => makeSong(id, (['2-3', '3-4', '4-5', '5-6'] as const)[i % 4], 1));
  const lessons = Object.fromEntries(songs.map((s) => [s.id, makeLesson(s.id, 2)]));
  it('New this week is empty when no song was added this week', () => {
    expect(newThisWeek(songs, at(2026, 10, 16))).toEqual([]);
  });
  it('Discover skips started songs and is stable within a week', () => {
    const started = { [lessons.a.classes[0].id]: { positionSec: 10, completed: false, stars: 0, lastWatchedAt: 1 } };
    const d1 = discover(songs, lessons, started, 3, at(2026, 10, 13)).map((s) => s.id);
    const d2 = discover(songs, lessons, started, 3, at(2026, 10, 16)).map((s) => s.id);
    expect(d1).toEqual(d2);
    expect(d1).not.toContain('a');
    expect(d1.length).toBeGreaterThan(0);
  });
});
