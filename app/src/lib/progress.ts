import type { ClassProgress, Lesson, LessonClass, ProgressMap } from '../types';

/** A class counts complete at >= 90% watched (contract). */
export const COMPLETE_FRACTION = 0.9;
/** Positions within this many seconds of the end are not "in progress" (contract). */
export const END_MARGIN_SEC = 10;
/** Video watched this far counts as "watched to the end" (2 stars in real-piano mode). */
export const END_FRACTION = 0.99;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function isInProgress(cls: LessonClass, p: ClassProgress | undefined): boolean {
  if (!p || p.completed) return false;
  return p.positionSec > 0 && p.positionSec < cls.durationSec - END_MARGIN_SEC;
}

/** Save a playback position; marks complete at 90%. Never un-completes, keeps best stars. */
export function recordPosition(
  map: ProgressMap,
  cls: LessonClass,
  positionSec: number,
  now: number,
  extra: Partial<Pick<ClassProgress, 'segIndex'>> = {},
): ProgressMap {
  const prev = map[cls.id];
  const pos = clamp(positionSec, 0, cls.durationSec);
  const reached = pos >= cls.durationSec * COMPLETE_FRACTION;
  const completed = !!prev?.completed || reached;
  const next: ClassProgress = {
    positionSec: pos,
    completed,
    stars: Math.max(prev?.stars ?? 0, reached ? 1 : 0),
    lastWatchedAt: now,
    completedAt: prev?.completedAt ?? (reached ? now : undefined),
    ...(extra.segIndex !== undefined ? { segIndex: extra.segIndex } : prev?.segIndex !== undefined ? { segIndex: prev.segIndex } : {}),
  };
  if (next.completedAt === undefined) delete next.completedAt;
  return { ...map, [cls.id]: next };
}

/** Mark a class finished with the stars earned this attempt (keeps the best). */
export function recordCompletion(map: ProgressMap, cls: LessonClass, stars: number, now: number): ProgressMap {
  const prev = map[cls.id];
  return {
    ...map,
    [cls.id]: {
      positionSec: cls.durationSec,
      completed: true,
      stars: clamp(Math.max(prev?.stars ?? 0, stars), 0, 3),
      lastWatchedAt: now,
      completedAt: prev?.completedAt ?? now,
    },
  };
}

export function resumePositionFor(cls: LessonClass, p: ClassProgress | undefined): number {
  return isInProgress(cls, p) ? p!.positionSec : 0;
}

export function starsForVideo(fraction: number): number {
  if (fraction >= END_FRACTION) return 2;
  if (fraction >= COMPLETE_FRACTION) return 1;
  return 0;
}

export function starsForInteractive(r: { completed: boolean; playedAlong: boolean; perfect: boolean }): number {
  if (!r.completed) return 0;
  if (!r.playedAlong) return 1;
  return r.perfect ? 3 : 2;
}

export interface SongProgress {
  completedCount: number;
  total: number;
  fraction: number;
  started: boolean;
  finished: boolean;
  /** First unfinished class in recommended (index) order. */
  nextClass: LessonClass | null;
  lastWatchedAt: number;
  totalStars: number;
}

export function songProgress(lesson: Lesson, map: ProgressMap): SongProgress {
  let completedCount = 0;
  let started = false;
  let last = 0;
  let totalStars = 0;
  const sorted = [...lesson.classes].sort((a, b) => a.index - b.index);
  for (const c of sorted) {
    const p = map[c.id];
    if (p) {
      started = true;
      last = Math.max(last, p.lastWatchedAt);
      totalStars += p.stars;
    }
    if (p?.completed) completedCount++;
  }
  const total = sorted.length;
  return {
    completedCount,
    total,
    fraction: total ? completedCount / total : 0,
    started,
    finished: total > 0 && completedCount === total,
    nextClass: nextUp(lesson, map),
    lastWatchedAt: last,
    totalStars,
  };
}

/** The most recently finished class of a song, if any. */
function lastFinished(lesson: Lesson, map: ProgressMap): LessonClass | null {
  let best: LessonClass | null = null;
  for (const c of lesson.classes) {
    const p = map[c.id];
    if (p?.completed && (!best || p.lastWatchedAt > map[best.id].lastWatchedAt)) best = c;
  }
  return best;
}

