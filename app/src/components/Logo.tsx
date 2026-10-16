import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Ellipse, G, Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

/**
 * The Little Duet mark: a big note whose beam arches over a small note (grown-up and child).
 * Provisional choice (A1) until the logo is signed off; one component so a swap is one file.
 */
export function LogoMark({ size = 64, mono }: { size?: number; mono?: string }) {
  const big = mono ?? colors.brand;
  const small = mono ?? colors.marigold;
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <G strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M384 262 L384 380" stroke={small} strokeWidth={22} />
        <Ellipse cx={354} cy={388} rx={44} ry={33} transform="rotate(-22 354 388)" fill={small} />
        <Path d="M222 120 L222 344" stroke={big} strokeWidth={30} />
        <Ellipse cx={168} cy={350} rx={78} ry={58} transform="rotate(-22 168 350)" fill={big} />
        <Path d="M222 122 C 300 96, 372 140, 384 262" stroke={big} strokeWidth={34} />
      </G>
    </Svg>
  );
}

/** Mark + wordmark, for the welcome screen. */
export function LogoLockup({ size = 48 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.22 }} accessible accessibilityRole="header" accessibilityLabel="Little Duet">
      <LogoMark size={size} />
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.62, color: colors.ink, letterSpacing: -0.3 }}>Little Duet</Text>
    </View>
  );
}
