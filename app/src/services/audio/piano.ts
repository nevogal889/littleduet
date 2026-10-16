import { Asset } from 'expo-asset';
import { SAMPLE_ASSETS } from '../../data/samples';
import { midiOf } from '../../lib/music';

// Web Audio: decoded sample buffers give instant, overlapping (multi-touch) playback.
let ctx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer>();
const loading = new Map<string, Promise<void>>();

function audio(): AudioContext | null {
  if (ctx) return ctx;
  const AC = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC() as AudioContext;
  return ctx;
}

async function load(note: string) {
  const mod = SAMPLE_ASSETS[note];
  const c = audio();
  if (!mod || !c || buffers.has(note)) return;
  if (!loading.has(note)) {
    loading.set(
      note,
      (async () => {
        try {
          const uri = Asset.fromModule(mod).uri;
          const res = await fetch(uri);
          const buf = await c.decodeAudioData(await res.arrayBuffer());
          buffers.set(note, buf);
        } catch {}
      })(),
    );
  }
  await loading.get(note);
}

function synth(c: AudioContext, note: string, volume: number) {
  const f0 = 440 * Math.pow(2, (midiOf(note) - 69) / 12);
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35 * volume, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  g.connect(c.destination);
  [1, 2, 3].forEach((h, i) => {
    const o = c.createOscillator();
    o.type = i ? 'sine' : 'triangle';
    o.frequency.value = f0 * h;
    const hg = c.createGain();
    hg.gain.value = [1, 0.35, 0.12][i];
    o.connect(hg).connect(g);
    o.start(t);
    o.stop(t + 1.25);
  });
}

export const piano = {
  async preload(notes: string[]) {
    await Promise.all(notes.map(load));
  },
  play(note: string, opts: { volume?: number } = {}) {
    const c = audio();
    if (!c) return;
    if (c.state === 'suspended') c.resume().catch(() => {});
    const vol = opts.volume ?? 1;
    const buf = buffers.get(note);
    if (!buf) {
      synth(c, note, vol);
      load(note);
      return;
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(g).connect(c.destination);
    src.start();
  },
  /** Call from a tap so browsers allow sound. */
  unlock() {
    const c = audio();
    if (c && c.state === 'suspended') c.resume().catch(() => {});
  },
};
