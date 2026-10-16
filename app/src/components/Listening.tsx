import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';
import { detectPitch, midiOfPitch, NoteMatcher } from '../lib/pitch';
import { createMic } from '../services/listen/mic';
import type { MicStart } from '../services/listen/types';
import { colors, fonts, radius, space } from '../theme';
import { Icon } from './Icon';
import { Button } from './ui';

export type MicState = 'off' | 'starting' | MicStart;

/**
 * On-device listening for one expected note at a time. Nothing is recorded: frames are analysed in
 * memory and dropped. `listenFor` replaces any previous target.
 */
export function useNoteListener(enabled: boolean, anyOctave: boolean) {
  const [state, setState] = useState<MicState>('off');
  const mic = useRef(createMic());
  const matcher = useRef<NoteMatcher | null>(null);
  const onHeard = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setState('starting');
    mic.current
      .start((frame, sr) => {
        const m = matcher.current;
        if (!m) return;
        if (m.feed(detectPitch(frame, sr))) {
          matcher.current = null;
          const cb = onHeard.current;
          onHeard.current = null;
          cb?.();
        }
      })
      .then((s) => alive && setState(s));
    const current = mic.current;
    return () => {
      alive = false;
      current.stop();
      setState('off');
    };
  }, [enabled]);

  const listenFor = useCallback(
    (p: string, cb: () => void) => {
      matcher.current = new NoteMatcher(midiOfPitch(p), { anyOctave });
      onHeard.current = cb;
    },
    [anyOctave],
  );
  const cancel = useCallback(() => {
    matcher.current = null;
    onHeard.current = null;
  }, []);
  return { state, listenFor, cancel, on: state === 'ok' };
}

/** "Your turn: play A" while waiting, "Yes! A!" when heard. Sits over the bottom of the video. */
export function ListenBanner({ note, heard, waitedLong, micOn, onPlayed }: { note: string; heard: boolean; waitedLong: boolean; micOn: boolean; onPlayed: () => void }) {
  const name = note.replace(/\d/g, '').replace('#', ' sharp');
  return (
    <View style={[styles.banner, heard && styles.bannerHeard]} testID={heard ? 'listen-heard' : 'listen-waiting'} accessibilityLiveRegion="polite">
      <View style={[styles.mic, heard && { backgroundColor: colors.green }]}>
        <Icon name={heard ? 'check' : 'songs'} size={26} color={colors.white} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.big}>{heard ? t('listen.heard', { note: name }) : t('listen.play', { note: name })}</Text>
        {!heard ? <Text style={styles.small}>{micOn ? t('listen.listening') : t('listen.micOff')}</Text> : null}
      </View>
      {!heard && (waitedLong || !micOn) ? <Button testID="listen-played" size="md" full={false} label={t('listen.wePlayed')} onPress={onPlayed} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', left: space.lg, right: space.lg, bottom: space.lg, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.card, backgroundColor: 'rgba(17,22,30,0.88)' },
  bannerHeard: { backgroundColor: 'rgba(40,90,20,0.92)' },
  mic: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  big: { fontFamily: fonts.extra, fontSize: 24, color: colors.white },
  small: { fontFamily: fonts.bold, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
});
