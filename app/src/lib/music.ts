import type { LyricLine, Note, Phrase, PitchedNote } from '../types';

const LETTER_SEMITONE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiOf(p: string): number {
  const m = /^([A-G])(#?)(-?\d)$/.exec(p);
  if (!m) throw new Error(`Bad pitch ${p}`);
  return (Number(m[3]) + 1) * 12 + LETTER_SEMITONE[m[1]] + (m[2] ? 1 : 0);
}

export function pitchOf(midi: number): string {
  return `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

export function isBlack(midi: number): boolean {
  return [1, 3, 6, 8, 10].includes(midi % 12);
}

/** Letter name without octave, e.g. "C", "F#". */
export function letterOf(p: string): string {
  return p.replace(/-?\d+$/, '');
}

export function isPitched(n: Note): n is PitchedNote {
  return !(n as { rest?: boolean }).rest;
}

/**
 * Keyboard range covering whole octaves from C of the lowest note to B of the highest
 * note's octave; when the highest note is a C it ends on that C.
 */
export function keyboardRange(pitches: string[]): { low: number; high: number } {
  if (!pitches.length) return { low: 60, high: 71 };
  const midis = pitches.map(midiOf);
  const lo = Math.min(...midis);
  const hi = Math.max(...midis);
  const low = lo - (lo % 12);
  const high = hi % 12 === 0 && hi > low ? hi : hi - (hi % 12) + 11;
  return { low, high };
}

export interface KaraokeWord {
  text: string;
  /** Indexes into the pitched-note list of the segment. */
  noteIdx: number[];
}
export interface KaraokeLine {
  words: KaraokeWord[];
  firstNote: number;
  lastNote: number;
}

const letters = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');

function phraseWords(lyric: string, pitched: PitchedNote[], startIdx: number): KaraokeWord[] {
  const words = lyric.split(/\s+/).filter(Boolean);
  const out: KaraokeWord[] = [];
  let ni = 0;
  for (const w of words) {
    const target = letters(w).length;
    const idx: number[] = [];
    let acc = 0;
    while (ni < pitched.length) {
      acc += letters(pitched[ni].s ?? '').length;
      idx.push(startIdx + ni);
      ni++;
      if (acc >= target) break;
    }
    out.push({ text: w, noteIdx: idx });
  }
  // Notes left over (melisma) attach to the last word.
  while (ni < pitched.length && out.length) {
    out[out.length - 1].noteIdx.push(startIdx + ni);
    ni++;
  }
  return out;
}

/**
 * Group a segment's notes into lyric lines. Phrases of the song that appear in the
 * segment get proper words; other notes fall back to their syllables, 8 per line.
 */
export function karaokeLines(notes: Note[], phrases: Phrase[], segLines?: LyricLine[]): KaraokeLine[] {
  const pitched = notes.filter(isPitched);
  if (segLines?.length) {
    // raw note index -> pitched index
    const rawToPitched: number[] = [];
    let k = 0;
    notes.forEach((n, raw) => {
      rawToPitched[raw] = k;
      if (isPitched(n)) k++;
    });
    rawToPitched[notes.length] = k;
    return segLines
      .map((ln, li) => {
        const from = rawToPitched[Math.min(ln.from, notes.length)] ?? 0;
        const toRaw = li + 1 < segLines.length ? segLines[li + 1].from : notes.length;
        const to = rawToPitched[Math.min(toRaw, notes.length)] ?? pitched.length;
        const words = phraseWords(ln.lyric, pitched.slice(from, to), from);
        return { words, firstNote: from, lastNote: Math.max(from, to - 1) };
      })
      .filter((l) => l.words.length);
  }
  const lines: KaraokeLine[] = [];
  let i = 0;
  let loose: KaraokeWord[] = [];
  const flushLoose = () => {
    while (loose.length) {
      const chunk = loose.splice(0, 8);
      lines.push({ words: chunk, firstNote: chunk[0].noteIdx[0], lastNote: chunk[chunk.length - 1].noteIdx.slice(-1)[0] });
    }
  };
  while (i < pitched.length) {
    const match = phrases.find((ph) => {
      const pn = ph.notes.filter(isPitched);
      if (!pn.length || i + pn.length > pitched.length) return false;
      return pn.every((n, k) => n.p === pitched[i + k].p && (n.s ?? '') === (pitched[i + k].s ?? ''));
    });
    if (match) {
      flushLoose();
      const len = match.notes.filter(isPitched).length;
      const words = phraseWords(match.lyric, pitched.slice(i, i + len), i);
      lines.push({ words, firstNote: i, lastNote: i + len - 1 });
      i += len;
    } else {
      if (pitched[i].s) loose.push({ text: pitched[i].s!, noteIdx: [i] });
      else if (loose.length) loose[loose.length - 1].noteIdx.push(i);
      else loose.push({ text: '', noteIdx: [i] });
      i++;
    }
  }
  flushLoose();
  return lines.filter((l) => l.words.some((w) => w.text));
}
