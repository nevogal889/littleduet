import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useNoteListener } from '../src/components/Listening';
import { BackButton, Button, Screen, T } from '../src/components/ui';
import { t } from '../src/i18n';
import { useApp } from '../src/state/store';
import { card, colors, fonts, radius, space } from '../src/theme';

/**
 * "Tune to our toy": play the toy's C once; Little Duet remembers how far it sits from concert pitch
 * and listens for the toy's own notes from then on. Behind Settings (already past the gate).
 */
export default function Tune() {
  const router = useRouter();
  const { child, updateChild } = useApp();
  const [cents, setCents] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  // Listen as an untuned toy: any octave, up to xylophone height, a C up to 1.5 semitones off.
  const L = useNoteListener(true, true, { toy: true, tuneCents: 0 });
  useEffect(() => {
    if (!L.on || cents !== null) return;
    L.listenFor('C4', (c) => setCents(c), { tolerance: 1.5, needFrames: 3 });
    return () => L.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L.on, round, cents]);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/settings' as never));
  const save = () => {
    if (child && cents !== null) updateChild(child.id, { tuneCents: cents, instrument: 'toy' });
    close();
  };
  const describe = (c: number) => (Math.abs(c) <= 10 ? t('tune.inTune') : t(c < 0 ? 'tune.flat' : 'tune.sharp', { cents: Math.abs(c) }));

  return (
    <Screen testID="tune" edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <BackButton testID="tune-back" onPress={close} label={t('common.back')} />
      </View>
      <View style={styles.col}>
        <T v="h1" accessibilityRole="header">
          {t('tune.title')}
        </T>
        <T v="body">{t('tune.body')}</T>
        <View style={styles.card} testID={cents === null ? 'tune-listening' : 'tune-done'} accessibilityLiveRegion="polite">
          {L.state === 'denied' || L.state === 'unavailable' ? (
            <T v="bodyStrong">{t('tune.noMic')}</T>
          ) : cents === null ? (
            <>
              <Text style={styles.big}>{t('tune.playC')}</Text>
              <T v="small">{L.on ? t('listen.listening') : t('tune.starting')}</T>
            </>
          ) : (
            <>
              <Text style={styles.big}>{t('tune.heard')}</Text>
              <T v="bodyStrong">{describe(cents)}</T>
            </>
          )}
        </View>
        {cents !== null ? (
          <>
            <Button testID="tune-save" label={t('tune.save')} onPress={save} />
            <Button testID="tune-again" variant="secondary" size="md" label={t('tune.again')} onPress={() => (setCents(null), setRound((r) => r + 1))} />
          </>
        ) : null}
        <T v="small">{t('tune.privacy')}</T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: space.md, paddingTop: space.md },
  card: { ...card, padding: space.xl, gap: space.sm, alignItems: 'center', borderRadius: radius.lg },
  big: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: colors.ink, textAlign: 'center' },
});
