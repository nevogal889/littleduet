import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DifficultyDots, SongTile } from '../../src/components/bits';
import { ClassRow, songMeta } from '../../src/components/cards';
import { BackButton, Button, Card, Screen, SectionTitle, Segmented, T } from '../../src/components/ui';
import { LESSONS, songById } from '../../src/data/catalog';
import { useOpenClass } from '../../src/hooks';
import { t } from '../../src/i18n';
import { canPlayClass } from '../../src/lib/entitlement';
import { classStates, continueRow, songProgress } from '../../src/lib/progress';
import { useApp } from '../../src/state/store';
import { space, useLayout } from '../../src/theme';

export default function SongPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { child, childData, entitlement, setPlayMode } = useApp();
  const openClass = useOpenClass();
  const { isTablet, isLandscape, contentWidth } = useLayout();
  const song = songById(String(id));
  const lesson = song ? LESSONS[song.id] : undefined;

  if (!song || !lesson) {
    return (
      <Screen>
        <BackButton onPress={() => router.back()} label={t('common.back')} />
        <T v="h2">{t('errors.genericTitle')}</T>
      </Screen>
    );
  }

  const progress = childData.progress;
  const sp = songProgress(lesson, progress);
  const states = classStates(lesson, progress);
  const mode = child?.playMode ?? 'real';
  const item = continueRow({ [song.id]: lesson }, progress)[0];
  const target = (item && lesson.classes.find((c) => c.id === item.classId)) || sp.nextClass || lesson.classes[0];
  const primaryLabel = sp.finished
    ? t('song.playAgain')
    : !sp.started
      ? t('song.start')
      : t('song.continue', { index: target.index });
  const wide = isTablet && isLandscape;
  const thumbW = isTablet ? 200 : 128;

  const info = (
    <View style={styles.info}>
      <View style={styles.artRow}>
        <SongTile icon={song.icon} ageGroup={song.ageGroup} size={wide ? 220 : isTablet ? 180 : 132} />
        <View style={styles.titleCol}>
          <T v="h1" accessibilityRole="header" testID="song-title">
            {song.title}
          </T>
          <T v="bodyStrong">{t('song.bestFor', { ageLabel: t(`ageGroups.${song.ageGroup}.label`), ages: t(`ageGroups.${song.ageGroup}.ages`) })}</T>
        </View>
      </View>
      <DifficultyDots level={song.difficulty} />
      <T v="body">{songMeta(lesson)}</T>
      <T v="small">{t(`ageGroups.${song.ageGroup}.short`)}</T>
      <Segmented
        testID="song-mode"
        value={mode}
        onChange={setPlayMode}
        options={[
          { value: 'real', label: t('common.modes.real.name'), icon: 'piano' },
          { value: 'screen', label: t('common.modes.screen.name'), icon: 'screen' },
        ]}
      />
      <T v="small">{t(`common.modes.${mode}.short`)}</T>
      <Button
        testID="song-primary"
        icon={canPlayClass(target, entitlement) ? 'play' : 'lock'}
        label={primaryLabel}
        onPress={() => openClass((sp.finished ? lesson.classes[lesson.classes.length - 1] : target).id, mode)}
      />
      {target.parentTip ? (
        <Card style={{ gap: 4 }}>
          <T v="bodyStrong">{t('song.tipTitle')}</T>
          <T v="body">{target.parentTip}</T>
        </Card>
      ) : null}
    </View>
  );

  const list = (
    <View style={{ gap: space.md }} testID="class-list">
      <SectionTitle>{t('common.classes', { count: lesson.classes.length })}</SectionTitle>
      {lesson.classes.map((c) => (
        <ClassRow
          key={c.id}
          song={song}
          cls={c}
          state={states[c.id]}
          stars={progress[c.id]?.stars ?? 0}
          fraction={(progress[c.id]?.positionSec ?? 0) / c.durationSec}
          locked={!canPlayClass(c, entitlement)}
          thumbWidth={thumbW}
          onPress={() => openClass(c.id, mode)}
        />
      ))}
      <T v="small">{t('song.concertNote')}</T>
      {song.origin ? (
        <Card style={{ gap: 4, marginTop: space.md }}>
          <T v="bodyStrong">{t('song.aboutTitle')}</T>
          <T v="small">{song.origin}</T>
          <T v="small">{t('song.aboutPublicDomain')}</T>
        </Card>
      ) : null}
    </View>
  );

  return (
    <Screen testID="song-page">
      <View style={{ paddingTop: space.sm }}>
        <BackButton onPress={() => (router.canGoBack() ? router.back() : router.replace('/songs' as never))} label={t('common.back')} />
      </View>
      {wide ? (
        <View style={styles.wide}>
          <View style={{ width: contentWidth * 0.42 }}>{info}</View>
          <View style={{ flex: 1 }}>{list}</View>
        </View>
      ) : (
        <>
          {info}
          {list}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { gap: space.md },
  artRow: { flexDirection: 'row', gap: space.lg, alignItems: 'center', flexWrap: 'wrap' },
  titleCol: { flex: 1, minWidth: 180, gap: space.xs },
  wide: { flexDirection: 'row', gap: space.xxl, alignItems: 'flex-start' },
});
