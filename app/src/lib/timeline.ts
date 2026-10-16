import type { LessonClass, Segment } from '../types';
import { isPitched, midiOf } from './music';
import { starsForInteractive } from './progress';

export interface ScheduledNote {
  p: string;
  startSec: number;
  durSec: number;
  s?: string;
  f?: number;
  h?: 'L' | 'R';
  who: 'child' | 'parent';
  lh?: { p: string; d: number; f?: number };
  /** index among the segment's pitched notes */
  i: number;
  /** index in the segment's raw notes array (lyric `lines[].from` uses this) */
  raw: number;
}

export function segmentStarts(cls: LessonClass): number[] {
  const out: number[] = [];
  let t = 0;
  for (const s of cls.segments) {
    out.push(t);
    t += s.durationSec;
  }
  return out;
}

export function segmentAt(cls: LessonClass, t: number): { index: number; offset: number } {
  const starts = segmentStarts(cls);
  for (let i = cls.segments.length - 1; i >= 0; i--) {
    if (t >= starts[i]) {
      return { index: i, offset: Math.min(t - starts[i], cls.segments[i].durationSec) };
    }
  }
  return { index: 0, offset: 0 };
}

const round = (v: number) => Math.round(v * 1e6) / 1e6;

/**
 * Timing model shared with content/build_lessons.py and the video renderer:
 * a note segment starts with `leadInSec` of count-in; each note lasts d * 60 / bpm;
 * in your_turn every child note is preceded by `gapBeats` beats of waiting.
 */
export function noteSchedule(seg: Segment, songBpm: number): ScheduledNote[] {
  const spb = 60 / (seg.bpm ?? songBpm);
  const gap = seg.kind === 'your_turn' ? seg.gapBeats ?? 0 : 0;
  const out: ScheduledNote[] = [];
  let t = seg.leadInSec ?? 0;
  let i = 0;
  (seg.notes ?? []).forEach((n, raw) => {
    if (isPitched(n)) {
      const who = n.who === 'parent' ? 'parent' : 'child';
      if (gap && who === 'child') t += gap * spb;
      out.push({ p: n.p, startSec: round(t), durSec: round(n.d * spb), s: n.s, f: n.f, h: n.h, who, lh: n.lh, i: i++, raw });
    }
    t += n.d * spb;
  });
  return out;
}

export type EngineEvent =
  | { type: 'segmentStart'; index: number }
  | { type: 'noteOn'; p: string; durSec: number; kind: Segment['kind'] }
  | { type: 'light'; p: string }
  | { type: 'sound'; p: string }
  | { type: 'hit'; p: string }
  | { type: 'hint'; p: string }
  | { type: 'beatTap' }
  | { type: 'sideOk'; side: 'low' | 'high' }
  | { type: 'sideHint'; side: 'low' | 'high' }
  | { type: 'finished' };

export interface EngineOptions {
  songBpm: number;
  startSegIndex?: number;
  /** Keys at or above this midi count as "high" in high_low games. */
  splitMidi?: number;
  /** Video fallback: child notes play by themselves on the video timeline (no waiting). */
  watch?: boolean;
}

export interface EngineStats {
  yourTurnHits: number;
  yourTurnWrong: number;
  yourTurnDone: number;
  yourTurnTotal: number;
  alongTaps: number;
  alongNotes: number;
}

/** Seconds the your_turn segment lingers after its last note ends. */
export const YOUR_TURN_TAIL = 1.5;

const AUTO_KINDS: Segment['kind'][] = ['listen', 'demo', 'together', 'beat', 'high_low'];
const ALONG_KINDS: Segment['kind'][] = ['together', 'beat'];
const INPUT_KINDS: Segment['kind'][] = ['your_turn', 'together', 'beat', 'high_low'];

/**
 * Plays a class timeline live. Time advances with tick(dt) except while a your_turn
 * child note is waiting for the right key. Wrong keys only play their own sound and
 * hint the right key; nothing ever fails.
 */
export class LessonEngine {
  readonly cls: LessonClass;
  readonly starts: number[];
  segIndex: number;
  segTime = 0;
  finished = false;
  waitingFor: string | null = null;
  private sched: ScheduledNote[] = [];
  /** next note to process (both auto and your_turn) */
  private idx = 0;
  private tailEnd: number | null = null;
  private doneYourTurn = new Set<number>();
  private opts: EngineOptions;
  stats: EngineStats;

