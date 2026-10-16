import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { t } from '../i18n';
import { space } from '../theme';
import { HoldButton } from './HoldButton';

/**
 * Parent controls stay hidden behind a 2-second hold so toddler taps never exit or pause.
 * Unlocked controls re-lock after 6 s without a tap (unless `stayOpen`, e.g. while paused).
 */
export function usePlayerLock(stayOpen: boolean) {
  const [unlocked, setUnlocked] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const poke = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setUnlocked(false), 6000);
  }, []);
  useEffect(() => {
    if (unlocked && !stayOpen) poke();
    if (stayOpen && timer.current) clearTimeout(timer.current);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [unlocked, stayOpen, poke]);
  return {
    unlocked,
    unlock: () => setUnlocked(true),
    lock: () => setUnlocked(false),
    poke,
  };
}

export function LockPill({ onUnlock, dark }: { onUnlock: () => void; dark?: boolean }) {
  return (
    <View style={styles.pill}>
      <HoldButton
        testID="hold-unlock"
        compact
        dark={dark}
        ms={2000}
        icon="lock"
        label={t('player.holdToUnlock')}
        hint={t('player.holdToUnlockHint')}
        onComplete={onUnlock}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-end', margin: space.sm },
});
