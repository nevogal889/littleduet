// Single-note pitch detection for real-piano listening (YIN, de Cheveigné & Kawahara 2002).
// Runs on the phone only; audio is analysed in memory and never stored or sent.

export interface PitchResult {
  freq: number;
  /** 0..1, higher = cleaner periodic signal */
  clarity: number;
  /** RMS level of the frame */
  rms: number;
}

const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiOfPitch(p: string): number {
  const m = /^([A-G])(#?)(\d)$/.exec(p);
  if (!m) throw new Error(`bad pitch ${p}`);
  return NAMES.indexOf(m[1] + m[2]) + 12 * (Number(m[3]) + 1);
}

export function freqToMidi(f: number): number {
  return 69 + 12 * Math.log2(f / 440);
}

/** YIN on one frame (2048 samples at 44.1/48 kHz is plenty for C3-C6). */
export function detectPitch(x: Float32Array, sampleRate: number, opts: { minHz?: number; maxHz?: number; threshold?: number; minRms?: number } = {}): PitchResult | null {
  const minHz = opts.minHz ?? 100;
  const maxHz = opts.maxHz ?? 1400;
  const threshold = opts.threshold ?? 0.15;
  let sum = 0;
  for (let i = 0; i < x.length; i++) sum += x[i] * x[i];
  const rms = Math.sqrt(sum / x.length);
  if (rms < (opts.minRms ?? 0.01)) return null;
  const tauMin = Math.max(2, Math.floor(sampleRate / maxHz));
  const tauMax = Math.min(Math.floor(x.length / 2), Math.ceil(sampleRate / minHz));
  const W = x.length - tauMax;
  if (W <= tauMin) return null;
  const d = new Float32Array(tauMax + 1);
  for (let tau = 1; tau <= tauMax; tau++) {
    let s = 0;
    for (let i = 0; i < W; i++) {
      const v = x[i] - x[i + tau];
      s += v * v;
    }
    d[tau] = s;
  }
  // cumulative mean normalised difference
  const cm = new Float32Array(tauMax + 1);
  cm[0] = 1;
  let run = 0;
  for (let tau = 1; tau <= tauMax; tau++) {
    run += d[tau];
    cm[tau] = run > 0 ? (d[tau] * tau) / run : 1;
  }
  let tau = -1;
  for (let t = tauMin; t <= tauMax; t++) {
    if (cm[t] < threshold) {
      while (t + 1 <= tauMax && cm[t + 1] < cm[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) return null;
  // parabolic interpolation
  const a = cm[tau - 1] ?? cm[tau];
  const b = cm[tau];
  const c = cm[tau + 1] ?? cm[tau];
  const den = a + c - 2 * b;
  const shift = den !== 0 ? (a - c) / (2 * den) : 0;
  const freq = sampleRate / (tau + shift);
  if (freq < minHz || freq > maxHz) return null;
  return { freq, clarity: Math.max(0, Math.min(1, 1 - b)), rms };
}

/**
 * Listens for one expected note. Feed it frames; it fires once when the note has been heard in
 * `needFrames` consecutive frames. `anyOctave` (ages 2-4) accepts the right note name in any octave.
 */
export class NoteMatcher {
  private hits = 0;
  private done = false;
  constructor(
    private target: number,
    private opts: { anyOctave?: boolean; needFrames?: number; tolerance?: number; minClarity?: number } = {},
  ) {}

  matches(midi: number): boolean {
    const tol = this.opts.tolerance ?? 0.6;
    const diff = midi - this.target;
    if (this.opts.anyOctave) {
      const pc = ((diff % 12) + 12) % 12;
      return Math.min(pc, 12 - pc) <= tol;
    }
    return Math.abs(diff) <= tol;
  }

  /** Returns true exactly once, on the frame the note is confirmed. */
  feed(r: PitchResult | null): boolean {
    if (this.done) return false;
    if (r && r.clarity >= (this.opts.minClarity ?? 0.8) && this.matches(freqToMidi(r.freq))) this.hits++;
    else this.hits = 0;
    if (this.hits >= (this.opts.needFrames ?? 2)) {
      this.done = true;
      return true;
    }
    return false;
  }

  get heard(): boolean {
    return this.done;
  }
}
