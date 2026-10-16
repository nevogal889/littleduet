import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EDGE, card, colors, fonts, radius, space, touch, type, useLayout } from '../theme';
import { Icon, type IconName } from './Icon';

type Variant = keyof typeof type;

export function T({ v = 'body', style, ...rest }: TextProps & { v?: Variant; style?: StyleProp<TextStyle> }) {
  return <Text {...rest} style={[type[v], style]} />;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'light' | 'gold';

const VARIANTS: Record<ButtonVariant, { face: string; edge: string; fg: string; border?: string; edgeH: number }> = {
  primary: { face: colors.accent, edge: colors.accentEdge, fg: colors.white, edgeH: EDGE },
  secondary: { face: colors.surface, edge: colors.line, fg: colors.ink, border: colors.line, edgeH: 2 },
  ghost: { face: 'transparent', edge: 'transparent', fg: colors.ink, edgeH: 0 },
  dark: { face: colors.ink, edge: '#1F1F1F', fg: colors.white, edgeH: EDGE },
  light: { face: colors.white, edge: 'rgba(255,255,255,0.35)', fg: colors.ink, edgeH: 2 },
  gold: { face: colors.gold, edge: colors.goldEdge, fg: colors.ink, edgeH: EDGE },
};

/** Game-style button: solid darker bottom edge; pressing sinks the face onto the edge (no layout shift). */
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
  const v = disabled ? { face: colors.locked, edge: colors.lineStrong, fg: colors.faint, edgeH: VARIANTS[variant].edgeH ? 2 : 0, border: undefined } : VARIANTS[variant];
  const h = size === 'lg' ? touch.primary : 48;
  const [down, setDown] = useState(false);
  const caps = variant !== 'ghost';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      style={[{ paddingBottom: v.edgeH }, full ? styles.full : styles.auto, style]}
    >
      {v.edgeH ? <View style={[styles.edge, { top: v.edgeH, backgroundColor: v.edge }]} /> : null}
      <View
        style={[
          styles.face,
          { minHeight: h, backgroundColor: v.face },
          v.border ? { borderWidth: 2, borderColor: v.border } : null,
          down && v.edgeH ? { transform: [{ translateY: v.edgeH }] } : null,
          variant === 'ghost' && down ? { backgroundColor: colors.soft } : null,
        ]}
      >
        {icon ? <Icon name={icon} size={22} color={v.fg} /> : null}
        <Text style={[type.button, { color: v.fg }, !caps && styles.ghostText]} numberOfLines={2}>
          {label}
        </Text>
      </View>
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

export function Chip({ label, selected, onPress, testID, children }: { label: string; selected?: boolean; onPress?: () => void; testID?: string; children?: React.ReactNode }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && !selected && styles.chipPressed]}
    >
      {children}
      <Text style={styles.chipText} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** 16 px, fully rounded, grey track, coral fill. */
export function ProgressBar({ value, color = colors.brand, track = colors.line, height = 16 }: { value: number; color?: string; track?: string; height?: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }} style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden', flexGrow: 1 }}>
      {pct > 0 ? <View style={{ width: `${Math.max(pct, 6)}%`, height, borderRadius: height, backgroundColor: color }} /> : null}
    </View>
  );
}

/** Bar + "45%" (or "Done"). */
export function PercentBar({ percent, doneLabel, testID, height = 16 }: { percent: number; doneLabel?: string; testID?: string; height?: number }) {
  return (
    <View style={styles.pctRow} testID={testID}>
      <ProgressBar value={percent / 100} height={height} />
      <Text style={styles.pctText}>{percent >= 100 && doneLabel ? doneLabel : `${percent}%`}</Text>
    </View>
  );
}

/** Scrollable page with safe-area top, adaptive gutters and a max content width. */
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
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.back, pressed && { backgroundColor: colors.soft }]}>
      <Icon name="chevronLeft" size={24} color={colors.inkSoft} />
      <Text style={[type.label, { color: colors.inkSoft }]}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({ options, value, onChange, testID }: { options: { value: T; label: string; icon?: IconName }[]; value: T; onChange: (v: T) => void; testID?: string }) {
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
            style={({ pressed }) => [styles.segItem, on && styles.segOn, pressed && !on && { backgroundColor: colors.soft }]}
          >
            {o.icon ? <Icon name={o.icon} size={20} color={on ? colors.blueEdge : colors.inkSoft} /> : null}
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
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: radius.md },
  face: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.sm, borderRadius: radius.md },
  full: { alignSelf: 'stretch' },
  auto: { alignSelf: 'flex-start' },
  ghostText: { textDecorationLine: 'underline', textTransform: 'none', letterSpacing: 0, fontFamily: fonts.bold },
  card: { ...card, padding: space.lg },
  cardPressed: { backgroundColor: colors.soft },
  chip: { minHeight: touch.min, paddingHorizontal: space.lg, borderRadius: radius.md, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  chipOn: { backgroundColor: colors.blueSoft, borderColor: '#84D8FF' },
  chipPressed: { backgroundColor: colors.soft },
  chipText: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  pctRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pctText: { fontFamily: fonts.extra, fontSize: 15, color: colors.inkSoft, minWidth: 44, textAlign: 'right' },
  back: { minHeight: touch.min, minWidth: touch.min, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: space.sm, marginLeft: -space.sm, borderRadius: radius.md, alignSelf: 'flex-start' },
  seg: { flexDirection: 'row', gap: space.sm },
  segItem: { flex: 1, minHeight: 52, borderRadius: radius.md, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingHorizontal: space.sm },
  segOn: { backgroundColor: colors.blueSoft, borderColor: '#84D8FF' },
  segText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.inkSoft, textAlign: 'center', flexShrink: 1 },
  segTextOn: { color: colors.ink },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xxl, marginBottom: space.md, gap: space.md },
});
