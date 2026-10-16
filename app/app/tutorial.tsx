import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Confetti } from '../src/components/Confetti';
import { Keyboard, layoutKeys } from '../src/components/Keyboard';
import { ListenBanner, useNoteListener } from '../src/components/Listening';
import { Scene, SCENES, type SceneId } from '../src/components/Scene';
import { Button, ProgressBar, T } from '../src/components/ui';
import realJson from '../src/data/tutorial-real.json';
import screenJson from '../src/data/tutorial-screen.json';
import { useOpenClass } from '../src/hooks';
import { t } from '../src/i18n';
import { moment } from '../src/lib/moments';
import { piano } from '../src/services/audio/piano';
import { voice } from '../src/services/audio/voice';
import { useApp } from '../src/state/store';
import { colors, fonts, radius, space, useLayout } from '../src/theme';
import type { Lesson, PlayMode, Segment } from '../src/types';
import { isPitched, midiOf } from '../src/lib/music';

const LESSONS: Record<PlayMode, Lesson> = { real: realJson as unknown as Lesson, screen: screenJson as unknown as Lesson };

/**
 * The required tutorial (one per mode): a step player with pictures, the teacher's voice and a first note.
 * Scene steps move on by themselves after the line; the grown-up can go back or forward any time.
 */
export default function Tutorial() {
  const { mode: modeParam, next, again } = useLocalSearchParams<{ mode?: string; next?: string; again?: string }>();
  const mode: PlayMode = modeParam === 'screen' ? 'screen' : 'real';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height, isTablet } = useLayout();
  const { markTutorial, child } = useApp();
  const openClass = useOpenClass();
  const steps = useMemo(() => LESSONS[mode]?.classes?.[0]?.segments ?? [], [mode]);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [lit, setLit] = useState<string[]>([]);
  const [flash, setFlash] = useState<Record<string, boolean>>({});
  const [canNext, setCanNext] = useState(false);
  const [heard, setHeard] = useState(false);
  const [taps, setTaps] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const step: Segment | undefined = steps[i];
  const playing = !!step && step.kind !== 'say';
  const needsChild = !!step && (step.kind === 'your_turn' || step.kind === 'beat' || step.kind === 'high_low');
  const listenOn = mode === 'real' && child?.listen !== false && step?.kind === 'your_turn';
  const L = useNoteListener(mode === 'real' && child?.listen !== false, true);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const go = useCallback(
    (to: number) => {
      clear();
      voice.stop();
      L.cancel();
      setLit([]);
      setHeard(false);
      setTaps(0);
      setCanNext(false);
      if (to >= steps.length) {
        markTutorial(mode);
        setDone(true);
        return;
      }
      setI(Math.max(0, to));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [steps.length, mode],
  );

  // Run the current step: speak, show keys, play the teacher's notes, then wait or move on.
  useEffect(() => {
    if (!step || done) return;
    let alive = true;
    const notes = (step.notes ?? []).filter(isPitched);
    const keysToShow = (step.showKeys ?? []).map((k) => (typeof k === 'string' ? k : (k as unknown as { p: string }).p));
    setLit(keysToShow);
    voice.say(step.voiceId, 15).then(() => {
      if (!alive) return;
      if (step.kind === 'say') {
        setCanNext(true);
        later(() => alive && go(i + 1), 1400);
        return;
      }
      const spb = 60 / (step.bpm ?? 72);
      if (step.kind === 'listen' || step.kind === 'demo') {
        let tt = 300;
        for (const n of notes) {
          later(() => {
            piano.play(n.p, { volume: 0.9 });
            setLit([n.p]);
          }, tt);
          tt += n.d * spb * 1000;
        }
        later(() => {
          setLit([]);
          setCanNext(true);
          later(() => alive && go(i + 1), 1200);
        }, tt + 300);
      } else if (step.kind === 'your_turn') {
        const target = notes[0]?.p;
        if (!target) return;
        setLit([target]);
        if (listenOn && L.on) {
          L.listenFor(target, () => {
            setHeard(true);
            const m = moment('heard', i, target);
            if (m) voice.say(m.voiceId);
            later(() => go(i + 1), 1800);
          });
        }
        later(() => setCanNext(true), mode === 'real' ? 6000 : 15000);
      } else {
        // beat / high_low: the child taps (screen) or plays (real); the grown-up moves on.
        later(() => setCanNext(true), mode === 'real' ? 4000 : 12000);
      }
    });
    return () => {
      alive = false;
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, done, step?.voiceId]);

  useEffect(() => () => (clear(), voice.stop()), []);

  const kbW = Math.min(width - space.lg * 2, isTablet ? 760 : width);
  const kbH = Math.round(Math.min(height * 0.24, 220));
  const isHL = step?.kind === 'high_low';
  const range = isHL ? { low: 48, high: 83 } : { low: 60, high: 71 };
  const keys = useMemo(() => layoutKeys(range.low, range.high, kbW, kbH), [range.low, range.high, kbW, kbH]);
  const target = step?.kind === 'your_turn' ? (step.notes ?? []).filter(isPitched)[0]?.p : undefined;

  const onKey = (p: string) => {
    piano.unlock();
    piano.play(p);
    if (!step || mode !== 'screen') return;
    setFlash((f) => ({ ...f, [p]: true }));
    later(() => setFlash((f) => ({ ...f, [p]: false })), 250);
    if (step.kind === 'your_turn' && p === target && !heard) {
      setHeard(true);
      const m = moment('heard', i, p);
      if (m) voice.say(m.voiceId);
      later(() => go(i + 1), 1500);
    } else if (step.kind === 'beat') {
      const n = taps + 1;
      setTaps(n);
      if (n >= 4) later(() => go(i + 1), 600);
    } else if (isHL) {
      const low = midiOf(p) < 66;
      if ((step.target === 'low') === low) later(() => go(i + 1), 700);
    }
  };

  if (done) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + space.xl }]} testID="tutorial-done">
        <Confetti />
        <View style={styles.doneCol}>
          <Scene id="stars" width={Math.min(320, width - space.xl * 2)} labels={{ grownUp: t('stage.grownUp'), child: t('stage.child') }} />
          <T v="hero" style={{ textAlign: 'center' }}>
            {t('tutorial.done')}
          </T>
          <T v="body" style={{ textAlign: 'center' }}>
            {t('tutorial.doneBody')}
          </T>
          <Button
            testID="tutorial-continue"
            icon="play"
            label={next ? t('tutorial.continue') : t('settings.done')}
            onPress={() => (next ? openClass(String(next), mode, { replace: true }) : router.canGoBack() ? router.back() : router.replace('/' as never))}
          />
        </View>
      </View>
    );
  }
  if (!step) return null;
  const sceneId = (step.scene && (SCENES as string[]).includes(step.scene) ? step.scene : null) as SceneId | null;
  const showKb = playing || lit.length > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, space.md) }]} testID="tutorial">
      <View style={styles.top}>
        {again ? <Button testID="tutorial-close" variant="secondary" size="md" full={false} icon="close" label={t('player.close')} onPress={() => (voice.stop(), router.back())} /> : <View />}
        <Text style={styles.count}>{t('tutorial.stepOf', { index: i + 1, total: steps.length })}</Text>
      </View>
      <View style={styles.progress}>
        <ProgressBar value={(i + 1) / steps.length} height={8} />
      </View>
      <View style={styles.body}>
        {sceneId ? <Scene id={sceneId} width={Math.min(isTablet ? 520 : 360, width - space.lg * 2)} labels={{ grownUp: t('stage.grownUp'), child: t('stage.child') }} /> : null}
        <Text style={[styles.caption, isTablet && { fontSize: 38, lineHeight: 44 }]} testID="tutorial-caption" accessibilityLiveRegion="polite">
          {step.caption}
        </Text>
        {step.parentCue ? (
          <View style={styles.cueRow}>
            <Text style={styles.gu}>{t('stage.grownUp')}</Text>
            <Text style={styles.cue}>{step.parentCue}</Text>
          </View>
        ) : null}
      </View>
      {showKb ? (
        <View style={{ alignItems: 'center' }}>
          <Keyboard
            keys={keys}
            width={kbW}
            height={kbH}
            lit={lit}
            hint={null}
            flash={flash}
            fingers={{}}
            sides={isHL ? { split: 66, target: step.target ?? 'low' } : null}
            onKey={onKey}
          />
        </View>
      ) : null}
      {mode === 'real' && step.kind === 'your_turn' && target ? (
        <View style={{ height: 96 }}>
          <ListenBanner note={target} heard={heard} waitedLong={canNext} micOn={L.on} onPlayed={() => go(i + 1)} />
        </View>
      ) : null}
      <View style={styles.nav}>
        <Button testID="tutorial-back" variant="ghost" size="md" full={false} label={t('common.back')} onPress={() => go(i - 1)} />
        <Button testID="tutorial-next" size="md" full={false} variant={canNext || !needsChild ? 'primary' : 'secondary'} label={t('common.next')} onPress={() => go(i + 1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.md },
  count: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft, letterSpacing: 0.6, textTransform: 'uppercase' },
  progress: { paddingHorizontal: space.lg },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.lg },
  caption: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.ink, textAlign: 'center' },
  cueRow: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', maxWidth: 560, backgroundColor: colors.indigoSoft, padding: space.md, borderRadius: radius.md },
  gu: { fontFamily: fonts.extra, fontSize: 12, letterSpacing: 0.8, color: colors.white, backgroundColor: colors.indigo, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: 'hidden', marginTop: 2 },
  cue: { flex: 1, fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.ink },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingTop: space.md },
  doneCol: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', gap: space.lg, paddingHorizontal: space.lg },
});
