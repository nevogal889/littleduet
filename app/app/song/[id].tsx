import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DifficultyDots, SongCover } from '../../src/components/bits';
import { ClassRow, songMeta } from '../../src/components/cards';
import { LessonPath, type PathItem } from '../../src/components/LessonPath';
import { ClassBriefSheet, SkillMapCard } from '../../src/components/skills';
import { SongStoryCard } from '../../src/components/SongStory';
import { BackButton, Button, Card, PercentBar, Screen, SectionTitle, Segmented, T } from '../../src/components/ui';
import { LESSONS, songById } from '../../src/data/catalog';
import { useOpenClass } from '../../src/hooks';
import { t } from '../../src/i18n';
import { canPlayClass } from '../../src/lib/entitlement';
import { classPercent, classStates, continueRow, songPercent, songProgress } from '../../src/lib/progress';
import { useApp } from '../../src/state/store';
import { card, colors, space, type, useLayout } from '../../src/theme';

export default function SongPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { child, childData, entitlement, setPlayMode } = useApp();
  const openClass = useOpenClass();
  const { isTablet, isLandscape, contentWidth } = useLayout();
  const [asList, setAsList] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const song = songById(String(id));
  const lesson = song ? LESSONS[song.id] : undefined;

  // Screen readers get the plain list (the path is visual).
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled?.()
      .then((on) => on && setAsList(true))
      .catch(() => {});
  }, []);

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
  const wide = isTablet && isLandscape;
  const pct = songPercent(lesson, progress);
  const coverW = wide ? contentWidth * 0.42 : Math.min(contentWidth, 720);
  const pathW = wide ? contentWidth * 0.58 - space.xxl : Math.min(contentWidth, 520);

  const items: PathItem[] = lesson.classes.map((c) => ({
    cls: c,
    state: states[c.id],
    stars: progress[c.id]?.stars ?? 0,
    percent: classPercent(c, progress[c.id]),
    locked: !canPlayClass(c, entitlement),
    current: !sp.finished && c.id === target.id,
  }));

  const skillMap = <SkillMapCard summary={lesson.songSummary} map={lesson.skillMap} classes={lesson.classes} />;
  const briefCls = brief ? lesson.classes.find((c) => c.id === brief) : undefined;

  const info = (
    <View style={styles.info}>
      {/* Hero card: cover bound inside the card (full bleed on top), details below. */}
      <View style={styles.hero} testID="song-hero">
        <SongCover song={song} kind="wide" width={coverW} rounded={0} />
        <View style={styles.heroBody}>
          <T v="h1" accessibilityRole="header" testID="song-title">
            {song.title}
          </T>
          <Text style={type.meta}>{t('song.bestFor', { ageLabel: t(`ageGroups.${song.ageGroup}.label`), ages: t(`ageGroups.${song.ageGroup}.ages`) })}</Text>
          <View style={styles.metaRow}>
            <DifficultyDots level={song.difficulty} />
            <Text style={type.meta}>{songMeta(lesson)}</Text>
          </View>
          <PercentBar percent={pct} doneLabel={t('song.done')} testID="song-pct" />
        </View>
      </View>
      <SongStoryCard song={song} />
      <Segmented
        testID="song-mode"
        value={mode}
        onChange={setPlayMode}
        options={[
          { value: 'real', label: t('common.modes.real.name'), icon: 'piano' },
          { value: 'screen', label: t('common.modes.screen.name'), icon: 'screen' },
        ]}
      />
      {sp.finished ? (
        <Button testID="song-primary" icon="play" label={t('song.playAgain')} onPress={() => openClass(lesson.classes[lesson.classes.length - 1].id, mode)} />
      ) : null}
      {mode === 'real' && target.parentTip ? (
        <Card style={{ gap: 4, backgroundColor: colors.soft, boxShadow: 'none' }}>
          <T v="bodyStrong">{t('song.tipTitle')}</T>
          <T v="body">{target.parentTip}</T>
        </Card>
      ) : null}
      {wide ? skillMap : null}
    </View>
  );

  const classes = (
    <View style={{ gap: space.md }} testID="class-list">
      <SectionTitle
        action={
          <Button
            testID="toggle-list"
            variant="ghost"
            size="md"
            full={false}
            icon={asList ? 'songs' : 'list'}
            label={asList ? t('path.pathView') : t('path.listView')}
            onPress={() => setAsList((v) => !v)}
          />
        }
      >
        {t('common.classes', { count: lesson.classes.length })}
      </SectionTitle>
      {asList ? (
        lesson.classes.map((c) => (
          <ClassRow
            key={c.id}
            song={song}
            cls={c}
            state={states[c.id]}
            stars={progress[c.id]?.stars ?? 0}
            percent={classPercent(c, progress[c.id])}
            locked={!canPlayClass(c, entitlement)}
            thumbWidth={isTablet ? 200 : 120}
            onPress={() => setBrief(c.id)}
          />
        ))
      ) : (
        <LessonPath items={items} width={pathW} onOpen={(c) => setBrief(c.id)} />
      )}
      <T v="small">{t('song.concertNote')}</T>
      {!wide ? <View style={{ marginTop: space.md }}>{skillMap}</View> : null}
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
          <View style={{ flex: 1 }}>{classes}</View>
        </View>
      ) : (
        <>
          {info}
          {classes}
        </>
      )}
      <ClassBriefSheet
        cls={briefCls}
        visible={!!briefCls}
        percent={briefCls ? classPercent(briefCls, progress[briefCls.id]) : 0}
        locked={briefCls ? !canPlayClass(briefCls, entitlement) : false}
        onClose={() => setBrief(null)}
        onStart={() => {
          const id = brief;
          setBrief(null);
          if (id) openClass(id, mode);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  info: { gap: space.lg },
  hero: { ...card, overflow: 'hidden' },
  heroBody: { padding: space.lg, gap: space.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg, flexWrap: 'wrap' },
  wide: { flexDirection: 'row', gap: space.xxl, alignItems: 'flex-start' },
});
