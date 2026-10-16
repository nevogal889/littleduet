import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { songStats } from '../lib/catalog';
import { t } from '../i18n';
import { card, colors, fonts, space, type } from '../theme';
import type { ClassState } from '../lib/progress';
import type { LessonClass, Lesson, Song } from '../types';
import { DifficultyDots, DoneMark, LockBadge, Pill, SongCover, Thumb } from './bits';
import { PercentBar } from './ui';

export function songMeta(lesson: Lesson | undefined): string {
  const st = songStats(lesson);
  return t('song.stats', { classes: t('common.classes', { count: st.classes }), minutes: t('common.minutes', { count: st.minutes }) });
}

export function SongCard({ song, lesson, width, percent, onPress }: { song: Song; lesson?: Lesson; width: number; percent: number; onPress: () => void }) {
  const inner = width - space.md * 2;
  return (
    <Pressable
      testID={`song-card-${song.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${song.title}. ${songMeta(lesson)}${percent >= 100 ? `. ${t('songs.finished')}` : percent > 0 ? `. ${t('song.percentDone', { count: percent })}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.songCard, { width }, pressed && styles.pressed]}
    >
      <SongCover song={song} kind="square" width={inner} />
      <View style={styles.songBody}>
        <Text style={styles.songTitle} numberOfLines={2}>
          {song.title}
        </Text>
        <DifficultyDots level={song.difficulty} />
        <Text style={type.small} numberOfLines={2}>
          {songMeta(lesson)}
        </Text>
        {percent > 0 ? <PercentBar percent={percent} doneLabel={t('song.done')} testID={`song-pct-${song.id}`} /> : null}
      </View>
    </Pressable>
  );
}

/** "Continue watching" item: song cover with %, song + class. */
export function ClassCard({ song, cls, total, percent, locked, width, onPress }: { song: Song; cls: LessonClass; total: number; percent: number; locked: boolean; width: number; onPress: () => void }) {
  const inner = width - space.md * 2;
  return (
    <Pressable
      testID={`class-card-${cls.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${song.title}, ${t('home.continueClassOf', { index: cls.index, total })}, ${percent}%${locked ? `, ${t('a11y.lockedClass', { index: cls.index })}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.classCard, { width }, pressed && styles.pressed]}
    >
      <SongCover song={song} kind="wide" width={inner}>
        {locked ? (
          <View style={styles.lockPos}>
            <LockBadge label={t('song.statusLocked')} />
          </View>
        ) : null}
      </SongCover>
      <View style={{ paddingTop: space.md, gap: 4 }}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={type.small} numberOfLines={1}>
          {t('home.continueClassOf', { index: cls.index, total })}
        </Text>
        <PercentBar percent={percent} testID={`class-pct-${cls.id}`} />
      </View>
    </Pressable>
  );
}

export function ClassRow({
  song,
  cls,
  state,
  stars,
  percent,
  locked,
  thumbWidth,
  onPress,
}: {
  song: Song;
  cls: LessonClass;
  state: ClassState;
  stars: number;
  percent: number;
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
      accessibilityLabel={`${a11y}. ${cls.title}${state !== 'done' && percent > 0 ? `. ${percent}%` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, next && styles.rowNext, pressed && styles.pressed]}
    >
      <Thumb thumb={cls.thumb} icon={song.icon} ageGroup={song.ageGroup} width={thumbWidth}>
        {locked ? (
          <View style={styles.lockPos}>
            <LockBadge iconOnly label={t('song.statusLocked')} />
          </View>
        ) : null}
      </Thumb>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.classLabel}>{t('song.classLabel', { index: cls.index })}</Text>
          <Text style={styles.classLabel}>·</Text>
          <Text style={styles.classLabel}>{t('song.classMinutes', { count: Math.max(1, Math.round(cls.durationSec / 60)) })}</Text>
          {next ? <Pill tone="dark" label={t('song.recommended')} /> : null}
          {cls.index === 1 && !locked && state !== 'done' ? <Pill label={t('song.statusFree')} /> : null}
          {locked ? <Pill label={t('song.statusLocked')} /> : null}
        </View>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {cls.title}
        </Text>
        {state === 'done' ? <DoneMark stars={stars} /> : percent > 0 ? <PercentBar percent={percent} testID={`row-pct-${cls.index}`} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { backgroundColor: colors.soft },
  songCard: { ...card, padding: space.md, gap: space.md },
  songBody: { gap: 6, paddingHorizontal: 2, paddingBottom: 2 },
  songTitle: { fontFamily: fonts.extra, fontSize: 17, lineHeight: 22, color: colors.ink },
  classCard: { ...card, padding: space.md },
  lockPos: { position: 'absolute', top: 8, left: 8 },
  row: { ...card, flexDirection: 'row', gap: space.lg, padding: space.md },
  rowNext: { borderColor: colors.brand },
  rowBody: { flex: 1, gap: 6, justifyContent: 'center' },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  classLabel: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkSoft },
  rowTitle: { fontFamily: fonts.extra, fontSize: 17, lineHeight: 22, color: colors.ink },
});
