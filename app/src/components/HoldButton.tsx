import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, space, touch, type } from '../theme';
import { Icon, type IconName } from './Icon';

/**
 * Press-and-hold button: fills while held, fires after `ms`. Letting go early resets.
 * Screen-reader users can activate it directly (the gate's question is the real check).
 */
export function HoldButton({
  label,
  hint,
  ms,
  onComplete,
  icon = 'lock',
  testID,
  compact,
  dark,
  style,
}: {
  label: string;
  hint?: string;
  ms: number;
  onComplete: () => void;
  icon?: IconName;
  testID?: string;
  compact?: boolean;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [p, setP] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (raf.current) clearInterval(raf.current);
    raf.current = null;
    start.current = null;
    setP(0);
  };
  useEffect(() => stop, []);

  const begin = () => {
    start.current = Date.now();
    if (raf.current) clearInterval(raf.current);
    raf.current = setInterval(() => {
      if (start.current === null) return;
      const v = Math.min(1, (Date.now() - start.current) / ms);
      setP(v);
      if (v >= 1) {
        stop();
        onComplete();
      }
    }, 40);
  };

  const fg = dark ? colors.white : colors.ink;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => onComplete()}
      onPressIn={begin}
      onPressOut={stop}
      style={[styles.btn, compact ? styles.compact : styles.large, dark ? styles.dark : styles.light, style]}
    >
      <View style={[styles.fill, { width: `${p * 100}%`, backgroundColor: dark ? 'rgba(245,184,61,0.55)' : colors.marigold }]} />
      <Icon name={icon} size={compact ? 24 : 30} color={fg} />
      <View style={styles.texts}>
        <Text style={[type.button, { color: fg }]} numberOfLines={2}>
          {label}
        </Text>
        {hint && !compact ? (
          <Text style={[type.small, { color: dark ? colors.white : colors.inkSoft }]} numberOfLines={2}>
            {hint}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
  },
  large: { minHeight: 88, paddingHorizontal: space.xl, paddingVertical: space.md },
  compact: { minHeight: touch.min, paddingHorizontal: space.lg },
  light: { backgroundColor: colors.surface, borderColor: colors.lineStrong },
  dark: { backgroundColor: 'rgba(30,42,58,0.82)', borderColor: 'rgba(255,255,255,0.5)' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  texts: { flexShrink: 1, gap: 2 },
});
