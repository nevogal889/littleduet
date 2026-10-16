import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SongCover } from '../../src/components/bits';
import { Icon } from '../../src/components/Icon';
import { SKILL_COLORS, skillLabel } from '../../src/components/skills';
import { Button, Card, PercentBar, Screen, SectionTitle, T } from '../../src/components/ui';
import { LESSONS, SONGS } from '../../src/data/catalog';
import { useChildName } from '../../src/hooks';
import { t } from '../../src/i18n';
import { songPercent } from '../../src/lib/progress';
import { classesThisWeek, minutesThisWeek, musicDaysThisWeek } from '../../src/lib/stickers';
import { useApp } from '../../src/state/store';
import { colors, fonts, radius, space } from '../../src/theme';
import type { SkillId } from '../../src/types';

/** Grown-ups: progress only (this week, songs being learned, skills practiced). Settings live behind the gear. */
export default function GrownUps() {
  const router = useRouter();
  const { childData } = useApp();
  const name = useChildName();
  const now = Date.now();
  const progress = childData.progress;
  const minutes = minutesThisWeek(LESSONS, progress, now);
  const classes = classesThisWeek(progress, now);
  const days = musicDaysThisWeek(childData.activityDays, now);

  const learning = useMemo(
    () =>
      SONGS.map((s) => ({ s, pct: songPercent(LESSONS[s.id], progress) }))
        .filter((x) => x.pct > 0)
        .sort((a, b) => b.pct - a.pct),
    [progress],
  );
  const skills = useMemo(() => {
    const n = new Map<SkillId, number>();
    for (const l of Object.values(LESSONS))
      for (const c of l.classes) if (progress[c.id]?.completed && c.skill) n.set(c.skill.primary, (n.get(c.skill.primary) ?? 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1]);
  }, [progress]);
  const maxSkill = Math.max(1, ...skills.map(([, v]) => v));

  return (
    <Screen testID="grownups">
      <View style={styles.head}>
        <View style={{ flex: 1 }}>
          <T v="h1" accessibilityRole="header">
            {t('grownups.title')}
          </T>
          <T v="small">{t('progressPage.subtitle', { name })}</T>
        </View>
        <Pressable testID="open-settings" accessibilityRole="button" accessibilityLabel={t('settings.title')} onPress={() => router.push('/settings' as never)} style={styles.gear} hitSlop={8}>
          <Icon name="gear" size={26} color={colors.ink} />
        </Pressable>
      </View>

      <Card style={[styles.card, { marginTop: space.xl }]} testID="minutes-week">
        <T v="small">{t('grownups.minutesThisWeek')}</T>
        <Text style={styles.bigNum}>{minutes}</Text>
        <T v="small">{t('grownups.minutesThisWeekBody', { count: minutes })}</T>
        <View style={styles.weekRow}>
          <View style={styles.weekStat}>
            <Text style={styles.weekNum}>{classes}</Text>
            <T v="small">{t('progressPage.classesWeek', { count: classes })}</T>
          </View>
          <View style={styles.weekStat}>
            <Text style={styles.weekNum}>{days}</Text>
            <T v="small">{t('progressPage.daysWeek', { count: days })}</T>
          </View>
        </View>
      </Card>

      <SectionTitle>{t('progressPage.learning')}</SectionTitle>
      {learning.length ? (
        <Card style={{ gap: space.md }} testID="learning-list">
          {learning.map(({ s, pct }) => (
            <Pressable key={s.id} accessibilityRole="button" accessibilityLabel={`${s.title}, ${pct}%`} onPress={() => router.push(`/song/${s.id}` as never)} style={styles.songRow}>
              <SongCover song={s} kind="square" width={56} rounded={radius.md} />
              <View style={{ flex: 1, gap: 6 }}>
                <T v="bodyStrong" numberOfLines={1}>
                  {s.title}
                </T>
                <PercentBar percent={pct} doneLabel={t('song.done')} height={10} />
              </View>
            </Pressable>
          ))}
        </Card>
      ) : (
        <Card>
          <T v="body">{t('progressPage.learningEmpty')}</T>
        </Card>
      )}

      <SectionTitle>{t('progressPage.skills')}</SectionTitle>
      {skills.length ? (
        <Card style={{ gap: space.sm }} testID="skills-practiced">
          {skills.map(([id, v]) => (
            <View key={id} style={styles.skillRow}>
              <Text style={styles.skillLabel} numberOfLines={2}>
                {skillLabel(id)}
              </Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.max(8, (v / maxSkill) * 100)}%`, backgroundColor: SKILL_COLORS[id] }]} />
              </View>
              <Text style={styles.skillCount}>{t('progressPage.classesN', { count: v })}</Text>
            </View>
          ))}
          <T v="small">{t('progressPage.skillsNote')}</T>
        </Card>
      ) : (
        <Card>
          <T v="body">{t('progressPage.skillsEmpty')}</T>
        </Card>
      )}

      <View style={{ marginTop: space.xl }}>
        <Button testID="settings-button" variant="secondary" icon="gear" label={t('settings.title')} onPress={() => router.push('/settings' as never)} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingTop: space.lg, gap: space.md },
  gear: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px -2px rgba(30,42,58,0.08)' },
  card: { gap: space.md },
  bigNum: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 46, color: colors.ink },
  weekRow: { flexDirection: 'row', gap: space.lg },
  weekStat: { flex: 1, backgroundColor: colors.soft, borderRadius: radius.md, padding: space.md, gap: 2 },
  weekNum: { fontFamily: fonts.extra, fontSize: 26, color: colors.ink },
  songRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  skillLabel: { width: 150, fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  track: { flex: 1, height: 12, borderRadius: 6, backgroundColor: colors.soft, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6 },
  skillCount: { width: 70, textAlign: 'right', fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
});
