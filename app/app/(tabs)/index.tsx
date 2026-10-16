import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LockBadge, SongCover } from '../../src/components/bits';
import { ClassCard, SongCard } from '../../src/components/cards';
import { Icon, type IconName } from '../../src/components/Icon';
import { StreakSheet } from '../../src/components/StreakSheet';
import { Button, Card, PercentBar, Screen, SectionTitle, Segmented, T } from '../../src/components/ui';
import { LESSONS, SONGS, classById, songById } from '../../src/data/catalog';
import { useChildName, useOpenClass } from '../../src/hooks';
import { t } from '../../src/i18n';
import { easySongs, newThisWeek, pickedFor } from '../../src/lib/catalog';
import { canPlayClass } from '../../src/lib/entitlement';
import { classPercent, heroItem, inProgressRow, songPercent } from '../../src/lib/progress';
import { homeStats } from '../../src/lib/stickers';
import { streak as computeStreak } from '../../src/lib/streak';
import { useApp } from '../../src/state/store';
import { card, colors, fonts, radius, space, useLayout } from '../../src/theme';
import type { Song } from '../../src/types';

function greetingKey() {
  const h = new Date().getHours();
  return h < 12 ? 'home.greetingMorning' : h < 18 ? 'home.greetingAfternoon' : 'home.greetingEvening';
}

