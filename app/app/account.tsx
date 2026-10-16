import React, { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '../src/components/Icon';
import { LogoMark } from '../src/components/Logo';
import { ParentalGate, useGate } from '../src/components/ParentalGate';
import { BackButton, Button, Field, Screen, T } from '../src/components/ui';
import { config } from '../src/config';
import { t } from '../src/i18n';
import { auth } from '../src/services/auth';
import { useApp } from '../src/state/store';
import { colors, fonts, radius, space, touch } from '../src/theme';

type Mode = 'signup' | 'login';
type From = 'onboarding' | 'trial' | 'welcome' | 'settings';

/**
 * Sign up / log in for grown-ups: Apple, Google, or a 6-digit email code (no passwords).
 * Behind the parental gate (Google opens a browser, which leaves the app: Apple 1.3).
 * Sign-up is always skippable: subscriptions never require an account (Apple 5.1.1).
 */
export default function Account() {
  const params = useLocalSearchParams<{ from?: string; mode?: string }>();
  const from = (params.from ?? 'settings') as From;
  const router = useRouter();
  const gate = useGate();
  const { child, data } = useApp();
  const dataRef = useRef(data);
  dataRef.current = data;
  const [mode, setMode] = useState<Mode>(params.mode === 'login' ? 'login' : 'signup');
  const [passed, setPassed] = useState(gate.isUnlocked());
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [apple, setApple] = useState(false);
  const [google, setGoogle] = useState(false);

  useEffect(() => {
    auth.appleAvailable().then(setApple).catch(() => {});
    auth.googleAvailable().then(setGoogle).catch(() => {});
  }, []);

  const leave = () => {
    // Backing out at the welcome screen: lock the gate again, the phone may go to the child next.
    if (from === 'welcome') return gate.lock(), router.canGoBack() ? router.back() : router.replace('/onboarding' as never);
    if (from === 'onboarding' || from === 'trial' || !router.canGoBack()) return router.replace('/' as never);
    router.back();
  };

  /** After a successful sign-in: synced progress arrives a moment later; a returning parent skips onboarding. */
  const signedIn = async () => {
    if (from !== 'welcome') return leave();
    const until = Date.now() + 2500;
    while (Date.now() < until && !(dataRef.current.onboarded && dataRef.current.children.length)) {
      await new Promise((r) => setTimeout(r, 150));
    }
    const back = dataRef.current.onboarded && dataRef.current.children.length > 0;
    router.replace((back ? '/' : '/onboarding?start=2&returning=1') as never);
  };

  const run = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    setErr(null);
    const r = await fn().catch(() => ({ ok: false, error: 'errors.genericBody' }));
    setBusy(false);
    if (r.ok) return true;
    if (r.error) setErr(t(r.error));
    return false;
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const send = async () => {
    if (!validEmail) return setErr(t('errors.emailInvalid'));
    if (await run(() => auth.sendCode(email.trim()))) setSent(true);
  };
  const verify = async () => {
    if (await run(() => auth.verifyCode(email.trim(), code))) signedIn();
  };

  const name = child?.name?.trim();
  const title =
    mode === 'login'
      ? t('auth.login.title')
      : from === 'trial'
        ? t('auth.signup.trialTitle')
        : name
          ? t('auth.signup.title', { name })
          : t('auth.signup.titleNoName');
  const body = mode === 'login' ? t('auth.login.body') : from === 'trial' && name ? t('auth.signup.trialBody', { name }) : t('auth.signup.body');

  return (
    <Screen testID="account" edges={['top', 'bottom']}>
      <View style={{ paddingTop: space.sm }}>
        <BackButton testID="account-back" onPress={leave} label={mode === 'signup' && from !== 'settings' ? t('common.notNow') : t('common.back')} />
      </View>
      {!passed ? (
        <ParentalGate purpose="account" onCancel={leave} onPass={() => (gate.unlock(), setPassed(true))} />
      ) : (
        <View style={styles.col} testID={`account-${mode}`}>
          <View style={styles.head}>
            <LogoMark size={72} />
            <T v="h1" accessibilityRole="header" style={styles.center} testID="account-title">
              {title}
            </T>
            <T v="body" style={[styles.center, { color: colors.inkSoft }]}>
              {body}
            </T>
          </View>

          {!sent ? (
            <>
              {apple ? (
                <Button testID="auth-apple" variant="dark" icon="apple" label={t('auth.apple')} disabled={busy} onPress={async () => (await run(() => auth.signInWithApple())) && signedIn()} />
              ) : null}
              {google ? (
                <Button testID="auth-google" variant="secondary" icon="google" label={t('auth.google')} disabled={busy} onPress={async () => (await run(() => auth.signInWithGoogle())) && signedIn()} />
              ) : null}
              {apple || google ? (
                <View style={styles.orRow} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <View style={styles.rule} />
                  <Text style={styles.or}>{t('auth.or')}</Text>
                  <View style={styles.rule} />
                </View>
              ) : null}
              <T v="bodyStrong" nativeID="email-label">
                {t('grownups.account.emailLabel')}
              </T>
              <Field
                testID="auth-email"
                value={email}
                onChangeText={(v) => (setEmail(v), setErr(null))}
                placeholder={t('grownups.account.emailPlaceholder')}
                accessibilityLabel={t('grownups.account.emailLabel')}
                accessibilityLabelledBy="email-label"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="send"
                onSubmitEditing={send}
                style={styles.input}
              />
              <Button testID="auth-send" variant="primary" icon="mail" label={t('auth.emailCta')} onPress={send} disabled={busy || !email.trim()} />
              <T v="small" style={styles.center}>
                {t('auth.noPassword')}
              </T>
            </>
          ) : (
            <>
              <T v="h2">{t('grownups.account.codeTitle')}</T>
              <T v="body">{t('grownups.account.codeBody', { email: email.trim() })}</T>
              <T v="bodyStrong" nativeID="code-label">
                {t('grownups.account.codeLabel')}
              </T>
              <Field
                testID="auth-code"
                value={code}
                onChangeText={(v) => (setCode(v.replace(/[^0-9]/g, '').slice(0, 6)), setErr(null))}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                accessibilityLabel={t('grownups.account.codeLabel')}
                accessibilityLabelledBy="code-label"
                style={[styles.input, styles.code]}
              />
              <Button testID="auth-verify" label={mode === 'login' ? t('auth.logIn') : t('auth.createAccount')} onPress={verify} disabled={busy || code.length !== 6} />
              <Button variant="secondary" size="md" label={t('grownups.account.resendCode')} onPress={send} disabled={busy} />
              <Button variant="ghost" size="md" label={t('grownups.account.differentEmail')} onPress={() => (setSent(false), setCode(''), setErr(null))} />
            </>
          )}

          {err ? (
            <T v="bodyStrong" accessibilityLiveRegion="polite" style={styles.err} testID="auth-error">
              {err}
            </T>
          ) : null}

          {auth.demo ? (
            <T v="small" style={[styles.center, styles.demo]} testID="auth-demo-note">
              {t('auth.demoNote')}
            </T>
          ) : null}

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{mode === 'signup' ? t('auth.haveAccount') : t('auth.newHere')}</Text>
            <Pressable
              testID="auth-switch"
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => (setMode((m) => (m === 'signup' ? 'login' : 'signup')), setSent(false), setCode(''), setErr(null))}
            >
              <Text style={styles.switchLink}>{mode === 'signup' ? t('auth.logIn') : t('auth.createAccount')}</Text>
            </Pressable>
          </View>

          <View style={styles.trust}>
            <Icon name="lock" size={20} color={colors.inkSoft} />
            <T v="small" style={{ flex: 1 }}>
              {t('auth.privacyNote')}
            </T>
          </View>
          <Text style={styles.legal}>
            {t('auth.legalStart')}
            <Text style={styles.legalLink} accessibilityRole="link" onPress={() => Linking.openURL(config.links.terms)}>
              {t('auth.terms')}
            </Text>
            {t('auth.legalAnd')}
            <Text style={styles.legalLink} accessibilityRole="link" onPress={() => Linking.openURL(config.links.privacy)}>
              {t('auth.privacy')}
            </Text>
            .
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: { width: '100%', maxWidth: 480, alignSelf: 'center', gap: space.md, paddingTop: space.sm, paddingBottom: space.xxl },
  head: { alignItems: 'center', gap: space.sm, marginBottom: space.md },
  center: { textAlign: 'center' },
  input: { fontSize: 20 },
  code: { letterSpacing: 8, fontSize: 28, textAlign: 'center' },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginVertical: space.xs },
  rule: { flex: 1, height: 1, backgroundColor: colors.line },
  or: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8 },
  err: { color: colors.brandEdge },
  demo: { backgroundColor: colors.goldSoft, padding: space.sm, borderRadius: radius.md, overflow: 'hidden' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, minHeight: touch.min, flexWrap: 'wrap' },
  switchText: { fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  switchLink: { fontFamily: fonts.extra, fontSize: 16, color: colors.brandEdge, textDecorationLine: 'underline' },
  trust: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', backgroundColor: colors.soft, padding: space.md, borderRadius: radius.md },
  legal: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, color: colors.inkSoft, textAlign: 'center' },
  legalLink: { textDecorationLine: 'underline', color: colors.ink },
});
