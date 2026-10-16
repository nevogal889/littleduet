import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import { t } from '../i18n';
import { isBlack, letterOf, pitchOf } from '../lib/music';
import { colors, fonts, radius } from '../theme';

export interface KeyLayout {
  p: string;
  midi: number;
  black: boolean;
  x: number;
  w: number;
  h: number;
}

export function layoutKeys(low: number, high: number, width: number, height: number): KeyLayout[] {
  const whites = [];
  for (let m = low; m <= high; m++) if (!isBlack(m)) whites.push(m);
  const kw = width / whites.length;
  const bw = kw * 0.6;
  const out: KeyLayout[] = [];
  let wi = 0;
  for (let m = low; m <= high; m++) {
    if (!isBlack(m)) {
      out.push({ p: pitchOf(m), midi: m, black: false, x: wi * kw, w: kw, h: height });
      wi++;
    } else {
      out.push({ p: pitchOf(m), midi: m, black: true, x: wi * kw - bw / 2, w: bw, h: height * 0.6 });
    }
  }
  return out;
}

/** Center x of a pitch's lane (for falling notes), or null when off the keyboard. */
export function laneX(keys: KeyLayout[], p: string): { x: number; w: number; black: boolean } | null {
  const k = keys.find((q) => q.p === p);
  return k ? { x: k.x + k.w / 2, w: k.w, black: k.black } : null;
}

export function Keyboard({
  keys,
  width,
  height,
  lit,
  hint,
  flash,
  fingers,
  sides,
  onKey,
}: {
  keys: KeyLayout[];
  width: number;
  height: number;
  lit: string[];
  hint: string | null;
  /** pitch -> true while flashing after a correct tap */
  flash: Record<string, boolean>;
  fingers: Record<string, number | undefined>;
  /** high_low games: tint the halves */
  sides?: { split: number; target: 'low' | 'high' } | null;
  onKey: (p: string) => void;
}) {
  const origin = useRef({ x: 0, y: 0 });
  const viewRef = useRef<View>(null);
  const litSet = useMemo(() => new Set(lit), [lit]);
  // Gentle glow on the right key after a wrong tap (no red, no fail sound).
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (!hint) return;
    const id = setInterval(() => setPulse((v) => !v), 450);
    return () => clearInterval(id);
  }, [hint]);

  const onLayout = (_e: LayoutChangeEvent) => {
    viewRef.current?.measureInWindow?.((x, y) => (origin.current = { x, y }));
  };

  // Native: one responder-free touch handler on the whole keyboard = true multi-touch.
  const hitTest = (px: number, py: number): string | null => {
    const x = px - origin.current.x;
    const y = py - origin.current.y;
    for (const k of keys) if (k.black && x >= k.x && x <= k.x + k.w && y <= k.h) return k.p;
    for (const k of keys) if (!k.black && x >= k.x && x < k.x + k.w) return k.p;
    return null;
  };
  const onTouchStart = (e: GestureResponderEvent) => {
    for (const touch of e.nativeEvent.changedTouches ?? [e.nativeEvent]) {
      const p = hitTest(touch.pageX, touch.pageY);
      if (p) onKey(p);
    }
  };
  const native = Platform.OS !== 'web';

  const renderKey = (k: KeyLayout) => {
    const isLit = litSet.has(k.p);
    const isHint = hint === k.p;
    const isFlash = flash[k.p];
    const side = sides ? (k.midi >= sides.split ? 'high' : 'low') : null;
    let bg = k.black ? colors.keyBlack : colors.keyWhite;
    if (side && !k.black) bg = side === 'low' ? '#E6E9F6' : '#FDF3DC';
    if (isLit) bg = colors.marigold;
    if (isHint) bg = k.black ? colors.coral : colors.coralSoft;
    if (isFlash) bg = colors.marigold;
    const finger = isLit ? fingers[k.p] : undefined;
    const label = isLit || isHint ? t('a11y.pianoKeyGlowing', { note: letterOf(k.p) }) : t('a11y.pianoKey', { note: letterOf(k.p) });
    const style = [
      k.black ? styles.black : styles.white,
      { left: k.x, width: k.w, height: k.h, backgroundColor: bg },
      isLit && !k.black && styles.litWhite,
      isHint && styles.hint,
      isHint && pulse && styles.hintPulse,
    ];
    const content = (
      <>
        {finger ? (
          <View style={[styles.finger, k.black && { bottom: 10 }]}>
            <Text style={styles.fingerText}>{finger}</Text>
          </View>
        ) : null}
        {!k.black ? <Text style={[styles.letter, (isLit || isHint) && { color: colors.ink }]}>{letterOf(k.p)}</Text> : null}
      </>
    );
    if (native) {
      return (
        <View key={k.p} testID={`key-${k.p}`} accessible accessibilityRole="button" accessibilityLabel={label} onAccessibilityTap={() => onKey(k.p)} style={style} pointerEvents="none">
          {content}
        </View>
      );
    }
    return (
      <Pressable key={k.p} testID={`key-${k.p}`} accessibilityRole="button" accessibilityLabel={label} onPressIn={() => onKey(k.p)} style={style}>
        {content}
      </Pressable>
    );
  };

  return (
    <View
      ref={viewRef}
      onLayout={onLayout}
      onTouchStart={native ? onTouchStart : undefined}
      style={[styles.board, { width, height }]}
      testID="keyboard"
    >
      {keys.filter((k) => !k.black).map(renderKey)}
      {keys.filter((k) => k.black).map(renderKey)}
      {sides ? (
        <View pointerEvents="none" style={styles.sideLabels}>
          <Text style={[styles.sideText, { color: colors.indigo }, sides.target === 'low' && styles.sideOn]}>{t('piano.lowLabel')}</Text>
          <Text style={[styles.sideText, { color: colors.ink }, sides.target === 'high' && styles.sideOn]}>{t('piano.highLabel')}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { position: 'relative', alignSelf: 'center' },
  white: {
    position: 'absolute',
    top: 0,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  litWhite: { borderColor: '#C98E14' },
  black: {
    position: 'absolute',
    top: 0,
    zIndex: 2,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  hint: { borderWidth: 5, borderColor: colors.coral },
  hintPulse: { backgroundColor: colors.coral },
  letter: { fontFamily: fonts.bold, fontSize: 17, color: colors.inkSoft },
  finger: {
    position: 'absolute',
    bottom: 44,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerText: { fontFamily: fonts.display, fontSize: 20, color: colors.white },
  sideLabels: { position: 'absolute', top: -40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around' },
  sideText: { fontFamily: fonts.display, fontSize: 24, opacity: 0.6 },
  sideOn: { opacity: 1, textDecorationLine: 'underline' },
});