/** Child-readable stat: big icon, big number, tiny label. */
function StatTile({ icon, tint, value, label, testID, onPress }: { icon: IconName; tint: string; value: number; label: string; testID: string; onPress?: () => void }) {
  const body = (
    <>
      <View style={styles.statTop}>
        <Icon name={icon} size={32} color={tint} />
        <Text style={styles.statNum}>{value}</Text>
      </View>
      <Text style={styles.statLabel} numberOfLines={2}>
        {label}
      </Text>
    </>
  );
  if (onPress) {
    return (
      <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress} style={({ pressed }) => [styles.stat, pressed && { backgroundColor: colors.soft }]}>
        {body}
      </Pressable>
    );
  }
  return (
    <View testID={testID} style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      {body}
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const { child, childData, entitlement, setPlayMode } = useApp();
  const name = useChildName();
  const openClass = useOpenClass();
  const { contentWidth, isTablet } = useLayout();
  const [sheet, setSheet] = useState(false);
  const progress = childData.progress;
  const age = child?.age ?? 3;

  const hero = heroItem(LESSONS, progress);
  const watching = inProgressRow(LESSONS, progress);
  const picked = useMemo(() => pickedFor(SONGS, LESSONS, progress, age).slice(0, 12), [progress, age]);
  const easy = useMemo(() => easySongs(SONGS, age).slice(0, 12), [age]);
  const fresh = useMemo(() => newThisWeek(SONGS, Date.now()), []);
  const stats = homeStats(SONGS, LESSONS, childData, Date.now());
  const st = computeStreak(childData.goalDays ?? [], Date.now());
  const songW = isTablet ? 220 : 172;
  const classW = isTablet ? 320 : 260;

  const songRow = (title: string, list: Song[], testID: string) =>
    list.length ? (
      <View testID={testID}>
        <SectionTitle>{title}</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {list.map((s) => (
            <SongCard key={s.id} song={s} lesson={LESSONS[s.id]} width={songW} percent={songPercent(LESSONS[s.id], progress)} onPress={() => router.push(`/song/${s.id}` as never)} />
          ))}
        </ScrollView>
      </View>
    ) : null;

  const heroHit = hero ? classById(hero.classId) : undefined;
  const heroLocked = heroHit ? !canPlayClass(heroHit.cls, entitlement) : false;
  const heroCoverW = isTablet ? Math.min(460, contentWidth * 0.45) : contentWidth - space.lg * 2 - 4;
  const first = picked[0] ?? SONGS[0];

  return (
    <Screen testID="home">
      <View style={styles.header}>
        <T v="h1" accessibilityRole="header">
          {t(greetingKey(), { name })}
        </T>
      </View>

      <View style={styles.stats} testID="home-stats">
        <StatTile testID="stat-streak" icon="flame" tint={st.days ? colors.streak : colors.faint} value={st.days} label={t('home.stats.streak')} onPress={() => setSheet(true)} />
        <StatTile testID="stat-stars" icon="star" tint={colors.gold} value={stats.stars} label={t('home.stats.stars')} />
        <StatTile testID="stat-songs" icon="songs" tint={colors.blue} value={stats.songsLearned} label={t('home.stats.songs')} />
      </View>

      <View style={[styles.goal, st.welcomeBack && styles.goalWelcome]} testID="daily-goal" accessible>
        <Icon name={st.playedToday ? 'check' : 'flame'} size={22} color={st.playedToday ? colors.green : colors.streak} />
        <View style={{ flex: 1 }}>
          {st.welcomeBack ? <Text style={styles.goalTitle}>{t('streak.welcomeBack')}</Text> : null}
          <Text style={styles.goalText}>{st.playedToday ? t('streak.goalDone') : st.welcomeBack ? t('streak.welcomeBackBody') : t('streak.goal')}</Text>
        </View>
      </View>

      {hero && heroHit ? (
        <Card style={[styles.hero, isTablet && styles.heroWide]} testID="continue-hero">
          <SongCover song={heroHit.song} kind="wide" width={heroCoverW} rounded={12}>
            {heroLocked ? (
              <View style={styles.lockPos}>
                <LockBadge label={t('song.statusLocked')} />
              </View>
            ) : null}
          </SongCover>
          <View style={[styles.heroBody, isTablet && { flex: 1 }]}>
            <Text style={styles.kicker}>{hero.kind === 'next' ? t('home.continueUpNext') : t('home.continueTitle')}</Text>
            <T v="h2" numberOfLines={2} testID="hero-song">
              {heroHit.song.title}
            </T>
            <T v="label" testID="hero-class">
              {t('home.continueClassOf', { index: heroHit.cls.index, total: heroHit.lesson.classes.length })}
            </T>
            <T v="bodyStrong" numberOfLines={2}>
              {heroHit.cls.title}
            </T>
            <View testID={hero.fraction > 0 ? 'hero-progress' : undefined}>
              <PercentBar percent={classPercent(heroHit.cls, progress[heroHit.cls.id])} testID="hero-pct" />
            </View>
            <Button testID="hero-continue" icon={heroLocked ? 'lock' : 'play'} label={t('common.continue')} onPress={() => openClass(hero.classId)} style={{ marginTop: space.sm }} />
          </View>
        </Card>
      ) : first ? (
        <Card style={[styles.hero, isTablet && styles.heroWide]} testID="start-first">
          <SongCover song={first} kind="wide" width={heroCoverW} rounded={12} />
          <View style={[styles.heroBody, isTablet && { flex: 1 }]}>
            <T v="h2">{t('home.startFirstTitle')}</T>
            <T v="body">{t('home.startFirstBody', { songTitle: first.title })}</T>
            <Button testID="start-first-song" icon="play" label={t('home.startFirstCta')} onPress={() => router.push(`/song/${first.id}` as never)} style={{ marginTop: space.sm }} />
          </View>
        </Card>
      ) : null}

      <View style={styles.mode}>
        <T v="label">{t('home.modeToggleLabel')}</T>
        <Segmented
          testID="home-mode"
          value={child?.playMode ?? 'real'}
          onChange={setPlayMode}
          options={[
            { value: 'real', label: t('common.modes.real.name'), icon: 'piano' },
            { value: 'screen', label: t('common.modes.screen.name'), icon: 'screen' },
          ]}
        />
      </View>

      {watching.length ? (
        <View testID="row-continue">
          <SectionTitle>{t('home.continueWatching')}</SectionTitle>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {watching.map((it) => {
              const hit = classById(it.classId)!;
              return (
                <ClassCard
                  key={it.classId}
                  song={songById(it.songId)!}
                  cls={hit.cls}
                  total={hit.lesson.classes.length}
                  percent={classPercent(hit.cls, progress[hit.cls.id])}
                  locked={!canPlayClass(hit.cls, entitlement)}
                  width={classW}
                  onPress={() => openClass(it.classId)}
                />
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {songRow(t('home.pickedFor', { name, age }), picked, 'row-picked')}
      {songRow(t('home.easyTitle'), easy, 'row-easy')}
      {songRow(t('home.newThisWeek'), fresh, 'row-new')}

      <View style={{ marginTop: space.xxl }}>
        <Button testID="see-all" variant="secondary" icon="songs" label={t('home.seeAll')} onPress={() => router.navigate('/songs' as never)} />
      </View>
      <StreakSheet visible={sheet} streak={st} onClose={() => setSheet(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: space.xl },
  stats: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  stat: { ...card, flex: 1, borderBottomWidth: 4, paddingVertical: space.md, paddingHorizontal: space.sm, gap: 4, alignItems: 'center', justifyContent: 'center' },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statNum: { fontFamily: fonts.extra, fontSize: 30, lineHeight: 36, color: colors.ink },
  statLabel: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, color: colors.inkSoft, textAlign: 'center' },
  goal: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md, marginBottom: space.xl, paddingVertical: space.md, paddingHorizontal: space.lg, borderRadius: radius.md, backgroundColor: colors.streakSoft },
  goalWelcome: { backgroundColor: colors.blueSoft },
  goalTitle: { fontFamily: fonts.extra, fontSize: 17, color: colors.ink },
  goalText: { fontFamily: fonts.bold, fontSize: 15, color: colors.body },
  mode: { gap: space.sm, marginTop: space.xl, maxWidth: 520 },
  hero: { gap: space.lg },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: space.xl },
  heroBody: { gap: 6 },
  kicker: { fontFamily: fonts.extra, fontSize: 13, color: colors.inkSoft, textTransform: 'uppercase', letterSpacing: 1 },
  lockPos: { position: 'absolute', top: 10, left: 10 },
  row: { gap: space.md, paddingBottom: space.lg, paddingRight: space.lg },
});
