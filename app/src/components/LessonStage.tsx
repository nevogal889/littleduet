import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { childPitches } from '../data/catalog';
import { t } from '../i18n';
import { karaokeLines, keyboardRange, pitchOf } from '../lib/music';
import { LessonEngine, type EngineEvent } from '../lib/timeline';
import { piano } from '../services/audio/piano';
import { voice } from '../services/audio/voice';
import { moment } from '../lib/moments';
import { Scene } from './Scene';
import { colors, fonts, radius, space, useLayout } from '../theme';
import type { LessonClass, Song } from '../types';
import { SongArt } from './art/SongArt';
import { Icon } from './Icon';
import { Keyboard, laneX, layoutKeys } from './Keyboard';
import { Button, ProgressBar } from './ui';

const WINDOW = 3; // seconds of falling notes visible

export interface StageResult {
  completed: boolean;
  stars: number;
}

/**
 * Screen-piano player: plays the class timeline live on an on-screen keyboard.
 * With `watch`, it is the real-piano fallback when no video is available (nothing waits).
 */
export function LessonStage({
  song,
  cls,
  startSegIndex = 0,
  watch = false,
  onProgress,
  onFinish,
  onExit,
  notice,
  skipReady = false,
}: {
  song: Song;
  cls: LessonClass;
  startSegIndex?: number;
  watch?: boolean;
  onProgress: (classTime: number, segIndex: number) => void;
  onFinish: (r: StageResult) => void;
  onExit: (r: StageResult) => void;
  notice?: string | null;
  /** Start immediately (tests, tutorials). Otherwise the class waits on a get-ready card. */
  skipReady?: boolean;
}) {
  const { width, height, isTablet, isLandscape } = useLayout();
  const insets = useSafeAreaInsets();
  const range = useMemo(() => keyboardRange(childPitches(song, cls)), [song, cls]);
  const split = Math.round((range.low + range.high) / 2);
  const engine = useMemo(
    () => new LessonEngine(cls, { songBpm: song.bpm, startSegIndex, splitMidi: split, watch }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cls.id],
  );
  const [, setFrame] = useState(0);
  const [ready, setReady] = useState(skipReady);
  const [paused, setPaused] = useState(false);
  const [waitSec, setWaitSec] = useState(0);
  const nudged = useRef<Record<number, boolean>>({});
  const lastOther = useRef(0);
  const segSeen = useRef(-1);
  const [hint, setHint] = useState<string | null>(null);
  const [flash, setFlash] = useState<Record<string, boolean>>({});
  const [pulse, setPulse] = useState(0); // beat circle / cheer, decays
  const [cheer, setCheer] = useState<'low' | 'high' | null>(null);
  const finishedRef = useRef(false);
  const lastSave = useRef(Date.now());

  const kbWidth = Math.min(width - space.lg * 2, isTablet ? 1000 : width);
  const kbHeight = Math.round(Math.min(isLandscape ? height * 0.42 : height * 0.32, 340));
  const keys = useMemo(() => layoutKeys(range.low, range.high, kbWidth, kbHeight), [range.low, range.high, kbWidth, kbHeight]);

  useEffect(() => {
    const pitches: string[] = [];
    for (let m = Math.min(range.low, 48); m <= Math.max(range.high, 84); m++) pitches.push(pitchOf(m));
    piano.preload(pitches).catch(() => {});
  }, [range.low, range.high]);

  const handle = (events: EngineEvent[]) => {
    for (const e of events) {
      if (e.type === 'noteOn') {
        piano.play(e.p, { volume: e.kind === 'listen' || e.kind === 'demo' ? 0.9 : 0.7 });
        if (e.kind === 'beat') setPulse(1);
      } else if (e.type === 'sound') piano.play(e.p);
      else if (e.type === 'hit') {
        setHint(null);
        setFlash((f) => ({ ...f, [e.p]: true }));
        setTimeout(() => setFlash((f) => ({ ...f, [e.p]: false })), 260);
        setPulse(1);
      } else if (e.type === 'hint') {
        setHint(e.p);
        if (Date.now() - lastOther.current > 6000) {
          lastOther.current = Date.now();
          const m = moment('otherKey', Date.now() / 1000);
          if (m) voice.say(m.voiceId);
        }
      }
      else if (e.type === 'beatTap') setPulse(1);
      else if (e.type === 'sideOk') {
        setCheer(e.side);
        setTimeout(() => setCheer(null), 600);
      } else if (e.type === 'segmentStart') {
        setHint(null);
        nudged.current = {};
        onProgress(engine.classTime, engine.segIndex);
        if (segSeen.current !== engine.segIndex) {
          segSeen.current = engine.segIndex;
          if (engine.segment.voiceId) voice.say(engine.segment.voiceId);
        }
      } else if (e.type === 'finished' && !finishedRef.current) {
        finishedRef.current = true;
        const r = engine.result();
        const end = moment('classEnd', engine.classTime);
        if (end) voice.say(end.voiceId);
        onFinish({ completed: r.completed, stars: watch ? 2 : r.stars });
      }
    }
  };

  // Frame loop (30 fps state updates are plenty for this UI).
  useEffect(() => {
    let last = Date.now();
    let raf = 0;
    let acc = 0;
    const loop = () => {
      const now = Date.now();
      // Web E2E hook: window.__LD_TIME_SCALE speeds the lesson clock (always 1 on devices).
      const scale = Platform.OS === 'web' ? Number((globalThis as any).__LD_TIME_SCALE) || 1 : 1;
      const dt = Math.min(0.1, (now - last) / 1000) * scale;
      last = now;
      if (ready && !paused && !finishedRef.current) {
        // The very first segment's line plays when the class starts (no segmentStart event for it).
        if (segSeen.current < 0) {
          segSeen.current = engine.segIndex;
          if (engine.segment.voiceId) voice.say(engine.segment.voiceId);
        }
        handle(engine.tick(dt));
        // Nudge ladder while waiting for the child (spec 7.4): 6 s child nudge, 12 s grown-up + pointer, 20 s Skip.
        if (engine.waitingFor) {
          setWaitSec((w) => {
            const nw = w + dt;
            if (nw >= 6 && !nudged.current[6]) {
              nudged.current[6] = true;
              const m = moment('waitNudge', engine.classTime);
              if (m) voice.say(m.voiceId);
            }
            if (nw >= 12 && !nudged.current[12]) {
              nudged.current[12] = true;
              setHint(engine.waitingFor);
              const m = moment('waitNudgeGrownUp', engine.classTime);
              if (m) voice.say(m.voiceId);
            }
            return nw;
          });
        } else if (waitSec) setWaitSec(0);
      }
      if (now - lastSave.current > 5000) {
        lastSave.current = now;
        onProgress(engine.classTime, engine.segIndex);
      }
      acc += dt;
      if (acc > 1 / 30) {
        acc = 0;
        setFrame((n) => (n + 1) % 1e6);
        setPulse((p) => (p > 0.02 ? p * 0.86 : 0));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, engine, ready]);

  useEffect(() => {
    if (paused) voice.stop();
  }, [paused]);
  useEffect(() => () => voice.stop(), []);
  // Get-ready voice (spec 2.1).
  useEffect(() => {
    if (ready) return;
    const m = moment(startSegIndex > 0 ? 'resume' : watch ? 'getReadyReal' : 'getReadyScreen', cls.index);
    const id = setTimeout(() => m && voice.say(m.voiceId), 400);
    return () => clearTimeout(id);
  }, [ready, startSegIndex, watch, cls.index]);

  const onKey = (p: string) => {
    piano.unlock();
    if (!ready) {
      // Get-ready card: a tap on C (any octave) starts the class, like the Start button.
      piano.play(p);
      if (p.startsWith('C') && !p.startsWith('C#')) start();
      return;
    }
    handle(engine.press(p));
  };
  const start = () => {
    piano.unlock();
    voice.stop();
    setReady(true);
  };
  const skipNote = () => {
    const p = engine.waitingFor;
    if (p) handle(engine.press(p));
  };

  const exit = () => {
    const r = engine.result();
    onProgress(engine.classTime, engine.segIndex);
    onExit({ completed: r.completed, stars: watch ? (r.completed ? 1 : 0) : r.stars });
  };

  const seg = engine.segment;
  const lit = engine.litKeys();
  const sched = engine.schedule;
  const fingers: Record<string, number | undefined> = {};
  for (const n of sched) if (lit.includes(n.p) && n.f) fingers[n.p] = n.f;
  const lines = useMemo(() => (seg.notes ? karaokeLines(seg.notes, song.phrases, seg.lines) : []), [seg, song.phrases]);
  const cur = engine.currentNoteIndex;
  const line = lines.find((l) => cur >= l.firstNote && cur <= l.lastNote) ?? (cur < 0 ? lines[0] : lines[lines.length - 1]);
  const fallH = Math.max(90, Math.min(220, height * 0.2));
  const isHL = seg.kind === 'high_low';
  const target = isHL ? seg.target ?? 'high' : null;
  const charSize = isTablet ? 120 : 84;
  const phase =
    seg.kind === 'listen' || seg.kind === 'demo'
      ? { id: 'watch', color: colors.indigo, soft: colors.indigoSoft }
      : seg.kind === 'your_turn' || seg.kind === 'high_low'
        ? { id: 'yourTurn', color: colors.coralInk, soft: colors.coralSoft }
        : seg.kind === 'together' || seg.kind === 'beat'
          ? { id: 'together', color: '#9A6A00', soft: colors.marigoldSoft }
          : null;
  const prompt = engine.waitingFor ? t('piano.tapGlowing') : seg.kind === 'beat' ? t('piano.tapBeat') : isHL ? t(target === 'low' ? 'piano.tapLow' : 'piano.tapHigh') : null;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, space.md) }]} testID="stage">
      {/* Parent controls: always visible, top of the screen, far from the keyboard. */}
      <View style={styles.topBar}>
        <Button testID="player-exit" variant="secondary" size="md" full={false} icon="close" label={t('player.close')} onPress={exit} />
        <Button
          testID="player-pause"
          variant="secondary"
          size="md"
          full={false}
          icon={paused ? 'play' : 'pause'}
          label={paused ? t('player.play') : t('player.pause')}
          onPress={() => setPaused((v) => !v)}
        />
      </View>

      <View style={styles.band}>
        <Text style={[styles.caption, isTablet && { fontSize: 40, lineHeight: 46 }]} numberOfLines={2} accessibilityLiveRegion="polite" testID="stage-caption">
          {seg.caption}
        </Text>
        {seg.subcaption ? <Text style={styles.cue}>{seg.subcaption}</Text> : null}
        {seg.parentCue ? (
          <View style={styles.cueRow}>
            <Text style={styles.gu}>{t('stage.grownUp')}</Text>
            <Text style={[styles.cue, { flex: 1 }]} numberOfLines={2}>
              {seg.parentCue}
            </Text>
          </View>
        ) : null}
        {notice ? <Text style={styles.cue}>{notice}</Text> : null}
      </View>

      <View style={styles.middle}>
        {phase ? (
          <View style={[styles.phase, { backgroundColor: phase.soft }]} testID={`phase-${phase.id}`}>
            <View style={[styles.phaseDot, { backgroundColor: phase.color }]} />
            <Text style={[styles.phaseText, { color: phase.color }]}>{t(`stage.phase.${phase.id}`)}</Text>
          </View>
        ) : null}
        <View style={styles.chars}>
          <View style={[styles.char, isHL && target === 'low' && styles.charOn, cheer === 'low' && { transform: [{ translateY: -12 }] }, !isHL && styles.hidden]}>
            <SongArt icon="bear" size={isHL && target !== 'low' ? charSize * 0.7 : charSize} />
          </View>
          <View style={styles.centerCol}>
            {seg.kind === 'beat' || (seg.kind === 'together' && !sched.some((n) => n.who === 'child')) ? (
              <View
                style={[styles.beat, { transform: [{ scale: 1 + pulse * 0.35 }], backgroundColor: pulse > 0.3 ? colors.marigold : colors.marigoldSoft }]}
                accessibilityElementsHidden
              />
            ) : null}
            {prompt ? (
              <Text style={styles.prompt} testID="stage-prompt">
                {prompt}
              </Text>
            ) : null}
          </View>
          <View style={[styles.char, isHL && target === 'high' && styles.charOn, cheer === 'high' && { transform: [{ translateY: -12 }] }, !isHL && styles.hidden]}>
            <SongArt icon="bird" size={isHL && target !== 'high' ? charSize * 0.7 : charSize} />
          </View>
        </View>
        {line ? (
          <Text style={[styles.karaoke, isTablet && { fontSize: 34, lineHeight: 42 }]} numberOfLines={2} testID="karaoke">
            {line.words.map((w, i) => {
              const done = w.noteIdx.every((k) => k < cur || (k === cur && !engine.waitingFor));
              const now = w.noteIdx.includes(cur);
              return (
                <Text key={i} style={now ? styles.wordNow : done ? styles.wordDone : styles.wordNext}>
                  {w.text}
                  {i < line.words.length - 1 ? ' ' : ''}
                </Text>
              );
            })}
          </Text>
        ) : null}
        <View style={[styles.fall, { width: kbWidth, height: fallH }]} pointerEvents="none" accessibilityElementsHidden>
          {sched
            .filter((n) => n.startSec + n.durSec >= engine.segTime - 0.05 && n.startSec - engine.segTime <= WINDOW)
            .map((n) => {
              const lane = laneX(keys, n.p);
              if (!lane) return null;
              const until = n.startSec - engine.segTime;
              const bottom = Math.max(0, (until / WINDOW) * fallH);
              const h = Math.max(18, Math.min(fallH * 0.5, (n.durSec / WINDOW) * fallH));
              const w = lane.w * (lane.black ? 0.9 : 0.62);
              const waiting = engine.waitingFor === n.p && n.i === cur;
              return (
                <View
                  key={`${n.i}`}
                  style={[
                    styles.note,
                    {
                      left: lane.x - w / 2,
                      width: w,
                      bottom,
                      height: h,
                      backgroundColor: n.who === 'child' ? colors.coral : colors.indigoSoft,
                      borderColor: n.who === 'child' ? colors.coralInk : colors.indigo,
                    },
                    waiting && styles.noteWaiting,
                  ]}
                >
                  {n.f && n.who === 'child' && h >= 30 ? <Text style={styles.noteFinger}>{n.f}</Text> : null}
                </View>
              );
            })}
          <View style={styles.hitLine} />
        </View>
      </View>

      <Keyboard keys={keys} width={kbWidth} height={kbHeight} lit={lit} hint={hint} flash={flash} fingers={fingers} sides={isHL ? { split, target: target! } : null} onKey={onKey} />
      <View style={[styles.progress, { width: kbWidth }]}>
        <ProgressBar value={engine.classTime / cls.durationSec} height={6} />
      </View>
      {ready && waitSec >= 20 && engine.waitingFor ? (
        <View style={styles.skipWrap}>
          <Button testID="stage-skip" size="md" full={false} variant="secondary" label={t('stage.skip')} onPress={skipNote} />
        </View>
      ) : null}
      {!ready ? (
        <View style={styles.readyCard} testID="get-ready">
          <Text style={styles.readyKicker}>{startSegIndex > 0 ? t('stage.resumeTitle') : t('stage.readyTitle')}</Text>
          <Scene id={watch ? 'middle-c' : 'phone-flat'} width={Math.min(320, width - space.xl * 2)} labels={{ grownUp: t('stage.grownUp'), child: t('stage.child') }} />
          <Text style={styles.readyBody}>{watch ? t('stage.readyReal') : t('stage.readyScreen')}</Text>
          <Button testID="stage-start" icon="play" label={t('stage.start')} onPress={start} />
          <Text style={styles.readyHint}>{t('stage.readyHint')}</Text>
        </View>
      ) : null}
      {paused ? (
        <View style={styles.pausedBadge} pointerEvents="none">
          <Icon name="pause" size={28} color={colors.white} />
          <Text style={styles.pausedText}>{t('player.paused')}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground, alignItems: 'stretch' },
  cueRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  gu: { fontFamily: fonts.extra, fontSize: 12, letterSpacing: 0.8, color: colors.white, backgroundColor: colors.indigo, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden', marginTop: 2 },
  phase: { position: 'absolute', top: space.sm, left: space.lg, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, zIndex: 2 },
  phaseDot: { width: 12, height: 12, borderRadius: 6 },
  phaseText: { fontFamily: fonts.extra, fontSize: 18, letterSpacing: 1 },
  hidden: { opacity: 0 },
  skipWrap: { position: 'absolute', right: space.lg, top: '38%' },
  readyCard: { position: 'absolute', left: space.lg, right: space.lg, top: '12%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.xl, gap: space.md, alignItems: 'center', boxShadow: '0 10px 30px -5px rgba(30,42,58,0.12)' },
  readyKicker: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink, textAlign: 'center' },
  readyBody: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 24, color: colors.body, textAlign: 'center' },
  readyHint: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.md },
  band: {
    marginHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderLeftWidth: 8,
    borderLeftColor: colors.coral,
    gap: 4,
  },
  caption: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.ink },
  cue: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 23, color: colors.inkSoft },
  middle: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', gap: space.sm, paddingTop: space.sm },
  chars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: space.xl },
  char: { borderRadius: radius.lg, padding: 4, borderWidth: 4, borderColor: 'transparent' },
  charOn: { borderColor: colors.coral, backgroundColor: colors.surface },
  centerCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: space.sm, minHeight: 60 },
  beat: { width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: colors.marigold },
  prompt: { fontFamily: fonts.heading, fontSize: 22, color: colors.indigo, textAlign: 'center' },
  karaoke: { fontFamily: fonts.display, fontSize: 28, lineHeight: 36, textAlign: 'center', paddingHorizontal: space.lg },
  wordDone: { color: colors.ink },
  wordNow: { color: colors.coralInk, textDecorationLine: 'underline' },
  wordNext: { color: colors.lineStrong },
  fall: { position: 'relative', overflow: 'hidden', alignSelf: 'center' },
  note: { position: 'absolute', borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  noteWaiting: { borderWidth: 4, borderColor: colors.ink },
  noteFinger: { fontFamily: fonts.display, fontSize: 18, color: colors.white },
  hitLine: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, backgroundColor: colors.lineStrong },
  progress: { alignSelf: 'center', marginTop: space.sm },
  pausedBadge: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'center',
    backgroundColor: colors.scrim,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.pill,
  },
  pausedText: { fontFamily: fonts.heading, fontSize: 22, color: colors.white },
});
