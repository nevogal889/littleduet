import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SongArt } from '../../src/components/art/SongArt';
import { Icon } from '../../src/components/Icon';
import { Card, Screen, SectionTitle, T } from '../../src/components/ui';
import { LESSONS, SONGS } from '../../src/data/catalog';
import { useChildName } from '../../src/hooks';
import { t } from '../../src/i18n';
import { AGE_GROUPS } from '../../src/lib/catalog';
import { songProgress } from '../../src/lib/progress';
import { allStickers, badges, classesThisWeek, earnedStickerIds, levelUps, musicDaysThisWeek, weekStart, localDay } from '../../src/lib/stickers';
import { useApp } from '../../src/state/store';
import { colors, fonts, radius, space, useLayout } from '../../src/theme';

export default function Stickers() {
  const { childData } = useApp();
  const name = useChildName();
  const { contentWidth, isTablet } = useLayout();
  const progress = childData.progress;
  const now = Date.now();
  const earned = useMemo(() => new Set(earnedStickerIds(SONGS, LESSONS, progress)), [progress]);
  const all = useMemo(() => allStickers(SONGS, LESSONS), []);
  const finished = SONGS.filter((s) => songProgress(LESSONS[s.id], progress).finished).length;
  const weekClasses = classesThisWeek(progress, now);
  const days = musicDaysThisWeek(childData.activityDays, now);
  const grads = levelUps(SONGS, LESSONS, progress);
  const badgeList = badges(SONGS, LESSONS, progress, { activityDays: childData.activityDays, modesUsed: childData.modesUsed, stickerCount: earned.size });
  const ws = weekStart(now);
  const weekDays = Array.from({ length: 7 }, (_, i) => localDay(ws + i * 86400000 + 3600000 * 12));
  const played = new Set(childData.activityDays);
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const statW = isTablet ? (contentWidth - space.lg * 2) / 3 : (contentWidth - space.lg) / 2;
  const stickerCols = isTablet ? 6 : 3;
  const stickerW = Math.floor((contentWidth - space.md * (stickerCols - 1)) / stickerCols);

  return (
    <Screen testID="stickers">
      <T v="h1" accessibilityRole="header" style={{ paddingTop: space.lg }}>
        {t('stickers.title')}
      </T>
      <T v="small">{t('stickers.progress', { count: earned.size, total: all.length })}</T>

      {grads.map((g) => {
        const idx = AGE_GROUPS.findIndex((a) => a.id === g);
        const nextLabel = AGE_GROUPS[idx + 1]?.label;
        return (
          <Card key={g} style={styles.levelUp} testID={`levelup-${g}`}>
            <SongArt icon="crown" size={72} />
            <View style={{ flex: 1, gap: 4 }}>
              <T v="h2">{t('stickers.levelUpTitle', { ageLabel: t(`ageGroups.${g}.label`) })}</T>
              <T v="body">
                {nextLabel
                  ? t('stickers.levelUpBody', { name, nextLabel })
                  : t('stickers.levelUpTopBody', { name, ageLabel: t(`ageGroups.${g}.label`) })}
              </T>
            </View>
          </Card>
        );
      })}

      <View style={styles.stats}>
        <Card style={[styles.stat, { width: statW }]}>
          <Text style={styles.statNum}>{finished}</Text>
          <T v="bodyStrong">{t('stickers.songsFinished')}</T>
        </Card>
        <Card style={[styles.stat, { width: statW }]}>
          <Text style={styles.statNum}>{weekClasses}</Text>
          <T v="bodyStrong">{t('stickers.classesThisWeek')}</T>
        </Card>
        <Card style={[styles.stat, { width: isTablet ? statW : contentWidth }]} testID="music-days">
          <View style={styles.week} accessible accessibilityLabel={t('home.weekCount', { count: days })}>
            {weekDays.map((d, i) => (
              <View key={d} style={[styles.day, played.has(d) && styles.dayOn]}>
                <Text style={[styles.dayText, played.has(d) && { color: colors.ink }]}>{dayLetters[i]}</Text>
              </View>
            ))}
          </View>
          <T v="bodyStrong">{t('stickers.musicDays')}</T>
          <T v="small">{t('stickers.musicDaysHint')}</T>
        </Card>
      </View>

      <SectionTitle>{t('stickers.tabStickers')}</SectionTitle>
      {earned.size === 0 ? <T v="body">{t('empty.stickers', { name })}</T> : null}
      <View style={[styles.grid, { gap: space.md }]} testID="sticker-book">
        {all.map((s) => {
          const has = earned.has(s.id);
          const label = `${t(`stickers.names.${s.icon}`)}: ${t(`stickers.milestones.${s.milestone}`)}`;
          return (
            <View
              key={s.id}
              style={[styles.sticker, { width: stickerW }, has ? styles.stickerOn : styles.stickerOff]}
              accessible
              accessibilityLabel={has ? t('a11y.sticker', { stickerName: label }) : t('a11y.stickerLocked')}
            >
              <View style={[styles.stickerRing, has && { borderColor: s.milestone === 'concert' ? colors.marigold : s.milestone === 'half' ? colors.indigo : colors.coral }]}>
                <SongArt icon={s.icon} size={stickerW * 0.62} silhouette={has ? undefined : '#C5CED9'} />
              </View>
              {has ? (
                <Text style={styles.stickerText} numberOfLines={2}>
                  {t(`stickers.names.${s.icon}`)}
                </Text>
              ) : null}
              <Text style={[styles.stickerSub, !has && { color: colors.inkSoft }]} numberOfLines={1}>
                {t(`stickers.milestones.${s.milestone}`)}
              </Text>
            </View>
          );
        })}
      </View>

      <SectionTitle>{t('stickers.tabBadges')}</SectionTitle>
      {(['child', 'grownUp'] as const).map((group) => (
        <View key={group} style={{ gap: space.sm, marginBottom: space.lg }}>
          <T v="h3">{group === 'child' ? t('stickers.badgesForChild', { name }) : t('stickers.badgesForGrownUp')}</T>
          <View style={[styles.grid, { gap: space.md }]}>
            {badgeList
              .filter((b) => b.group === group)
              .map((b) => (
                <View key={b.id} style={[styles.badge, { width: isTablet ? (contentWidth - space.md * 2) / 3 : contentWidth }, !b.earned && styles.badgeOff]} testID={`badge-${b.id}`}>
                  <View style={[styles.badgeIcon, b.earned && { backgroundColor: colors.marigold }]}>
                    <Icon name={b.earned ? 'star' : 'starOutline'} size={30} color={b.earned ? colors.ink : colors.inkSoft} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T v="bodyStrong">{t(b.nameKey, b.params)}</T>
                    <T v="small">{b.earned ? t(b.descKey, b.params) : `${t('stickers.badgeLocked')}: ${t(b.descKey, b.params)}`}</T>
                  </View>
                </View>
              ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  levelUp: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginTop: space.lg, borderWidth: 3, borderColor: colors.marigold },
  stats: { gap: space.lg, marginTop: space.lg, flexDirection: 'row', flexWrap: 'wrap' },
  stat: { gap: 4 },
  statNum: { fontFamily: fonts.display, fontSize: 40, lineHeight: 46, color: colors.ink },
  week: { flexDirection: 'row', gap: 6, marginBottom: space.xs, flexWrap: 'wrap' },
  day: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.marigold, borderColor: colors.marigold },
  dayText: { fontFamily: fonts.bold, fontSize: 17, color: colors.inkSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  sticker: { alignItems: 'center', gap: space.xs, padding: space.sm, borderRadius: radius.lg },
  stickerOn: { backgroundColor: colors.marigoldSoft },
  stickerOff: { backgroundColor: 'rgba(255,255,255,0.5)' },
  stickerRing: { borderRadius: 999, borderWidth: 4, borderColor: 'transparent', padding: 4 },
  stickerText: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, color: colors.ink, textAlign: 'center' },
  stickerSub: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 22, color: colors.inkSoft, textAlign: 'center' },
  badge: { flexDirection: 'row', gap: space.md, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md },
  badgeOff: { backgroundColor: 'rgba(255,255,255,0.55)' },
  badgeIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center' },
});