/** Next class: the first unfinished one after the most recently finished class (wrapping to the first unfinished). */
export function nextUp(lesson: Lesson, map: ProgressMap): LessonClass | null {
  const sorted = [...lesson.classes].sort((a, b) => a.index - b.index);
  const open = sorted.filter((c) => !map[c.id]?.completed);
  if (!open.length) return null;
  const done = lastFinished(lesson, map);
  return (done && open.find((c) => c.index > done.index)) || open[0];
}

export type ClassState = 'done' | 'in_progress' | 'next_up' | 'not_started';

export function classStates(lesson: Lesson, map: ProgressMap): Record<string, ClassState> {
  const sp = songProgress(lesson, map);
  const out: Record<string, ClassState> = {};
  for (const c of lesson.classes) {
    const p = map[c.id];
    if (p?.completed) out[c.id] = 'done';
    else if (isInProgress(c, p)) out[c.id] = 'in_progress';
    else if (sp.nextClass?.id === c.id) out[c.id] = 'next_up';
    else out[c.id] = 'not_started';
  }
  return out;
}

export interface ContinueItem {
  songId: string;
  classId: string;
  kind: 'in_progress' | 'next';
  fraction: number;
  positionSec: number;
  lastWatchedAt: number;
}

/**
 * Contract: classes with 0 < positionSec < duration - 10s, or the next class of any
 * started song, newest first. Completed classes and finished songs are left out.
 */
export function continueRow(lessons: Record<string, Lesson>, map: ProgressMap): ContinueItem[] {
  const items: ContinueItem[] = [];
  for (const lesson of Object.values(lessons)) {
    const sp = songProgress(lesson, map);
    if (!sp.started || sp.finished) continue;
    const listed = new Set<string>();
    for (const c of lesson.classes) {
      const p = map[c.id];
      if (isInProgress(c, p)) {
        items.push({
          songId: lesson.songId,
          classId: c.id,
          kind: 'in_progress',
          fraction: p!.positionSec / c.durationSec,
          positionSec: p!.positionSec,
          lastWatchedAt: p!.lastWatchedAt,
        });
        listed.add(c.id);
      }
    }
    const next = sp.nextClass;
    const done = lastFinished(lesson, map);
    if (next && !listed.has(next.id) && (done || listed.size === 0)) {
      const at = done ? map[done.id].lastWatchedAt : sp.lastWatchedAt;
      items.push({ songId: lesson.songId, classId: next.id, kind: 'next', fraction: 0, positionSec: 0, lastWatchedAt: at });
    }
  }
  return items.sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
}

export function heroItem(lessons: Record<string, Lesson>, map: ProgressMap): ContinueItem | null {
  return continueRow(lessons, map)[0] ?? null;
}

/** "Continue watching" row: in-progress classes, newest first, excluding the hero. */
export function inProgressRow(lessons: Record<string, Lesson>, map: ProgressMap): ContinueItem[] {
  const hero = heroItem(lessons, map);
  return continueRow(lessons, map).filter((i) => i.kind === 'in_progress' && i.classId !== hero?.classId);
}

/** Merge two progress maps (device + account): completion and best stars from either side,
 * position and lastWatchedAt from whichever was watched most recently. */
export function mergeProgress(a: ProgressMap, b: ProgressMap): ProgressMap {
  const out: ProgressMap = { ...a };
  for (const [id, rp] of Object.entries(b)) {
    const lp = out[id];
    if (!lp) {
      out[id] = rp;
      continue;
    }
    const newer = rp.lastWatchedAt > lp.lastWatchedAt ? rp : lp;
    const completedAts = [lp.completedAt, rp.completedAt].filter((v): v is number => typeof v === 'number');
    const merged: ClassProgress = {
      positionSec: newer.positionSec,
      completed: lp.completed || rp.completed,
      stars: Math.max(lp.stars, rp.stars),
      lastWatchedAt: Math.max(lp.lastWatchedAt, rp.lastWatchedAt),
    };
    if (completedAts.length) merged.completedAt = Math.min(...completedAts);
    if (newer.segIndex !== undefined) merged.segIndex = newer.segIndex;
    out[id] = merged;
  }
  return out;
}
