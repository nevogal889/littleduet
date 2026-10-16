// Data types mirror /home/claude/littleduet/CONTRACT.md (binding schema).

export type AgeGroupId = '2-3' | '3-4' | '4-5' | '5-6';
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface PitchedNote {
  p: string; // scientific pitch, sharps only (C4, F#4)
  d: number; // beats
  f?: number; // finger 1-5
  s?: string; // syllable
  h?: 'L' | 'R';
  rest?: false;
  /** Lesson files: "parent" notes are played by the grown-up / video; others are the child's. */
  who?: 'parent' | 'child';
  /** Lesson files: a left-hand note struck together with this one (the child's). */
  lh?: { p: string; d: number; f?: number; h?: 'L' };
}
export interface RestNote {
  rest: true;
  d: number;
}
export type Note = PitchedNote | RestNote;

export interface Phrase {
  lyric: string;
  notes: Note[];
}

export interface Song {
  id: string;
  title: string;
  origin?: string;
  publicDomainBasis?: string;
  ageGroup: AgeGroupId;
  difficulty: Difficulty;
  tags: string[];
  icon: string;
  key: string;
  bpm: number;
  timeSignature: string;
  phrases: Phrase[];
  /** Optional, not in the contract yet: ISO date the song was added (drives "New this week"). */
  addedAt?: string;
}

export type SegmentKind =
  | 'title'
  | 'say'
  | 'listen'
  | 'demo'
  | 'your_turn'
  | 'together'
  | 'beat'
  | 'high_low'
  | 'praise';

export interface LyricLine {
  lyric: string;
  /** index into the segment's notes array where this line starts */
  from: number;
}

export interface Segment {
  kind: SegmentKind;
  caption: string;
  subcaption?: string;
  parentCue?: string;
  notes?: Note[];
  bpm?: number;
  target?: 'low' | 'high';
  durationSec: number;
  /** Count-in before the first note (seconds). */
  leadInSec?: number;
  /** your_turn: beats of waiting before every child note. */
  gapBeats?: number;
  lines?: LyricLine[];
  dynamic?: 'loud' | 'soft';
  /** say: keys to light while the caption shows. */
  showKeys?: string[];
}

export interface LessonClass {
  id: string;
  index: number;
  title: string;
  goal: string;
  type: string;
  durationSec: number;
  parentTip: string;
  video: string;
  thumb: string;
  segments: Segment[];
}

export interface Lesson {
  songId: string;
  classes: LessonClass[];
}

export type PlayMode = 'real' | 'screen';

/** Progress model from the contract plus two optional app-side fields. */
export interface ClassProgress {
  positionSec: number;
  completed: boolean;
  stars: number; // 0-3
  lastWatchedAt: number; // epoch ms
  /** Interactive mode resumes at segment level. */
  segIndex?: number;
  completedAt?: number;
}

export type ProgressMap = Record<string, ClassProgress>;

export interface ChildProfile {
  id: string;
  name: string;
  age: number; // 2-6
  playMode: PlayMode;
  createdAt: number;
}

export interface ChildData {
  progress: ProgressMap;
  /** Local dates (YYYY-MM-DD) with any music activity. */
  activityDays: string[];
  /** Sticker ids earned. */
  stickers: string[];
  /** Play modes used at least once (for the "Any Piano Will Do" badge). */
  modesUsed?: PlayMode[];
}
