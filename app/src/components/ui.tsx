import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EDGE, card, colors, fonts, radius, shadow, space, touch, type, useLayout } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = keyof typeof type;

export function T({ v = 'body', style, ...rest }: TextProps & { v?: Variant; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[type[v], style]} />;
}

/** Reduce Motion: animations jump to their end state. */
export function useReduceMotion(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => setOn(!!v))
      .catch(() => {});
  }, []);
  return on;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'light' | 'gold';

const VARIANTS: Record<ButtonVariant, { face: string; edge: string; fg: string; edgeH: number; lifted?: boolean }> = {
  primary: { face: colors.accent, edge: colors.accentEdge, fg: colors.white, edgeH: EDGE },
  secondary: { face: colors.surface, edge: colors.secondaryEdge, fg: colors.ink, edgeH: EDGE, lifted: true },
  ghost: { face: 'transparent', edge: 'transparent', fg: colors.ink, edgeH: 0 },
  dark: { face: colors.ink, edge: '#0E1622', fg: colors.white, edgeH: EDGE },
  light: { face: colors.white, edge: 'rgba(255,255,255,0.35)', fg: colors.ink, edgeH: EDGE },
  gold: { face: colors.gold, edge: colors.goldEdge, fg: colors.ink, edgeH: EDGE },
};

/**
 * Tactile button: a darker 4 px edge under the face; pressing drops the face 2 px onto it
 * (150 ms ease-out), so 2 px of edge stays visible. No layout shift.
 */
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
  const base = VARIANTS[variant];
  const v = disabled ? { ...base, face: colors.locked, edge: colors.lineStrong, fg: colors.inkSoft, lifted: false } : base;
  const h = size === 'lg' ? touch.primary : 48;
  const press = useRef(new Animated.Value(0)).current;
  const still = useReduceMotion();
  const to = (n: number) => {
    if (still) press.setValue(n);
    else Animated.timing(press, { toValue: n, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };
  const ghost = variant === 'ghost';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => to(1)}
      onPressOut={() => to(0)}
      style={[{ paddingBottom: v.edgeH }, full ? styles.full : styles.auto, style]}
    >
      {v.edgeH ? <View style={[styles.edge, { top: v.edgeH, backgroundColor: v.edge }]} /> : null}
      <Animated.View
        style={[
          styles.face,
          { minHeight: h, backgroundColor: v.face },
          v.lifted ? shadow.card : null,
          v.edgeH ? { transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, v.edgeH / 2] }) }] } : null,
        ]}
      >
        {icon ? <Icon name={icon} size={22} color={v.fg} /> : null}
        <Text style={[type.button, { color: v.fg }, size === 'md' && { fontSize: 17 }, ghost && styles.ghostText]} numberOfLines={2}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function Card({ children, style, onPress, testID, accessibilityLabel }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; testID?: string; accessibilityLabel?: string }) {
  if (onPress) {
    return (
      <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed, style]}>
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

/** Capsule chip: soft fill; selected = white lifted pill with bold navy text. */
export function Chip({ label, selected, onPress, testID, children }: { label: string; selected?: boolean; onPress?: () => void; testID?: string; children?: React.ReactNode }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && !selected && { opacity: 0.75 }]}
    >
      {children}
      <Text style={[styles.chipText, selected && styles.chipTextOn]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Text field: white, no border; a 2 px coral (40%) ring appears only while focused. */
export function Field({ style, onFocus, onBlur, ...rest }: TextInputProps & { style?: StyleProp<TextStyle> }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.inkSoft}
      {...rest}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={[styles.field, focused && styles.fieldFocus, style]}
    />
  );
}

/** 16 px, fully rounded, soft track, coral fill. */
export function ProgressBar({ value, color = colors.brand, track = colors.soft, height = 14 }: { value: number; color?: string; track?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }} style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden', flexGrow: 1 }}>
      {pct > 0 ? <View style={{ width: `${Math.max(pct, 6)}%`, height, borderRadius: height, backgroundColor: color }} /> : null}
    </View>
  );
}

/** Bar + "45%" (or "Done"). */
export function PercentBar({ percent, doneLabel, testID, height = 14 }: { percent: number; doneLabel?: string; testID?: string; height?: number }) {
  return (
    <View style={styles.pctRow} testID={testID}>
      <ProgressBar value={percent / 100} height={height} />
      <Text style={styles.pctText}>{percent >= 100 && doneLabel ? doneLabel : `${percent}%`}</Text>
    </View>
  );
}

