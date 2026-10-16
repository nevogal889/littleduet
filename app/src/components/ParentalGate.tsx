import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Linking, Modal, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gateQuestion, t } from '../i18n';
import { colors, fonts, radius, space, touch, type } from '../theme';
import { HoldButton } from './HoldButton';
import { Button, T } from './ui';

export type GatePurpose = 'paywall' | 'settings' | 'link' | 'account' | 'email';

/** Apple 1.3: hold for 3 seconds, then a written math question typed as digits. */
export function ParentalGate({ purpose, onPass, onCancel, inset }: { purpose: GatePurpose; onPass: () => void; onCancel?: () => void; inset?: boolean }) {
  const [step, setStep] = useState<'hold' | 'ask'>('hold');
  const [q, setQ] = useState(() => gateQuestion());
  const [answer, setAnswer] = useState('');
  const [wrong, setWrong] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [pausedUntil, setPausedUntil] = useState(0);

  useEffect(() => {
    if (!pausedUntil) return;
    const id = setTimeout(() => {
      setPausedUntil(0);
      setWrong(0);
      setMsg(null);
    }, Math.max(0, pausedUntil - Date.now()));
    return () => clearTimeout(id);
  }, [pausedUntil]);

  const submit = () => {
    if (answer.trim() === q.answer) {
      onPass();
      return;
    }
    const n = wrong + 1;
    setWrong(n);
    setAnswer('');
    setQ(gateQuestion());
    if (n >= 3) {
      setPausedUntil(Date.now() + 60_000);
      setMsg(`${t('gate.tooManyTitle')}. ${t('gate.tooManyBody')}`);
    } else {
      setMsg(t('gate.wrong'));
    }
  };

  return (
    <View style={[styles.wrap, inset && styles.inset]} testID="gate">
      <T v="h1" accessibilityRole="header">
        {t('gate.title')}
      </T>
      <T v="body">{t(`gate.purpose.${purpose}`)}</T>
      <T v="small">{t('gate.childPrompt')}</T>
      {step === 'hold' ? (
        <HoldButton testID="gate-hold" label={t('gate.holdTitle')} hint={t('gate.holdHint')} ms={3000} icon="lock" onComplete={() => setStep('ask')} />
      ) : (
        <View style={styles.ask}>
          <T v="body">{t('gate.instruction')}</T>
          <T v="h2" testID="gate-question">
            {q.text}
          </T>
          <T v="bodyStrong" nativeID="gate-answer-label">
            {t('gate.inputLabel')}
          </T>
          <TextInput
            testID="gate-answer"
            accessibilityLabel={t('gate.inputLabel')}
            accessibilityLabelledBy="gate-answer-label"
            value={answer}
            onChangeText={(v) => setAnswer(v.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            inputMode="numeric"
            returnKeyType="done"
            onSubmitEditing={submit}
            editable={!pausedUntil}
            autoFocus
            style={styles.input}
            maxLength={4}
          />
          {msg ? (
            <T v="bodyStrong" accessibilityLiveRegion="polite" style={{ color: colors.indigo }}>
              {msg}
            </T>
          ) : null}
          <Button testID="gate-submit" label={t('gate.submit')} onPress={submit} disabled={!answer || !!pausedUntil} />
        </View>
      )}
      {onCancel ? <Button testID="gate-cancel" variant="ghost" size="md" label={t('gate.cancel')} onPress={onCancel} /> : null}
    </View>
  );
}

const UNLOCK_MS = 2 * 60 * 1000;

interface GateCtx {
  /** Runs onPass now if a grown-up passed the gate in the last 2 minutes, else shows the gate. */
  requireGate(purpose: GatePurpose, onPass: () => void): void;
  isUnlocked(): boolean;
  unlock(): void;
  lock(): void;
  openExternal(url: string, purpose?: GatePurpose): void;
}
const Ctx = createContext<GateCtx | null>(null);

export function GateProvider({ children }: { children: React.ReactNode }) {
  const until = useRef(0);
  const [pending, setPending] = useState<{ purpose: GatePurpose; onPass: () => void } | null>(null);

  const isUnlocked = useCallback(() => Date.now() < until.current, []);
  const unlock = useCallback(() => {
    until.current = Date.now() + UNLOCK_MS;
  }, []);
  const lock = useCallback(() => {
    until.current = 0;
  }, []);
  const requireGate = useCallback(
    (purpose: GatePurpose, onPass: () => void) => {
      if (isUnlocked()) {
        unlock();
        onPass();
      } else setPending({ purpose, onPass });
    },
    [isUnlocked, unlock],
  );
  const openExternal = useCallback(
    (url: string, purpose: GatePurpose = url.startsWith('mailto:') ? 'email' : 'link') => {
      requireGate(purpose, () => {
        Linking.openURL(url).catch(() => {});
      });
    },
    [requireGate],
  );

  return (
    <Ctx.Provider value={{ requireGate, isUnlocked, unlock, lock, openExternal }}>
      {children}
      <Modal visible={!!pending} animationType="fade" onRequestClose={() => setPending(null)} presentationStyle="fullScreen">
        <SafeAreaView style={styles.modal}>
          {pending ? (
            <ParentalGate
              inset
              purpose={pending.purpose}
              onCancel={() => setPending(null)}
              onPass={() => {
                const p = pending;
                setPending(null);
                unlock();
                p.onPass();
              }}
            />
          ) : null}
        </SafeAreaView>
      </Modal>
    </Ctx.Provider>
  );
}

export function useGate(): GateCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useGate outside GateProvider');
  return v;
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: colors.ground },
  wrap: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: space.lg },
  inset: { padding: space.xl },
  ask: { gap: space.md },
  input: {
    minHeight: touch.primary,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    ...type.h2,
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.ink,
  },
});
