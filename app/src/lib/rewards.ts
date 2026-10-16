import type { Lesson, ProgressMap, Song } from '../types';
import { songProgress } from './progress';
import { localDay, weekStart } from './stickers';

/** Level 1 needs 30 stars, each next level 15 more (L2 45, L3 60, ...). */
export function levelFor(totalStars: number): { level: number; inLevel: number; need: number } {
  let level = 1;
  let need = 30;
  let left = Math.max(0, totalStars);
  while (left >= need) {
    left -= need;
    level++;
    need += 15;
  }
  return { level, inLevel: left, need };
}

export interface Quest {
  id: 'classes' | 'song' | 'days';
  progress: number;
  target: number;
  done: boolean;
}

export interface QuestInput {
  progress: ProgressMap;
  /** Local days with the daily goal met (a class finished). */
  goalDays: string[];
  /** Timestamps of every class finished (replays included). */
  completions?: number[];
}

/** Three weekly family quests: play 3 classes, finish a song, play on 4 days. */
export function weeklyQuests(songs: Song[], lessons: Record<string, Lesson>, input: QuestInput, now: number): { quests: Quest[]; allDone: boolean } {
  const start = weekStart(now);
  const end = start + 7 * 86400000;
  const inWeek = (t: number) => t >= start && t < end;
  const classes = input.completions
    ? input.completions.filter(inWeek).length
    : Object.values(input.progress).filter((p) => p.completed && inWeek(p.completedAt ?? 0)).length;
  const songsDone = songs.filter((s) => {
    const l = lessons[s.id];
    if (!l || !songProgress(l, input.progress).finished) return false;
    const last = Math.max(...l.classes.map((c) => input.progress[c.id]?.completedAt ?? 0));
    return inWeek(last);
  }).length;
  const days = new Set(input.goalDays.filter((d) => {
    const [y, m, dd] = d.split('-').map(Number);
    return inWeek(new Date(y, m - 1, dd, 12).getTime());
  })).size;
  const mk = (id: Quest['id'], value: number, target: number): Quest => ({ id, progress: Math.min(value, target), target, done: value >= target });
  const quests = [mk('classes', classes, 3), mk('song', songsDone, 1), mk('days', days, 4)];
  return { quests, allDone: quests.every((q) => q.done) };
}

export function chestId(now: number): string {
  return `chest-${localDay(weekStart(now) + 12 * 3600000)}`;
}

/** The song whose cover sticker is inside this week's chest (stable per week). */
export function chestSong(songs: Song[], id: string): string | undefined {
  if (!songs.length) return undefined;
  let h = 7;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return songs[h % songs.length].id;
}
