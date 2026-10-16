import { useWindowDimensions } from 'react-native';

/**
 * Little Duet design tokens (principal-designer spec): warm cream canvas, white cards lifted
 * by layered ambient shadows (no grey borders), Nunito, tactile coral buttons, our own brand
 * (no mascot). One meaning per colour: coral = brand / current / progress, orange = streak,
 * gold = stars, blue = info, green = "done" ticks, grey = locked.
 *
 * Contrast (WCAG): navy #1E2A3A on cream 13.6:1, body #4B4B4B 8.3:1, muted #737373 4.5:1 on white.
 * Primary button labels are 19 px Nunito 800 = "large text" (>= 18.66 px bold), so white on
 * #F2674E (3.1:1) passes AA large (3:1). Never use white text on coral below 18.66 px bold.
 */
export const colors = {
  ground: '#FAF8F5',
  surface: '#FFFFFF',
  soft: '#F1ECE6',
  line: '#ECE6DF',
  lineStrong: '#D9D1C7',
  ink: '#1E2A3A',
  body: '#4B4B4B',
  inkSoft: '#737373',
  faint: '#B3ABA1',
  // brand coral
  brand: '#F2674E',
  brandEdge: '#CC452D',
  brandSoft: '#FDEBE7',
  /** primary button fill + edge (19 px bold labels) */
  accent: '#F2674E',
  accentEdge: '#CC452D',
  accentPressed: '#F2674E',
  accentSoft: '#FDEBE7',
  secondaryEdge: '#E9E2DA',
  /** focus ring: coral at 40% */
  focus: 'rgba(242,103,78,0.4)',
  // meanings
  streak: '#FF9600',
  streakEdge: '#CC7700',
  streakSoft: 'rgba(255,150,0,0.10)',
  gold: '#FFC800',
  goldEdge: '#CC9F00',
  goldSoft: 'rgba(255,200,0,0.10)',
  blue: '#1CB0F6',
  blueEdge: '#0A8ACF',
  blueSoft: 'rgba(28,176,246,0.10)',
  green: '#58A700',
  greenSoft: 'rgba(88,167,0,0.10)',
  locked: '#E9E2DA',
  lockedInk: '#B3ABA1',
  selected: '#1E2A3A',
  selectedSoft: '#F1ECE6',
  white: '#FFFFFF',
  black: '#000000',
  scrim: 'rgba(30,42,58,0.5)',
  // ---- lesson-only palette (players, keyboard; bear/bird low/high cues) ----
  coral: '#F26B4F',
  coralInk: '#B5432B',
  coralSoft: '#FDE3DC',
  marigold: '#F5B83D',
  marigoldSoft: '#FDF0D2',
  indigo: '#3D4C8C',
  indigoSoft: '#DDE2F3',
  keyWhite: '#FFFFFF',
  keyBlack: '#1E2A3A',
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  medium: 'Nunito_700Bold',
  bold: 'Nunito_700Bold',
  extra: 'Nunito_800ExtraBold',
  display: 'Nunito_800ExtraBold',
  heading: 'Nunito_800ExtraBold',
  body: 'Nunito_600SemiBold',
} as const;

/** Nunito Bold for UI; 800 for headings, numbers and buttons. */
export const type = {
  hero: { fontFamily: fonts.extra, fontSize: 32, lineHeight: 38, color: colors.ink },
  h1: { fontFamily: fonts.extra, fontSize: 28, lineHeight: 34, color: colors.ink },
  h2: { fontFamily: fonts.extra, fontSize: 22, lineHeight: 28, color: colors.ink },
  h3: { fontFamily: fonts.extra, fontSize: 19, lineHeight: 25, color: colors.ink },
  body: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 25, color: colors.body },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 25, color: colors.ink },
  small: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
  label: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.inkSoft },
  /** Metadata tags (age group, difficulty, "8 classes · 33 min", UP NEXT, %, counters). */
  meta: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 18, color: colors.inkSoft, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  button: { fontFamily: fonts.extra, fontSize: 19, lineHeight: 24, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  number: { fontFamily: fonts.extra, fontSize: 22, lineHeight: 26, color: colors.ink },
  caption: { fontFamily: fonts.extra, fontSize: 30, lineHeight: 36, color: colors.ink },
} as const;

/** Spacing scaled +24% over the previous set (16->20, 24->30, ...). */
export const space = { xs: 5, sm: 10, md: 15, lg: 20, xl: 30, xxl: 40, xxxl: 60 } as const;
export const radius = { sm: 12, md: 16, card: 24, lg: 24, squircle: 28, pill: 999 } as const;
export const touch = { min: 44, primary: 56 } as const;
/** Height of the solid 3D edge under buttons and path nodes. */
export const EDGE = 4;

/**
 * Card elevation. `spec` = the designer's exact values (very subtle on cream); `strong` = a
 * more visible navy-tinted variant for comparison. Dev flag: SHADOW_VARIANT, or on web
 * window.__LD_SHADOW = 'strong' | 'spec' (used to render both for review).
 */
export const SHADOW_VARIANT: 'spec' | 'strong' = 'strong';
const SHADOWS = {
  spec: '0 10px 30px -5px rgba(0,0,0,0.02), 0 4px 12px -2px rgba(0,0,0,0.01)',
  strong: '0 10px 30px -5px rgba(30,42,58,0.08), 0 4px 12px -2px rgba(30,42,58,0.05)',
};
const variant: 'spec' | 'strong' = ((globalThis as any).__LD_SHADOW as 'spec' | 'strong') || SHADOW_VARIANT;
export const shadow = {
  card: { boxShadow: SHADOWS[variant] },
  cardStrong: { boxShadow: SHADOWS.strong },
  cardSpec: { boxShadow: SHADOWS.spec },
} as const;
/** White card on the cream canvas: radius 24, ambient shadow, no border. */
export const card = { backgroundColor: colors.surface, borderRadius: radius.card, ...shadow.card } as const;

/** Soft tints behind song art when no cover image exists. */
export const AGE_TINT: Record<string, { bg: string; fg: string }> = {
  '2-3': { bg: '#FFF6D9', fg: colors.ink },
  '3-4': { bg: '#FDEBE7', fg: colors.ink },
  '4-5': { bg: '#E3F5FD', fg: colors.ink },
  '5-6': { bg: '#EAF4DF', fg: colors.ink },
};

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const short = Math.min(width, height);
  const isTablet = short >= 600;
  const isLandscape = width > height;
  const gutter = width >= 900 ? 50 : isTablet ? 40 : 20;
  const contentWidth = Math.min(width, 1100) - gutter * 2;
  return { width, height, isTablet, isLandscape, gutter, contentWidth };
}
