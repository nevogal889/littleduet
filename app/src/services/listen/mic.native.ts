// iOS / Android: react-native-audio-api's AudioRecorder streams float PCM buffers.
// Typed loosely on purpose: the recorder's callback shape changed between library versions.
import { FRAME, type Mic, type MicStart } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
export function createMic(): Mic {
  let rec: any = null;
  return {
    async start(onFrame): Promise<MicStart> {
      let api: any;
      try {
        api = require('react-native-audio-api');
      } catch {
        return 'unavailable';
      }
      try {
        const perm = await api.AudioManager?.requestRecordingPermissions?.();
        if (perm && perm !== 'Granted') return 'denied';
        api.AudioManager?.setAudioSessionOptions?.({ iosCategory: 'playAndRecord', iosMode: 'default', iosOptions: ['defaultToSpeaker', 'allowBluetoothA2DP'] });
        await api.AudioManager?.setAudioSessionActivity?.(true);
        rec = new api.AudioRecorder({ sampleRate: 44100, bufferLengthInSamples: FRAME });
        const handler = (e: any) => {
          const buffer = e?.buffer ?? e;
          const data: Float32Array | undefined = buffer?.getChannelData?.(0);
          if (data) onFrame(data.length > FRAME ? data.subarray(data.length - FRAME) : data, buffer.sampleRate ?? 44100);
        };
        if (rec.onAudioReady.length >= 2) rec.onAudioReady({ sampleRate: 44100, bufferLength: FRAME, channelCount: 1 }, handler);
        else rec.onAudioReady(handler);
        const r = await rec.start();
        if (r && r.status === 'error') return 'unavailable';
        return 'ok';
      } catch {
        return 'unavailable';
      }
    },
    stop() {
      try {
        rec?.stop();
      } catch {}
      rec = null;
    },
  };
}
