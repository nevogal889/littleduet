import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';
import { card, colors, fonts, radius, space, type } from '../theme';
import type { LessonClass, SkillId, SkillMapEntry } from '../types';
import { Icon } from './Icon';
import { Button, T } from './ui';

/** One colour per skill (tints at 10% for backgrounds), matching the stats-bar language. */
export const SKILL_COLORS: Record<SkillId, string> = {
  beat: colors.streak,
  pitch: colors.blue,
  listening: colors.indigo,
  counting: colors.goldEdge,
  patterns: colors.brand,
  space: colors.green,
  fingers: '#B86BD8',
  form: '#2E9C8F',
  expression: '#E0568A',
  together: colors.coralInk,
};

export function skillLabel(id: SkillId): string {
  return t(`skills.names.${id}`);
}

function tint(hex: string, a = 0.12): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function SkillChip({ id, strong }: { id: SkillId; strong?: boolean }) {
  const c = SKILL_COLORS[id];
  return (
    <View style={[styles.chip, { backgroundColor: tint(c, strong ? 0.16 : 0.1) }]} testID={`skill-chip-${id}`}>
      <View style={[styles.chipDot, { backgroundColor: c }]} />
      <Text style={[styles.chipText, { color: colors.ink }]}>{skillLabel(id)}</Text>
    </View>
  );
}

/** Song page: what the whole song practices (bars) + one coloured dot per class (primary skill). */
export function SkillMapCard({ summary, map, classes }: { summary?: string; map?: SkillMapEntry[]; classes: LessonClass[] }) {
  if (!map?.length) return null;
  // Counted by main skill: the counts add up to the class count and match the dots below.
  const rows = map;
  return (
    <View style={styles.mapCard} testID="skill-map">
      <Text style={type.meta}>{t('skills.mapTitle')}</Text>
      {summary ? <T v="body">{summary}</T> : null}
      <View style={{ gap: space.sm }} accessible accessibilityLabel={rows.map((r) => skillLabel(r.id)).join(', ')}>
        {rows.map((r) => (
          <View key={r.id} style={styles.barRow}>
            <Text style={styles.barLabel} numberOfLines={2}>
              {skillLabel(r.id)}
            </Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.max(8, Math.round(r.value * 100))}%`, backgroundColor: SKILL_COLORS[r.id] }]} />
            </View>
            <Text style={styles.barCount}>{t('skills.ofTotal', { count: r.classes, total: r.total ?? classes.length })}</Text>
          </View>
        ))}
      </View>
      <View style={styles.strip} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {classes.map((c) =>
          c.skill ? (
            <View key={c.id} style={styles.stripItem}>
              <View style={[styles.stripDot, { backgroundColor: SKILL_COLORS[c.skill.primary] }]}>
                <Text style={styles.stripNum}>{c.index}</Text>
              </View>
            </View>
          ) : null,
        )}
      </View>
      <T v="small">{t('skills.mapNote')}</T>
    </View>
  );
}

function Row({ icon, color, label, text }: { icon: React.ReactNode; color: string; label: string; text: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: tint(color, 0.12) }]}>{icon}</View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={type.meta}>{label}</Text>
        <T v="bodyStrong">{text}</T>
      </View>
    </View>
  );
}

const Glyph = ({ ch, color }: { ch: string; color: string }) => <Text style={[styles.glyph, { color }]}>{ch}</Text>;

/** Before each class: skill, thinking target, what the grown-up does, what the child does, the image. */
export function ClassBriefSheet({
  cls,
  visible,
  percent,
  locked,
  onStart,
  onClose,
}: {
  cls?: LessonClass;
  visible: boolean;
  percent: number;
  locked?: boolean;
  onStart: () => void;
  onClose: () => void;
}) {
  if (!cls) return null;
  const sk = cls.skill;
  const primary = sk ? SKILL_COLORS[sk.primary] : colors.brand;
  const mins = Math.max(1, Math.round(cls.durationSec / 60));
  const cta = locked ? t('skills.unlock') : percent > 0 && percent < 100 ? t('path.continue') : t('path.start');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel={t('streak.close')}>
        <Pressable style={styles.sheet} onPress={() => {}} testID="class-brief" accessibilityViewIsModal>
          <ScrollView contentContainerStyle={{ gap: space.md }} bounces={false}>
            <View style={styles.head}>
              <Text style={type.meta}>
                {t('skills.classKicker', { index: cls.index, minutes: mins })}
              </Text>
              <T v="h1" accessibilityRole="header">
                {cls.title}
              </T>
              <T v="body">{cls.goal}</T>
            </View>
            {sk ? (
              <View style={styles.chips}>
                <SkillChip id={sk.primary} strong />
                {sk.secondary.map((s) => (
                  <SkillChip key={s} id={s} />
                ))}
              </View>
            ) : null}
            {cls.mathTarget ? (
              <View style={[styles.target, { backgroundColor: tint(primary, 0.08) }]} testID="brief-target">
                <Text style={[type.meta, { color: colors.ink }]}>{t('skills.thinking')}</Text>
                <T v="bodyStrong">{cls.mathTarget.parentLine}</T>
              </View>
            ) : null}
            <Row icon={<Icon name="grownups" size={22} color={colors.indigo} />} color={colors.indigo} label={t('skills.you')} text={cls.parentPrompt ?? cls.parentTip} />
            {cls.childAction ? <Row icon={<Icon name="star" size={22} color={colors.goldEdge} />} color={colors.gold} label={t('skills.child')} text={cls.childAction} /> : null}
            {cls.bridge ? <Row icon={<Glyph ch="♪" color={colors.brand} />} color={colors.brand} label={t('skills.bridge')} text={cls.bridge} /> : null}
          </ScrollView>
          <Button testID="brief-start" icon={locked ? 'lock' : 'play'} label={cta} onPress={onStart} />
          <Button testID="brief-close" variant="ghost" label={t('skills.notNow')} onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Celebration: "Today you practiced" with the class's skills. */
export function PracticedToday({ cls }: { cls?: LessonClass }) {
  if (!cls?.skill) return null;
  const ids = [cls.skill.primary, ...cls.skill.secondary];
  return (
    <View style={styles.today} testID="practiced-today">
      <Text style={type.meta}>{t('skills.todayTitle')}</Text>
      <View style={[styles.chips, { justifyContent: 'center', alignSelf: 'stretch' }]}>
        {ids.map((s, i) => (
          <SkillChip key={s} id={s} strong={i === 0} />
        ))}
      </View>
      {cls.mathTarget ? <T v="small">{cls.mathTarget.parentLine}</T> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  chipDot: { width: 10, height: 10, borderRadius: 5 },
  chipText: { fontFamily: fonts.bold, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  mapCard: { ...card, padding: space.lg, gap: space.md },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  barLabel: { width: 150, fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  barTrack: { flex: 1, height: 12, borderRadius: 6, backgroundColor: colors.soft, overflow: 'hidden' },
  barFill: { height: 12, borderRadius: 6 },
  barCount: { width: 56, textAlign: 'right', fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stripItem: { alignItems: 'center' },
  stripDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stripNum: { fontFamily: fonts.extra, fontSize: 13, color: colors.white },
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { ...card, width: '100%', maxWidth: 560, maxHeight: '92%', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: space.xl, gap: space.sm },
  head: { gap: 4 },
  target: { padding: space.md, borderRadius: radius.md, gap: 4 },
  row: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  rowIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: fonts.extra, fontSize: 24, lineHeight: 28 },
  today: { ...card, padding: space.lg, gap: space.sm, alignItems: 'center' },
});
