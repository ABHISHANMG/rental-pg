/**
 * Design system — "Soft Neo-Brutalist + Minimal Marketplace"
 *
 * Principles:
 *  - Warm cream canvas, white surfaces.
 *  - Confident 2px ink borders on interactive surfaces.
 *  - Hard, offset, blur-less shadows (see components/Surface) instead of soft elevation.
 *  - Chunky-but-soft rounded corners.
 *  - Bold, high-contrast typography with a few punchy pastel accents.
 *
 * Everything a screen needs is exported from a single `theme` object so styling
 * stays consistent and centralized (no magic numbers scattered across screens).
 */

export const colors = {
  // Canvas & surfaces
  bg: '#FBF8F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EEE3',
  surfaceSunken: '#EFE9DC',

  // Ink (text)
  ink: '#1A1712',
  inkSoft: '#6F675B',
  inkFaint: '#A9A093',
  // Soft, translucent hairline border — reads as a subtle line on light surfaces and
  // stays near-invisible on dark/coloured ones, so one token works everywhere.
  border: 'rgba(26, 23, 18, 0.10)',
  line: 'rgba(26, 23, 18, 0.10)',

  // Brand + accents
  primary: '#6C5CE7',
  primaryDark: '#5A4BD6',
  primaryInk: '#FFFFFF',

  accent: '#FFC93C', // sunny yellow — badges / highlights
  accentInk: '#1A1712',

  coral: '#FF6B5E', // favorite / heart
  mint: '#37B87C', // success / availability
  sky: '#5B9DF9',
  danger: '#E5484D',

  // Soft pastel fills (paired with ink border + ink text)
  lilac: '#EDE9FF',
  lemon: '#FFF3CC',
  peach: '#FFE3DE',
  mintBg: '#D8F3E6',
  skyBg: '#DEEBFF',
  sand: '#F0E7D6',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(26, 23, 18, 0.45)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
};

// Hard-shadow offsets (used by <Surface />). Blur-less on purpose.
export const shadow = {
  xs: 3,
  sm: 4,
  md: 5,
  lg: 7,
};

export const typography = {
  // Sizes
  display: 34,
  h1: 28,
  h2: 22,
  h3: 18,
  body: 15,
  bodyLg: 16,
  caption: 13,
  micro: 11,

  // Weights (RN accepts numeric strings)
  regular: '500',
  medium: '600',
  semibold: '700',
  bold: '800',
  heavy: '900',
};

export const buttonVariants = {
  // Filled buttons carry a soft shadow instead of a border; the surface (white) button
  // keeps a subtle hairline for definition.
  primary: { bg: colors.primary, fg: colors.primaryInk, border: 'transparent' },
  accent: { bg: colors.accent, fg: colors.ink, border: 'transparent' },
  ink: { bg: colors.ink, fg: colors.white, border: 'transparent' },
  surface: { bg: colors.surface, fg: colors.ink, border: colors.border },
  danger: { bg: colors.danger, fg: colors.white, border: 'transparent' },
  ghost: { bg: 'transparent', fg: colors.ink, border: 'transparent' },
};

export const inputVariants = {
  default: { bg: colors.surface, border: colors.border, placeholder: colors.inkFaint },
  focused: { bg: colors.surface, border: colors.primary, placeholder: colors.inkFaint },
  error: { bg: colors.surface, border: colors.danger, placeholder: colors.inkFaint },
};

// Soft elevation preset (blurred, low-opacity) — replaces the hard offset shadows.
export const shadowSoft = {
  shadowColor: '#1A1712',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 4,
};

// Reusable text presets
export const text = {
  display: { fontSize: typography.display, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.5 },
  h1: { fontSize: typography.h1, fontWeight: typography.heavy, color: colors.ink, letterSpacing: -0.4 },
  h2: { fontSize: typography.h2, fontWeight: typography.bold, color: colors.ink, letterSpacing: -0.3 },
  h3: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.ink },
  body: { fontSize: typography.body, fontWeight: typography.regular, color: colors.ink },
  bodyStrong: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.ink },
  muted: { fontSize: typography.body, fontWeight: typography.regular, color: colors.inkSoft },
  caption: { fontSize: typography.caption, fontWeight: typography.medium, color: colors.inkSoft },
  micro: { fontSize: typography.micro, fontWeight: typography.bold, color: colors.inkSoft },
};

const theme = {
  colors,
  spacing,
  radius,
  shadow,
  shadowSoft,
  typography,
  buttonVariants,
  inputVariants,
  text,
};

export default theme;
