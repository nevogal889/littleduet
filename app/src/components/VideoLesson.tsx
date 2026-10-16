import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { useEvent, useEventListener } from 'expo';
import { useVideoPlayer, VideoView, type VideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from '../i18n';
import { COMPLETE_FRACTION, starsForVideo } from '../lib/progress';
import { videoUrl } from '../services/media';
import { colors, fonts, radius, space } from '../theme';
import type { LessonClass, Song } from '../types';
import { Icon } from './Icon';
import { LessonStage, type StageResult } from './LessonStage';
import { ListenBanner, useNoteListener } from './Listening';
import { childCues } from '../lib/timeline';
import { moment } from '../lib/moments';
import { voice } from '../services/audio/voice';
import { Scene } from './Scene';
import { Button } from './ui';

interface Props {
  song: Song;
  cls: LessonClass;
  resumeSec: number;
  onProgress: (positionSec: number) => void;
  onFinish: (r: StageResult) => void;
  onExit: (r: StageResult) => void;
  /** Real piano: listen through the microphone and wait for the child's notes. */
  listen?: boolean;
}

/** Real-piano mode: the lesson video. Falls back to the on-screen lesson when no video plays. */
export function VideoLesson(props: Props) {
  const url = videoUrl(props.cls.video);
  const [failed, setFailed] = useState(!url);
  if (failed || !url) {
    const seg = props.cls.segments.reduce(
      (acc, s, i) => (acc.t + s.durationSec <= props.resumeSec ? { t: acc.t + s.durationSec, i: i + 1 } : acc),
      { t: 0, i: 0 },
    );
    return (
      <LessonStage
        song={props.song}
        cls={props.cls}
        watch
        startSegIndex={Math.min(seg.i, props.cls.segments.length - 1)}
        notice={t('player.videoFallback')}
        onProgress={(time) => props.onProgress(time)}
        onFinish={props.onFinish}
        onExit={props.onExit}
      />
    );
  }
  return <RealVideo {...props} url={url} onFail={() => setFailed(true)} />;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

function RealVideo({ song, cls, resumeSec, onProgress, onFinish, onExit, url, onFail, listen = true }: Props & { url: string; onFail: () => void }) {
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.1;
  });
  // Listening: pause on each of the child's notes until the microphone hears it (or the grown-up taps
  // "We played it"). Without the microphone, pause once at the end of each "your turn" part instead.
  const cues = useMemo(() => childCues(cls, song.bpm), [cls, song.bpm]);
  const anyOctave = song.ageGroup === '2-3' || song.ageGroup === '3-4';
  const L = useNoteListener(listen && cues.length > 0, anyOctave);
  const [wait, setWait] = useState<{ i: number; heard: boolean; since: number } | null>(null);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const begin = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    setReady(true);
    voice.stop();
    L.cancel();
    if (started.current) player.play();
  };
  const [waitedLong, setWaitedLong] = useState(false);
  const handled = useRef(new Set<number>());
  const heardCount = useRef(0);
  const resume = (i: number, seekTo?: number) => {
    handled.current.add(i);
    setWait(null);
    setWaitedLong(false);
    L.cancel();
    if (seekTo !== undefined) player.currentTime = seekTo;
    player.play();
  };
  useEffect(() => {
    if (ready) return;
    const m = moment(resumeSec > 0 ? 'resume' : 'getReadyReal', cls.index);
    const id = setTimeout(() => m && voice.say(m.voiceId), 400);
    return () => clearTimeout(id);
  }, [ready, resumeSec, cls.index]);
  useEffect(() => {
    if (ready || !L.on) return;
    // Mic check: the child's C (any octave) starts the class.
    const m = moment('micCheck', cls.index);
    const id = setTimeout(() => {
      if (m) voice.say(m.voiceId);
      L.listenFor('C4', () => {
        const ok = moment('micReady', cls.index);
        if (ok) voice.say(ok.voiceId);
        setTimeout(begin, 1200);
      });
    }, 4500);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, L.on]);
  useEffect(() => () => voice.stop(), []);
  useEffect(() => {
    if (!wait || wait.heard) return;
    const id = setTimeout(() => setWaitedLong(true), 7000);
    return () => clearTimeout(id);
  }, [wait]);
  const checkCue = (time: number) => {
    if (wait || !cues.length) return;
    const micOn = L.on;
    for (let i = 0; i < cues.length; i++) {
      if (handled.current.has(i)) continue;
      const c = cues[i];
      const at = micOn ? c.t - 0.12 : c.last ? c.tEnd + 0.3 : Infinity;
      if (time >= at && time < at + 1.5) {
        player.pause();
        setWait({ i, heard: false, since: Date.now() });
        if (micOn) {
          L.listenFor(c.p, () => {
            heardCount.current += 1;
            const m = moment('heard', heardCount.current, c.p);
            if (m) voice.say(m.voiceId);
            setWait((w) => (w ? { ...w, heard: true } : w));
            setTimeout(() => resume(i, c.tEnd), 800);
          });
        }
        return;
      }
      if (time >= at + 1.5) handled.current.add(i); // skipped past (seek): don't stop for it
    }
  };
  const onSeekBack = (to: number) => {
    for (const i of [...handled.current]) if (cues[i] && cues[i].t >= to) handled.current.delete(i);
  };
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const [pos, setPos] = useState(resumeSec);
  const posRef = useRef(resumeSec);
  const started = useRef(false);
  const done = useRef(false);
  const lastSave = useRef(Date.now());
  const duration = player.duration > 0 ? player.duration : cls.durationSec;

  useEventListener(player, 'statusChange', ({ status }) => {
    if (status === 'error') onFail();
    if (status === 'readyToPlay' && !started.current) {
      started.current = true;
      if (resumeSec > 0) player.currentTime = resumeSec;
      if (readyRef.current) player.play();
    }
  });
  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    posRef.current = currentTime;
    setPos(currentTime);
    checkCue(currentTime);
    if (Date.now() - lastSave.current >= 5000) {
      lastSave.current = Date.now();
      onProgress(currentTime);
    }
  });
  useEventListener(player, 'playToEnd', () => {
    if (done.current) return;
    done.current = true;
    onProgress(cls.durationSec);
    const listened = L.on ? cues.length : 0;
    const ratio = listened ? heardCount.current / listened : 1;
    onFinish({ completed: true, stars: listened ? (ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1) : starsForVideo(1) });
  });
  // If the source never becomes ready (offline, unsupported), use the on-screen lesson.
  useEffect(() => {
    const id = setTimeout(() => {
      if (!started.current) onFail();
    }, 12000);
    return () => clearTimeout(id);
  }, [onFail]);

  const exit = () => {
    const p = posRef.current;
    onProgress(p);
    player.pause();
    const fraction = p / duration;
    onExit({ completed: fraction >= COMPLETE_FRACTION, stars: starsForVideo(fraction) });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]} testID="video-player">
      {/* Controls are always available, above and below the picture (never on top of it). */}
      <View style={styles.topRow}>
        <Button testID="player-exit" variant="light" size="md" full={false} icon="close" label={t('player.close')} onPress={exit} />
      </View>
      <View style={styles.videoBox}>
        <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} allowsPictureInPicture={false} />
        {!ready ? (
          <View style={styles.ready} testID="get-ready">
            <Text style={styles.readyTitle}>{resumeSec > 0 ? t('stage.resumeTitle') : t('stage.readyTitle')}</Text>
            <Scene id="middle-c" width={280} labels={{ grownUp: t('stage.grownUp'), child: t('stage.child') }} />
            <Text style={styles.readyBody}>{t('stage.readyReal')}</Text>
            <Button testID="stage-start" icon="play" label={t('stage.start')} onPress={begin} />
            <Text style={styles.readyHint}>{L.on ? t('stage.readyHintMic') : t('stage.readyHintNoMic')}</Text>
          </View>
        ) : null}
        {wait ? (
          <ListenBanner
            note={cues[wait.i].p}
            heard={wait.heard}
            waitedLong={waitedLong}
            micOn={L.on}
            onPlayed={() => resume(wait.i, L.on ? cues[wait.i].tEnd : undefined)}
          />
        ) : null}
      </View>
      <View style={styles.bottom}>
        {L.on ? (
          <Text style={styles.listenNote} testID="listen-on">
            {t('listen.onNote')}
          </Text>
        ) : null}
        {cls.parentTip ? (
          <Text style={styles.tip} numberOfLines={2}>
            {t('player.grownUpTip')}: {cls.parentTip}
          </Text>
        ) : null}
        <Scrubber player={player} pos={pos} duration={duration} onSeek={(s) => (onSeekBack(s), (player.currentTime = s), setPos(s))} />
        <View style={styles.center}>
          <RoundButton testID="player-back10" label={t('player.back10')} icon="back10" size={64} onPress={() => (onSeekBack(posRef.current - 10), player.seekBy(-10))} />
          <RoundButton
            testID="player-playpause"
            label={isPlaying ? t('a11y.pauseButton') : t('a11y.playButton')}
            icon={isPlaying ? 'pause' : 'play'}
            size={84}
            primary
            onPress={() => (isPlaying ? player.pause() : player.play())}
          />
          <View style={{ width: 64 }} />
        </View>
      </View>
    </View>
  );
}

