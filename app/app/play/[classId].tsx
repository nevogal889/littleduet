import React, { useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { LessonStage, type StageResult } from '../../src/components/LessonStage';
import { VideoLesson } from '../../src/components/VideoLesson';
import { classById, fullClass } from '../../src/data/catalog';
import { canPlayClass } from '../../src/lib/entitlement';
import { isInProgress, resumePositionFor } from '../../src/lib/progress';
import { useApp } from '../../src/state/store';
import { colors } from '../../src/theme';
import type { PlayMode } from '../../src/types';

export default function Player() {
  useKeepAwake();
  const { classId, mode: modeParam } = useLocalSearchParams<{ classId: string; mode?: string }>();
  const router = useRouter();
  const { childData, entitlement, child, savePosition, completeClass, flush } = useApp();
  const hit = classById(String(classId));
  // Segment timelines are loaded only here (the catalog keeps class metadata only).
  const full = useMemo(() => (hit ? fullClass(hit.cls.id) ?? hit.cls : undefined), [hit]);
  const mode: PlayMode = modeParam === 'screen' || modeParam === 'real' ? modeParam : child?.playMode ?? 'real';
  const ended = useRef(false);
  // Snapshot of saved progress when the class opened (resume point).
  const initial = useRef(hit ? childData.progress[hit.cls.id] : undefined).current;

  const finish = useCallback(
    (r: StageResult) => {
      if (!hit || ended.current) return;
      ended.current = true;
      const stars = Math.max(1, r.stars);
      const earned = completeClass(hit.cls, stars, mode);
      flush();
      router.replace(`/celebrate?classId=${hit.cls.id}&stars=${stars}&mode=${mode}&stickers=${encodeURIComponent(earned.map((s) => s.id).join(','))}` as never);
    },
    [hit, mode, completeClass, flush, router],
  );

  if (!hit) return <Redirect href="/" />;
  if (!canPlayClass(hit.cls, entitlement)) return <Redirect href={`/song/${hit.song.id}` as never} />;

  const exit = (r: StageResult) => {
    if (r.completed) finish(r);
    else {
      ended.current = true;
      flush();
      if (router.canGoBack()) router.back();
      else router.replace(`/song/${hit.song.id}` as never);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: mode === 'real' ? colors.black : colors.ground }} testID={`player-${mode}`}>
      {mode === 'real' ? (
        <VideoLesson
          song={hit.song}
          cls={full ?? hit.cls}
          resumeSec={resumePositionFor(hit.cls, initial)}
          onProgress={(sec) => !ended.current && savePosition(hit.cls, sec)}
          onFinish={finish}
          onExit={exit}
        />
      ) : (
        <LessonStage
          song={hit.song}
          cls={full ?? hit.cls}
          startSegIndex={isInProgress(hit.cls, initial) ? initial?.segIndex ?? 0 : 0}
          onProgress={(sec, seg) => !ended.current && savePosition(hit.cls, sec, seg)}
          onFinish={finish}
          onExit={exit}
        />
      )}
    </View>
  );
}