  constructor(cls: LessonClass, opts: EngineOptions) {
    this.cls = cls;
    this.opts = opts;
    this.starts = segmentStarts(cls);
    this.segIndex = Math.max(0, Math.min(opts.startSegIndex ?? 0, cls.segments.length - 1));
    const ytIdxs = cls.segments.map((s, i) => (s.kind === 'your_turn' ? i : -1)).filter((i) => i >= 0);
    ytIdxs.filter((i) => i < this.segIndex).forEach((i) => this.doneYourTurn.add(i));
    this.stats = {
      yourTurnHits: 0,
      yourTurnWrong: 0,
      yourTurnDone: this.doneYourTurn.size,
      yourTurnTotal: ytIdxs.length,
      alongTaps: 0,
      alongNotes: 0,
    };
    this.enterSegment();
  }

  get segment(): Segment {
    return this.cls.segments[this.segIndex];
  }
  get schedule(): ScheduledNote[] {
    return this.sched;
  }
  /** Class-time position (seconds on the video timeline) for progress and resume. */
  get classTime(): number {
    if (this.finished) return this.cls.durationSec;
    return round(this.starts[this.segIndex] + Math.min(this.segTime, this.segment.durationSec));
  }
  get allYourTurnDone(): boolean {
    return this.doneYourTurn.size >= this.stats.yourTurnTotal;
  }
  /** Index (in schedule) of the note being played or waited for. */
  get currentNoteIndex(): number {
    if (this.waitingFor) return this.idx;
    return this.idx - 1;
  }
  /** The next child note in a your_turn segment (lit or about to be). */
  get nextTarget(): ScheduledNote | null {
    if (this.segment.kind !== 'your_turn') return null;
    for (let k = this.idx; k < this.sched.length; k++) if (this.sched[k].who === 'child') return this.sched[k];
    return null;
  }
  /** Keys to light now. */
  litKeys(): string[] {
    if (this.waitingFor) return [this.waitingFor];
    const seg = this.segment;
    if (seg.kind === 'say' && seg.showKeys) return seg.showKeys;
    const t = this.segTime;
    const out: string[] = [];
    for (const n of this.sched) {
      if (n.startSec <= t && t < n.startSec + Math.max(n.durSec * 0.9, 0.15)) {
        out.push(n.p);
        if (n.lh) out.push(n.lh.p);
      }
    }
    return out;
  }

  private enterSegment() {
    this.segTime = 0;
    this.idx = 0;
    this.tailEnd = null;
    this.waitingFor = null;
    this.sched = noteSchedule(this.segment, this.opts.songBpm);
  }

  private hasChildNotes(): boolean {
    return this.sched.some((n) => n.who === 'child');
  }

  private segEnd(): number {
    const seg = this.segment;
    if (seg.kind === 'your_turn' && this.hasChildNotes() && !this.opts.watch) {
      return this.tailEnd ?? Number.POSITIVE_INFINITY;
    }
    return seg.durationSec;
  }

  private markYourTurnDone() {
    if (this.segment.kind === 'your_turn' && !this.doneYourTurn.has(this.segIndex)) {
      this.doneYourTurn.add(this.segIndex);
      this.stats.yourTurnDone = this.doneYourTurn.size;
    }
  }

  private advanceSegment(ev: EngineEvent[]) {
    this.markYourTurnDone();
    if (this.segIndex >= this.cls.segments.length - 1) {
      this.finished = true;
      this.waitingFor = null;
      ev.push({ type: 'finished' });
      return;
    }
    this.segIndex++;
    this.enterSegment();
    ev.push({ type: 'segmentStart', index: this.segIndex });
  }

  /** After the last child note of a your_turn segment: end shortly after the music does. */
  private afterChildNote() {
    if (this.nextTarget) return;
    const last = this.sched[this.sched.length - 1];
    const musicEnd = last ? last.startSec + last.durSec : this.segTime;
    this.tailEnd = Math.min(this.segment.durationSec, Math.max(this.segTime, musicEnd) + YOUR_TURN_TAIL);
    this.tailEnd = Math.max(this.tailEnd, this.segTime);
    this.markYourTurnDone();
  }

  tick(dt: number): EngineEvent[] {
    const ev: EngineEvent[] = [];
    let remaining = dt;
    let guard = 0;
    while (!this.finished && !this.waitingFor && guard++ < 10000) {
      const seg = this.segment;
      const isYT = seg.kind === 'your_turn';
      const plays = isYT || AUTO_KINDS.includes(seg.kind);
      const end = this.segEnd();
      let nextT = end;
      if (plays && this.idx < this.sched.length) nextT = Math.min(nextT, this.sched[this.idx].startSec);
      const step = Math.min(remaining, Math.max(0, nextT - this.segTime));
      this.segTime = round(this.segTime + step);
      remaining = round(remaining - step);

      while (plays && this.idx < this.sched.length && this.sched[this.idx].startSec <= this.segTime + 1e-9) {
        const n = this.sched[this.idx];
        if (isYT && n.who === 'child' && !this.opts.watch) {
          this.segTime = n.startSec;
          this.waitingFor = n.p;
          ev.push({ type: 'light', p: n.p });
          break;
        }
        this.idx++;
        if (ALONG_KINDS.includes(seg.kind)) this.stats.alongNotes++;
        ev.push({ type: 'noteOn', p: n.p, durSec: n.durSec, kind: seg.kind });
        if (n.lh) ev.push({ type: 'noteOn', p: n.lh.p, durSec: n.durSec, kind: seg.kind });
      }
      if (this.waitingFor) break;
      if (this.segTime >= end - 1e-9) {
        this.advanceSegment(ev);
        continue;
      }
      if (remaining <= 0) break;
    }
    return ev;
  }

