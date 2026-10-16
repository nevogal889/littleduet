import React, { useEffect, useRef, useState } from 'react';
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
import { Button } from './ui';

interface Props {
  song: Song;
  cls: LessonClass;
  resumeSec: number;
  onProgress: (positionSec: number) => void;
  onFinish: (r: StageResult) => void;
  onExit: (r: StageResult) => void;
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

function RealVideo({ cls, resumeSec, onProgress, onFinish, onExit, url, onFail }: Props & { url: string; onFail: () => void }) {
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.5;
  });
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
      player.play();
    }
  });
  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    posRef.current = currentTime;
    setPos(currentTime);
    if (Date.now() - lastSave.current >= 5000) {
      lastSave.current = Date.now();
      onProgress(currentTime);
    }
  });
  useEventListener(player, 'playToEnd', () => {
    if (done.current) return;
    done.current = true;
    onProgress(cls.durationSec);
    onFinish({ completed: true, stars: starsForVideo(1) });
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
      </View>
      <View style={styles.bottom}>
        {cls.parentTip ? (
          <Text style={styles.tip} numberOfLines={2}>
            {t('player.grownUpTip')}: {cls.parentTip}
          </Text>
        ) : null}
        <Scrubber player={player} pos={pos} duration={duration} onSeek={(s) => ((player.currentTime = s), setPos(s))} />
        <View style={styles.center}>
          <RoundButton testID="player-back10" label={t('player.back10')} icon="back10" size={64} onPress={() => player.seekBy(-10)} />
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
