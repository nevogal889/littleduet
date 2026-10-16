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
import { LockPill, usePlayerLock } from './PlayerLock';
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
  const lock = usePlayerLock(!isPlaying && started.current);
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
    <View style={styles.root} testID="video-player">
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} allowsPictureInPicture={false} />
      {lock.unlocked ? (
        <View style={[styles.overlay, { paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.md }]}>
          <View style={styles.topRow}>
            <Button testID="player-exit" variant="light" size="md" full={false} icon="close" label={t('player.exit')} onPress={exit} />
            <Button testID="player-lock" variant="light" size="md" full={false} icon="lock" label={t('player.lock')} onPress={lock.lock} />
          </View>
          {cls.parentTip ? (
            <Text style={styles.tip} numberOfLines={3}>
              {t('player.grownUpTip')}: {cls.parentTip}
            </Text>
          ) : null}
          <View style={styles.center}>
            <RoundButton
              testID="player-back10"
              label={t('player.back10')}
              icon="back10"
              size={80}
              onPress={() => {
                player.seekBy(-10);
                lock.poke();
              }}
            />
            <RoundButton
              testID="player-playpause"
              label={isPlaying ? t('a11y.pauseButton') : t('a11y.playButton')}
              icon={isPlaying ? 'pause' : 'play'}
              size={104}
              primary
              onPress={() => {
                if (isPlaying) player.pause();
                else player.play();
                lock.poke();
              }}
            />
            <View style={{ width: 80 }} />
          </View>
          <Scrubber
            player={player}
            pos={pos}
            duration={duration}
            onSeek={(s) => {
              player.currentTime = s;
              setPos(s);
              lock.poke();
            }}
          />
        </View>
      ) : (
        <View style={[styles.lockArea, { paddingTop: insets.top }]}>
          <LockPill dark onUnlock={lock.unlock} />
        </View>
      )}
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
          { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? colors.coral : 'rgba(255,255,255,0.94)' },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Icon name={icon} size={size * 0.42} color={primary ? colors.white : colors.ink} />
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
        <View pointerEvents="none" style={[styles.thumb, { left: frac * w - 16 }]} />
      </View>
      <Text style={styles.time}>{fmt(duration)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,42,58,0.55)', justifyContent: 'space-between', paddingHorizontal: space.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
  tip: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 25, color: colors.white, textAlign: 'center', maxWidth: 640, alignSelf: 'center' },
  center: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xxl },
  btnLabel: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
  lockArea: { position: 'absolute', top: 0, right: 0, padding: space.sm },
  scrubRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  time: { fontFamily: fonts.bold, fontSize: 17, color: colors.white, minWidth: 48, textAlign: 'center' },
  track: { flex: 1, height: 56, justifyContent: 'center' },
  trackBg: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  trackFill: { height: 10, backgroundColor: colors.coral },
  thumb: { position: 'absolute', top: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, borderWidth: 4, borderColor: colors.coral },
});
