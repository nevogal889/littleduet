import { useWindowDimensions } from 'react-native';

/** Brand tokens. Contrast (WCAG): ink/ground 13:1, inkSoft/ground 6.7:1, coralInk/white 5.5:1,
 * white/coral 3.0:1 (used only for >= 20px bold button labels = large text), white/indigo 8:1. */
export const colors = {
  ground: '#EEF3F7',
  surface: '#FFFFFF',
  ink: '#1E2A3A',
  inkSoft: '#4A5668',
  line: '#D3DCE6',
  lineStrong: '#8693A3',
  coral: '#F26B4F',
  coralInk: '#B5432B',
  coralSoft: '#FDE3DC',
  marigold: '#F5B83D',
  marigoldSoft: '#FDF0D2',
  indigo: '#3D4C8C',
  indigoSoft: '#DDE2F3',
  white: '#FFFFFF',
  black: '#000000',
  scrim: 'rgba(30,42,58,0.72)',
  keyWhite: '#FFFFFF',
  keyBlack: '#1E2A3A',
} as const;

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  heading: 'BricolageGrotesque_700Bold',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
} as const;

/** Parent-facing text never goes below 17. */
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40, color: colors.ink },
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.ink },
  h2: { fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, color: colors.ink },
  h3: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 18, lineHeight: 26, color: colors.ink },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 26, color: colors.ink },
  small: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 24, color: colors.inkSoft },
  button: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 24 },
  caption: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, color: colors.ink },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 12, md: 16, lg: 24, pill: 999 } as const;
export const touch = { min: 56, primary: 64 } as const;

export const shadow = {
  card: {
    shadowColor: '#1E2A3A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

export const AGE_TINT: Record<string, { bg: string; fg: string }> = {
  '2-3': { bg: colors.marigoldSoft, fg: colors.ink },
  '3-4': { bg: colors.coralSoft, fg: colors.ink },
  '4-5': { bg: colors.indigoSoft, fg: colors.ink },
  '5-6': { bg: '#DCEFE3', fg: colors.ink },
};

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const short = Math.min(width, height);
  const isTablet = short >= 600;
  const isLandscape = width > height;
  const gutter = width >= 900 ? 40 : isTablet ? 32 : 16;
  const contentWidth = Math.min(width, 1200) - gutter * 2;
  return { width, height, isTablet, isLandscape, gutter, contentWidth };
}
