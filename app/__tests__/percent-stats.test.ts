import { classPercent, recordCompletion, recordPosition, songPercent } from '@/lib/progress';
import { homeStats, minutesThisWeek } from '@/lib/stickers';
import { coverPath } from '@/lib/catalog';
import { makeClass, makeLesson, makeSong } from './fixtures';
import type { Lesson } from '@/types';

describe('class percent', () => {
  const cls = makeClass('a', 2, 200);

  it('is 0 when never started', () => {
    expect(classPercent(cls, undefined)).toBe(0);
  });

  it('rounds the watched share', () => {
    const map = recordPosition({}, cls, 90, 1);
    expect(classPercent(cls, map[cls.id])).toBe(45);
  });

  it('never shows 100 before the class is done, and 100 once done', () => {
    const near = { positionSec: 199.5, completed: false, stars: 0, lastWatchedAt: 1 };
    expect(classPercent(cls, near)).toBe(99);
    const done = recordCompletion({}, cls, 2, 1);
    expect(classPercent(cls, done[cls.id])).toBe(100);
  });
});

describe('song percent (weighted by duration, partial counted)', () => {
  const lesson: Lesson = {
    songId: 's',
    classes: [makeClass('s', 1, 100), makeClass('s', 2, 300)],
  };

  it('is 0 for an untouched song', () => {
    expect(songPercent(lesson, {})).toBe(0);
  });

  it('weights classes by duration and counts partial progress', () => {
    let map = recordCompletion({}, lesson.classes[0], 1, 1); // 100 of 400
    expect(songPercent(lesson, map)).toBe(25);
    map = recordPosition(map, lesson.classes[1], 150, 2); // +150 -> 250 of 400
    expect(songPercent(lesson, map)).toBe(63);
  });

  it('is 100 only when every class is done', () => {
    let map = recordCompletion({}, lesson.classes[0], 1, 1);
    map = recordPosition(map, lesson.classes[1], 299, 2); // >= 90%: complete
    expect(songPercent(lesson, map)).toBe(100);
  });
});

describe('home stats (child readable)', () => {
  const songs = [makeSong('a'), makeSong('b')];
  const lessons = { a: makeLesson('a', 2, 200), b: makeLesson('b', 2, 200) };
  const now = new Date(2026, 9, 14, 12).getTime(); // Wednesday

  it('totals stars, counts songs learned and marks music days Monday to Sunday', () => {
    let map = recordCompletion({}, lessons.a.classes[0], 3, now);
    map = recordCompletion(map, lessons.a.classes[1], 2, now);
    map = recordCompletion(map, lessons.b.classes[0], 1, now);
    const s = homeStats(songs, lessons, { progress: map, activityDays: ['2026-10-12', '2026-10-14', '2026-10-01'], stickers: [] }, now);
    expect(s.stars).toBe(6);
    expect(s.songsLearned).toBe(1);
    expect(s.week).toEqual([true, false, true, false, false, false, false]);
    expect(s.musicDays).toBe(2);
  });

  it('starts at zero for a new child', () => {
    const s = homeStats(songs, lessons, { progress: {}, activityDays: [], stickers: [] }, now);
    expect(s).toEqual({ stars: 0, songsLearned: 0, week: [false, false, false, false, false, false, false], musicDays: 0 });
  });
});

describe('minutes played this week (grown-ups)', () => {
  const lessons = { a: makeLesson('a', 3, 240) };
  const now = new Date(2026, 9, 14, 12).getTime();
  const lastWeek = new Date(2026, 9, 8, 12).getTime();

  it('counts finished classes in full and partial classes by position, this week only', () => {
    let map = recordCompletion({}, lessons.a.classes[0], 1, now); // 4 min
    map = recordPosition(map, lessons.a.classes[1], 90, now); // 1.5 min
    map = recordCompletion(map, lessons.a.classes[2], 1, lastWeek); // not this week
    expect(minutesThisWeek(lessons, map, now)).toBe(6);
  });
});

describe('song covers', () => {
  it('uses the video teammate cover paths', () => {
    expect(coverPath('twinkle-twinkle', 'wide')).toBe('twinkle-twinkle/cover.jpg');
    expect(coverPath('twinkle-twinkle', 'square')).toBe('twinkle-twinkle/cover-square.jpg');
  });
});
