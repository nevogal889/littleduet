import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SongArt } from '../src/components/art/SongArt';
import { Icon } from '../src/components/Icon';
import { ParentalGate } from '../src/components/ParentalGate';
import { Paywall } from '../src/components/Paywall';
import { BackButton, Button, T } from '../src/components/ui';
import { authEnabled } from '../src/config';
import { t, tRaw } from '../src/i18n';
import { useApp } from '../src/state/store';
import { colors, fonts, radius, shadow, space, touch, useLayout } from '../src/theme';
import type { PlayMode } from '../src/types';

const TOTAL = 4;

export default function Onboarding() {
  const router = useRouter();
  const { addChild, finishOnboarding, data } = useApp();
  const { gutter, isTablet } = useLayout();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [mode, setMode] = useState<PlayMode>('real');
  const [gatePassed, setGatePassed] = useState(false);

  const finish = () => {
    if (!data.children.length) addChild(name.trim(), age ?? 3, mode);
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
                <SongArt icon="bear" size={isTablet ? 160 : 120} />
                <SongArt icon="music" size={isTablet ? 110 : 80} />
                <SongArt icon="bird" size={isTablet ? 160 : 120} />
              </View>
              <T v="hero" accessibilityRole="header" style={styles.center}>
                {t('onboarding.welcome.title')}
              </T>
              <T v="body" style={styles.center}>
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
              <TextInput
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
                style={styles.input}
              />
              <T v="small">{t('onboarding.child.nameHelper')}</T>
              <T v="h2" style={{ marginTop: space.lg }}>
                {name.trim() ? t('onboarding.child.ageTitle', { name: name.trim() }) : t('onboarding.child.ageTitleNoName')}
              </T>
              <View style={styles.ages} accessibilityRole="radiogroup">
                {[2, 3, 4, 5, 6].map((a) => (
                  <Pressable
                    key={a}
                    testID={`onb-age-${a}`}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: age === a, selected: age === a }}
                    accessibilityLabel={t('grownups.children.ageButton', { age: a })}
                    onPress={() => setAge(a)}
                    style={({ pressed }) => [styles.age, age === a && styles.ageOn, pressed && age !== a && { backgroundColor: colors.indigoSoft }]}
                  >
                    <Text style={[styles.ageText, age === a && { color: colors.white }]}>{a}</Text>
                  </Pressable>
                ))}
              </View>
              <T v="small">{t('onboarding.child.ageHelper')}</T>
              <Button testID="onb-next" label={t('common.next')} disabled={age === null} onPress={() => setStep(3)} />
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
                  style={({ pressed }) => [styles.option, pressed && { borderColor: colors.coral }]}
                >
                  <View style={styles.optionIcon}>
                    <Icon name={o.icon} size={40} color={colors.indigo} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <T v="h2">{o.title}</T>
                    <T v="bodyStrong" style={{ color: colors.indigo }}>
                      {o.mode}
                    </T>
                    <T v="body">{o.detail}</T>
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
              <>
                <T v="body">{t('onboarding.paywallGateNote')}</T>
                <ParentalGate purpose="paywall" onPass={() => setGatePassed(true)} />
                <Button testID="onb-keep-free" variant="secondary" size="md" label={t('paywall.keepFree')} onPress={finish} />
                <T v="small" style={styles.center}>
                  {t('onboarding.ready.body')}
                </T>
              </>
            )
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ground },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 64 },
  dots: { flexDirection: 'row', gap: 8, paddingRight: space.sm },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.line },
  dotOn: { backgroundColor: colors.coral, width: 28 },
  dotDone: { backgroundColor: colors.indigo },
  body: { paddingBottom: space.xxxl, flexGrow: 1 },
  col: { width: '100%', maxWidth: 620, alignSelf: 'center', gap: space.lg, paddingTop: space.md },
  hero: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: space.md, paddingVertical: space.lg },
  center: { textAlign: 'center' },
  steps: { gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.card },
  stepRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.marigold, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  input: {
    minHeight: touch.primary,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.ink,
  },
  ages: { flexDirection: 'row', gap: space.sm },
  age: {
    flex: 1,
    maxWidth: 96,
    height: 72,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageOn: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  ageText: { fontFamily: fonts.display, fontSize: 32, color: colors.ink },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 3,
    borderColor: colors.line,
    minHeight: 120,
    ...shadow.card,
  },
  optionIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.indigoSoft, alignItems: 'center', justifyContent: 'center' },
});
