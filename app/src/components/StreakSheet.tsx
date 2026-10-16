import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';
import type { Streak } from '../lib/streak';
import { card, colors, fonts, radius, space } from '../theme';
import { Icon } from './Icon';
import { Button, T } from './ui';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function streakTitle(s: Streak): string {
  return s.days === 0 ? t('streak.title_zero') : t('streak.title', { count: s.days });
}

/** Kind streak details: this week's goal days, weekend protection, no loss language. */
export function StreakSheet({ visible, streak, onClose }: { visible: boolean; streak: Streak; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel={t('streak.close')}>
        <Pressable style={styles.sheet} onPress={() => {}} testID="streak-sheet" accessibilityViewIsModal>
          <View style={styles.head}>
            <Icon name="flame" size={56} color={streak.days ? colors.streak : colors.faint} />
            <T v="h1">{streakTitle(streak)}</T>
          </View>
          <T v="body">{streak.playedToday ? t('streak.goalDone') : streak.welcomeBack ? t('streak.welcomeBackBody') : t('streak.goalTodo')}</T>
          <T v="label">{t('streak.thisWeek')}</T>
          <View style={styles.week}>
            {streak.week.map((on, i) => (
              <View key={i} style={styles.day}>
                <View style={[styles.dot, on && styles.dotOn, i >= 5 && !on && styles.dotWeekend]}>
                  {on ? <Icon name="flame" size={18} color={colors.white} /> : null}
                </View>
                <Text style={styles.dayText}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
          <View style={styles.note}>
            <Icon name="check" size={20} color={colors.blueEdge} />
            <T v="small" style={{ flex: 1, color: colors.body }}>
              {t('streak.weekend')}
            </T>
          </View>
          <Button testID="streak-close" variant="secondary" label={t('streak.close')} onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { ...card, width: '100%', maxWidth: 560, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, padding: space.xl, gap: space.md },
  head: { alignItems: 'center', gap: space.sm },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4 },
  dot: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: colors.streak },
  dotWeekend: { backgroundColor: '#F7F3EE' },
  dayText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  note: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', backgroundColor: colors.blueSoft, padding: space.md, borderRadius: radius.card },
});