/** Scrollable page on the cream canvas with adaptive gutters and a max content width. */
export function Screen({ children, scroll = true, testID, edges = ['top'], transparent }: { children: React.ReactNode; scroll?: boolean; testID?: string; edges?: ('top' | 'bottom')[]; transparent?: boolean }) {
  const { gutter } = useLayout();
  const inner = <View style={[styles.inner, { paddingHorizontal: gutter }]}>{children}</View>;
  return (
    <SafeAreaView testID={testID} edges={edges} style={[styles.screen, transparent && { backgroundColor: 'transparent' }]}>
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
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
      <Icon name="chevronLeft" size={24} color={colors.ink} />
      <Text style={[type.label, { color: colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** One capsule with a white pill that slides behind the selected label. */
export function Segmented<T extends string>({ options, value, onChange, testID }: { options: { value: T; label: string; icon?: IconName }[]; value: T; onChange: (v: T) => void; testID?: string }) {
  const [w, setW] = useState(0);
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const x = useRef(new Animated.Value(idx)).current;
  const still = useReduceMotion();
  useEffect(() => {
    if (still) x.setValue(idx);
    else Animated.spring(x, { toValue: idx, useNativeDriver: true, speed: 18, bounciness: 4 }).start();
  }, [idx, still, x]);
  const pillW = w ? (w - 8) / options.length : 0;
  return (
    <View testID={testID} style={styles.seg} accessibilityRole="radiogroup" onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {pillW ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.segPill, { width: pillW, transform: [{ translateX: x.interpolate({ inputRange: [0, Math.max(1, options.length - 1)], outputRange: [0, pillW * Math.max(1, options.length - 1)] }) }] }]}
        />
      ) : null}
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
            style={styles.segItem}
          >
            {o.icon ? <Icon name={o.icon} size={20} color={on ? colors.ink : colors.inkSoft} /> : null}
            <Text style={[styles.segText, on && styles.segTextOn]} numberOfLines={2}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionTitle({ children, testID, action }: { children: React.ReactNode; testID?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <T v="h2" testID={testID} accessibilityRole="header" style={{ flexShrink: 1 }}>
        {children}
      </T>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ground },
  scrollContent: { paddingBottom: space.xxxl },
  inner: { width: '100%', maxWidth: 1100, alignSelf: 'center' },
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: radius.md + 2 },
  face: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.sm, borderRadius: radius.md + 2 },
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  ghostText: { textDecorationLine: 'underline', textTransform: 'none', letterSpacing: 0, fontFamily: fonts.bold, fontSize: 17 },
  card: { ...card, padding: space.lg },
  cardPressed: { opacity: 0.92 },
  chip: { minHeight: touch.min, paddingHorizontal: space.lg, borderRadius: radius.pill, backgroundColor: colors.soft, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  chipOn: { backgroundColor: colors.surface, ...shadow.card },
  chipText: { fontFamily: fonts.bold, fontSize: 15, color: colors.inkSoft },
  chipTextOn: { fontFamily: fonts.extra, color: colors.ink },
  field: { minHeight: touch.primary, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: 'transparent', paddingHorizontal: space.lg, fontFamily: fonts.bold, fontSize: 18, color: colors.ink, ...shadow.card },
  fieldFocus: { borderColor: colors.focus },
  pctRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pctText: { ...type.meta, minWidth: 48, textAlign: 'right' },
  back: { minHeight: touch.min, minWidth: touch.min, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: space.sm, marginLeft: -space.sm, borderRadius: radius.md, alignSelf: 'flex-start' },
  seg: { flexDirection: 'row', backgroundColor: colors.soft, borderRadius: radius.pill, padding: 4, position: 'relative' },
  segPill: { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: radius.pill, backgroundColor: colors.surface, ...shadow.card },
  segItem: { flex: 1, minHeight: 48, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.sm },
  segText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.inkSoft, textAlign: 'center', flexShrink: 1 },
  segTextOn: { fontFamily: fonts.extra, color: colors.ink },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xxl, marginBottom: space.md, gap: space.md },
});
