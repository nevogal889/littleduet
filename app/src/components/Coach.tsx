import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t, tRaw } from '../i18n';
import type { CoachPlan, Noticed, WeekReport } from '../lib/coach';
import { card, colors, fonts, radius, space } from '../theme';
import type { LessonClass, SkillId } from '../types';
import { Icon } from './Icon';
import { T } from './ui';

/** "C", "C and G", "C, E and G"; sharps read as words. */
export function noteList(notes: string[]): string {
  const n = notes.map((x) => x.replace('#', ' sharp'));
  if (n.length <= 1) return n.join('');
  return `${n.slice(0, -1).join(', ')} ${t('coach.and')} ${n[n.length - 1]}`;
}

/** Class brief: one or two lines on how the teacher will adapt this class. Nothing for a plain class. */
export function TeacherPlan({ plan, name, songTitle }: { plan?: CoachPlan; name: string; songTitle: string }) {
  if (!plan) return null;
  const lines: string[] = [];
  if (plan.reason === 'extra') lines.push(t('coach.plan.extra', { name }));
  if (plan.reason === 'slower') lines.push(t('coach.plan.slower', { song: songTitle }));
  if (plan.reason === 'fade') lines.push(t('coach.plan.fade', { name }));
  if (plan.focus.length) lines.push(t('coach.plan.focus', { notes: noteList(plan.focus) }));
  else if (plan.strong.length && plan.reason !== 'fade') lines.push(t('coach.plan.strong', { name, notes: noteList(plan.strong.slice(0, 3)) }));
  if (!lines.length) return null;
  return (
    <View style={styles.plan} testID="teacher-plan">
      <Text style={styles.kicker}>{t('coach.plan.title')}</Text>
      {lines.map((l) => (
        <T key={l} v="body">
          {l}
        </T>
      ))}
    </View>
  );
}

/** Celebration: what the teacher noticed in this class. Only when notes were listened for. */
export function NoticedCard({ n, name }: { n: Noticed | null; name: string }) {
  if (!n || n.total === 0) return null;
  const lines = [n.solo === n.total ? t('coach.noticed.allSolo', { name }) : t('coach.noticed.solo', { name, solo: n.solo, total: n.total })];
  if (n.firstSolo.length) lines.push(t('coach.noticed.firstSolo', { notes: noteList(n.firstSolo) }));
  if (n.workingOn.length) lines.push(t(n.workingOn.length === 1 ? 'coach.noticed.workingOn_one' : 'coach.noticed.workingOn_other', { notes: noteList(n.workingOn) }));
  if (n.grownUpHelped) lines.push(t('coach.noticed.grownUp'));
  return (
    <View style={styles.card} testID="teacher-noticed">
      <View style={styles.head}>
        <Icon name="check" size={22} color={colors.green} />
        <Text style={styles.kicker}>{t('coach.noticed.title')}</Text>
      </View>
      {lines.map((l) => (
        <T key={l} v="body">
          {l}
        </T>
      ))}
    </View>
  );
}

/** A two-minute, screen-free activity for later today, matched to the class's main skill. */
export function homeIdea(cls: LessonClass | undefined, name: string, songTitle: string, seed = Date.now()): string | null {
  const skill: SkillId = cls?.skill?.primary ?? 'together';
  const bank = (tRaw(`coach.home.${skill}`) as string[] | undefined) ?? (tRaw('coach.home.together') as string[] | undefined) ?? [];
  if (!bank.length) return null;
  const line = bank[Math.abs(Math.floor(seed / 86400000)) % bank.length];
  return line.replace(/\{name\}/g, name).replace(/\{song\}/g, songTitle);
}

export function HomeIdeaCard({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <View style={[styles.card, { backgroundColor: colors.marigoldSoft }]} testID="home-idea">
      <Text style={styles.kicker}>{t('coach.home.title')}</Text>
      <T v="bodyStrong">{text}</T>
    </View>
  );
}

/** Grown-ups: this week with the teacher's eyes. */
export function WeekCard({ w, name }: { w: WeekReport; name: string }) {
  const pct = w.soloShare === null ? null : Math.round(w.soloShare * 100);
  const prev = w.soloSharePrev === null ? null : Math.round(w.soloSharePrev * 100);
  return (
    <View style={styles.card} testID="week-report">
      <Text style={styles.kicker}>{t('coach.week.title', { name })}</Text>
      {pct === null ? (
        <T v="body">{t('coach.week.empty')}</T>
      ) : (
        <>
          <Text style={styles.big}>{t('coach.week.solo', { pct })}</Text>
          {prev !== null && pct !== prev ? <T v="small">{t(pct > prev ? 'coach.week.up' : 'coach.week.down', { prev })}</T> : null}
          {w.strong.length ? <T v="body">{t('coach.week.strong', { notes: noteList(w.strong) })}</T> : null}
          {w.workingOn.length ? <T v="body">{t('coach.week.workingOn', { notes: noteList(w.workingOn) })}</T> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plan: { padding: space.md, borderRadius: radius.md, gap: 4, backgroundColor: colors.blueSoft },
  card: { ...card, padding: space.lg, gap: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  kicker: { fontFamily: fonts.extra, fontSize: 15, color: colors.ink },
  big: { fontFamily: fonts.display, fontSize: 28, lineHeight: 34, color: colors.ink },
});
