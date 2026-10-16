import { Platform } from 'react-native';
import { config } from '../config';

/**
 * Lesson media lives at <VIDEO_BASE_URL>/<songId>/<classId>.mp4|.jpg (contract paths).
 * Web dev without a base URL uses /media (filled by scripts/sync-content.mjs).
 * Native builds without a base URL have no video; the player falls back to the
 * on-screen lesson.
 */
export function mediaBase(): string {
  if (config.videoBaseUrl) return config.videoBaseUrl.replace(/\/$/, '');
  if (Platform.OS !== 'web') return '';
  // Hosted previews set window.__LD_BASE (the page's own folder); local dev serves /media.
  const base = typeof window !== 'undefined' ? (window as any).__LD_BASE : undefined;
  return base ? `${String(base).replace(/\/$/, '')}/media` : '/media';
}

export function mediaUrl(rel: string | undefined): string | null {
  const base = mediaBase();
  if (!base || !rel) return null;
  return `${base}/${rel}`;
}

let h264: boolean | null = null;
function browserPlaysH264(): boolean {
  if (h264 !== null) return h264;
  try {
    const v = (globalThis as any).document?.createElement('video');
    h264 = !!v && v.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
  } catch {
    h264 = true;
  }
  return h264;
}

/** Browsers without H.264 get the VP8 .webm sibling (made by sync-content --webm). */
export function videoUrl(rel: string | undefined): string | null {
  const url = mediaUrl(rel);
  if (!url) return null;
  if (Platform.OS === 'web' && !browserPlaysH264()) return url.replace(/\.mp4$/, '.webm');
  return url;
}
