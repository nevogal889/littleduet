import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { coverSources, difficultyWord, type MediaManifest } from '../lib/catalog';
import mediaManifest from '../data/media.json';
import { t } from '../i18n';
import { mediaUrl } from '../services/media';
import { AGE_TINT, colors, fonts, radius, shadow, space, type } from '../theme';
import type { AgeGroupId, Song } from '../types';
import { SongArt } from './art/SongArt';
import { Icon } from './Icon';

/** 1-5 dots plus the plain word (Easy / Medium / Harder). */
export function DifficultyDots({ level, showWord = true }: { level: number; showWord?: boolean }) {
  const word = t(`difficultyWords.${difficultyWord(level)}`);
  return (
    <View style={styles.dotsRow} accessible accessibilityLabel={`${word}, ${t('difficulty.label', { count: level })}`}>
      <View style={styles.dots}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i <= level ? colors.blue : colors.line }]} />
        ))}
      </View>
      {showWord ? <Text style={type.meta}>{word}</Text> : null}
    </View>
  );
}

/** Earned stars only; never shows "0 stars". */
export function Stars({ count, size = 18, of = 3, color = colors.gold }: { count: number; size?: number; of?: number; color?: string }) {
  if (count <= 0) return null;
  return (
    <View style={styles.starsRow} accessible accessibilityLabel={t('common.stars', { count })}>
      {Array.from({ length: of }, (_, i) => (
        <Icon key={i} name={i < count ? 'star' : 'starOutline'} size={size} color={i < count ? color : colors.faint} />
      ))}
    </View>
  );
}

function Fallback({ icon, ageGroup, w, h }: { icon: string; ageGroup: AgeGroupId; w: number; h: number }) {
  return (
    <View style={[styles.fill, { width: w, height: h, backgroundColor: AGE_TINT[ageGroup]?.bg ?? colors.selectedSoft }]}>
      <SongArt icon={icon} size={Math.min(w, h) * 0.7} />
    </View>
  );
}

const MANIFEST = mediaManifest as MediaManifest;

/**
 * Song cover: the founder's real photo, else the lesson-style cover, else the icon art.
 * The single place covers are resolved, so the source can change without touching screens.
 * Photos are cropped with resizeMode cover (16:9 cards, square tiles).
 */
export function SongCover({ song, kind, width, height, children, rounded = radius.md }: { song: Song; kind: 'wide' | 'square'; width: number; height?: number; children?: React.ReactNode; rounded?: number }) {
  const sources = coverSources(song.id, kind, MANIFEST)
    .map((rel) => mediaUrl(rel))
    .filter((u): u is string => !!u);
  const [idx, setIdx] = useState(0);
  const uri = sources[idx];
  const h = height ?? (kind === 'wide' ? Math.round((width * 9) / 16) : width);
  return (
    <View style={[styles.cover, { width, height: h, borderRadius: rounded }]} testID={`cover-${song.id}`}>
      {uri ? (
        <Image source={{ uri }} style={{ width, height: h }} resizeMode="cover" onError={() => setIdx((i) => i + 1)} accessibilityIgnoresInvertColors />
      ) : (
        <Fallback icon={song.icon} ageGroup={song.ageGroup} w={width} h={h} />
      )}
      {children}
    </View>
  );
}

/** Lesson thumbnail (16:9) for class rows; falls back to the song cover art. */
export function Thumb({ thumb, icon, ageGroup, width, children }: { thumb?: string; icon: string; ageGroup: AgeGroupId; width: number; children?: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  const uri = mediaUrl(thumb);
  const h = Math.round((width * 9) / 16);
  return (
    <View style={[styles.cover, { width, height: h, borderRadius: radius.sm }]}>
      {uri && !failed ? (
        <Image source={{ uri }} style={{ width, height: h }} resizeMode="cover" onError={() => setFailed(true)} accessibilityIgnoresInvertColors />
      ) : (
        <Fallback icon={icon} ageGroup={ageGroup} w={width} h={h} />
      )}
      {children}
    </View>
  );
}

export function LockBadge({ label, iconOnly }: { label: string; iconOnly?: boolean }) {
  return (
    <View style={styles.lock} accessible accessibilityLabel={label}>
      <Icon name="lock" size={15} color={colors.inkSoft} />
      {iconOnly ? null : (
        <Text style={styles.lockText} numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
}

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' | 'dark' }) {
  const bg = tone === 'accent' ? colors.brandSoft : tone === 'dark' ? colors.blueSoft : colors.soft;
  const fg = colors.ink;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

/** Done + stars, or nothing. */
export function DoneMark({ stars }: { stars: number }) {
  return (
    <View style={styles.doneRow}>
      <Icon name="check" size={18} color={colors.green} />
      <Text style={styles.doneText}>{t('song.done')}</Text>
      <Stars count={stars} size={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotWord: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkSoft },
  starsRow: { flexDirection: 'row', gap: 2 },
  cover: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.soft },
  fill: { alignItems: 'center', justifyContent: 'center' },
  lock: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.white, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, ...shadow.cardStrong },
  lockText: { ...type.meta },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontFamily: fonts.extra, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  doneText: { fontFamily: fonts.extra, fontSize: 15, color: colors.ink },
});
