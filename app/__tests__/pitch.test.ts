import { detectPitch, freqToMidi, midiOfPitch, NoteMatcher } from '@/lib/pitch';

const SR = 44100;
const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
/** A piano-ish tone: fundamental + decaying harmonics + a little noise. */
function tone(m: number, n = 2048, amp = 0.3, noise = 0.01, seed = 1): Float32Array {
  const f = hz(m);
  const out = new Float32Array(n);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = amp * (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t) + 0.25 * Math.sin(6 * Math.PI * f * t)) + noise * rnd();
  }
  return out;
}

describe('pitch detection', () => {
  it('finds C3, middle C, A4 and C6 within a quarter tone', () => {
    for (const p of ['C3', 'C4', 'E4', 'A4', 'C5', 'G5', 'C6']) {
      const m = midiOfPitch(p);
      const r = detectPitch(tone(m), SR);
      expect(r).not.toBeNull();
      expect(Math.abs(freqToMidi(r!.freq) - m)).toBeLessThan(0.25);
    }
  });
  it('ignores silence and pure noise', () => {
    expect(detectPitch(new Float32Array(2048), SR)).toBeNull();
    const noise = tone(60, 2048, 0, 0.3, 7);
    const r = detectPitch(noise, SR);
    expect(r === null || r.clarity < 0.8).toBe(true);
  });
  it('confirms the expected note after two good frames, once', () => {
    const m = new NoteMatcher(midiOfPitch('A4'));
    expect(m.feed(detectPitch(tone(69), SR))).toBe(false);
    expect(m.feed(detectPitch(tone(69, 2048, 0.3, 0.01, 3), SR))).toBe(true);
    expect(m.feed(detectPitch(tone(69), SR))).toBe(false);
    expect(m.heard).toBe(true);
  });
  it('rejects a wrong note, and accepts another octave only when allowed', () => {
    const strict = new NoteMatcher(midiOfPitch('C4'));
    strict.feed(detectPitch(tone(62), SR));
    expect(strict.feed(detectPitch(tone(62), SR))).toBe(false);
    const loose = new NoteMatcher(midiOfPitch('C4'), { anyOctave: true });
    loose.feed(detectPitch(tone(72), SR));
    expect(loose.feed(detectPitch(tone(72), SR))).toBe(true);
  });
});

import { childCues } from '@/lib/timeline';
import type { LessonClass } from '@/types';

describe('child cues for listening', () => {
  it('lists your_turn child notes in video time, marking the last of each segment', () => {
    const cls = {
      id: 'x-c01', index: 1, title: 't', goal: 'g', type: 'phrase', durationSec: 20, parentTip: '', video: '', thumb: '',
      segments: [
        { kind: 'say', caption: 'Hi', durationSec: 4 },
        { kind: 'your_turn', caption: 'Your turn!', bpm: 60, leadInSec: 2, gapBeats: 1, durationSec: 9, notes: [{ p: 'C4', d: 1 }, { p: 'D4', d: 1, who: 'parent' }, { p: 'E4', d: 1 }] },
      ],
    } as unknown as LessonClass;
    const cues = childCues(cls, 60);
    expect(cues.map((c) => c.p)).toEqual(['C4', 'E4']);
    expect(cues[0].t).toBe(4 + 2 + 1); // segment start + lead-in + one beat of waiting
    expect(cues[1].t).toBe(4 + 2 + 1 + 1 + 1 + 1);
    expect(cues.map((c) => c.last)).toEqual([false, true]);
  });
});
