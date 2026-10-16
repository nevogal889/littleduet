import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SongArt } from '../src/components/art/SongArt';
import { Confetti } from '../src/components/Confetti';
import { Icon } from '../src/components/Icon';
import { Button, Card, Screen, T } from '../src/components/ui';
import { classById, nextClassOf, songById } from '../src/data/catalog';
import { useChildName, useOpenClass } from '../src/hooks';
import { t, tPick } from '../src/i18n';
import { canPlayClass } from '../src/lib/entitlement';
import { useApp } from '../src/state/store';
import { colors, fonts, radius, space, useLayout } from '../src/theme';

export default function Celebrate() {
  const { classId, stars: starsParam, stickers } = useLocalSearchParams<{ classId: string; stars?: string; stickers?: string }>();
  const router = useRouter();
  const name = useChildName();
  const openClass = useOpenClass();
  const { entitlement, child } = useApp();
  const { isTablet } = useLayout();
  const hit = classById(String(classId));
  const stars = Math.max(1, Math.min(3, Number(starsParam) || 1));
  const next = hit ? nextClassOf(hit.cls.id) : undefined;
  const isConcert = hit?.cls.type === 'concert';
  const newStickers = String(stickers ?? '')
    .split(',')
    .filter(Boolean)
    .map((id) => {
      const [songId, milestone] = id.split(':');
      const s = songById(songId);
      return s ? { id, icon: s.icon, name: t(`stickers.names.${s.icon}`), milestone: t(`stickers.milestones.${milestone}`), song: s.title } : null;
    })
    .filter(Boolean) as { id: string; icon: string; name: string; milestone: string; song: string }[];
  const seed = (hit?.cls.index ?? 0) + stars;
  const starSize = isTablet ? 96 : 72;

  return (
    <View style={{ flex: 1, backgroundColor: colors.ground }} testID="celebrate">
      <Screen edges={['top', 'bottom']}>
        <View style={styles.col}>
          <View style={styles.chars} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <SongArt icon="bear" size={isTablet ? 120 : 88} />
            {hit ? <SongArt icon={hit.song.icon} size={isTablet ? 150 : 110} /> : null}
            <SongArt icon="bird" size={isTablet ? 120 : 88} />
          </View>
          <View style={styles.stars} accessible accessibilityLabel={t('celebration.classDoneStars', { name, count: stars })} testID="celebrate-stars">
            {[1, 2, 3].map((i) => (
              <View key={i} style={i === 2 ? { marginTop: -16 } : undefined}>
                <Icon name={i <= stars ? 'star' : 'starOutline'} size={starSize} color={i <= stars ? colors.marigold : colors.lineStrong} />
              </View>
            ))}
          </View>
          <T v="hero" accessibilityRole="header" style={styles.center} testID="celebrate-title">
            {isConcert ? t('celebration.concertTitle') : t('celebration.headline', { name })}
          </T>
          <T v="h3" style={styles.center}>
            {t('celebration.parentHeadline')}
          </T>
          <T v="body" style={styles.center}>
            {isConcert ? t('celebration.concertBow', { name }) : t('celebration.classDoneStars', { name, count: stars })}
          </T>
          <T v="small" style={styles.center}>
            {tPick('celebration.parentPraise', seed, { name })}
          </T>

          {newStickers.map((s) => (
            <Card key={s.id} style={styles.sticker} testID="new-sticker">
              <View style={styles.stickerArt}>
                <SongArt icon={s.icon} size={72} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.stickerKicker}>{t('celebration.stickerTitle')}</Text>
                <T v="h3">
                  {s.name}: {s.milestone}
                </T>
                <T v="small">{t('celebration.stickerBody', { stickerName: s.name })}</T>
              </View>
            </Card>
          ))}

          <View style={styles.actions}>
            {next ? (
              <Button
                testID="celebrate-next"
                icon={canPlayClass(next, entitlement) ? 'play' : 'lock'}
                label={canPlayClass(next, entitlement) ? t('celebration.nextClass') : t('celebration.unlockNext')}
                onPress={() => openClass(next.id, child?.playMode, { replace: true })}
              />
            ) : (
              <Button testID="celebrate-new-song" icon="songs" label={t('celebration.pickNewSong')} onPress={() => router.navigate('/songs' as never)} />
            )}
            {hit ? (
              <Button testID="celebrate-back" variant="secondary" label={t('celebration.backToSong')} onPress={() => router.dismissTo(`/song/${hit.song.id}` as never)} />
            ) : null}
          </View>
        </View>
      </Screen>
      <Confetti />
    </View>
  );
}

const styles = StyleSheet.create({
  col: { width: '100%', maxWidth: 620, alignSelf: 'center', gap: space.md, paddingTop: space.xl },
  chars: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: space.md },
  stars: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.sm },
  center: { textAlign: 'center' },
  sticker: { flexDirection: 'row', alignItems: 'center', gap: space.lg, borderWidth: 3, borderColor: colors.marigold },
  stickerArt: { backgroundColor: colors.marigoldSoft, borderRadius: radius.lg, padding: space.sm },
  stickerKicker: { fontFamily: fonts.bold, fontSize: 17, color: colors.coralInk, textTransform: 'uppercase', letterSpacing: 1 },
  actions: { gap: space.md, marginTop: space.lg },
});
