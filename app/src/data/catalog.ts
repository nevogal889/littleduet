import songsJson from './songs.json';
import { LESSONS, fullLesson } from './lessons';
import type { Lesson, LessonClass, Song } from '../types';
import { isPitched } from '../lib/music';

/** Songs that have a lesson file (the app only shows playable songs). */
export const SONGS: Song[] = (songsJson as unknown as Song[]).filter((s) => LESSONS[s.id]);
export { LESSONS, fullLesson };

const songIndex = new Map(SONGS.map((s) => [s.id, s]));
const classIndex = new Map<string, { song: Song; lesson: Lesson; cls: LessonClass }>();
for (const s of SONGS) {
  for (const c of LESSONS[s.id].classes) classIndex.set(c.id, { song: s, lesson: LESSONS[s.id], cls: c });
}

export function songById(id: string): Song | undefined {
  return songIndex.get(id);
}
export function lessonFor(songId: string): Lesson | undefined {
  return LESSONS[songId];
}
export function classById(classId: string) {
  return classIndex.get(classId);
}
/** The class with its segment timeline (loads that song's full lesson on first use). */
export function fullClass(classId: string): LessonClass | undefined {
  const hit = classIndex.get(classId);
  if (!hit) return undefined;
  return fullLesson(hit.song.id)?.classes.find((c) => c.id === classId) ?? hit.cls;
}

export function nextClassOf(classId: string): LessonClass | undefined {
  const hit = classIndex.get(classId);
  if (!hit) return undefined;
  return hit.lesson.classes.find((c) => c.index === hit.cls.index + 1);
}

/** Pitches the child may press in a class (falls back to the song melody). */
export function childPitches(song: Song, cls: LessonClass): string[] {
  const out = new Set<string>();
  for (const seg of cls.segments) {
    if (!['your_turn', 'together', 'demo'].includes(seg.kind)) continue;
    for (const n of seg.notes ?? []) {
      if (!isPitched(n) || n.who === 'parent') continue;
      out.add(n.p);
      if (n.lh) out.add(n.lh.p);
    }
  }
  if (!out.size) {
    for (const ph of song.phrases) for (const n of ph.notes) if (isPitched(n)) out.add(n.p);
  }
  return [...out];
}