function RoundButton({ label, icon, size, onPress, primary, testID }: { label: string; icon: 'back10' | 'play' | 'pause'; size: number; onPress: () => void; primary?: boolean; testID?: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? colors.accent : 'rgba(255,255,255,0.14)' },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Icon name={icon} size={size * 0.42} color={colors.white} />
      </Pressable>
      {icon === 'back10' ? <Text style={styles.btnLabel}>{label}</Text> : null}
    </View>
  );
}

function Scrubber({ pos, duration, onSeek }: { player: VideoPlayer; pos: number; duration: number; onSeek: (s: number) => void }) {
  const [w, setW] = useState(1);
  const seekAt = (e: GestureResponderEvent) => onSeek(Math.max(0, Math.min(duration - 0.5, (e.nativeEvent.locationX / w) * duration)));
  const frac = duration ? Math.min(1, pos / duration) : 0;
  return (
    <View style={styles.scrubRow}>
      <Text style={styles.time}>{fmt(pos)}</Text>
      <View
        testID="player-scrubber"
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('player.resumeFrom', { time: fmt(pos) })}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => onSeek(Math.max(0, pos + (e.nativeEvent.actionName === 'increment' ? 10 : -10)))}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderGrant={seekAt}
        onResponderMove={seekAt}
        style={styles.track}
      >
        <View pointerEvents="none" style={styles.trackBg}>
          <View style={[styles.trackFill, { width: `${frac * 100}%` }]} />
        </View>
        <View pointerEvents="none" style={[styles.thumb, { left: frac * w - 12 }]} />
      </View>
      <Text style={styles.time}>{fmt(duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#11161E' },
  topRow: { flexDirection: 'row', justifyContent: 'flex-start', paddingHorizontal: space.lg, paddingVertical: space.md },
  videoBox: { flex: 1, backgroundColor: colors.black },
  bottom: { paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.lg, gap: space.md },
  ready: { position: 'absolute', left: space.lg, right: space.lg, top: space.lg, bottom: space.lg, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, gap: space.sm, alignItems: 'center', justifyContent: 'center' },
  readyTitle: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink, textAlign: 'center' },
  readyBody: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.body, textAlign: 'center', maxWidth: 520 },
  readyHint: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  listenNote: { fontFamily: fonts.bold, fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  tip: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: 640, alignSelf: 'center' },
  center: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xxl },
  btnLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.white },
  scrubRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  time: { fontFamily: fonts.medium, fontSize: 15, color: colors.white, minWidth: 44, textAlign: 'center' },
  track: { flex: 1, height: 48, justifyContent: 'center' },
  trackBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  trackFill: { height: 6, backgroundColor: colors.accent },
  thumb: { position: 'absolute', top: 12, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white },
});
