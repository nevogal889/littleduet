import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Linking, Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkGateAnswer, gateQuestion, t } from '../i18n';
import { colors, fonts, radius, space, touch, type } from '../theme';
import { Button, Field, T } from './ui';

export type GatePurpose = 'paywall' | 'settings' | 'link' | 'account' | 'email';

/** Apple 1.3 parental gate: a written math question (numbers spelled out) typed as digits. */
export function ParentalGate({
  purpose,
  onPass,
  onCancel,
  inset,
  compact,
  cancelLabel,
}: {
  purpose: GatePurpose;
  onPass: () => void;
  onCancel?: () => void;
  inset?: boolean;
  /** Onboarding: just "For grown-ups" + the question. */
  compact?: boolean;
  cancelLabel?: string;
}) {
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
    if (checkGateAnswer(q, answer)) {
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
      <Text style={styles.kicker} accessibilityRole="header">
        {t('gate.compactTitle')}
      </Text>
      <T v="h2" testID="gate-question" nativeID="gate-question">
        {q.text}
      </T>
      <Field
        testID="gate-answer"
        accessibilityLabel={`${t('gate.inputLabel')}: ${q.text}`}
        accessibilityLabelledBy="gate-question"
        placeholder={t('gate.inputLabel')}
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
        <T v="body" accessibilityLiveRegion="polite" style={{ color: colors.inkSoft }}>
          {msg}
        </T>
      ) : null}
      <Button testID="gate-submit" label={t('gate.submit')} onPress={submit} disabled={!answer || !!pausedUntil} />
      {onCancel ? <Button testID="gate-cancel" variant="ghost" size="md" label={cancelLabel ?? t('gate.cancel')} onPress={onCancel} /> : null}
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
  wrap: { width: '100%', maxWidth: 520, alignSelf: 'center', gap: space.md },
  inset: { padding: space.xl, paddingTop: space.xxxl },
  kicker: { fontFamily: fonts.extra, fontSize: 13, color: colors.inkSoft, textTransform: 'uppercase', letterSpacing: 1.2 },
  input: { fontFamily: fonts.extra, fontSize: 24 },
});
