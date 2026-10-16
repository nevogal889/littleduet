import type { AgeGroupId, Difficulty, Lesson, ProgressMap, Song } from '../types';
import { songProgress } from './progress';

export const AGE_GROUPS: { id: AgeGroupId; label: string; ages: string; min: number }[] = [
  { id: '2-3', label: 'Tiny Ears', ages: '2-3', min: 2 },
  { id: '3-4', label: 'Little Explorer', ages: '3-4', min: 3 },
  { id: '4-5', label: 'First Songs', ages: '4-5', min: 4 },
  { id: '5-6', label: 'Little Pianist', ages: '5-6', min: 5 },
];

export function ageGroupLabel(id: AgeGroupId): string {
  return AGE_GROUPS.find((g) => g.id === id)?.label ?? id;
}

export function ageGroupForAge(age: number): AgeGroupId {
  if (age <= 2) return '2-3';
  if (age === 3) return '3-4';
  if (age === 4) return '4-5';
  return '5-6';
}

const groupRank = (id: AgeGroupId) => AGE_GROUPS.findIndex((g) => g.id === id);

export type DifficultyWord = 'Easy' | 'Medium' | 'Harder';
export const DIFFICULTY_WORDS: DifficultyWord[] = ['Easy', 'Medium', 'Harder'];

export function difficultyWord(d: Difficulty | number): DifficultyWord {
  if (d <= 2) return 'Easy';
  if (d === 3) return 'Medium';
  return 'Harder';
}

export function songStats(lesson: Lesson | undefined): { classes: number; minutes: number } {
  if (!lesson) return { classes: 0, minutes: 0 };
  const sec = lesson.classes.reduce((a, c) => a + c.durationSec, 0);
  return { classes: lesson.classes.length, minutes: Math.round(sec / 60) };
}

const byEasiest = (a: Song, b: Song) =>
  a.difficulty - b.difficulty || groupRank(a.ageGroup) - groupRank(b.ageGroup) || a.title.localeCompare(b.title);

export function filterSongs(
  songs: Song[],
  f: { ageGroup?: AgeGroupId | null; difficulty?: DifficultyWord | null; query?: string },
): Song[] {
  const q = (f.query ?? '').trim().toLowerCase();
  return songs
    .filter((s) => !f.ageGroup || s.ageGroup === f.ageGroup)
    .filter((s) => !f.difficulty || difficultyWord(s.difficulty) === f.difficulty)
    .filter(
      (s) =>
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)),
    )
    .sort(byEasiest);
}

/** Songs in the child's age group: unfinished first, then easiest first. */
export function pickedFor(songs: Song[], lessons: Record<string, Lesson>, progress: ProgressMap, age: number): Song[] {
  const group = ageGroupForAge(age);
  const finished = (s: Song) => (lessons[s.id] ? songProgress(lessons[s.id], progress).finished : false);
  return songs
    .filter((s) => s.ageGroup === group)
    .sort((a, b) => Number(finished(a)) - Number(finished(b)) || byEasiest(a, b));
}

/** Difficulty 1-2 songs at or below the child's age group. */
export function easySongs(songs: Song[], age: number): Song[] {
  const rank = groupRank(ageGroupForAge(age));
  return songs.filter((s) => s.difficulty <= 2 && groupRank(s.ageGroup) <= rank).sort(byEasiest);
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

function weekNumber(now: number): number {
  // Weeks since a Monday epoch (1970-01-05).
  return Math.floor((now - new Date(1970, 0, 5).getTime()) / WEEK_MS);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Songs added in the last 7 days (when the catalog provides `addedAt`), otherwise a
 * stable weekly rotation so the row changes every Monday.
 */
export function newThisWeek(songs: Song[], now: number, count = 8): Song[] {
  const dated = songs.filter((s) => s.addedAt);
  if (dated.length) {
    return dated
      .filter((s) => now - new Date(s.addedAt!).getTime() <= WEEK_MS && new Date(s.addedAt!).getTime() <= now)
      .sort((a, b) => b.addedAt!.localeCompare(a.addedAt!))
      .slice(0, count);
  }
  const wk = weekNumber(now);
  return [...songs].sort((a, b) => hash(`${wk}:${a.id}`) - hash(`${wk}:${b.id}`)).slice(0, count);
}

/** Song cover produced by the video teammate: <songId>/cover.jpg (16:9) or cover-square.jpg. */
export function coverPath(songId: string, kind: 'wide' | 'square'): string {
  return `${songId}/${kind === 'wide' ? 'cover.jpg' : 'cover-square.jpg'}`;
}

export type MediaManifest = Record<string, { photo?: boolean; cover?: boolean; square?: boolean }>;

/**
 * Cover image sources for a song slot, best first. Empty list = draw the icon art.
 * - wide (16:9) slots: the founder's cover content/covers/<songId>.jpg (served as <songId>/photo.jpg),
 *   then the lesson-style video/out/<songId>/cover.jpg. Shown with resizeMode cover, centred.
 * - square / squircle slots: the square-composed cover-square.jpg first (titles are baked into
 *   the images, so a square crop of a wide cover would cut them), then the wide cover cropped.
 * Songs missing from the manifest try every source (falling through on load errors).
 */
export function coverSources(songId: string, kind: 'wide' | 'square', manifest: MediaManifest): string[] {
  const m = manifest[songId];
  const out: string[] = [];
  if (kind === 'square' && (!m || m.square)) out.push(coverPath(songId, 'square'));
  if (!m || m.photo) out.push(`${songId}/photo.jpg`);
  if (kind === 'wide' && (!m || m.cover)) out.push(coverPath(songId, 'wide'));
  return out;
}
