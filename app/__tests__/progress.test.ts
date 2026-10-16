import {
  COMPLETE_FRACTION,
  continueRow,
  heroItem,
  inProgressRow,
  isInProgress,
  recordPosition,
  recordCompletion,
  resumePositionFor,
  songProgress,
  classStates,
  starsForVideo,
  starsForInteractive,
  mergeProgress,
} from '@/lib/progress';
import { makeLesson } from './fixtures';
import type { ProgressMap } from '@/types';

const twinkle = makeLesson('twinkle', 8, 200);
const mary = makeLesson('mary', 6, 240);
const lessons = { twinkle, mary };

describe('completion at 90%', () => {
  it('uses a 90% threshold', () => {
    expect(COMPLETE_FRACTION).toBe(0.9);
  });

  it('does not complete below 90% watched', () => {
    const map = recordPosition({}, twinkle.classes[0], 179, 1000);
    expect(map['twinkle-c01'].completed).toBe(false);
    expect(map['twinkle-c01'].positionSec).toBe(179);
    expect(map['twinkle-c01'].lastWatchedAt).toBe(1000);
  });

  it('completes at exactly 90% watched', () => {
    const map = recordPosition({}, twinkle.classes[0], 180, 1000);
    expect(map['twinkle-c01'].completed).toBe(true);
    expect(map['twinkle-c01'].completedAt).toBe(1000);
  });

  it('never un-completes a class when rewatched from the start', () => {
    let map = recordPosition({}, twinkle.classes[0], 195, 1000);
    map = recordPosition(map, twinkle.classes[0], 20, 2000);
    expect(map['twinkle-c01'].completed).toBe(true);
    expect(map['twinkle-c01'].positionSec).toBe(20);
  });

  it('clamps position to the class duration', () => {
    const map = recordPosition({}, twinkle.classes[0], 999, 1);
    expect(map['twinkle-c01'].positionSec).toBe(200);
  });
});

describe('stars', () => {
  it('video: 0 below 90%, 1 at 90%, 2 when watched to the end', () => {
    expect(starsForVideo(0.5)).toBe(0);
    expect(starsForVideo(0.9)).toBe(1);
    expect(starsForVideo(0.995)).toBe(2);
  });

  it('interactive: watched=1, played along=2, perfect your_turn=3', () => {
    expect(starsForInteractive({ completed: false, playedAlong: true, perfect: true })).toBe(0);
    expect(starsForInteractive({ completed: true, playedAlong: false, perfect: false })).toBe(1);
    expect(starsForInteractive({ completed: true, playedAlong: true, perfect: false })).toBe(2);
    expect(starsForInteractive({ completed: true, playedAlong: true, perfect: true })).toBe(3);
  });

  it('keeps the best stars across attempts', () => {
    let map = recordCompletion({}, twinkle.classes[0], 3, 1000);
    map = recordCompletion(map, twinkle.classes[0], 1, 2000);
    expect(map['twinkle-c01'].stars).toBe(3);
    expect(map['twinkle-c01'].lastWatchedAt).toBe(2000);
  });
});

describe('in progress + resume', () => {
  it('is in progress when 0 < position < duration - 10s and not completed', () => {
    const cls = twinkle.classes[1];
    expect(isInProgress(cls, undefined)).toBe(false);
    expect(isInProgress(cls, { positionSec: 0, completed: false, stars: 0, lastWatchedAt: 1 })).toBe(false);
    expect(isInProgress(cls, { positionSec: 30, completed: false, stars: 0, lastWatchedAt: 1 })).toBe(true);
    expect(isInProgress(cls, { positionSec: 191, completed: false, stars: 0, lastWatchedAt: 1 })).toBe(false);
    expect(isInProgress(cls, { positionSec: 30, completed: true, stars: 1, lastWatchedAt: 1 })).toBe(false);
  });

  it('resumes from the saved position when in progress', () => {
    const map = recordPosition({}, twinkle.classes[1], 42, 1);
    expect(resumePositionFor(twinkle.classes[1], map['twinkle-c02'])).toBe(42);
  });

  it('starts from 0 when the class was finished or never started', () => {
    const map = recordCompletion({}, twinkle.classes[1], 2, 1);
    expect(resumePositionFor(twinkle.classes[1], map['twinkle-c02'])).toBe(0);
    expect(resumePositionFor(twinkle.classes[1], undefined)).toBe(0);
  });

  it('starts from 0 when the saved position is in the last 10 seconds', () => {
    const p = { positionSec: 195, completed: false, stars: 0, lastWatchedAt: 1 };
    expect(resumePositionFor(twinkle.classes[1], p)).toBe(0);
  });
});

