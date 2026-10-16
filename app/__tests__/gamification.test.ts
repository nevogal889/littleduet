import { streak } from '@/lib/streak';
import { levelFor, weeklyQuests, chestId, chestSong } from '@/lib/rewards';
import { coverSources } from '@/lib/catalog';
import { recordCompletion } from '@/lib/progress';
import { makeLesson, makeSong } from './fixtures';

// Week of Monday 2026-10-12 .. Sunday 2026-10-18; Monday 2026-10-19 next.
const at = (day: number, month = 9) => new Date(2026, month, day, 18, 0, 0).getTime();

describe('kind streak (daily goal = 1 class, weekends protected, no streak loss)', () => {
  it('is zero with no history and is not a welcome back', () => {
    expect(streak([], at(14))).toMatchObject({ days: 0, playedToday: false, welcomeBack: false });
  });

  it('counts days in a row including today', () => {
    expect(streak(['2026-10-12', '2026-10-13', '2026-10-14'], at(14))).toMatchObject({ days: 3, playedToday: true });
  });

  it('keeps the streak alive while today is still open', () => {
    expect(streak(['2026-10-12', '2026-10-13'], at(14))).toMatchObject({ days: 2, playedToday: false, welcomeBack: false });
  });

  it('weekends are protected: Fri + Mon counts as 2 without playing Sat/Sun', () => {
    expect(streak(['2026-10-16', '2026-10-19'], at(19))).toMatchObject({ days: 2, playedToday: true });
  });

  it('weekends are protected while Monday is still open', () => {
    expect(streak(['2026-10-15', '2026-10-16'], at(19))).toMatchObject({ days: 2, welcomeBack: false });
  });

  it('weekend play still counts', () => {
    expect(streak(['2026-10-16', '2026-10-17', '2026-10-18'], at(18)).days).toBe(3);
  });

  it('a missed weekday shows Welcome back and starts again (never "lost")', () => {
    const s = streak(['2026-10-12'], at(14));
    expect(s).toMatchObject({ days: 0, welcomeBack: true });
    expect(streak(['2026-10-12', '2026-10-14'], at(14))).toMatchObject({ days: 1, playedToday: true, welcomeBack: false });
  });

  it('gives this week as Monday..Sunday dots', () => {
    expect(streak(['2026-10-12', '2026-10-14', '2026-10-05'], at(14)).week).toEqual([true, false, true, false, false, false, false]);
  });
});

describe('levels from stars', () => {
  it('level 1 needs 30 stars, then 15 more per level', () => {
    expect(levelFor(0)).toEqual({ level: 1, inLevel: 0, need: 30 });
    expect(levelFor(29)).toEqual({ level: 1, inLevel: 29, need: 30 });
    expect(levelFor(30)).toEqual({ level: 2, inLevel: 0, need: 45 });
    expect(levelFor(117)).toEqual({ level: 3, inLevel: 42, need: 60 });
  });
});

describe('weekly family quests', () => {
  const songs = [makeSong('a'), makeSong('b')];
  const lessons = { a: makeLesson('a', 2, 200), b: makeLesson('b', 3, 200) };
  const now = at(14);

  it('tracks play 3 classes, finish a song and play on 4 days', () => {
    let progress = recordCompletion({}, lessons.a.classes[0], 2, at(12));
    progress = recordCompletion(progress, lessons.a.classes[1], 2, at(13));
    const q = weeklyQuests(songs, lessons, { progress, goalDays: ['2026-10-12', '2026-10-13'], completions: [at(12), at(13)] }, now);
    expect(q.quests.map((x) => [x.id, x.progress, x.target, x.done])).toEqual([
      ['classes', 2, 3, false],
      ['song', 1, 1, true],
      ['days', 2, 4, false],
    ]);
    expect(q.allDone).toBe(false);
  });

  it('caps progress at the target and ignores last week', () => {
    const q = weeklyQuests(songs, lessons, { progress: {}, goalDays: ['2026-10-05', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16'], completions: [at(5), at(12), at(13), at(14), at(14), at(14)] }, at(16));
    expect(q.quests[0]).toMatchObject({ progress: 3, done: true });
    expect(q.quests[2]).toMatchObject({ progress: 4, done: true });
    expect(q.quests[1].done).toBe(false);
  });

  it('all three done = chest ready, one chest per week with a stable song sticker', () => {
    let progress = recordCompletion({}, lessons.a.classes[0], 2, at(12));
    progress = recordCompletion(progress, lessons.a.classes[1], 2, at(13));
    const q = weeklyQuests(songs, lessons, { progress, goalDays: ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15'], completions: [at(12), at(13), at(14)] }, at(15));
    expect(q.allDone).toBe(true);
    expect(chestId(at(15))).toBe('chest-2026-10-12');
    expect(chestId(at(19))).toBe('chest-2026-10-19');
    expect(chestSong(songs, 'chest-2026-10-12')).toBe(chestSong(songs, 'chest-2026-10-12'));
  });
});

describe('cover sources (wide: founder cover -> lesson cover; square: square-composed cover)', () => {
  it('wide slots prefer content/covers (served as photo.jpg), then the lesson-style cover', () => {
    expect(coverSources('twinkle', 'wide', { twinkle: { photo: true, cover: true } })).toEqual(['twinkle/photo.jpg', 'twinkle/cover.jpg']);
    expect(coverSources('twinkle', 'wide', { twinkle: { photo: false, cover: true } })).toEqual(['twinkle/cover.jpg']);
  });

  it('square and squircle slots use the square-composed cover (titles are baked into the images)', () => {
    expect(coverSources('twinkle', 'square', { twinkle: { photo: true, cover: true, square: true } })).toEqual(['twinkle/cover-square.jpg', 'twinkle/photo.jpg']);
    expect(coverSources('twinkle', 'square', { twinkle: { photo: true, cover: true, square: false } })).toEqual(['twinkle/photo.jpg']);
  });

  it('icon art when nothing exists; songs missing from the manifest try every source', () => {
    expect(coverSources('twinkle', 'wide', { twinkle: { photo: false, cover: false } })).toEqual([]);
    expect(coverSources('x', 'wide', {})).toEqual(['x/photo.jpg', 'x/cover.jpg']);
    expect(coverSources('x', 'square', {})).toEqual(['x/cover-square.jpg', 'x/photo.jpg']);
  });
});
