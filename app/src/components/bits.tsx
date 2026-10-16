import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { difficultyWord } from '../lib/catalog';
import { t } from '../i18n';
import { mediaUrl } from '../services/media';
import { AGE_TINT, colors, fonts, radius, space } from '../theme';
import type { AgeGroupId } from '../types';
import { SongArt } from './art/SongArt';
import { Icon } from './Icon';

/** 1-5 filled dots plus the plain word (Easy / Medium / Harder). */
export function DifficultyDots({ level, showWord = true, light }: { level: number; showWord?: boolean; light?: boolean }) {
  const word = t(`difficultyWords.${difficultyWord(level)}`);
  return (
    <View style={styles.dotsRow} accessible accessibilityLabel={`${word}, ${t('difficulty.label', { count: level })}`}>
      <View style={styles.dots}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i <= level ? colors.indigo : 'transparent', borderColor: colors.indigo }]} />
        ))}
      </View>
      {showWord ? <Text style={[styles.dotWord, light && { color: colors.white }]}>{word}</Text> : null}
    </View>
  );
}

export function ProgressRing({ value, size = 40, done }: { value: number; size?: number; done?: boolean }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]} accessible accessibilityLabel={done ? t('songs.finished') : t('songs.inProgress')}>
      {done ? (
        <Icon name="star" size={size - 12} color={colors.marigold} />
      ) : (
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.line} strokeWidth={5} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.coral}
            strokeWidth={5}
            fill="none"
            strokeDasharray={`${c * Math.max(0.04, value)} ${c}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      )}
    </View>
  );
}

/** Earned stars only; never shows "0 stars". */
export function Stars({ count, size = 22, of = 3 }: { count: number; size?: number; of?: number }) {
  if (count <= 0) return null;
  return (
    <View style={styles.starsRow} accessible accessibilityLabel={t('common.stars', { count })}>
      {Array.from({ length: of }, (_, i) => (
        <Icon key={i} name={i < count ? 'star' : 'starOutline'} size={size} color={i < count ? colors.marigold : colors.lineStrong} />
      ))}
    </View>
  );
}

/** Lesson thumbnail (16:9); falls back to the song art on a tinted card when missing. */
export function Thumb({ thumb, icon, ageGroup, width, children }: { thumb?: string; icon: string; ageGroup: AgeGroupId; width: number; children?: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  const uri = mediaUrl(thumb);
  const h = Math.round((width * 9) / 16);
  return (
    <View style={[styles.thumb, { width, height: h, backgroundColor: AGE_TINT[ageGroup]?.bg ?? colors.indigoSoft }]}>
      {uri && !failed ? (
        <Image source={{ uri }} style={{ width, height: h }} resizeMode="cover" onError={() => setFailed(true)} accessibilityIgnoresInvertColors />
      ) : (
        <SongArt icon={icon} size={h * 0.8} />
      )}
      {children}
    </View>
  );
}

export function SongTile({ icon, ageGroup, size }: { icon: string; ageGroup: AgeGroupId; size: number }) {
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: AGE_TINT[ageGroup]?.bg ?? colors.indigoSoft }]}>
      <SongArt icon={icon} size={size * 0.78} />
    </View>
  );
}

export function LockBadge({ label }: { label: string }) {
  return (
    <View style={styles.lock}>
      <Icon name="lock" size={18} color={colors.white} />
      <Text style={styles.lockText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function Pill({ label, tone = 'coral' }: { label: string; tone?: 'coral' | 'indigo' | 'marigold' }) {
  const bg = tone === 'coral' ? colors.coralSoft : tone === 'indigo' ? colors.indigoSoft : colors.marigoldSoft;
  const fg = tone === 'coral' ? colors.coralInk : colors.ink;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
  dotWord: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  ring: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  starsRow: { flexDirection: 'row', gap: 2 },
  thumb: { borderRadius: radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  tile: { borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  lock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30,42,58,0.86)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  lockText: { fontFamily: fonts.bold, fontSize: 17, color: colors.white },
  pill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontFamily: fonts.bold, fontSize: 17 },
});
