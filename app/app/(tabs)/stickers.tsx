import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Modal, StyleSheet, Text, View } from 'react-native';
import { SongCover } from '../../src/components/bits';
import { Confetti } from '../../src/components/Confetti';
import { Icon, type IconName } from '../../src/components/Icon';
import { Button, Card, ProgressBar, Screen, SectionTitle, T } from '../../src/components/ui';
import { LESSONS, SONGS, songById } from '../../src/data/catalog';
import { useChildName } from '../../src/hooks';
import { t } from '../../src/i18n';
import { AGE_GROUPS, ageGroupForAge } from '../../src/lib/catalog';
import { songProgress } from '../../src/lib/progress';
import { chestId, chestSong, levelFor, weeklyQuests } from '../../src/lib/rewards';
import { allStickers, badges, earnedStickerIds, levelUps } from '../../src/lib/stickers';
import { useApp } from '../../src/state/store';
import { card, colors, fonts, radius, space, useLayout } from '../../src/theme';

const QUEST_ICON: Record<string, IconName> = { classes: 'play', song: 'songs', days: 'flame' };

export default function Progress() {
  const { childData, child, openChest } = useApp();
  const name = useChildName();
  const { contentWidth, isTablet } = useLayout();
  const progress = childData.progress;
  const now = Date.now();
  const totalStars = Object.values(progress).reduce((a, p) => a + p.stars, 0);
  const lvl = levelFor(totalStars);
  const q = weeklyQuests(SONGS, LESSONS, { progress, goalDays: childData.goalDays ?? [], completions: childData.completions }, now);
  const cid = chestId(now);
  const opened = (childData.chests ?? []).find((c) => c.id === cid);
  const [reveal, setReveal] = useState<string | null>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => setStill(!!v))
      .catch(() => {});
  }, []);

  const earned = useMemo(() => new Set(earnedStickerIds(SONGS, LESSONS, progress)), [progress]);
  const group = ageGroupForAge(child?.age ?? 3);
  // Started songs first, then the rest of the child's age group (100 songs x 3 tiles is too many to show).
  const bookSongs = useMemo(() => {
    const started = SONGS.filter((s) => songProgress(LESSONS[s.id], progress).started);
    const rest = SONGS.filter((s) => s.ageGroup === group && !started.includes(s));
    return [...started, ...rest];
  }, [progress, group]);
  const all = useMemo(() => allStickers(bookSongs, LESSONS), [bookSongs]);
  const grads = levelUps(SONGS, LESSONS, progress);
  const badgeList = badges(SONGS, LESSONS, progress, { activityDays: childData.activityDays, modesUsed: childData.modesUsed, stickerCount: earned.size, birthdays: childData.birthdays });
  const cols = isTablet ? 6 : 3;
  const tileW = Math.floor((contentWidth - space.md * (cols - 1)) / cols);
  const badgeCols = isTablet ? 4 : 3;
  const badgeW = Math.floor((contentWidth - space.md * (badgeCols - 1)) / badgeCols);
  const chestSongs = (childData.chests ?? []).map((c) => songById(c.songId)).filter(Boolean);

  const doOpen = () => {
    const sid = chestSong(SONGS, cid);
    if (!sid) return;
    openChest(cid, sid);
    setReveal(sid);
  };
  const revealSong = reveal ? songById(reveal) : undefined;

  return (
    <Screen testID="stickers">
      <T v="h1" accessibilityRole="header" style={{ paddingTop: space.xl }}>
        {t('progress.title')}
      </T>

      <Card style={styles.level} testID="level-card">
        <View style={styles.levelHead}>
          <View style={styles.levelBadge}>
            <Icon name="star" size={30} color={colors.white} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T v="h2">{t('progress.level', { level: lvl.level })}</T>
            <T v="label">{t('progress.levelStars', { inLevel: lvl.inLevel, need: lvl.need })}</T>
          </View>
        </View>
        <ProgressBar value={lvl.inLevel / lvl.need} color={colors.gold} />
        <T v="small">{t('progress.levelHint')}</T>
      </Card>

      {grads.map((g) => {
        const idx = AGE_GROUPS.findIndex((a) => a.id === g);
        const nextLabel = AGE_GROUPS[idx + 1]?.label;
        return (
          <Card key={g} style={styles.levelUp} testID={`levelup-${g}`}>
            <Icon name="trophy" size={44} color={colors.gold} />
            <View style={{ flex: 1, gap: 4 }}>
              <T v="h3">{t('stickers.levelUpTitle', { ageLabel: t(`ageGroups.${g}.label`) })}</T>
              <T v="body">{nextLabel ? t('stickers.levelUpBody', { name, nextLabel }) : t('stickers.levelUpTopBody', { name, ageLabel: t(`ageGroups.${g}.label`) })}</T>
            </View>
          </Card>
        );
      })}

      <SectionTitle>{t('quests.title')}</SectionTitle>
      <Card style={{ gap: space.lg }} testID="quests">
        {q.quests.map((x) => (
          <View key={x.id} style={styles.quest} testID={`quest-${x.id}`}>
            <View style={[styles.questIcon, x.done && { backgroundColor: colors.greenSoft }]}>
              <Icon name={x.done ? 'check' : QUEST_ICON[x.id]} size={24} color={x.done ? colors.green : colors.blue} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.questTop}>
                <Text style={styles.questTitle}>{t(`quests.${x.id}`)}</Text>
                <Text style={styles.questCount}>
                  {x.progress}/{x.target}
                </Text>
              </View>
              <ProgressBar value={x.progress / x.target} color={x.done ? colors.green : colors.brand} />
            </View>
          </View>
        ))}
        <View style={styles.chestRow} testID="chest">
          <Icon name="chest" size={44} color={q.allDone ? colors.goldEdge : colors.faint} />
          <View style={{ flex: 1 }}>
            <T v="bodyStrong">{opened ? t('quests.chestDone') : q.allDone ? t('quests.chestReady') : t('quests.chestLocked')}</T>
          </View>
        </View>
        {q.allDone && !opened ? <Button testID="chest-open" variant="gold" icon="chest" label={t('quests.chestOpen')} onPress={doOpen} /> : null}
      </Card>

      <SectionTitle>{t('stickers.book')}</SectionTitle>
      <T v="small" style={{ marginBottom: space.md }}>
        {t('stickers.progress', { count: earned.size, total: SONGS.length * 3 })}
      </T>
      {chestSongs.length ? (
        <View style={{ marginBottom: space.lg }}>
          <T v="label" style={{ marginBottom: space.sm }}>
            {t('stickers.chestStickers')}
          </T>
          <View style={[styles.grid, { gap: space.md }]}>
            {chestSongs.map((s) => (
              <View key={s!.id} style={[styles.sticker, { width: tileW }]}>
                <View style={[styles.ring, { borderColor: colors.gold }]}>
                  <SongCover song={s!} kind="square" width={tileW * 0.7} rounded={tileW} />
                </View>
                <Text style={styles.stickerName} numberOfLines={2}>
                  {s!.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      <View style={[styles.grid, { gap: space.md }]} testID="sticker-book">
        {all.map((s) => {
          const has = earned.has(s.id);
          const song = songById(s.songId)!;
          const label = `${t(`stickers.names.${s.icon}`)}: ${t(`stickers.milestones.${s.milestone}`)}`;
          return (
            <View key={s.id} style={[styles.sticker, { width: tileW }]} accessible accessibilityLabel={has ? t('a11y.sticker', { stickerName: label }) : t('a11y.stickerLocked')}>
              {has ? (
                <View style={[styles.ring, { borderColor: s.milestone === 'concert' ? colors.gold : s.milestone === 'half' ? colors.blue : colors.brand }]}>
                  <SongCover song={song} kind="square" width={tileW * 0.7} rounded={tileW} />
                </View>
              ) : (
                <View style={[styles.empty, { width: tileW * 0.7 + 12, height: tileW * 0.7 + 12 }]}>
                  <Icon name={s.milestone === 'concert' ? 'trophy' : 'star'} size={tileW * 0.28} color={colors.lineStrong} />
                </View>
              )}
              <Text style={[styles.stickerName, !has && { color: colors.inkSoft, fontFamily: fonts.bold }]} numberOfLines={2}>
                {has ? t(`stickers.names.${s.icon}`) : song.title}
              </Text>
              <Text style={styles.stickerSub}>{t(`stickers.milestones.${s.milestone}`)}</Text>
            </View>
          );
        })}
      </View>

      <SectionTitle>{t('stickers.tabBadges')}</SectionTitle>
      <View style={[styles.grid, { gap: space.md }]}>
        {badgeList.map((b) => (
          <View key={b.id} style={[styles.badge, { width: badgeW }, !b.earned && styles.badgeOff]} testID={`badge-${b.id}`} accessible accessibilityLabel={`${t(b.nameKey, b.params)}${b.earned ? '' : `, ${t('stickers.badgeLocked')}`}`}>
            <View style={[styles.badgeIcon, b.earned ? (b.group === 'child' ? styles.badgeGold : styles.badgeBlue) : styles.badgeIconOff]}>
              <Icon name={b.id.startsWith('grad') ? 'trophy' : b.group === 'child' ? 'star' : 'grownups'} size={28} color={b.earned ? colors.white : colors.faint} />
            </View>
            <Text style={[styles.badgeName, !b.earned && { color: colors.inkSoft }]} numberOfLines={2}>
              {t(b.nameKey, b.params)}
            </Text>
            <Text style={styles.badgeDesc} numberOfLines={3}>
              {t(b.descKey, b.params)}
            </Text>
          </View>
        ))}
      </View>

      <Modal visible={!!revealSong} transparent animationType={still ? 'none' : 'fade'} onRequestClose={() => setReveal(null)}>
        <View style={styles.scrim}>
          <View style={styles.revealCard} testID="chest-reveal">
            <Icon name="chest" size={56} color={colors.goldEdge} />
            {revealSong ? (
              <View style={[styles.ring, { borderColor: colors.gold, borderWidth: 6 }]}>
                <SongCover song={revealSong} kind="square" width={160} rounded={80} />
              </View>
            ) : null}
            <T v="h2" style={{ textAlign: 'center' }}>
              {t('quests.chestGot', { songTitle: revealSong?.title ?? '' })}
            </T>
            <Button testID="chest-close" label={t('celebration.continue')} onPress={() => setReveal(null)} />
          </View>
          {!still ? <Confetti /> : null}
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  level: { gap: space.md, marginTop: space.lg },
  levelHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  levelBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gold, borderBottomWidth: 4, borderColor: colors.goldEdge, alignItems: 'center', justifyContent: 'center' },
  levelUp: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginTop: space.lg },
  quest: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  questIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  questTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questTitle: { fontFamily: fonts.extra, fontSize: 17, color: colors.ink },
  questCount: { fontFamily: fonts.extra, fontSize: 15, color: colors.inkSoft },
  chestRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: colors.soft },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  sticker: { alignItems: 'center', gap: 4 },
  ring: { borderRadius: 999, borderWidth: 4, padding: 2 },
  empty: { borderRadius: 999, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  stickerName: { fontFamily: fonts.extra, fontSize: 14, lineHeight: 18, color: colors.ink, textAlign: 'center' },
  stickerSub: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  badge: { ...card, alignItems: 'center', gap: 6, padding: space.md },
  badgeOff: { backgroundColor: colors.white },
  badgeIcon: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4 },
  badgeGold: { backgroundColor: colors.gold, borderColor: colors.goldEdge },
  badgeBlue: { backgroundColor: colors.blue, borderColor: colors.blueEdge },
  badgeIconOff: { backgroundColor: colors.soft, borderBottomWidth: 0 },
  badgeName: { fontFamily: fonts.extra, fontSize: 14, lineHeight: 18, color: colors.ink, textAlign: 'center' },
  badgeDesc: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 17, color: colors.inkSoft, textAlign: 'center' },
  scrim: { flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center', padding: space.lg },
  revealCard: { ...card, width: '100%', maxWidth: 420, alignItems: 'center', gap: space.lg, padding: space.xl, borderRadius: radius.lg },
});
