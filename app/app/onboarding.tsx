import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongCover } from '../src/components/bits';
import { SONGS } from '../src/data/catalog';
import { Icon } from '../src/components/Icon';
import { ParentalGate } from '../src/components/ParentalGate';
import { Paywall } from '../src/components/Paywall';
import { BackButton, Button, Field, T } from '../src/components/ui';
import { authEnabled } from '../src/config';
import { t, tRaw } from '../src/i18n';
import { useApp } from '../src/state/store';
import { card, colors, fonts, radius, shadow, space, touch, useLayout } from '../src/theme';
import type { PlayMode } from '../src/types';
import { BirthdayPicker } from '../src/components/BirthdayPicker';
import { childAge } from '../src/lib/birthday';

const TOTAL = 4;

export default function Onboarding() {
  const router = useRouter();
  const { addChild, finishOnboarding, data } = useApp();
  const { gutter, isTablet } = useLayout();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [birthday, setBirthday] = useState<string | undefined>(undefined);
  const [ageOnly, setAgeOnly] = useState(false);
  const [mode, setMode] = useState<PlayMode>('real');
  const [gatePassed, setGatePassed] = useState(false);

  const finish = () => {
    if (!data.children.length) {
      const bd = ageOnly ? undefined : birthday;
      addChild(name.trim(), bd ? childAge({ age: 3, birthday: bd }, Date.now()) : age ?? 3, mode, bd);
    }
    finishOnboarding();
    if (authEnabled) router.replace('/account?from=onboarding');
    else router.replace('/');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']} testID={`onboarding-step-${step}`}>
      <View style={[styles.top, { paddingHorizontal: gutter }]}>
        {step > 1 ? <BackButton onPress={() => setStep((s) => s - 1)} label={t('common.back')} /> : <View style={{ height: touch.min }} />}
        <View style={styles.dots} accessible accessibilityLabel={t('onboarding.stepOf', { index: step, total: TOTAL })}>
          {Array.from({ length: TOTAL }, (_, i) => (
            <View key={i} style={[styles.dot, i + 1 === step && styles.dotOn, i + 1 < step && styles.dotDone]} />
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={[styles.body, { paddingHorizontal: gutter }]} keyboardShouldPersistTaps="handled">
        <View style={styles.col}>
          {step === 1 ? (
            <>
              <View style={styles.hero} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                {SONGS.slice(0, 3).map((s, i) => (
                  <View key={s.id} style={i === 1 ? styles.heroMid : styles.heroSide}>
                    <SongCover song={s} kind="square" width={isTablet ? (i === 1 ? 180 : 140) : i === 1 ? 120 : 92} rounded={20} />
                  </View>
                ))}
              </View>
              <T v="h1" accessibilityRole="header" style={styles.center}>
                {t('onboarding.welcome.title')}
              </T>
              <T v="body" style={[styles.center, { color: colors.inkSoft }]}>
                {t('onboarding.welcome.body')}
              </T>
              <View style={styles.steps}>
                {((tRaw('onboarding.howItWorks.steps') as { title: string; body: string }[] | undefined) ?? []).map((s, i) => (
                  <View key={s.title} style={styles.stepRow}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <T v="bodyStrong">{s.title}</T>
                      <T v="small">{s.body}</T>
                    </View>
                  </View>
                ))}
              </View>
              <Button testID="onb-start" label={t('onboarding.welcome.cta')} onPress={() => setStep(2)} />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <T v="h1" accessibilityRole="header">
                {t('onboarding.child.title')}
              </T>
              <T v="bodyStrong" nativeID="name-label">
                {t('onboarding.child.nameLabel')}
              </T>
              <Field
                testID="onb-name"
                value={name}
                onChangeText={(v) => setName(v.slice(0, 24))}
                placeholder={t('onboarding.child.namePlaceholder')}
                placeholderTextColor={colors.inkSoft}
                accessibilityLabel={t('onboarding.child.nameLabel')}
                accessibilityLabelledBy="name-label"
                autoCapitalize="words"
                autoCorrect={false}
                autoComplete="off"
                returnKeyType="done"
                style={{ fontSize: 20 }}
              />
              <T v="small">{t('onboarding.child.nameHelper')}</T>
              <T v="h2" style={{ marginTop: space.lg }}>
                {ageOnly
                  ? name.trim()
                    ? t('onboarding.child.ageTitle', { name: name.trim() })
                    : t('onboarding.child.ageTitleNoName')
                  : name.trim()
                    ? t('birthday.title', { name: name.trim() })
                    : t('birthday.titleNoName')}
              </T>
              {ageOnly ? (
                <>
                  <View style={styles.ages} accessibilityRole="radiogroup">
                    {[2, 3, 4, 5, 6].map((a) => (
                      <Pressable
                        key={a}
                        testID={`onb-age-${a}`}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: age === a, selected: age === a }}
                        accessibilityLabel={t('grownups.children.ageButton', { age: a })}
                        onPress={() => setAge(a)}
                        style={({ pressed }) => [styles.age, age === a && styles.ageOn, pressed && age !== a && { backgroundColor: colors.selectedSoft }]}
                      >
                        <Text style={styles.ageText}>{a}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <T v="small">{t('onboarding.child.ageHelper')}</T>
                </>
              ) : (
                <>
                  <BirthdayPicker value={birthday} onChange={setBirthday} />
                  <T v="small">{t('birthday.helper')}</T>
                </>
              )}
              <Pressable testID="onb-age-toggle" accessibilityRole="button" onPress={() => setAgeOnly((v) => !v)} hitSlop={8}>
                <Text style={styles.link}>{ageOnly ? t('birthday.useBirthday') : t('birthday.justAge')}</Text>
              </Pressable>
              <Button testID="onb-next" label={t('common.next')} disabled={ageOnly ? age === null : !birthday} onPress={() => setStep(3)} />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <T v="h1" accessibilityRole="header">
                {t('onboarding.mode.title')}
              </T>
              {(
                [
                  { m: 'real' as PlayMode, title: t('onboarding.mode.yes'), detail: t('onboarding.mode.yesDetail'), icon: 'piano' as const, mode: t('common.modes.real.name') },
                  { m: 'screen' as PlayMode, title: t('onboarding.mode.no'), detail: t('onboarding.mode.noDetail'), icon: 'screen' as const, mode: t('common.modes.screen.name') },
                ]
              ).map((o) => (
                <Pressable
                  key={o.m}
                  testID={`onb-mode-${o.m}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${o.title}. ${o.mode}. ${o.detail}`}
                  onPress={() => {
                    setMode(o.m);
                    setStep(4);
                  }}
                  style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.brandSoft }]}
                >
                  <View style={styles.optionIcon}>
                    <Icon name={o.icon} size={32} color={colors.blueEdge} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <T v="h3">{o.title}</T>
                    <T v="small">{o.mode}</T>
                    <T v="body" style={{ color: colors.inkSoft }}>
                      {o.detail}
                    </T>
                  </View>
                  <Icon name="chevronRight" size={28} />
                </Pressable>
              ))}
              <T v="small">{t('onboarding.mode.footnote')}</T>
            </>
          ) : null}

          {step === 4 ? (
            gatePassed ? (
              <Paywall onDone={finish} onLater={finish} childName={name.trim()} />
            ) : (
              <ParentalGate compact purpose="paywall" onPass={() => setGatePassed(true)} onCancel={finish} cancelLabel={t('paywall.keepFree')} />
            )
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  link: { fontFamily: fonts.extra, fontSize: 16, color: colors.brandEdge, textDecorationLine: 'underline' },
  root: { flex: 1, backgroundColor: colors.ground },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 },
  dots: { flexDirection: 'row', gap: 6, paddingRight: space.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.brand, width: 22 },
  dotDone: { backgroundColor: colors.brandSoft },
  body: { paddingBottom: space.xxxl, flexGrow: 1 },
  col: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.lg, paddingTop: space.md },
  hero: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.md, paddingVertical: space.xl },
  heroSide: { opacity: 0.9 },
  heroMid: {},
  center: { textAlign: 'center' },
  steps: { ...card, gap: space.lg, padding: space.xl },
  stepRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.extra, fontSize: 15, color: colors.ink },
  ages: { flexDirection: 'row', gap: space.sm },
  age: {
    flex: 1,
    maxWidth: 96,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageOn: { backgroundColor: colors.surface, ...shadow.cardStrong },
  ageText: { fontFamily: fonts.bold, fontSize: 24, color: colors.ink },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.xl,
    minHeight: 112,
    ...shadow.card,
  },
  optionIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center' },
});
