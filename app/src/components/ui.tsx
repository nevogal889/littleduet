import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, space, touch, type, useLayout } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = keyof typeof type;

export function T({ v = 'body', style, ...rest }: TextProps & { v?: Variant; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[type[v], style]} />;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'light';

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  disabled,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  full = true,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'lg' | 'md';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  full?: boolean;
}) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { minHeight: size === 'lg' ? touch.primary : touch.min, backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border },
        full ? styles.full : styles.auto,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={26} color={v.fg} /> : null}
      <Text style={[type.button, { color: v.fg }, variant === 'ghost' && styles.ghostText]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const VARIANTS: Record<ButtonVariant, { bg: string; pressed: string; fg: string; border: string }> = {
  primary: { bg: colors.coral, pressed: '#DD5A3F', fg: colors.white, border: colors.coral },
  secondary: { bg: colors.surface, pressed: colors.indigoSoft, fg: colors.ink, border: colors.lineStrong },
  ghost: { bg: 'transparent', pressed: colors.indigoSoft, fg: colors.ink, border: 'transparent' },
  dark: { bg: colors.ink, pressed: '#334257', fg: colors.white, border: colors.ink },
  light: { bg: 'rgba(255,255,255,0.94)', pressed: colors.white, fg: colors.ink, border: 'transparent' },
};

export function Card({ children, style, onPress, testID, accessibilityLabel }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; testID?: string; accessibilityLabel?: string }) {
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  testID,
  children,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
  children?: React.ReactNode;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && !selected && styles.chipPressed]}
    >
      {selected ? <Icon name="check" size={20} color={colors.white} /> : null}
      {children}
      <Text style={[styles.chipText, selected && { color: colors.white }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ProgressBar({ value, color = colors.coral, track = colors.line, height = 8 }: { value: number; color?: string; track?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}
    >
      <View style={{ width: `${pct}%`, height, borderRadius: height, backgroundColor: color }} />
    </View>
  );
}

/** Scrollable page with safe-area top, adaptive gutters and a max content width. */
export function Screen({ children, scroll = true, testID, edges = ['top'] }: { children: React.ReactNode; scroll?: boolean; testID?: string; edges?: ('top' | 'bottom')[] }) {
  const { gutter } = useLayout();
  const inner = <View style={[styles.inner, { paddingHorizontal: gutter }]}>{children}</View>;
  return (
    <SafeAreaView testID={testID} edges={edges} style={styles.screen}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

export function BackButton({ onPress, label = 'Back', testID = 'back' }: { onPress: () => void; label?: string; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.indigoSoft }]}
    >
      <Icon name="chevronLeft" size={26} />
      <Text style={[type.bodyStrong]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  testID,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
}) {
  return (
    <View testID={testID} style={styles.seg} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={testID ? `${testID}-${o.value}` : undefined}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.value)}
            style={({ pressed }) => [styles.segItem, on && styles.segOn, pressed && !on && { backgroundColor: colors.indigoSoft }]}
          >
            {o.icon ? <Icon name={o.icon} size={24} color={on ? colors.white : colors.ink} /> : null}
            <Text style={[styles.segText, on && { color: colors.white }]} numberOfLines={2}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionTitle({ children, testID }: { children: React.ReactNode; testID?: string }) {
  return (
    <T v="h2" testID={testID} accessibilityRole="header" style={{ marginTop: space.xl, marginBottom: space.md }}>
      {children}
    </T>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  scrollContent: { paddingBottom: space.xxl },
  inner: { width: '100%', maxWidth: 1200, alignSelf: 'center' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  disabled: { opacity: 0.45 },
  ghostText: { textDecorationLine: 'underline' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.card },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  chip: {
    minHeight: touch.min,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  chipOn: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  chipPressed: { backgroundColor: colors.indigoSoft },
  chipText: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  back: {
    minHeight: touch.min,
    minWidth: touch.min,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  seg: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    padding: 4,
    gap: 4,
  },
  segItem: {
    flex: 1,
    minHeight: touch.min - 4,
    borderRadius: radius.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.sm,
  },
  segOn: { backgroundColor: colors.indigo },
  segText: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 21, color: colors.ink, textAlign: 'center', flexShrink: 1 },
});
