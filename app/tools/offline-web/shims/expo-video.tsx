// expo-video stand-in (offline web preview): a player object around <video>.
import React, { useMemo } from 'react';

type Fn = (p: any) => void;
export class VideoPlayer {
  el: HTMLVideoElement | null = null;
  loop = false;
  timeUpdateEventInterval = 1;
  private l = new Map<string, Set<Fn>>();
  private lastTU = 0;
  private ready = false;
  constructor(public src: string | null) {}
  get playing() {
    return !!this.el && !this.el.paused && !this.el.ended;
  }
  get currentTime() {
    return this.el?.currentTime ?? 0;
  }
  set currentTime(v: number) {
    if (this.el) this.el.currentTime = v;
  }
  get duration() {
    const d = this.el?.duration ?? 0;
    return Number.isFinite(d) ? d : 0;
  }
  play() {
    this.el?.play().catch(() => {});
  }
  pause() {
    this.el?.pause();
  }
  seekBy(s: number) {
    if (this.el) this.el.currentTime = Math.max(0, this.el.currentTime + s);
  }
  addListener(name: string, fn: Fn) {
    if (!this.l.has(name)) this.l.set(name, new Set());
    this.l.get(name)!.add(fn);
    return { remove: () => this.l.get(name)?.delete(fn) };
  }
  emit(name: string, p: any) {
    this.l.get(name)?.forEach((f) => f(p));
  }
  attach(el: HTMLVideoElement | null) {
    if (!el || el === this.el) return;
    this.el = el;
    (window as any).__video = el;
    el.loop = this.loop;
    el.addEventListener('canplay', () => {
      if (!this.ready) {
        this.ready = true;
        this.emit('statusChange', { status: 'readyToPlay' });
      }
    });
    el.addEventListener('error', () => this.emit('statusChange', { status: 'error', error: el.error }));
    el.addEventListener('play', () => this.emit('playingChange', { isPlaying: true }));
    el.addEventListener('pause', () => this.emit('playingChange', { isPlaying: false }));
    el.addEventListener('timeupdate', () => {
      const now = Date.now();
      if (now - this.lastTU >= this.timeUpdateEventInterval * 1000 * 0.9) {
        this.lastTU = now;
        this.emit('timeUpdate', { currentTime: el.currentTime });
      }
    });
    el.addEventListener('ended', () => this.emit('playToEnd', {}));
    if (this.src) el.src = this.src;
  }
}

export function useVideoPlayer(src: string | null, setup?: (p: VideoPlayer) => void) {
  return useMemo(() => {
    const p = new VideoPlayer(src);
    setup?.(p);
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
}

export function VideoView({ player, contentFit }: any) {
  return (
    <video
      ref={(el) => player.attach(el)}
      playsInline
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: contentFit ?? 'contain', background: '#000' }}
    />
  );
}
