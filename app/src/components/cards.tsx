import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { songStats } from '../lib/catalog';
import { t } from '../i18n';
import { card, colors, fonts, radius, space, type } from '../theme';
import type { ClassState } from '../lib/progress';
import type { LessonClass, Lesson, Song } from '../types';
import { DifficultyDots, DoneMark, LockBadge, Pill, SongCover, Thumb } from './bits';
import { PercentBar } from './ui';

export function songMeta(lesson: Lesson | undefined): string {
  const st = songStats(lesson);
  return t('song.stats', { classes: t('common.classes', { count: st.classes }), minutes: t('common.minutes', { count: st.minutes }) });
}

/** Squircle mask for covers on side-by-side cards (large radius on a square, overflow hidden). */
const SQUIRCLE = radius.squircle;

/**
 * Song card.
 * - layout "row" (phones, Home rows): squircle cover on the left, text on the right.
 * - layout "grid" (Songs grid, tablets): cover fills the top of the card, same top radius, no gap.
 */
export function SongCard({ song, lesson, width, percent, onPress, layout = 'grid' }: { song: Song; lesson?: Lesson; width: number; percent: number; onPress: () => void; layout?: 'row' | 'grid' }) {
  const a11y = `${song.title}. ${songMeta(lesson)}${percent >= 100 ? `. ${t('songs.finished')}` : percent > 0 ? `. ${t('song.percentDone', { count: percent })}` : ''}`;
  const body = (
    <>
      <Text style={styles.songTitle} numberOfLines={2}>
        {song.title}
      </Text>
      <DifficultyDots level={song.difficulty} />
      <Text style={type.meta} numberOfLines={2}>
        {songMeta(lesson)}
      </Text>
      {percent > 0 ? <PercentBar percent={percent} doneLabel={t('song.done')} testID={`song-pct-${song.id}`} height={10} /> : null}
    </>
  );
  if (layout === 'row') {
    const cover = 96;
    return (
      <Pressable testID={`song-card-${song.id}`} accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} style={({ pressed }) => [styles.rowCard, { width }, pressed && styles.pressed]}>
        <SongCover song={song} kind="square" width={cover} rounded={SQUIRCLE} />
        <View style={styles.rowBody}>{body}</View>
      </Pressable>
    );
  }
  return (
    <Pressable testID={`song-card-${song.id}`} accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} style={({ pressed }) => [styles.gridCard, { width }, pressed && styles.pressed]}>
      <SongCover song={song} kind="wide" width={width} rounded={0} />
      <View style={styles.gridBody}>{body}</View>
    </Pressable>
  );
}

/** "Continue watching" item: side-by-side, squircle cover + song, class and %. */
export function ClassCard({ song, cls, total, percent, locked, width, onPress }: { song: Song; cls: LessonClass; total: number; percent: number; locked: boolean; width: number; onPress: () => void }) {
  return (
    <Pressable
      testID={`class-card-${cls.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${song.title}, ${t('home.continueClassOf', { index: cls.index, total })}, ${percent}%${locked ? `, ${t('a11y.lockedClass', { index: cls.index })}` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [styles.rowCard, { width }, pressed && styles.pressed]}
    >
      <SongCover song={song} kind="square" width={88} rounded={SQUIRCLE}>
        {locked ? (
          <View style={styles.lockPos}>
            <LockBadge iconOnly label={t('song.statusLocked')} />
          </View>
        ) : null}
      </SongCover>
      <View style={styles.rowBody}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={type.meta} numberOfLines={1}>
          {t('home.continueClassOf', { index: cls.index, total })}
        </Text>
        <PercentBar percent={percent} testID={`class-pct-${cls.id}`} height={10} />
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
      <View style={styles.classBody}>
        <View style={styles.rowTop}>
          <Text style={type.meta}>
            {t('song.classLabel', { index: cls.index })} · {t('song.classMinutes', { count: Math.max(1, Math.round(cls.durationSec / 60)) })}
          </Text>
          {next ? <Pill tone="accent" label={t('song.recommended')} /> : null}
          {cls.index === 1 && !locked && state !== 'done' ? <Pill label={t('song.statusFree')} /> : null}
          {locked ? <Pill label={t('song.statusLocked')} /> : null}
        </View>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {cls.title}
        </Text>
        {state === 'done' ? <DoneMark stars={stars} /> : percent > 0 ? <PercentBar percent={percent} testID={`row-pct-${cls.index}`} height={10} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
  songTitle: { fontFamily: fonts.extra, fontSize: 17, lineHeight: 22, color: colors.ink },
  rowCard: { ...card, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  rowBody: { flex: 1, gap: 6 },
  gridCard: { ...card, overflow: 'hidden' },
  gridBody: { gap: 6, padding: space.md },
  lockPos: { position: 'absolute', top: 6, left: 6 },
  row: { ...card, flexDirection: 'row', gap: space.lg, padding: space.md, borderWidth: 2, borderColor: 'transparent' },
  rowNext: { borderColor: colors.brand },
  classBody: { flex: 1, gap: 6, justifyContent: 'center' },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rowTitle: { fontFamily: fonts.extra, fontSize: 17, lineHeight: 22, color: colors.ink },
});