  press(p: string): EngineEvent[] {
    const ev: EngineEvent[] = [{ type: 'sound', p }];
    if (this.finished) return ev;
    const seg = this.segment;
    switch (seg.kind) {
      case 'your_turn': {
        const n = this.sched[this.idx];
        if (!n || n.who !== 'child') break; // a parent note comes first: just a sound
        if (p === n.p) {
          ev.push({ type: 'hit', p });
          if (n.lh) ev.push({ type: 'sound', p: n.lh.p });
          this.stats.yourTurnHits++;
          if (!this.waitingFor) this.segTime = n.startSec; // early tap: jump to the note
          this.waitingFor = null;
          this.idx++;
          this.afterChildNote();
        } else if (this.waitingFor) {
          this.stats.yourTurnWrong++;
          ev.push({ type: 'hint', p: n.p });
        }
        break;
      }
      case 'beat':
        this.stats.alongTaps++;
        ev.push({ type: 'beatTap' });
        break;
      case 'high_low': {
        const side: 'low' | 'high' = midiOf(p) >= (this.opts.splitMidi ?? 66) ? 'high' : 'low';
        const target = seg.target ?? 'high';
        if (side === target) {
          this.stats.alongTaps++;
          ev.push({ type: 'sideOk', side });
        } else {
          ev.push({ type: 'sideHint', side: target });
        }
        break;
      }
      case 'together': {
        if (!this.hasChildNotes()) {
          this.stats.alongTaps++;
          ev.push({ type: 'beatTap' });
          break;
        }
        const near = [this.sched[this.idx - 1], this.sched[this.idx]].filter(Boolean);
        if (near.some((n) => n.p === p)) {
          this.stats.alongTaps++;
          ev.push({ type: 'hit', p });
        }
        break;
      }
      default:
        break;
    }
    return ev;
  }

  result(): { completed: boolean; playedAlong: boolean; perfect: boolean; stars: number } {
    const s = this.stats;
    const completed = s.yourTurnTotal > 0 ? this.allYourTurnDone : this.finished || this.classTime >= this.cls.durationSec * 0.9;
    const hasInput = this.cls.segments.some((g) => INPUT_KINDS.includes(g.kind));
    if (!hasInput) {
      // Nothing to press (listen classes): staying to the end is everything we asked.
      return { completed, playedAlong: this.finished, perfect: this.finished, stars: starsForInteractive({ completed, playedAlong: this.finished, perfect: this.finished }) };
    }
    const alongRatio = s.alongNotes > 0 ? Math.min(1, s.alongTaps / s.alongNotes) : 0;
    const playedAlong = s.alongNotes > 0 ? alongRatio >= 0.5 || s.yourTurnHits > 0 : s.yourTurnHits > 0 || s.alongTaps > 0;
    const perfect = s.yourTurnTotal > 0 ? s.yourTurnWrong === 0 && s.yourTurnHits > 0 : alongRatio >= 0.8;
    return { completed, playedAlong, perfect, stars: starsForInteractive({ completed, playedAlong, perfect }) };
  }
}

export interface ChildCue {
  /** absolute class time the child's note starts / ends (video time) */
  t: number;
  tEnd: number;
  p: string;
  seg: number;
  /** true for the last child note of its your_turn segment */
  last: boolean;
}

/** Child notes the real-piano player waits for (your_turn segments), in video time. */
export function childCues(cls: LessonClass, songBpm: number): ChildCue[] {
  const starts = segmentStarts(cls);
  const out: ChildCue[] = [];
  cls.segments.forEach((seg, si) => {
    if (seg.kind !== 'your_turn') return;
    const notes = noteSchedule(seg, songBpm).filter((n) => n.who === 'child');
    notes.forEach((n, k) => out.push({ t: round(starts[si] + n.startSec), tEnd: round(starts[si] + n.startSec + n.durSec), p: n.p, seg: si, last: k === notes.length - 1 }));
  });
  return out;
}
