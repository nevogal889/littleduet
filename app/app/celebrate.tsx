import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SongCover } from '../src/components/bits';
import { Confetti } from '../src/components/Confetti';
import { Icon } from '../src/components/Icon';
import { Button, ProgressBar, Screen, T } from '../src/components/ui';
import { classById, songById } from '../src/data/catalog';
import { useChildName } from '../src/hooks';
import { t } from '../src/i18n';
import { levelFor } from '../src/lib/rewards';
import { localDay } from '../src/lib/stickers';
import { streak as computeStreak } from '../src/lib/streak';
import { useApp } from '../src/state/store';
import { card, colors, fonts, radius, space, useLayout } from '../src/theme';

export default function Celebrate() {
  const { classId, stars: starsParam, stickers } = useLocalSearchParams<{ classId: string; stars?: string; stickers?: string }>();
  const router = useRouter();
  const name = useChildName();
  const { childData } = useApp();
  const { isTablet } = useLayout();
  const hit = classById(String(classId));
  const stars = Math.max(1, Math.min(3, Number(starsParam) || 1));
  const isConcert = hit?.cls.type === 'concert';
  const totalStars = Object.values(childData.progress).reduce((a, p) => a + p.stars, 0);
  const lvl = levelFor(totalStars);
  const st = computeStreak(childData.goalDays ?? [], Date.now());
  const today = localDay(Date.now());
  const firstToday = (childData.completions ?? []).filter((c) => localDay(c) === today).length === 1;
  const fromStreak = firstToday ? Math.max(0, st.days - 1) : st.days;

  // Staged reveal: stars pop in one by one, the counter ticks up, then the streak.
  const [step, setStep] = useState(0);
  const [still, setStill] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => !cancelled && v && (setStill(true), setStep(99)))
      .catch(() => {});
    const timers = [1, 2, 3, 4, 5].map((n) => setTimeout(() => !cancelled && setStep((s) => Math.max(s, n)), 350 * n));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);
  const shownStars = Math.min(stars, step);
  const counter = step >= stars ? stars : shownStars;
  const streakNow = step >= stars + 1 ? st.days : fromStreak;

  const newStickers = String(stickers ?? '')
    .split(',')
    .filter(Boolean)
    .map((id) => {
      const [songId, milestone] = id.split(':');
      const s = songById(songId);
      return s ? { id, song: s, name: t(`stickers.names.${s.icon}`), milestone: t(`stickers.milestones.${milestone}`) } : null;
    })
    .filter(Boolean) as { id: string; song: NonNullable<ReturnType<typeof songById>>; name: string; milestone: string }[];

  const starSize = isTablet ? 96 : 76;
  const pop = (i: number) => (still || shownStars >= i ? { opacity: 1, transform: [{ scale: shownStars === i && step === i ? 1.15 : 1 }] } : { opacity: 0.25, transform: [{ scale: 0.7 }] });

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }} testID="celebrate">
      {/* Confetti falls behind the content (never over the words or the button). */}
      <Confetti />
      <Screen edges={['top', 'bottom']} transparent>
        <View style={styles.col}>
          {isConcert ? (
            <View style={styles.trophy} testID="celebrate-trophy">
              <Icon name="trophy" size={isTablet ? 140 : 112} color={colors.gold} />
              <T v="h2">{t('celebration.trophy')}</T>
            </View>
          ) : null}
          <View style={styles.stars} accessible accessibilityLabel={t('celebration.classDoneStars', { name, count: stars })} testID="celebrate-stars">
            {[1, 2, 3].map((i) => (
              <View key={i} style={[i === 2 ? { marginTop: -18 } : undefined, i <= stars ? pop(i) : null]}>
                <Icon name={i <= stars ? 'star' : 'starOutline'} size={starSize} color={i <= stars ? colors.gold : colors.line} />
              </View>
            ))}
          </View>
          <Text style={styles.plus} testID="celebrate-plus">
            {t('celebration.plusStars', { count: counter })}
          </Text>
          <T v="hero" accessibilityRole="header" style={styles.center} testID="celebrate-title">
            {t('celebration.headline', { name })}
          </T>
          <T v="h3" style={[styles.center, { color: colors.body }]}>
            {t('celebration.parentHeadline')}
          </T>

          <View style={styles.row}>
            <View style={[styles.pill, { backgroundColor: colors.streakSoft }]} testID="celebrate-streak">
              <Icon name="flame" size={26} color={colors.streak} />
              <Text style={styles.pillText}>{t('celebration.streakUp', { count: streakNow })}</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: colors.goldSoft }]}>
              <Icon name="star" size={24} color={colors.goldEdge} />
              <Text style={styles.pillText}>{t('progress.level', { level: lvl.level })}</Text>
            </View>
          </View>
          <View style={{ gap: 4 }}>
            <ProgressBar value={lvl.inLevel / lvl.need} color={colors.gold} />
            <T v="small" style={styles.center}>
              {t('progress.levelStars', { inLevel: lvl.inLevel, need: lvl.need })}
            </T>
          </View>

          {newStickers.map((s) => (
            <View key={s.id} style={styles.sticker} testID="new-sticker">
              <SongCover song={s.song} kind="square" width={64} rounded={32} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.stickerKicker}>{t('celebration.stickerTitle')}</Text>
                <T v="h3">
                  {s.name}: {s.milestone}
                </T>
              </View>
            </View>
          ))}

          <Button
            testID="celebrate-continue"
            label={t('celebration.continue')}
            style={{ marginTop: space.lg }}
            onPress={() => (hit ? router.dismissTo(`/song/${hit.song.id}` as never) : router.replace('/' as never))}
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.md, paddingTop: space.xxl },
  trophy: { alignItems: 'center', gap: space.sm },
  stars: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm },
  plus: { fontFamily: fonts.extra, fontSize: 22, color: colors.ink, textAlign: 'center' },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.md, flexWrap: 'wrap', marginTop: space.sm },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: radius.md },
  pillText: { fontFamily: fonts.extra, fontSize: 17, color: colors.ink },
  sticker: { ...card, flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.md, borderColor: colors.gold },
  stickerKicker: { fontFamily: fonts.extra, fontSize: 13, color: colors.inkSoft, textTransform: 'uppercase', letterSpacing: 1 },
});
