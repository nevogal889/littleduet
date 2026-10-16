import {
  allStickers,
  earnedStickerIds,
  newlyEarned,
  badges,
  musicDaysThisWeek,
  classesThisWeek,
  levelUps,
  localDay,
} from '@/lib/stickers';
import { recordCompletion } from '@/lib/progress';
import { makeLesson, makeSong } from './fixtures';
import type { ProgressMap } from '@/types';

const songs = [makeSong('a', '2-3'), makeSong('b', '2-3'), makeSong('c', '3-4')];
const lessons = { a: makeLesson('a', 6), b: makeLesson('b', 6), c: makeLesson('c', 8) };

function finish(map: ProgressMap, songId: keyof typeof lessons, upTo: number, at = 1000) {
  lessons[songId].classes.slice(0, upTo).forEach((c, i) => (map = recordCompletion(map, c, 2, at + i)));
  return map;
}

describe('stickers', () => {
  it('each song has three milestone stickers: first class, halfway, concert', () => {
    const all = allStickers(songs, lessons);
    expect(all).toHaveLength(9);
    expect(all.filter((s) => s.songId === 'a').map((s) => s.milestone)).toEqual(['first', 'half', 'concert']);
  });

  it('earns the first sticker after one class, halfway at half, concert when finished', () => {
    expect(earnedStickerIds(songs, lessons, finish({}, 'a', 1))).toEqual(['a:first']);
    expect(earnedStickerIds(songs, lessons, finish({}, 'a', 3))).toEqual(['a:first', 'a:half']);
    expect(earnedStickerIds(songs, lessons, finish({}, 'a', 6))).toEqual(['a:first', 'a:half', 'a:concert']);
  });

  it('reports newly earned stickers between two progress snapshots', () => {
    const before = finish({}, 'a', 2);
    const after = finish({}, 'a', 3);
    expect(newlyEarned(songs, lessons, before, after).map((s) => s.id)).toEqual(['a:half']);
  });
});

describe('badges (names from copy: badges.child.* / badges.grownUp.*)', () => {
  const get = (b: ReturnType<typeof badges>, id: string) => b.find((x) => x.id === id)!;

  it('First Note after one class; First Concert after a concert class', () => {
    let map = finish({}, 'a', 1);
    expect(get(badges(songs, lessons, map), 'firstClass').earned).toBe(true);
    expect(get(badges(songs, lessons, map), 'firstConcert').earned).toBe(false);
    map = finish({}, 'a', 6); // last class of the fixture is type phrase; mark one as concert
    const withConcert = { ...lessons, a: { ...lessons.a, classes: lessons.a.classes.map((c, i) => (i === 5 ? { ...c, type: 'concert' } : c)) } };
    expect(get(badges(songs, withConcert, map), 'firstConcert').earned).toBe(true);
  });

  it('Song Collector at 3 finished songs; Duet Partner at 10 classes', () => {
    let map = finish(finish({}, 'a', 6), 'b', 6);
    let b = badges(songs, lessons, map);
    expect(get(b, 'threeSongs').earned).toBe(false);
    expect(get(b, 'duetPartner').earned).toBe(true);
    expect(get(b, 'duetPartner').group).toBe('grownUp');
    map = finish(map, 'c', 8);
    b = badges(songs, lessons, map);
    expect(get(b, 'threeSongs').earned).toBe(true);
  });

  it('Any Piano Will Do needs both modes; Five-Day Week needs 5 days in one week', () => {
    const days = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'];
    const b = badges(songs, lessons, {}, { modesUsed: ['real', 'screen'], activityDays: days });
    expect(get(b, 'bothModes').earned).toBe(true);
    expect(get(b, 'fiveDays').earned).toBe(true);
    const b2 = badges(songs, lessons, {}, { modesUsed: ['real'], activityDays: days.slice(0, 4) });
    expect(get(b2, 'bothModes').earned).toBe(false);
    expect(get(b2, 'fiveDays').earned).toBe(false);
  });

  it('awards an age-group graduate badge when most of that group is finished', () => {
    const map = finish(finish({}, 'a', 6), 'b', 6);
    const b = badges(songs, lessons, map);
    expect(get(b, 'grad-2-3').earned).toBe(true);
    expect(get(b, 'grad-3-4').earned).toBe(false);
  });
});

describe('weekly stats (no streak punishment)', () => {
  // Wednesday 2026-10-14 local
  const now = new Date(2026, 9, 14, 12, 0, 0).getTime();

  it('counts distinct music days in the current Monday-Sunday week', () => {
    const days = ['2026-10-11', '2026-10-12', '2026-10-12', '2026-10-14', '2026-10-19'];
    expect(musicDaysThisWeek(days, now)).toBe(2);
  });

  it('counts classes completed this week', () => {
    const monday = new Date(2026, 9, 12, 9).getTime();
    const lastWeek = new Date(2026, 9, 10, 9).getTime();
    let map: ProgressMap = {};
    map = recordCompletion(map, lessons.a.classes[0], 1, lastWeek);
    map = recordCompletion(map, lessons.a.classes[1], 1, monday);
    map = recordCompletion(map, lessons.a.classes[2], 1, now);
    expect(classesThisWeek(map, now)).toBe(2);
  });

  it('formats local days as YYYY-MM-DD', () => {
    expect(localDay(now)).toBe('2026-10-14');
  });
});

describe('level up', () => {
  it('praises an age group when at least 75% of its songs are finished', () => {
    expect(levelUps(songs, lessons, finish({}, 'a', 6))).toEqual([]);
    expect(levelUps(songs, lessons, finish(finish({}, 'a', 6), 'b', 6))).toEqual(['2-3']);
  });
});
