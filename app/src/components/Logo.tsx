import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

/**
 * The Little Duet mark ("Note friends", A2): a big note whose beam arches over a small note,
 * both smiling (grown-up and child). Master artwork: brand/logo/mark.svg.
 * `faces={false}` drops the faces for tiny sizes (under ~40 px), like the favicon.
 */
export function LogoMark({ size = 64, faces = size >= 40 }: { size?: number; faces?: boolean }) {
  const ink = colors.ink;
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <G transform="translate(11 -12)" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M384 262 L384 380" stroke={colors.marigold} strokeWidth={22} />
        <Ellipse cx={352} cy={388} rx={50} ry={38} transform="rotate(-16 352 388)" fill={colors.marigold} />
        <Path d="M226 120 L226 340" stroke={colors.brand} strokeWidth={30} />
        <Ellipse cx={166} cy={348} rx={86} ry={64} transform="rotate(-16 166 348)" fill={colors.brand} />
        <Path d="M226 122 C 304 96, 372 140, 384 262" stroke={colors.brand} strokeWidth={34} />
        {faces ? (
          <>
            <Circle cx={140} cy={342} r={10} fill={ink} />
            <Circle cx={188} cy={330} r={10} fill={ink} />
            <Path d="M146 370 Q170 388 196 362" stroke={ink} strokeWidth={9} />
            <Circle cx={336} cy={388} r={7.5} fill={ink} />
            <Circle cx={366} cy={379} r={7.5} fill={ink} />
            <Path d="M341 406 Q356 416 371 401" stroke={ink} strokeWidth={7} />
          </>
        ) : null}
      </G>
    </Svg>
  );
}

/** Mark + wordmark, for the welcome screen. */
export function LogoLockup({ size = 48 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.2 }} accessible accessibilityRole="header" accessibilityLabel="Little Duet">
      <LogoMark size={size} />
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.62, color: colors.ink, letterSpacing: -0.3 }}>Little Duet</Text>
    </View>
  );
}
