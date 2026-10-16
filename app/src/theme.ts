import { useWindowDimensions } from 'react-native';

/**
 * Little Duet design tokens: playful, game-like, our own brand (no mascot).
 * One meaning per colour: coral = brand / current / progress, orange = streak,
 * gold = stars, blue = info & selection, green = "done" ticks, grey = locked.
 *
 * Contrast (WCAG): text #3C3C3C 11:1, body #4B4B4B 8.7:1, muted #737373 4.7:1 on white
 * (the brief's #777777 is 4.48:1, nudged to pass). Brand coral #F2674E with white text is
 * only 3.1:1, so primary BUTTONS use the darker fill #CC452D (4.7:1 at 17 px bold);
 * #F2674E stays for progress fills, the current path node and tints (non-text, >= 3:1).
 * Blue and green are used as fills/borders/icons, never as small text.
 */
export const colors = {
  ground: '#FFFFFF',
  surface: '#FFFFFF',
  soft: '#F7F7F7',
  line: '#E5E5E5',
  lineStrong: '#D4D4D4',
  ink: '#3C3C3C',
  body: '#4B4B4B',
  inkSoft: '#737373',
  faint: '#AFAFAF',
  // brand coral
  brand: '#F2674E',
  brandEdge: '#C9503A',
  brandSoft: '#FDE9E5',
  /** primary button fill (white text passes AA) */
  accent: '#CC452D',
  accentEdge: '#9E3220',
  accentPressed: '#CC452D',
  accentSoft: '#FDE9E5',
  // meanings
  streak: '#FF9600',
  streakEdge: '#CC7700',
  streakSoft: '#FFF1DC',
  gold: '#FFC800',
  goldEdge: '#CC9F00',
  goldSoft: '#FFF6D1',
  blue: '#1CB0F6',
  blueEdge: '#0A8ACF',
  blueSoft: '#DDF4FF',
  green: '#58A700',
  greenSoft: '#E6F4D7',
  locked: '#E5E5E5',
  lockedInk: '#AFAFAF',
  // selection = info blue
  selected: '#1CB0F6',
  selectedSoft: '#F7F7F7',
  white: '#FFFFFF',
  black: '#000000',
  scrim: 'rgba(60,60,60,0.55)',
  // ---- lesson-only palette (players, keyboard; bear/bird low/high cues) ----
  coral: '#F26B4F',
  coralInk: '#B5432B',
  coralSoft: '#FDE3DC',
  marigold: '#F5B83D',
  marigoldSoft: '#FDF0D2',
  indigo: '#3D4C8C',
  indigoSoft: '#DDE2F3',
  keyWhite: '#FFFFFF',
  keyBlack: '#3C3C3C',
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  medium: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extra: 'Nunito_800ExtraBold',
  // aliases used by lesson screens
  display: 'Nunito_800ExtraBold',
  heading: 'Nunito_800ExtraBold',
  body: 'Nunito_400Regular',
} as const;

/** Nunito: 800 headings/buttons/numbers, 700 labels, 400/600 body. h1 28, h2 22, h3 19, body 17, label 15. */
export const type = {
  hero: { fontFamily: fonts.extra, fontSize: 32, lineHeight: 38, color: colors.ink },
  h1: { fontFamily: fonts.extra, fontSize: 28, lineHeight: 34, color: colors.ink },
  h2: { fontFamily: fonts.extra, fontSize: 22, lineHeight: 28, color: colors.ink },
  h3: { fontFamily: fonts.extra, fontSize: 19, lineHeight: 25, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 25, color: colors.body },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 25, color: colors.ink },
  small: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
  label: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.inkSoft },
  button: { fontFamily: fonts.extra, fontSize: 17, lineHeight: 22, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  number: { fontFamily: fonts.extra, fontSize: 28, lineHeight: 32, color: colors.ink },
  caption: { fontFamily: fonts.extra, fontSize: 30, lineHeight: 36, color: colors.ink },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 12, md: 16, card: 16, lg: 16, pill: 999 } as const;
export const touch = { min: 44, primary: 56 } as const;
/** Height of the solid 3D edge under buttons and path nodes. */
export const EDGE = 4;

/** No soft shadows in this style: cards use a 2 px border instead. */
export const shadow = { card: {} } as const;
export const card = { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 2, borderColor: colors.line } as const;

/** Soft tints behind song art when no cover image exists. */
export const AGE_TINT: Record<string, { bg: string; fg: string }> = {
  '2-3': { bg: '#FFF6D1', fg: colors.ink },
  '3-4': { bg: '#FDE9E5', fg: colors.ink },
  '4-5': { bg: '#DDF4FF', fg: colors.ink },
  '5-6': { bg: '#E6F4D7', fg: colors.ink },
};

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const short = Math.min(width, height);
  const isTablet = short >= 600;
  const isLandscape = width > height;
  const gutter = width >= 900 ? 40 : isTablet ? 32 : 16;
  const contentWidth = Math.min(width, 1100) - gutter * 2;
  return { width, height, isTablet, isLandscape, gutter, contentWidth };
}
