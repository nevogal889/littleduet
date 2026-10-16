import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { songStats } from '../lib/catalog';
import { t } from '../i18n';
import { colors, fonts, radius, shadow, space, type } from '../theme';
import type { ClassState } from '../lib/progress';
import type { LessonClass, Lesson, Song } from '../types';
import { DifficultyDots, LockBadge, Pill, ProgressRing, SongTile, Stars, Thumb } from './bits';
import { ProgressBar } from './ui';

export function songMeta(lesson: Lesson | undefined): string {
  const st = songStats(lesson);
  return t('song.stats', { classes: t('common.classes', { count: st.classes }), minutes: t('common.minutes', { count: st.minutes }) });
}

export function SongCard({
  song,
  lesson,
  width,
  progress,
  finished,
  onPress,
}: {
  song: Song;
  lesson?: Lesson;
  width: number;
  progress: number;
  finished: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`song-card-${song.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${song.title}. ${songMeta(lesson)}${finished ? `. ${t('songs.finished')}` : progress > 0 ? `. ${t('songs.inProgress')}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.songCard, { width }, pressed && styles.pressed]}
    >
      <View>
        <SongTile icon={song.icon} ageGroup={song.ageGroup} size={width - space.md * 2} />
        {finished || progress > 0 ? (
          <View style={styles.ringPos}>
            <ProgressRing value={progress} done={finished} />
          </View>
        ) : null}
      </View>
      <Text style={styles.songTitle} numberOfLines={2}>
        {song.title}
      </Text>
      <DifficultyDots level={song.difficulty} />
      <Text style={type.small} numberOfLines={2}>
        {songMeta(lesson)}
      </Text>
    </Pressable>
  );
}

/** "Continue watching" item: thumbnail with progress bar, song + class. */
export function ClassCard({
  song,
  cls,
  total,
  fraction,
  locked,
  width,
  onPress,
}: {
  song: Song;
  cls: LessonClass;
  total: number;
  fraction: number;
  locked: boolean;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      testID={`class-card-${cls.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${song.title}, ${t('home.continueClassOf', { index: cls.index, total })}${locked ? `, ${t('a11y.lockedClass', { index: cls.index })}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.classCard, { width: width + space.md * 2 }, pressed && styles.pressed]}
    >
      <Thumb thumb={cls.thumb} icon={song.icon} ageGroup={song.ageGroup} width={width}>
        {locked ? (
          <View style={styles.lockPos}>
            <LockBadge label={t('song.statusLocked')} />
          </View>
        ) : null}
      </Thumb>
      {fraction > 0 ? (
        <View style={{ marginTop: -8 }}>
          <ProgressBar value={fraction} height={8} />
        </View>
      ) : null}
      <View style={{ paddingTop: space.md, gap: 2 }}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {t('home.continueClassOf', { index: cls.index, total })}
        </Text>
      </View>
    </Pressable>
  );
}

export function ClassRow({
  song,
  cls,
  state,
  stars,
  fraction,
  locked,
  thumbWidth,
  onPress,
}: {
  song: Song;
  cls: LessonClass;
  state: ClassState;
  stars: number;
  fraction: number;
  locked: boolean;
  thumbWidth: number;
  onPress: () => void;
}) {
  const next = state === 'next_up';
  const a11y =
    state === 'done'
      ? t('a11y.completedClass', { index: cls.index, count: stars })
      : locked
        ? t('a11y.lockedClass', { index: cls.index })
        : cls.index === 1
          ? t('a11y.freeClass', { index: cls.index })
          : t('song.classLabel', { index: cls.index });
  return (
    <Pressable
      testID={`class-row-${cls.index}`}
      accessibilityRole="button"
      accessibilityLabel={`${a11y}. ${cls.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, next && styles.rowNext, pressed && styles.pressed]}
    >
      <Thumb thumb={cls.thumb} icon={song.icon} ageGroup={song.ageGroup} width={thumbWidth} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.classLabel}>{t('song.classLabel', { index: cls.index })}</Text>
          {next ? <Pill label={t('song.recommended')} /> : null}
          {cls.index === 1 && !locked && state !== 'done' ? <Pill label={t('song.statusFree')} tone="marigold" /> : null}
        </View>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {cls.title}
        </Text>
        <View style={styles.rowMeta}>
          <Text style={type.small}>{t('song.classMinutes', { count: Math.max(1, Math.round(cls.durationSec / 60)) })}</Text>
          {state === 'done' ? <Stars count={stars} size={20} /> : null}
          {locked ? (
            <View style={styles.lockInline}>
              <LockBadge label={t('song.statusLocked')} />
            </View>
          ) : null}
        </View>
        {state === 'in_progress' ? <ProgressBar value={fraction} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  songCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, gap: space.sm, ...shadow.card },
  ringPos: { position: 'absolute', top: 8, right: 8 },
  songTitle: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 24, color: colors.ink },
  classCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, ...shadow.card },
  lockPos: { position: 'absolute', top: 8, left: 8 },
  row: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.card,
  },
  rowNext: { borderColor: colors.coral },
  rowBody: { flex: 1, gap: 4, justifyContent: 'center' },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  classLabel: { fontFamily: fonts.bold, fontSize: 17, color: colors.inkSoft },
  rowTitle: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 24, color: colors.ink },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' },
  lockInline: {},
});