describe('continue row ordering', () => {
  it('is empty for a brand-new user', () => {
    expect(continueRow(lessons, {})).toEqual([]);
    expect(heroItem(lessons, {})).toBeNull();
  });

  it('shows the in-progress class, newest first, and next classes of started songs', () => {
    let map: ProgressMap = {};
    map = recordCompletion(map, twinkle.classes[0], 2, 1000); // twinkle c01 done -> next is c02
    map = recordPosition(map, mary.classes[2], 60, 3000); // mary c03 in progress, newest
    const row = continueRow(lessons, map);
    expect(row.map((r) => r.classId)).toEqual(['mary-c03', 'twinkle-c02']);
    expect(row[0].kind).toBe('in_progress');
    expect(row[0].fraction).toBeCloseTo(0.25);
    expect(row[1].kind).toBe('next');
    expect(row[1].fraction).toBe(0);
  });

  it('does not list a song twice when its next class is already in progress', () => {
    let map: ProgressMap = {};
    map = recordCompletion(map, twinkle.classes[0], 2, 1000);
    map = recordPosition(map, twinkle.classes[1], 50, 2000);
    const row = continueRow(lessons, map);
    expect(row.map((r) => r.classId)).toEqual(['twinkle-c02']);
  });

  it('lists two in-progress classes of the same song, newest first', () => {
    let map: ProgressMap = {};
    map = recordPosition(map, twinkle.classes[0], 50, 1000);
    map = recordPosition(map, twinkle.classes[3], 50, 5000);
    expect(continueRow(lessons, map).map((r) => r.classId)).toEqual(['twinkle-c04', 'twinkle-c01']);
  });

  it('drops songs that are fully finished', () => {
    let map: ProgressMap = {};
    twinkle.classes.forEach((c, i) => (map = recordCompletion(map, c, 1, 1000 + i)));
    expect(continueRow(lessons, map)).toEqual([]);
  });

  it('next class skips finished classes and follows the latest one when done out of order', () => {
    let map: ProgressMap = {};
    map = recordCompletion(map, twinkle.classes[0], 1, 1000);
    map = recordCompletion(map, twinkle.classes[1], 1, 1100);
    map = recordCompletion(map, twinkle.classes[4], 1, 1200);
    map = recordCompletion(map, twinkle.classes[5], 1, 1050); // older completion
    expect(continueRow(lessons, map)[0].classId).toBe('twinkle-c07');
  });

  it('next class follows the most recently finished class, even when an older class is in progress', () => {
    let map: ProgressMap = {};
    map = recordPosition(map, twinkle.classes[0], 5, 1000); // class 1 barely started
    map = recordCompletion(map, twinkle.classes[2], 2, 2000); // then class 3 finished
    const row = continueRow(lessons, map);
    expect(row.map((r) => r.classId)).toEqual(['twinkle-c04', 'twinkle-c01']);
    expect(row[0].kind).toBe('next');
  });

  it('after the last class is finished, next wraps to the first unfinished class', () => {
    let map: ProgressMap = {};
    map = recordCompletion(map, twinkle.classes[7], 2, 2000);
    expect(continueRow(lessons, map)[0].classId).toBe('twinkle-c01');
  });

  it('hero is the newest item and the continue-watching row excludes it', () => {
    let map: ProgressMap = {};
    map = recordPosition(map, twinkle.classes[0], 50, 1000);
    map = recordPosition(map, mary.classes[0], 50, 2000);
    expect(heroItem(lessons, map)?.classId).toBe('mary-c01');
    expect(inProgressRow(lessons, map).map((r) => r.classId)).toEqual(['twinkle-c01']);
  });
});

describe('song progress + class states', () => {
  it('counts finished classes and finds the next one', () => {
    let map: ProgressMap = {};
    map = recordCompletion(map, twinkle.classes[0], 3, 1);
    map = recordPosition(map, twinkle.classes[1], 40, 2);
    const sp = songProgress(twinkle, map);
    expect(sp.completedCount).toBe(1);
    expect(sp.total).toBe(8);
    expect(sp.started).toBe(true);
    expect(sp.finished).toBe(false);
    expect(sp.nextClass?.id).toBe('twinkle-c02');
    expect(sp.fraction).toBeCloseTo(1 / 8);
  });

  it('marks done / in progress / next up / not started', () => {
    let map: ProgressMap = {};
    map = recordCompletion(map, twinkle.classes[0], 3, 1);
    map = recordPosition(map, twinkle.classes[2], 40, 2);
    const states = classStates(twinkle, map);
    expect(states['twinkle-c01']).toBe('done');
    expect(states['twinkle-c02']).toBe('next_up');
    expect(states['twinkle-c03']).toBe('in_progress');
    expect(states['twinkle-c04']).toBe('not_started');
  });

  it('a brand-new song has class 1 as next up', () => {
    expect(classStates(twinkle, {})['twinkle-c01']).toBe('next_up');
    expect(songProgress(twinkle, {}).started).toBe(false);
  });
});

describe('merging local and synced progress', () => {
  it('keeps completion and best stars from either side, position from the newest', () => {
    const local: ProgressMap = {
      a: { positionSec: 50, completed: false, stars: 0, lastWatchedAt: 2000 },
      b: { positionSec: 200, completed: true, stars: 3, lastWatchedAt: 1000, completedAt: 1000 },
    };
    const remote: ProgressMap = {
      a: { positionSec: 20, completed: true, stars: 1, lastWatchedAt: 1500, completedAt: 1500 },
      c: { positionSec: 10, completed: false, stars: 0, lastWatchedAt: 900 },
    };
    const m = mergeProgress(local, remote);
    expect(m.a).toEqual({ positionSec: 50, completed: true, stars: 1, lastWatchedAt: 2000, completedAt: 1500 });
    expect(m.b.stars).toBe(3);
    expect(m.c.positionSec).toBe(10);
  });
});
