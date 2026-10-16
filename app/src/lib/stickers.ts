import type { AgeGroupId, Lesson, ProgressMap, Song } from '../types';
import { AGE_GROUPS } from './catalog';
import { songProgress } from './progress';

export type Milestone = 'first' | 'half' | 'concert';

export interface Sticker {
  id: string; // `${songId}:${milestone}`
  songId: string;
  milestone: Milestone;
  icon: string;
  label: string;
}

const MILESTONE_LABEL: Record<Milestone, string> = {
  first: 'First class',
  half: 'Halfway',
  concert: 'Concert',
};

export function allStickers(songs: Song[], lessons: Record<string, Lesson>): Sticker[] {
  return songs
    .filter((s) => lessons[s.id])
    .flatMap((s) =>
      (['first', 'half', 'concert'] as Milestone[]).map((m) => ({
        id: `${s.id}:${m}`,
        songId: s.id,
        milestone: m,
        icon: s.icon,
        label: `${s.title}: ${MILESTONE_LABEL[m]}`,
      })),
    );
}

function milestonesReached(lesson: Lesson, map: ProgressMap): Milestone[] {
  const sp = songProgress(lesson, map);
  const out: Milestone[] = [];
  if (sp.completedCount >= 1) out.push('first');
  if (sp.total > 0 && sp.completedCount >= Math.ceil(sp.total / 2)) out.push('half');
  if (sp.finished) out.push('concert');
  return out;
}

export function earnedStickerIds(songs: Song[], lessons: Record<string, Lesson>, map: ProgressMap): string[] {
  return songs.flatMap((s) => (lessons[s.id] ? milestonesReached(lessons[s.id], map).map((m) => `${s.id}:${m}`) : []));
}

export function newlyEarned(songs: Song[], lessons: Record<string, Lesson>, before: ProgressMap, after: ProgressMap): Sticker[] {
  const had = new Set(earnedStickerIds(songs, lessons, before));
  const now = new Set(earnedStickerIds(songs, lessons, after));
  return allStickers(songs, lessons).filter((s) => now.has(s.id) && !had.has(s.id));
}

/** Share of songs in a group that must be finished to "graduate" it. */
export const MOSTLY_DONE = 0.75;

function finishedSongs(songs: Song[], lessons: Record<string, Lesson>, map: ProgressMap): Song[] {
  return songs.filter((s) => lessons[s.id] && songProgress(lessons[s.id], map).finished);
}

export function levelUps(songs: Song[], lessons: Record<string, Lesson>, map: ProgressMap): AgeGroupId[] {
  const done = new Set(finishedSongs(songs, lessons, map).map((s) => s.id));
  return AGE_GROUPS.map((g) => g.id).filter((g) => {
    const inGroup = songs.filter((s) => s.ageGroup === g && lessons[s.id]);
    return inGroup.length > 0 && inGroup.filter((s) => done.has(s.id)).length / inGroup.length >= MOSTLY_DONE;
  });
}

export interface Badge {
  id: string;
  group: 'child' | 'grownUp';
  /** i18n keys (copy: badges.child.<id>.name); graduate badges use badges.grad.* with ageLabel */
  nameKey: string;
  descKey: string;
  params?: Record<string, string>;
  earned: boolean;
}

export interface BadgeContext {
  activityDays?: string[];
  modesUsed?: string[];
  stickerCount?: number;
  /** Years a class was finished on the child's birthday. */
  birthdays?: string[];
}

