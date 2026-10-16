import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';
import type { ClassState } from '../lib/progress';
import { colors, fonts, radius, space } from '../theme';
import type { LessonClass } from '../types';
import { Stars } from './bits';
import { Icon } from './Icon';

const NODE = 76;
const EDGE_H = 6;
/** Winding pattern (fraction of the amplitude), repeats every 8 nodes. */
const WAVE = [0, 0.5, 0.8, 0.5, 0, -0.5, -0.8, -0.5];

export interface PathItem {
  cls: LessonClass;
  state: ClassState;
  stars: number;
  percent: number;
  locked: boolean;
  current: boolean;
}

function nodeColors(it: PathItem) {
  if (it.state === 'done') return { face: colors.gold, edge: colors.goldEdge, icon: colors.white };
  if (it.current) return { face: colors.brand, edge: colors.brandEdge, icon: colors.white };
  return { face: colors.locked, edge: colors.lineStrong, icon: colors.faint };
}

/**
 * Lesson path: big round nodes on a winding line. Every class stays open (tap any node);
 * subscription-locked classes show a small lock and go through the gate + paywall.
 */
export function LessonPath({ items, width, onOpen }: { items: PathItem[]; width: number; onOpen: (cls: LessonClass) => void }) {
  const amp = Math.min(90, (width - NODE) / 2 - 24);
  return (
    <View style={[styles.wrap, { width }]} testID="lesson-path">
      {items.map((it, i) => {
        const c = nodeColors(it);
        const x = WAVE[i % WAVE.length] * amp;
        const mins = Math.max(1, Math.round(it.cls.durationSec / 60));
        const status =
          it.state === 'done'
            ? `${t('song.done')}, ${t('common.stars', { count: it.stars })}`
            : it.locked
              ? t('song.statusLocked')
              : it.percent > 0
                ? `${it.percent}%`
                : '';
        const label = `${t('path.classNode', { index: it.cls.index, title: it.cls.title })}. ${status}`;
        return (
          <View key={it.cls.id} style={[styles.slot, { transform: [{ translateX: x }] }]}>
            {it.current ? (
              <Pressable testID="song-primary" accessibilityRole="button" accessibilityLabel={`${it.percent > 0 ? t('path.continue') : t('path.start')}: ${label}`} onPress={() => onOpen(it.cls)} style={styles.bubble}>
                <Text style={styles.bubbleCta}>{it.percent > 0 ? t('path.continue') : t('path.start')}</Text>
                <Text style={styles.bubbleMeta}>
                  {it.percent}% · {t('path.minutes', { count: mins })}
                </Text>
                <View style={styles.bubbleTail} />
              </Pressable>
            ) : null}
            <Pressable testID={`class-node-${it.cls.index}`} accessibilityRole="button" accessibilityLabel={label} onPress={() => onOpen(it.cls)} style={styles.nodeHit}>
              {({ pressed }) => (
                <View style={{ width: NODE, height: NODE + EDGE_H }}>
                  <View style={[styles.circle, styles.edge, { backgroundColor: c.edge, top: EDGE_H }]} />
                  <View style={[styles.circle, { backgroundColor: c.face, transform: [{ translateY: pressed ? EDGE_H : 0 }] }]}>
                    <Icon name={it.state === 'done' ? 'star' : it.current ? 'play' : 'songs'} size={34} color={c.icon} />
                  </View>
                  {it.locked ? (
                    <View style={styles.lock}>
                      <Icon name="lock" size={14} color={colors.inkSoft} />
                    </View>
                  ) : null}
                </View>
              )}
            </Pressable>
            <Text style={styles.nodeLabel} numberOfLines={1}>
              {t('song.classLabel', { index: it.cls.index })}
            </Text>
            <Text style={styles.nodeTitle} numberOfLines={2}>
              {it.cls.title}
            </Text>
            {it.state === 'done' ? <Stars count={it.stars} size={16} /> : it.percent > 0 && !it.current ? <Text style={styles.nodeLabel}>{it.percent}%</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: space.lg, paddingVertical: space.lg, alignSelf: 'center' },
  slot: { alignItems: 'center', width: 180, gap: 4 },
  nodeHit: { borderRadius: NODE / 2 },
  circle: { position: 'absolute', left: 0, top: 0, width: NODE, height: NODE, borderRadius: NODE / 2, alignItems: 'center', justifyContent: 'center' },
  edge: {},
  lock: { position: 'absolute', right: -4, top: -2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  nodeLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  nodeTitle: { fontFamily: fonts.extra, fontSize: 15, lineHeight: 19, color: colors.ink, textAlign: 'center' },
  bubble: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4, borderRadius: radius.md, paddingHorizontal: space.lg, paddingVertical: space.sm, alignItems: 'center', marginBottom: 6, minHeight: 56, justifyContent: 'center' },
  bubbleCta: { fontFamily: fonts.extra, fontSize: 17, color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  bubbleMeta: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  bubbleTail: { position: 'absolute', bottom: -10, width: 14, height: 14, backgroundColor: colors.white, borderRightWidth: 2, borderBottomWidth: 2, borderColor: colors.line, transform: [{ rotate: '45deg' }] },
});
