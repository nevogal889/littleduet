// Teacher voice, iOS / Android: expo-audio streams <media>/voice/<voiceId>.mp3.
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { mediaUrl } from '../media';

let player: AudioPlayer | null = null;
let done: (() => void) | null = null;

export const voice = {
  say(voiceId: string | undefined, maxSec = 20): Promise<void> {
    voice.stop();
    const url = voiceId ? mediaUrl(`voice/${voiceId}.mp3`) : null;
    if (!url) return Promise.resolve();
    return new Promise((resolve) => {
      const p = createAudioPlayer({ uri: url });
      player = p;
      const finish = () => {
        clearTimeout(tm);
        sub.remove();
        if (player === p) {
          p.remove();
          player = null;
        }
        done = null;
        resolve();
      };
      done = finish;
      const tm = setTimeout(finish, maxSec * 1000);
      const sub = p.addListener('playbackStatusUpdate', (s) => {
        if (s.didJustFinish) finish();
      });
      p.play();
    });
  },
  stop() {
    done?.();
  },
};
