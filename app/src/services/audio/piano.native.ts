import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { SAMPLE_ASSETS } from '../../data/samples';

// Two voices per note so fast repeats and multi-touch chords overlap instead of cutting off.
const VOICES = 2;
const players = new Map<string, AudioPlayer[]>();
const turn = new Map<string, number>();
let modeSet = false;

function voicesFor(note: string): AudioPlayer[] | null {
  const src = SAMPLE_ASSETS[note];
  if (!src) return null;
  let v = players.get(note);
  if (!v) {
    v = Array.from({ length: VOICES }, () => createAudioPlayer(src));
    players.set(note, v);
  }
  return v;
}

export const piano = {
  async preload(notes: string[]) {
    if (!modeSet) {
      modeSet = true;
      try {
        await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
      } catch {}
    }
    notes.forEach(voicesFor);
  },
  play(note: string, opts: { volume?: number } = {}) {
    const v = voicesFor(note);
    if (!v) return;
    const i = ((turn.get(note) ?? 0) + 1) % v.length;
    turn.set(note, i);
    const p = v[i];
    p.volume = opts.volume ?? 1;
    p.seekTo(0).catch(() => {});
    p.play();
  },
  unlock() {},
};
