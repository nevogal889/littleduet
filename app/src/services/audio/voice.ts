// Teacher voice, web: one HTMLAudioElement at a time. Lines live at <media>/voice/<voiceId>.mp3.
import { mediaUrl } from '../media';

let el: HTMLAudioElement | null = null;
let done: (() => void) | null = null;

export const voice = {
  /** Plays a line; resolves when it ends, is stopped, or fails (never rejects). */
  say(voiceId: string | undefined, maxSec = 20): Promise<void> {
    voice.stop();
    const url = voiceId ? mediaUrl(`voice/${voiceId}.mp3`) : null;
    if (!url || typeof Audio === 'undefined') return Promise.resolve();
    return new Promise((resolve) => {
      const a = new Audio(url);
      el = a;
      const finish = () => {
        clearTimeout(tm);
        if (el === a) el = null;
        done = null;
        resolve();
      };
      done = finish;
      const tm = setTimeout(finish, maxSec * 1000);
      a.onended = finish;
      a.onerror = finish;
      a.play().catch(finish);
    });
  },
  stop() {
    if (el) {
      el.pause();
      el = null;
    }
    done?.();
  },
};
