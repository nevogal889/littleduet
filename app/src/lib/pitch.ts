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

// ---------------------------------------------------------------------------------------------
// Cluster-proof check: "is the note we are waiting for inside this sound?"
// Toddlers press 2-5 keys at once; YIN then finds no single pitch. Here we look for the target's
// overtones in the spectrum instead. Only overtones a neighbouring key cannot leak into are scored,
// notes that are only echoes of louder notes are explained away, and a voice is rejected because
// its overtones are smeared (not sharp peaks) and its pitch wobbles from frame to frame.
// Tuned on synthetic piano, cluster, voice, clap and noise sounds (__tests__/pitch.test.ts).
// ---------------------------------------------------------------------------------------------

const NFFT = 4096;
const hzOf = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const hannCache = new Map<number, Float32Array>();
function hann(n: number): Float32Array {
  let w = hannCache.get(n);
  if (!w) {
    w = new Float32Array(n);
    for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1));
    hannCache.set(n, w);
  }
  return w;
}

/** Magnitude spectrum of a Hann-windowed frame, zero-padded to 4096 points. */
export function magnitudeSpectrum(x: Float32Array): Float64Array {
  const n = Math.min(x.length, NFFT);
  const w = hann(n);
  const re = new Float64Array(NFFT);
  const im = new Float64Array(NFFT);
  for (let i = 0; i < n; i++) re[i] = x[x.length - n + i] * w[i];
  for (let i = 1, j = 0; i < NFFT; i++) {
    let b = NFFT >> 1;
    for (; j & b; b >>= 1) j ^= b;
    j ^= b;
    if (i < j) {
      const t = re[i];
      re[i] = re[j];
      re[j] = t;
    }
  }
  for (let len = 2; len <= NFFT; len <<= 1) {
    const a = (-2 * Math.PI) / len;
    const wr = Math.cos(a);
    const wi = Math.sin(a);
    const half = len >> 1;
    for (let i = 0; i < NFFT; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < half; k++) {
        const p = i + k;
        const q = p + half;
        const vr = re[q] * cr - im[q] * ci;
        const vi = re[q] * ci + im[q] * cr;
        re[q] = re[p] - vr;
        im[q] = im[p] - vi;
        re[p] += vr;
        im[p] += vi;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
  const mag = new Float64Array(NFFT / 2);
  for (let k = 0; k < NFFT / 2; k++) mag[k] = Math.hypot(re[k], im[k]);
  return mag;
}

interface Spec {
  mag: Float64Array;
  binHz: number;
  lobeHz: number;
  nyq: number;
}

function peakAt(s: Spec, mag: Float64Array, f: number, cents = 30): number {
  const lo = Math.max(1, Math.floor((f * Math.pow(2, -cents / 1200)) / s.binHz));
  const hi = Math.min(mag.length - 1, Math.ceil((f * Math.pow(2, cents / 1200)) / s.binHz));
  let m = 0;
  for (let k = lo; k <= hi; k++) if (mag[k] > m) m = mag[k];
  return m;
}

/** Overtones a semitone neighbour can't leak into (the window's main lobe is narrower than a semitone there). */
function resolvable(s: Spec, m: number): [number, number] {
  const h0 = Math.max(1, Math.ceil((1.25 * s.lobeHz) / (hzOf(m) * 0.0595)));
  return [h0, h0 + 5];
}

/** Mean height of the target's resolvable overtones (discriminates semitone neighbours). */
function salience(s: Spec, mag: Float64Array, m: number): number {
  const f0 = hzOf(m);
  const [a, b] = resolvable(s, m);
  let sum = 0;
  let n = 0;
  for (let h = a; h <= b; h++) {
    if (h * f0 > Math.min(7000, s.nyq)) break;
    sum += peakAt(s, mag, h * f0);
    n++;
  }
  return n ? sum / n : 0;
}

/** All overtones from the fundamental up, weighted 1/h (a phantom low note has nothing at its own fundamental). */
function salienceFull(s: Spec, mag: Float64Array, m: number): number {
  const f0 = hzOf(m);
  let sum = 0;
  for (let h = 1; h <= 10; h++) {
    if (h * f0 > Math.min(7000, s.nyq)) break;
    sum += peakAt(s, mag, h * f0) / h;
  }
  return sum;
}

/** Share of the first six overtones that are odd: an octave above has only the even ones. */
function oddShare(s: Spec, mag: Float64Array, m: number): number {
  const f0 = hzOf(m);
  let o = 0;
  let e = 0;
  for (let h = 1; h <= 6; h++) {
    const v = peakAt(s, mag, h * f0);
    if (h % 2) o += v;
    else e += v;
  }
  return o / (o + e + 1e-12);
}

/** How sharp the target's overtones stand above their surroundings, and where they sit (cents off). */
function sharpness(s: Spec, m: number): { peaky: number; offset: number } {
  const { mag, binHz } = s;
  const f0 = hzOf(m);
  const [a, b] = resolvable(s, m);
  const pk: number[] = [];
  const off: number[] = [];
  for (let h = a; h <= b; h++) {
    const f = h * f0;
    if (f > Math.min(7000, s.nyq)) break;
    const lo = Math.floor((f * Math.pow(2, -30 / 1200)) / binHz);
    const hi = Math.ceil((f * Math.pow(2, 30 / 1200)) / binHz);
    let kb = lo;
    for (let k = lo; k <= hi; k++) if (mag[k] > mag[kb]) kb = k;
    const band: number[] = [];
    const blo = Math.floor((f * Math.pow(2, -2.5 / 12)) / binHz);
    const bhi = Math.min(mag.length - 1, Math.ceil((f * Math.pow(2, 2.5 / 12)) / binHz));
    for (let k = blo; k <= bhi; k++) if (k < lo - 2 || k > hi + 2) band.push(mag[k]);
    band.sort((x, y) => x - y);
    const floor = band[Math.floor(band.length / 2)] || 1e-12;
    pk.push(mag[kb] / floor);
    const y0 = mag[kb - 1] ?? mag[kb];
    const y1 = mag[kb];
    const y2 = mag[kb + 1] ?? mag[kb];
    const den = 2 * (y0 - 2 * y1 + y2);
    const d = den !== 0 ? (y0 - y2) / den : 0;
    off.push(1200 * Math.log2(((kb + d) * binHz) / f));
  }
  pk.sort((x, y) => x - y);
  off.sort((x, y) => x - y);
  return { peaky: pk[Math.floor(pk.length / 2)] ?? 0, offset: off[Math.floor(off.length / 2)] ?? 0 };
}

export interface ClusterHit {
  /** The target (or, with anyOctave, an octave of it) is in the sound. */
  present: boolean;
  /** Cents offset of the target's overtones: steady for a piano, wobbling for a voice. */
  offset: number;
}

/**
 * One frame: is `target` (midi) among the notes sounding, even with other keys pressed?
 * Pure function of the frame; the matcher adds the across-frames checks.
 */
export function targetInSound(x: Float32Array, sampleRate: number, target: number, opts: { anyOctave?: boolean; minRms?: number } = {}): ClusterHit {
  let e = 0;
  for (let i = 0; i < x.length; i++) e += x[i] * x[i];
  if (Math.sqrt(e / x.length) < (opts.minRms ?? 0.01)) return { present: false, offset: 0 };
  const n = Math.min(x.length, NFFT);
  const s: Spec = { mag: magnitudeSpectrum(x), binHz: sampleRate / NFFT, lobeHz: (2 * sampleRate) / n, nyq: sampleRate / 2 };
  const { mag } = s;

  // Greedy estimate of the notes sounding: strongest first, remove its overtones, look again (max 5).
  const work = Float64Array.from(mag);
  const picked: number[] = [];
  let first = 0;
  for (let it = 0; it < 5; it++) {
    let bm = -1;
    let bs = 0;
    for (let m = 45; m <= 90; m++) {
      const v = salienceFull(s, work, m);
      if (v > bs) {
        bs = v;
        bm = m;
      }
    }
    if (bm < 0 || (first && bs < 0.3 * first)) break;
    if (!first) first = bs;
    picked.push(bm);
    clearOvertones(s, work, bm, 45, 2);
  }

  let best = 0;
  for (let m = 48; m <= 88; m++) best = Math.max(best, salience(s, mag, m));
  if (best <= 0) return { present: false, offset: 0 };

  const cands = opts.anyOctave ? [target, target - 12, target + 12] : [target];
  for (const t of cands) {
    const st = salience(s, mag, t);
    const l = salience(s, mag, t - 1);
    const r = salience(s, mag, t + 1);
    if (st < 0.45 * best) continue; // among the loudest notes
    const nbOk = st >= 0.8 * Math.max(l, r) || (st >= 1.6 * Math.min(l, r) && st >= 0.6 * Math.max(l, r));
    if (!nbOk) continue; // not just leakage from a neighbouring key
    if (!opts.anyOctave && oddShare(s, mag, t) < 0.3) continue; // not the octave above
    if (!picked.includes(t)) {
      // not merely the echo of other notes' overtones (E4's 3rd overtone is B3's 4th)
      const rest = Float64Array.from(mag);
      for (const pm of picked) if ((pm - t) % 12 !== 0) clearOvertones(s, rest, pm, 35, 0);
      if (salience(s, rest, t) < 0.5 * st) continue;
    }
    const sh = sharpness(s, t);
    if (sh.peaky < 2.3) continue; // smeared overtones: a voice or noise
    return { present: true, offset: sh.offset };
  }
  return { present: false, offset: 0 };
}

function clearOvertones(s: Spec, mag: Float64Array, m: number, cents: number, padBins: number) {
  const f0 = hzOf(m);
  for (let h = 1; h <= 16; h++) {
    const f = h * f0;
    if (f > s.nyq - 100) break;
    const lo = Math.max(0, Math.floor((f * Math.pow(2, -cents / 1200)) / s.binHz) - padBins);
    const hi = Math.min(mag.length - 1, Math.ceil((f * Math.pow(2, cents / 1200)) / s.binHz) + padBins);
    for (let k = lo; k <= hi; k++) mag[k] = 0;
  }
}

/**
 * Listens for one expected note. Feed it frames; it fires once when the note is confirmed:
 * - clean single note (YIN): `needFrames` consecutive frames (default 2), as before;
 * - inside a cluster of keys: 3 consecutive frames whose overtones stay within 12 cents
 *   (a piano holds its pitch; a voice wobbles).
 * `anyOctave` (ages 2-4) accepts the right note name in any octave.
 */
export class NoteMatcher {
  private hits = 0;
  private clusterOffsets: number[] = [];
  private done = false;
  constructor(
    private target: number,
    private opts: { anyOctave?: boolean; needFrames?: number; tolerance?: number; minClarity?: number; clusters?: boolean } = {},
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

  private confirm(): boolean {
    this.done = true;
    return true;
  }

  /** Returns true exactly once, on the frame the note is confirmed (single-note path only). */
  feed(r: PitchResult | null): boolean {
    if (this.done) return false;
    if (r && r.clarity >= (this.opts.minClarity ?? 0.8) && this.matches(freqToMidi(r.freq))) this.hits++;
    else this.hits = 0;
    return this.hits >= (this.opts.needFrames ?? 2) ? this.confirm() : false;
  }

  /** Full check on a raw frame: the single-note path first, the cluster path when that hears nothing usable. */
  feedFrame(frame: Float32Array, sampleRate: number): boolean {
    if (this.done) return false;
    const r = detectPitch(frame, sampleRate);
    const clean = !!r && r.clarity >= (this.opts.minClarity ?? 0.8) && this.matches(freqToMidi(r.freq));
    if (this.feed(r)) return true;
    if (clean || this.opts.clusters === false) {
      this.clusterOffsets = [];
      return false;
    }
    const c = targetInSound(frame, sampleRate, this.target, { anyOctave: this.opts.anyOctave });
    if (!c.present) {
      this.clusterOffsets = [];
      return false;
    }
    this.clusterOffsets.push(c.offset);
    if (this.clusterOffsets.length > 3) this.clusterOffsets.shift();
    if (this.clusterOffsets.length === 3 && Math.max(...this.clusterOffsets) - Math.min(...this.clusterOffsets) <= 12) return this.confirm();
    return false;
  }

  get heard(): boolean {
    return this.done;
  }
}
