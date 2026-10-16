import {
  ageGroupForAge,
  difficultyWord,
  filterSongs,
  songStats,
  pickedFor,
  easySongs,
  newThisWeek,
} from '@/lib/catalog';
import { keyboardRange, midiOf, karaokeLines } from '@/lib/music';
import { recordCompletion } from '@/lib/progress';
import { makeLesson, makeSong } from './fixtures';

describe('catalog', () => {
  it('maps a child age to an age group', () => {
    expect(ageGroupForAge(2)).toBe('2-3');
    expect(ageGroupForAge(3)).toBe('3-4');
    expect(ageGroupForAge(4)).toBe('4-5');
    expect(ageGroupForAge(5)).toBe('5-6');
    expect(ageGroupForAge(6)).toBe('5-6');
  });

  it('describes difficulty in plain words', () => {
    expect(difficultyWord(1)).toBe('Easy');
    expect(difficultyWord(2)).toBe('Easy');
    expect(difficultyWord(3)).toBe('Medium');
    expect(difficultyWord(5)).toBe('Harder');
  });

  it('sums classes and minutes for a song', () => {
    expect(songStats(makeLesson('a', 8, 225))).toEqual({ classes: 8, minutes: 30 });
  });

  const songs = [
    makeSong('twinkle-star', '2-3', 1),
    makeSong('old-macdonald', '3-4', 3),
    makeSong('mary-lamb', '3-4', 1, { tags: ['animals'] }),
  ];

  it('filters by age group, difficulty word and search text', () => {
    expect(filterSongs(songs, { ageGroup: '3-4' }).map((s) => s.id)).toEqual(['mary-lamb', 'old-macdonald']);
    expect(filterSongs(songs, { difficulty: 'Medium' }).map((s) => s.id)).toEqual(['old-macdonald']);
    expect(filterSongs(songs, { query: 'STAR' }).map((s) => s.id)).toEqual(['twinkle-star']);
    expect(filterSongs(songs, { query: 'animals' }).map((s) => s.id)).toEqual(['mary-lamb']);
  });

  it('picks songs for the child age group, unfinished first, easiest first', () => {
    const lessons = { 'mary-lamb': makeLesson('mary-lamb', 1), 'old-macdonald': makeLesson('old-macdonald', 2), 'twinkle-star': makeLesson('twinkle-star', 2) };
    const map = recordCompletion({}, lessons['mary-lamb'].classes[0], 1, 1);
    expect(pickedFor(songs, lessons, map, 3).map((s) => s.id)).toEqual(['old-macdonald', 'mary-lamb']);
  });

  it('easy songs are difficulty 1-2 up to the child group, easiest and youngest first', () => {
    expect(easySongs(songs, 3).map((s) => s.id)).toEqual(['twinkle-star', 'mary-lamb']);
  });

  it('new this week prefers addedAt within 7 days, else a stable weekly rotation', () => {
    const now = new Date(2026, 9, 14).getTime();
    const withDates = [makeSong('x', '2-3', 1, { addedAt: '2026-10-10' }), makeSong('y', '2-3', 1, { addedAt: '2026-01-01' })];
    expect(newThisWeek(withDates, now).map((s) => s.id)).toEqual(['x']);
    const rot1 = newThisWeek(songs, now, 2).map((s) => s.id);
    const rot2 = newThisWeek(songs, now + 1000, 2).map((s) => s.id);
    expect(rot1).toEqual(rot2);
    expect(rot1).toHaveLength(2);
  });
});

describe('music helpers', () => {
  it('converts pitches to midi', () => {
    expect(midiOf('C4')).toBe(60);
    expect(midiOf('F#4')).toBe(66);
    expect(midiOf('C3')).toBe(48);
  });

  it('keyboard covers only the octave(s) a song needs', () => {
    expect(keyboardRange(['C4', 'G4', 'A4'])).toEqual({ low: 60, high: 71 });
    expect(keyboardRange(['C4', 'C5'])).toEqual({ low: 60, high: 72 });
    expect(keyboardRange(['G3', 'E4'])).toEqual({ low: 48, high: 71 });
  });

  it('joins syllables into words using the song lyric', () => {
    const phrases = [{ lyric: 'Twinkle twinkle little star', notes: [
      { p: 'C4', d: 1, s: 'Twin' }, { p: 'C4', d: 1, s: 'kle' }, { p: 'G4', d: 1, s: 'twin' }, { p: 'G4', d: 1, s: 'kle' },
      { p: 'A4', d: 1, s: 'lit' }, { p: 'A4', d: 1, s: 'tle' }, { p: 'G4', d: 2, s: 'star' }] }];
    const lines = karaokeLines(phrases[0].notes, phrases);
    expect(lines).toHaveLength(1);
    expect(lines[0].words.map((w) => w.text)).toEqual(['Twinkle', 'twinkle', 'little', 'star']);
    expect(lines[0].words[0].noteIdx).toEqual([0, 1]);
  });
});
