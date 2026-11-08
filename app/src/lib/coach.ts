// The adaptive teacher's memory and judgement. Pure functions, device-only data.
//
// Every class leaves a small log: for each note the child was asked to play, how it went
// (on their own, after a hint, the grown-up confirmed it, or skipped) and how long it took.
// From those logs the teacher decides, before the next class, how much help to give and how
// fast to go, and tells the grown-up what it noticed. Nothing here leaves the phone.

import type { PlayMode } from '../types';

/** solo: played without help · helped: after a hint or a nudge · grownUp: "We played it" · skipped */
export type CueOutcome = 'solo' | 'helped' | 'grownUp' | 'skipped';

export interface CueLog {
  /** pitch, e.g. "E4" */
  p: string;
  o: CueOutcome;
  /** seconds the class waited for this note */
  w: number;
}

export interface ClassLog {
  classId: string;
  songId: string;
  /** epoch ms when the class ended */
  at: number;
  mode: PlayMode;
  /** seconds actually spent in the class */
  sec: number;
  completed: boolean;
  /** notes the child was asked to play; empty when nothing was listened for (mic off) */
  cues: CueLog[];
  /** playback speed the class ran at (1 = normal) */
  tempo?: number;
}

export type HintLevel = 'fade' | 'normal' | 'extra';

export interface CoachPlan {
  hintLevel: HintLevel;
  /** 1, or 0.85 when the child needs it slower */
  tempo: number;
  /** note names (no octave) this class should give extra time and a hint on */
  focus: string[];
  /** note names the child has been playing on their own (for the grown-up's line) */
  strong: string[];
  /** why, for the grown-up: one of the coach.plan.* strings */
  reason: 'first' | 'steady' | 'extra' | 'slower' | 'fade';
}

/** Seconds before the first nudge, the grown-up nudge and "We played it", per hint level. */
export const NUDGE_TIMES: Record<HintLevel, { child: number; grownUp: number; override: number }> = {
  fade: { child: 6, grownUp: 12, override: 7 },
  normal: { child: 6, grownUp: 12, override: 7 },
  extra: { child: 3, grownUp: 7, override: 4 },
};

/** A note counts as played solo when it was found before the first nudge. */
export function outcomeFor(waitSec: number, opts: { hinted?: boolean; grownUp?: boolean; skipped?: boolean; level?: HintLevel } = {}): CueOutcome {
  if (opts.skipped) return 'skipped';
  if (opts.grownUp) return 'grownUp';
  if (opts.hinted) return 'helped';
  return waitSec <= NUDGE_TIMES[opts.level ?? 'normal'].child ? 'solo' : 'helped';
}

export const noteName = (p: string) => p.replace(/\d+$/, '');
const KEEP = 80;

/** Append a log, keeping the most recent 80 (about a month of daily play). */
export function addLog(logs: ClassLog[] | undefined, log: ClassLog): ClassLog[] {
  return [...(logs ?? []), log].slice(-KEEP);
}

const listened = (logs: ClassLog[]) => logs.filter((l) => l.cues.length > 0);
const soloShare = (cues: CueLog[]) => (cues.length ? cues.filter((c) => c.o === 'solo').length / cues.length : 0);

export interface NoteStat {
  note: string;
  tries: number;
  /** recency-weighted share played solo, 0..1 */
  score: number;
}

/** Per note name: how reliably the child finds it alone, newer classes counting more. */
export function noteStats(logs: ClassLog[]): NoteStat[] {
  const acc = new Map<string, { w: number; s: number; tries: number }>();
  const recent = listened(logs).slice(-20);
  recent.forEach((log, i) => {
    const weight = Math.pow(0.85, recent.length - 1 - i);
    for (const c of log.cues) {
      const n = noteName(c.p);
      const a = acc.get(n) ?? { w: 0, s: 0, tries: 0 };
      a.w += weight;
      a.s += weight * (c.o === 'solo' ? 1 : c.o === 'helped' ? 0.4 : 0);
      a.tries += 1;
      acc.set(n, a);
    }
  });
  return [...acc.entries()].map(([note, a]) => ({ note, tries: a.tries, score: a.w ? a.s / a.w : 0 })).sort((x, y) => y.score - x.score);
}