/** Badge rules for the badge set in copy/strings.en.json, plus age-group graduates. */
export function badges(songs: Song[], lessons: Record<string, Lesson>, map: ProgressMap, ctx: BadgeContext = {}): Badge[] {
  const done = Object.entries(map).filter(([, p]) => p.completed).map(([id]) => id);
  const doneSet = new Set(done);
  const classes = Object.values(lessons).flatMap((l) => l.classes);
  const doneOfType = (type: string) => classes.filter((c) => c.type === type && doneSet.has(c.id)).length;
  const finished = finishedSongs(songs, lessons, map);
  const finishedTag = (tag: string) => finished.filter((s) => s.tags.includes(tag)).length;
  const stars = Object.values(map).reduce((a, p) => a + p.stars, 0);
  const minutes = classes.filter((c) => doneSet.has(c.id)).reduce((a, c) => a + c.durationSec / 60, 0);
  const modes = new Set(ctx.modesUsed ?? []);
  const grads = new Set(levelUps(songs, lessons, map));
  const child = (id: string, earned: boolean): Badge => ({ id, group: 'child', nameKey: `badges.child.${id}.name`, descKey: `badges.child.${id}.description`, earned });
  const grown = (id: string, earned: boolean): Badge => ({ id, group: 'grownUp', nameKey: `badges.grownUp.${id}.name`, descKey: `badges.grownUp.${id}.description`, earned });
  return [
    child('firstClass', done.length >= 1),
    child('firstConcert', doneOfType('concert') >= 1),
    child('beatKeeper', doneOfType('beat') >= 5),
    child('echoStar', doneOfType('echo') >= 5),
    child('highLow', doneOfType('high-low') >= 3),
    child('threeSongs', finished.length >= 3),
    child('tenSongs', finished.length >= 10),
    child('animalFriend', finishedTag('animals') >= 3),
    child('bedtime', finishedTag('bedtime') >= 3),
    child('leftHand', doneOfType('left-hand') >= 1),
    child('stickerFan', (ctx.stickerCount ?? earnedStickerIds(songs, lessons, map).length) >= 20),
    child('allStars', stars >= 100),
    child('birthday', (ctx.birthdays ?? []).length > 0),
    ...AGE_GROUPS.map(
      (g): Badge => ({
        id: `grad-${g.id}`,
        group: 'child',
        nameKey: 'badges.grad.name',
        descKey: 'badges.grad.description',
        params: { ageLabel: g.label },
        earned: grads.has(g.id),
      }),
    ),
    grown('duetPartner', done.length >= 10),
    grown('fiveDays', bestWeekDays(ctx.activityDays ?? []) >= 5),
    grown('concertHost', doneOfType('concert') >= 3),
    grown('songBuilder', finished.length >= 5),
    grown('hundredMinutes', minutes >= 100),
    grown('bothModes', modes.has('real') && modes.has('screen')),
  ];
}

/** Most distinct music days in any single Monday-Sunday week. */
export function bestWeekDays(days: string[]): number {
  const perWeek = new Map<number, Set<string>>();
  for (const day of days) {
    const [y, m, d] = day.split('-').map(Number);
    const wk = weekStart(new Date(y, m - 1, d).getTime());
    if (!perWeek.has(wk)) perWeek.set(wk, new Set());
    perWeek.get(wk)!.add(day);
  }
  return Math.max(0, ...[...perWeek.values()].map((s) => s.size));
}

export function localDay(ms: number): string {
  const d = new Date(ms);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Monday 00:00 local of the week containing `now`. */
export function weekStart(now: number): number {
  const d = new Date(now);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow).getTime();
}

export function musicDaysThisWeek(days: string[], now: number): number {
  const start = weekStart(now);
  const end = start + 7 * 24 * 3600 * 1000;
  const inWeek = new Set<string>();
  for (const day of days) {
    const [y, m, d] = day.split('-').map(Number);
    const t = new Date(y, m - 1, d).getTime();
    if (t >= start && t < end) inWeek.add(day);
  }
  return inWeek.size;
}

export function classesThisWeek(map: ProgressMap, now: number): number {
  const start = weekStart(now);
  return Object.values(map).filter((p) => p.completed && (p.completedAt ?? 0) >= start).length;
}

export interface HomeStats {
  stars: number;
  songsLearned: number;
  /** Monday..Sunday of this week: true when music was played that day */
  week: boolean[];
  musicDays: number;
}

/** The three child-readable stats on Home: stars, songs learned, music days this week. */
export function homeStats(songs: Song[], lessons: Record<string, Lesson>, child: { progress: ProgressMap; activityDays: string[]; stickers: string[] }, now: number): HomeStats {
  const stars = Object.values(child.progress).reduce((a, p) => a + p.stars, 0);
  const songsLearned = finishedSongs(songs, lessons, child.progress).length;
  const start = weekStart(now);
  const played = new Set(child.activityDays);
  const week = Array.from({ length: 7 }, (_, i) => played.has(localDay(start + i * 86400000 + 12 * 3600000)));
  return { stars, songsLearned, week, musicDays: week.filter(Boolean).length };
}

/** Grown-ups: minutes of classes played this week (finished classes count in full). */
export function minutesThisWeek(lessons: Record<string, Lesson>, map: ProgressMap, now: number): number {
  const start = weekStart(now);
  let sec = 0;
  for (const l of Object.values(lessons)) {
    for (const c of l.classes) {
      const p = map[c.id];
      if (!p || p.lastWatchedAt < start) continue;
      sec += p.completed ? c.durationSec : Math.min(p.positionSec, c.durationSec);
    }
  }
  return Math.round(sec / 60);
}
