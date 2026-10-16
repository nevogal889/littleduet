// Web (preview / desktop browsers): getUserMedia + an AnalyserNode polled ~20 times a second.
import { FRAME, type Mic, type MicStart } from './types';

export function createMic(): Mic {
  let ctx: AudioContext | null = null;
  let stream: MediaStream | null = null;
  let timer: ReturnType<typeof setInterval> | null = null;
  return {
    async start(onFrame): Promise<MicStart> {
      const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
      if (!md?.getUserMedia) return 'unavailable';
      try {
        stream = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      } catch {
        return 'denied';
      }
      const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return 'unavailable';
      ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = FRAME;
      src.connect(an);
      const buf = new Float32Array(FRAME);
      timer = setInterval(() => {
        an.getFloatTimeDomainData(buf);
        onFrame(buf, ctx!.sampleRate);
      }, 50);
      return 'ok';
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      ctx?.close().catch(() => {});
      ctx = null;
    },
  };
}