/**
 * Before a class: how much help and how fast. `classNotes` are the child's pitches in this class.
 * Rules (kept simple on purpose, so a grown-up can predict them):
 * - first classes, or not enough data: normal;
 * - the last 2 listened classes were mostly solo (85%+, 6+ notes): fade the hints;
 * - the last 2 were mostly helped (under 40% solo, 4+ notes): extra hints;
 *   and if this same song went that way last time, also play 15% slower.
 */
export function planFor(logs: ClassLog[] | undefined, songId: string, classNotes: string[], enabled = true): CoachPlan {
  const all = listened(logs ?? []);
  const stats = noteStats(all);
  const names = [...new Set(classNotes.map(noteName))];
  const strong = stats.filter((s) => s.tries >= 3 && s.score >= 0.8).map((s) => s.note);
  const focus = names.filter((n) => {
    const s = stats.find((x) => x.note === n);
    return !!s && s.tries >= 2 && s.score < 0.5;
  });
  if (!enabled || all.length === 0) return { hintLevel: 'normal', tempo: 1, focus: enabled ? focus : [], strong, reason: all.length ? 'steady' : 'first' };
  const last2 = all.slice(-2);
  const cues = last2.flatMap((l) => l.cues);
  const share = soloShare(cues);
  const lastSame = [...all].reverse().find((l) => l.songId === songId);
  if (cues.length >= 4 && share < 0.4) {
    const slower = !!lastSame && lastSame.cues.length >= 3 && soloShare(lastSame.cues) < 0.4;
    return { hintLevel: 'extra', tempo: slower ? 0.85 : 1, focus, strong, reason: slower ? 'slower' : 'extra' };
  }
  if (last2.length === 2 && cues.length >= 6 && share >= 0.85) return { hintLevel: 'fade', tempo: 1, focus, strong, reason: 'fade' };
  return { hintLevel: 'normal', tempo: 1, focus, strong, reason: 'steady' };
}

export interface Noticed {
  total: number;
  solo: number;
  /** note names played solo in this class for the first time ever */
  firstSolo: string[];
  /** note names that needed help in this class */
  workingOn: string[];
  /** the grown-up confirmed at least one note (mic missed it or it was hard) */
  grownUpHelped: boolean;
}

/** After a class: what the teacher noticed. `before` = logs before this class. */
export function noticed(log: ClassLog, before: ClassLog[] | undefined): Noticed {
  const prevSolo = new Set(listened(before ?? []).flatMap((l) => l.cues.filter((c) => c.o === 'solo').map((c) => noteName(c.p))));
  const solo = log.cues.filter((c) => c.o === 'solo');
  const firstSolo = [...new Set(solo.map((c) => noteName(c.p)))].filter((n) => !prevSolo.has(n));
  const soloNames = new Set(solo.map((c) => noteName(c.p)));
  const workingOn = [...new Set(log.cues.filter((c) => c.o !== 'solo').map((c) => noteName(c.p)))].filter((n) => !soloNames.has(n));
  return { total: log.cues.length, solo: solo.length, firstSolo, workingOn, grownUpHelped: log.cues.some((c) => c.o === 'grownUp') };
}

export interface WeekReport {
  classes: number;
  minutes: number;
  days: number;
  /** share of notes played solo this week, null when nothing was listened for */
  soloShare: number | null;
  /** the same for the week before, for the trend */
  soloSharePrev: number | null;
  strong: string[];
  workingOn: string[];
}

const DAY = 86400000;

/** The grown-up's weekly summary: the last 7 days against the 7 before. */
export function weekReport(logs: ClassLog[] | undefined, now: number): WeekReport {
  const L = logs ?? [];
  const week = L.filter((l) => l.at > now - 7 * DAY);
  const prev = L.filter((l) => l.at <= now - 7 * DAY && l.at > now - 14 * DAY);
  const share = (ls: ClassLog[]) => {
    const c = ls.flatMap((l) => l.cues);
    return c.length ? soloShare(c) : null;
  };
  const stats = noteStats(week);
  return {
    classes: week.filter((l) => l.completed).length,
    minutes: Math.round(week.reduce((a, l) => a + l.sec, 0) / 60),
    days: new Set(week.map((l) => new Date(l.at).toDateString())).size,
    soloShare: share(week),
    soloSharePrev: share(prev),
    strong: stats.filter((s) => s.tries >= 2 && s.score >= 0.8).map((s) => s.note).slice(0, 4),
    workingOn: stats.filter((s) => s.tries >= 2 && s.score < 0.5).map((s) => s.note).slice(0, 3),
  };
}
