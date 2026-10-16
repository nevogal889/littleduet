import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LockBadge, Pill, Thumb } from '../../src/components/bits';
import { ClassCard, SongCard } from '../../src/components/cards';
import { SongArt } from '../../src/components/art/SongArt';
import { Button, Card, ProgressBar, Screen, SectionTitle, Segmented, T } from '../../src/components/ui';
import { LESSONS, SONGS, classById, songById } from '../../src/data/catalog';
import { useChildName, useOpenClass } from '../../src/hooks';
import { t } from '../../src/i18n';
import { easySongs, newThisWeek, pickedFor } from '../../src/lib/catalog';
import { canPlayClass } from '../../src/lib/entitlement';
import { heroItem, inProgressRow, songProgress } from '../../src/lib/progress';
import { musicDaysThisWeek } from '../../src/lib/stickers';
import { useApp } from '../../src/state/store';
import { colors, fonts, space, useLayout } from '../../src/theme';
import type { Song } from '../../src/types';

function greetingKey() {
  const h = new Date().getHours();
  return h < 12 ? 'home.greetingMorning' : h < 18 ? 'home.greetingAfternoon' : 'home.greetingEvening';
}

export default function Home() {
  const router = useRouter();
  const { child, childData, entitlement, setPlayMode } = useApp();
  const name = useChildName();
  const openClass = useOpenClass();
  const { contentWidth, isTablet } = useLayout();
  const progress = childData.progress;
  const age = child?.age ?? 3;

  const hero = heroItem(LESSONS, progress);
  const watching = inProgressRow(LESSONS, progress);
  const picked = useMemo(() => pickedFor(SONGS, LESSONS, progress, age), [progress, age]);
  const easy = useMemo(() => easySongs(SONGS, age), [age]);
  const fresh = useMemo(() => newThisWeek(SONGS, Date.now()), []);
  const days = musicDaysThisWeek(childData.activityDays, Date.now());
  const songW = isTablet ? 210 : 168;
  const classW = isTablet ? 300 : 240;
  const classThumbW = classW - space.md * 2;

  const songRow = (title: string, list: Song[], testID: string) =>
    list.length ? (
      <View testID={testID}>
        <SectionTitle>{title}</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {list.map((s) => {
            const sp = songProgress(LESSONS[s.id], progress);
            return (
              <SongCard
                key={s.id}
                song={s}
                lesson={LESSONS[s.id]}
                width={songW}
                progress={sp.fraction}
                finished={sp.finished}
                onPress={() => router.push(`/song/${s.id}` as never)}
              />
            );
          })}
        </ScrollView>
      </View>
    ) : null;

  const heroHit = hero ? classById(hero.classId) : undefined;
  const heroLocked = heroHit ? !canPlayClass(heroHit.cls, entitlement) : false;
  const heroThumbW = isTablet ? Math.min(520, contentWidth * 0.5) : contentWidth - space.lg * 2;
  const first = picked[0] ?? SONGS[0];

  return (
    <Screen testID="home">
      <View style={styles.header}>
        <T v="h1" accessibilityRole="header" style={{ flexShrink: 1 }}>
          {t(greetingKey(), { name })}
        </T>
        {days > 0 ? <Pill tone="marigold" label={t('home.weekCount', { count: days })} /> : null}
      </View>
      <View style={styles.mode}>
        <T v="small">{t('home.modeToggleLabel')}</T>
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

      {hero && heroHit ? (
        <Card style={[styles.hero, isTablet && styles.heroWide]} testID="continue-hero">
          <Thumb thumb={heroHit.cls.thumb} icon={heroHit.song.icon} ageGroup={heroHit.song.ageGroup} width={heroThumbW}>
            {heroLocked ? (
              <View style={styles.lockPos}>
                <LockBadge label={t('song.statusLocked')} />
              </View>
            ) : null}
          </Thumb>
          <View style={[styles.heroBody, isTablet && { flex: 1 }]}>
            <Text style={styles.kicker}>{hero.kind === 'next' ? t('home.continueUpNext') : t('home.continueTitle')}</Text>
            <T v="h2" numberOfLines={2} testID="hero-song">
              {heroHit.song.title}
            </T>
            <T v="bodyStrong" testID="hero-class">
              {t('home.continueClassOf', { index: heroHit.cls.index, total: heroHit.lesson.classes.length })}
            </T>
            <T v="small" numberOfLines={2}>
              {heroHit.cls.title}
            </T>
            {hero.fraction > 0 ? (
              <View style={{ gap: 4 }} testID="hero-progress">
                <ProgressBar value={hero.fraction} height={10} />
                <T v="small">{t('home.continueMinutesLeft', { minutes: Math.max(1, Math.ceil((heroHit.cls.durationSec - hero.positionSec) / 60)) })}</T>
              </View>
            ) : null}
            <Button testID="hero-continue" icon={heroLocked ? 'lock' : 'play'} label={t('common.continue')} onPress={() => openClass(hero.classId)} />
          </View>
        </Card>
      ) : first ? (
        <Card style={[styles.hero, isTablet && styles.heroWide]} testID="start-first">
          <View style={styles.firstArt}>
            <SongArt icon={first.icon} size={isTablet ? 200 : 150} />
          </View>
          <View style={[styles.heroBody, isTablet && { flex: 1 }]}>
            <T v="h1">{t('home.startFirstTitle')}</T>
            <T v="body">{t('home.startFirstBody', { songTitle: first.title })}</T>
            <Button testID="start-first-song" icon="play" label={t('home.startFirstCta')} onPress={() => router.push(`/song/${first.id}` as never)} />
          </View>
        </Card>
      ) : null}

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
                  fraction={it.fraction}
                  locked={!canPlayClass(hit.cls, entitlement)}
                  width={classThumbW}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, flexWrap: 'wrap', paddingTop: space.lg },
  mode: { gap: space.xs, marginTop: space.md, marginBottom: space.lg, maxWidth: 520 },
  hero: { gap: space.lg },
  heroWide: { flexDirection: 'row', alignItems: 'center' },
  heroBody: { gap: space.sm },
  kicker: { fontFamily: fonts.bold, fontSize: 17, color: colors.coralInk, textTransform: 'uppercase', letterSpacing: 1 },
  lockPos: { position: 'absolute', top: 10, left: 10 },
  row: { gap: space.lg, paddingBottom: space.md, paddingRight: space.lg },
  firstArt: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.marigoldSoft, borderRadius: 24, padding: space.lg },
});
