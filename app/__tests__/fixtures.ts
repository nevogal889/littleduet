import type { Lesson, LessonClass, Segment, Song } from '@/types';

export function seg(kind: Segment['kind'], durationSec: number, extra: Partial<Segment> = {}): Segment {
  return { kind, caption: kind, durationSec, ...extra };
}

export function makeClass(songId: string, index: number, durationSec = 200, segments?: Segment[]): LessonClass {
  const id = `${songId}-c${String(index).padStart(2, '0')}`;
  return {
    id,
    index,
    title: `Class ${index}`,
    goal: 'goal',
    type: index === 1 ? 'listen' : 'phrase',
    durationSec,
    parentTip: 'tip',
    video: `${songId}/${id}.mp4`,
    thumb: `${songId}/${id}.jpg`,
    segments: segments ?? [seg('title', 10), seg('say', durationSec - 10)],
  };
}

export function makeLesson(songId: string, count: number, durationSec = 200): Lesson {
  return { songId, classes: Array.from({ length: count }, (_, i) => makeClass(songId, i + 1, durationSec)) };
}

export function makeSong(id: string, ageGroup: Song['ageGroup'] = '2-3', difficulty: Song['difficulty'] = 1, extra: Partial<Song> = {}): Song {
  return {
    id,
    title: id.replace(/-/g, ' '),
    ageGroup,
    difficulty,
    tags: ['classic'],
    icon: 'star',
    key: 'C',
    bpm: 80,
    timeSignature: '4/4',
    phrases: [{ lyric: 'Hot cross buns', notes: [{ p: 'E4', d: 1, s: 'Hot' }, { p: 'D4', d: 1, s: 'cross' }, { p: 'C4', d: 2, s: 'buns' }] }],
    ...extra,
  };
}
