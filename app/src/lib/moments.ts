import momentsJson from '../data/moments.json';

export interface MomentLine {
  text: string;
  voiceId: string;
  note?: string;
}
const MOMENTS = momentsJson as unknown as Record<string, MomentLine[]>;

/** A teacher line for a moment ("heard", "waitNudge", "classEnd"...), varied by seed, matched to a note name. */
export function moment(key: string, seed = 0, note?: string): MomentLine | undefined {
  let list = MOMENTS[key] ?? [];
  if (note) {
    const name = note.replace(/\d+$/, '');
    const forNote = list.filter((l) => l.note === name);
    if (forNote.length) list = forNote;
  }
  if (!list.length) return undefined;
  return list[Math.abs(Math.floor(seed)) % list.length];
}
