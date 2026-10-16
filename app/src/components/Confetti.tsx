import React, { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import { colors, useLayout } from '../theme';

const PALETTE = [colors.coral, colors.marigold, colors.indigo, '#5CAA78', colors.coralSoft];

/** Falling confetti for ~4 s; a still scatter when Reduce Motion is on. Decorative. */
export function Confetti({ count = 40 }: { count?: number }) {
  const { width, height } = useLayout();
  const [t, setT] = useState(0);
  const [still, setStill] = useState(false);
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        // Fall only in the outer margins (0-14% and 86-100% of the width) so pieces never
        // cover the praise text and buttons in the centre column.
        x: i % 2 ? ((i * 97) % 14) : 86 + ((i * 97) % 14),
        delay: ((i * 37) % 20) / 20,
        speed: 0.6 + ((i * 53) % 40) / 50,
        rot: (i * 47) % 360,
        spin: ((i % 2 ? 1 : -1) * (120 + ((i * 29) % 240))),
        color: PALETTE[i % PALETTE.length],
        w: 10 + (i % 3) * 4,
        h: 14 + (i % 4) * 3,
      })),
    [count],
  );

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => setStill(!!v))
      .catch(() => {});
    const start = Date.now();
    let raf = 0;
    const loop = () => {
      const s = (Date.now() - start) / 1000;
      setT(s);
      if (s < 4.5) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {pieces.map((p, i) => {
        const life = still ? 0.2 + ((i * 13) % 60) / 100 : Math.max(0, t - p.delay) * p.speed * 0.45;
        if (!still && (life <= 0 || life > 1.2)) return null;
        const y = -20 + life * (height + 40);
        const x = (p.x / 100) * width + Math.sin((life + p.delay) * 6) * 18;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.w,
              height: p.h,
              borderRadius: 3,
              backgroundColor: p.color,
              opacity: still ? 0.9 : Math.max(0, 1 - Math.max(0, life - 0.9) * 3),
              transform: [{ rotate: `${p.rot + (still ? 0 : life * p.spin)}deg` }],
            }}
          />
        );
      })}
    </View>
  );
}
