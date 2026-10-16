import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ParentalGate, useGate } from '../src/components/ParentalGate';
import { BackButton, Button, Field, Screen, T } from '../src/components/ui';
import { t } from '../src/i18n';
import { auth } from '../src/services/auth';
import { colors, fonts, radius, space, touch } from '../src/theme';

/** Optional account (email 6-digit code, Sign in with Apple on iOS). Always skippable, behind the gate. */
export default function Account() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const router = useRouter();
  const gate = useGate();
  const [passed, setPassed] = useState(gate.isUnlocked());
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [apple, setApple] = useState(false);

  useEffect(() => {
    auth.appleAvailable().then(setApple).catch(() => {});
  }, []);

  const done = () => (from === 'onboarding' || !router.canGoBack() ? router.replace('/' as never) : router.back());
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const send = async () => {
    if (!validEmail) return setErr(t('errors.emailInvalid'));
    setBusy(true);
    const r = await auth.sendCode(email.trim());
    setBusy(false);
    if (r.ok) {
      setSent(true);
      setErr(null);
    } else setErr(t(r.error ?? 'errors.genericBody'));
  };
  const verify = async () => {
    setBusy(true);
    const r = await auth.verifyCode(email.trim(), code);
    setBusy(false);
    if (r.ok) done();
    else setErr(t(r.error ?? 'errors.codeWrong'));
  };

  return (
    <Screen testID="account" edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <BackButton onPress={done} label={from === 'onboarding' ? t('onboarding.child.skip') : t('common.close')} />
      </View>
      {!passed ? (
        <ParentalGate purpose="account" onCancel={done} onPass={() => (gate.unlock(), setPassed(true))} />
      ) : (
        <View style={styles.col}>
          <T v="h1" accessibilityRole="header">
            {t('grownups.account.create')}
          </T>
          <T v="body">{t('grownups.account.guestBody')}</T>
          {!sent ? (
            <>
              <T v="bodyStrong" nativeID="email-label">
                {t('grownups.account.emailLabel')}
              </T>
              <Field
                value={email}
                onChangeText={setEmail}
                placeholder={t('grownups.account.emailPlaceholder')}
                accessibilityLabel={t('grownups.account.emailLabel')}
                accessibilityLabelledBy="email-label"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                style={styles.input}
              />
              <T v="small">{t('grownups.account.emailHelper')}</T>
              <Button icon="mail" label={t('grownups.account.sendCode')} onPress={send} disabled={busy || !email} />
              {apple ? (
                <Button
                  variant="dark"
                  icon="apple"
                  label="Sign in with Apple"
                  onPress={async () => {
                    const r = await auth.signInWithApple();
                    if (r.ok) done();
                    else if (r.error) setErr(t(r.error));
                  }}
                />
              ) : null}
            </>
          ) : (
            <>
              <T v="h2">{t('grownups.account.codeTitle')}</T>
              <T v="body">{t('grownups.account.codeBody', { email: email.trim() })}</T>
              <T v="bodyStrong" nativeID="code-label">
                {t('grownups.account.codeLabel')}
              </T>
              <Field
                value={code}
                onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                accessibilityLabel={t('grownups.account.codeLabel')}
                accessibilityLabelledBy="code-label"
                style={styles.input}
              />
              <Button label={t('common.continue')} onPress={verify} disabled={busy || code.length !== 6} />
              <Button variant="secondary" size="md" label={t('grownups.account.resendCode')} onPress={send} />
              <Button variant="ghost" size="md" label={t('grownups.account.differentEmail')} onPress={() => (setSent(false), setCode(''))} />
            </>
          )}
          {err ? (
            <T v="bodyStrong" accessibilityLiveRegion="polite" style={{ color: colors.inkSoft }}>
              {err}
            </T>
          ) : null}
          <Button variant="ghost" size="md" label={t('common.notNow')} onPress={done} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.md, paddingTop: space.md },
  input: { fontSize: 20 },
});
