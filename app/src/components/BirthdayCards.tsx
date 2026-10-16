import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { t } from '../i18n';
import { ageGroupForAge } from '../lib/catalog';
import { card, colors, fonts, radius, space } from '../theme';
import { Icon } from './Icon';
import { Button, T } from './ui';

const SPRINKLES = [colors.brand, colors.gold, colors.blue, colors.green, colors.coral, colors.indigo];

/** On the birthday: greeting, Happy Birthday lesson, badge hint. Decorative sprinkles, no motion. */
export function BirthdayBanner({ name, age, badgeEarned, onPlay }: { name: string; age: number; badgeEarned: boolean; onPlay: () => void }) {
  return (
    <View style={styles.bday} testID="birthday-banner">
      <View style={styles.sprinkles} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: 18 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.sprinkle,
              { left: `${(i * 53) % 96}%` as unknown as number, top: (i * 37) % 44, backgroundColor: SPRINKLES[i % SPRINKLES.length], transform: [{ rotate: `${(i * 47) % 180}deg` }] },
            ]}
          />
        ))}
      </View>
      <View style={styles.cakeWrap}>
        <Icon name="cake" size={40} color={colors.brand} />
      </View>
      <T v="h2" accessibilityRole="header" style={styles.center}>
        {t('birthday.banner', { name })}
      </T>
      <T v="body" style={styles.center}>
        {t('birthday.bannerAge', { name, age })}
      </T>
      <Button testID="birthday-play" icon="play" label={t('birthday.playCta')} onPress={onPlay} />
      <Text style={styles.hint}>{badgeEarned ? t('birthday.badgeDone') : t('birthday.badgeHint')}</Text>
    </View>
  );
}

/** After a birthday: the age changed, so the picks changed. */
export function AgeUpCard({ name, age, onSee, onClose }: { name: string; age: number; onSee: () => void; onClose: () => void }) {
  const group = ageGroupForAge(age);
  return (
    <View style={styles.ageUp} testID="age-up">
      <T v="h3">{t('birthday.ageUpTitle', { name, age })}</T>
      <T v="body">{t('birthday.ageUpBody', { ageLabel: t(`ageGroups.${group}.label`) })}</T>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <Button testID="age-up-see" size="md" full={false} label={t('birthday.ageUpCta')} onPress={onSee} />
        <Button testID="age-up-close" size="md" full={false} variant="ghost" label={t('birthday.dismiss')} onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bday: { ...card, marginTop: space.lg, padding: space.lg, paddingTop: space.xxl, gap: space.sm, overflow: 'hidden', backgroundColor: '#FFF7F2' },
  sprinkles: { position: 'absolute', left: 0, right: 0, top: 6, height: 56 },
  sprinkle: { position: 'absolute', width: 10, height: 14, borderRadius: 3, opacity: 0.85 },
  cakeWrap: { alignSelf: 'center', width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
  hint: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  ageUp: { ...card, marginTop: space.lg, padding: space.lg, gap: space.sm, borderLeftWidth: 6, borderLeftColor: colors.green, borderRadius: radius.card },
});
