export type MicStart = 'ok' | 'denied' | 'unavailable';

/** Microphone frames for on-device pitch detection. Audio stays in memory: never stored or sent. */
export interface Mic {
  start(onFrame: (frame: Float32Array, sampleRate: number) => void): Promise<MicStart>;
  stop(): void;
}

export const FRAME = 2048;
