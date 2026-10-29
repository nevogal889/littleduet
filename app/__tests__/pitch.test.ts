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

// ---- Cluster-proof listening: toddlers press several keys at once, sing and shout ----
import { targetInSound } from '@/lib/pitch';

const N = 2048;
const HOP = 0.0464;
/** Struck piano-ish note(s): 10 slightly stretched, decaying overtones, random phases. */
function piano(ms: number[], t0: number, seed: number, detune = 0, amp = 0.25): Float32Array {
  const out = new Float32Array(N);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (const m of ms) {
    const f = hz(m) * Math.pow(2, detune / 1200);
    for (let h = 1; h <= 10; h++) {
      const fh = f * h * Math.sqrt(1 + 0.0004 * h * h);
      const a = (amp / Math.pow(h, 1.1)) * (h === 1 ? 0.7 : 1);
      const ph = rnd() * Math.PI;
      for (let i = 0; i < N; i++) {
        const t = i / SR + t0;
        out[i] += a * Math.exp(-t * (2 + h)) * Math.sin(2 * Math.PI * fh * t + ph);
      }
    }
  }
  for (let i = 0; i < N; i++) out[i] += 0.004 * rnd();
  return out;
}
/** A child's voice: rich overtones shaped by vowel formants, vibrato, breath noise. */
function voice(f0: number, t0: number, seed: number, vib = 60, breath = 0.03, glide = 0): Float32Array {
  const out = new Float32Array(N);
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
  const formants = [
    [800, 120],
    [1200, 150],
    [2800, 250],
  ];
  let ph = 0;
  for (let i = 0; i < N; i++) {
    const t = i / SR + t0;
    const f = f0 * Math.pow(2, (vib * Math.sin(2 * Math.PI * 5.5 * t) + glide * t * 1000) / 1200);
    ph += (2 * Math.PI * f) / SR;
    let v = 0;
    for (let h = 1; h <= 20; h++) {
      let g = 0.05;
      for (const [F, bw] of formants) g += 1 / (1 + Math.pow((h * f0 - F) / bw, 2));
      v += (g / Math.sqrt(h)) * Math.sin(h * ph);
    }
    out[i] = 0.04 * v + breath * rnd();
  }
  return out;
}
/** Three consecutive frames through the full matcher (YIN path first, cluster path as fallback). */
function heardOver3(gen: (t0: number, k: number) => Float32Array, target: string, anyOctave = false): boolean {
  const m = new NoteMatcher(midiOfPitch(target), { anyOctave });
  let got = false;
  for (let k = 0; k < 3; k++) got = m.feedFrame(gen(0.04 + k * HOP, k), SR) || got;
  return got;
}
const P = (notes: string[], detune = 0) => (t0: number, k: number) => piano(notes.map(midiOfPitch), t0, 11 + k * 7, detune);

describe('cluster-proof listening', () => {
  it('hears the target inside a 3-key cluster, a palm smash and a fist', () => {
    expect(heardOver3(P(['C4', 'D4', 'E4']), 'C4')).toBe(true);
    expect(heardOver3(P(['C4', 'D4', 'E4']), 'D4')).toBe(true);
    expect(heardOver3(P(['C4', 'D4', 'E4']), 'E4')).toBe(true);
    expect(heardOver3(P(['C4', 'C#4', 'D4']), 'D4')).toBe(true);
    expect(heardOver3(P(['C4', 'D4', 'E4', 'F4', 'G4']), 'E4')).toBe(true);
  });
  it('still hears clean single notes, including a slightly flat home piano', () => {
    expect(heardOver3(P(['G4']), 'G4')).toBe(true);
    expect(heardOver3(P(['C4'], -30), 'C4')).toBe(true);
  });
  it('rejects a cluster that does not contain the target, even when overtones overlap', () => {
    expect(heardOver3(P(['C4', 'D4', 'E4']), 'F4')).toBe(false);
    expect(heardOver3(P(['C4', 'D4', 'E4']), 'A4')).toBe(false);
    expect(heardOver3(P(['C4', 'D4', 'E4']), 'B3')).toBe(false); // E4's 3rd overtone = B3's 4th
    expect(heardOver3(P(['C4', 'D4', 'E4']), 'G4')).toBe(false); // C4's 3rd overtone = G4's 2nd
  });
  it('rejects wrong single notes, neighbours and the octave above', () => {
    expect(heardOver3(P(['D4']), 'C4')).toBe(false);
    expect(heardOver3(P(['C#4']), 'C4')).toBe(false);
    expect(heardOver3(P(['B3']), 'C4')).toBe(false);
    expect(heardOver3(P(['C5']), 'C4')).toBe(false);
    expect(heardOver3(P(['C5']), 'C4', true)).toBe(true); // ages 2-4: any octave is fine
  });
  it('rejects singing with vibrato, shouting, claps and room noise', () => {
    expect(heardOver3((t0, k) => voice(262, t0, 5 + k), 'C4')).toBe(false);
    expect(heardOver3((t0, k) => voice(330, t0, 5 + k), 'E4')).toBe(false);
    expect(heardOver3((t0, k) => voice(262, t0, 5 + k, 25), 'C4')).toBe(false);
    expect(heardOver3((t0, k) => voice(400, t0, 5 + k, 30, 0.15, 1.5), 'G4')).toBe(false);
    expect(heardOver3((t0, k) => voice(520, t0, 5 + k, 80, 0.2), 'C5')).toBe(false);
    const clap = (_t0: number, k: number) => {
      let s = 3 + k;
      return Float32Array.from({ length: N }, (_, i) => 0.5 * Math.exp(-i / 300) * (((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1));
    };
    expect(heardOver3(clap, 'C4')).toBe(false);
    expect(heardOver3((t0, k) => piano([], t0, 99 + k * 13), 'C4')).toBe(false);
  });
  it('one frame is pure: the target is found in a cluster and not in a neighbour', () => {
    expect(targetInSound(piano([60, 62, 64], 0.04, 3), SR, 62).present).toBe(true);
    expect(targetInSound(piano([61], 0.04, 3), SR, 60).present).toBe(false);
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
