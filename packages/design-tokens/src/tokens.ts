/**
 * Alta Universe design tokens — single source of truth.
 *
 * Light mode is defined first; the token structure (semantic color roles +
 * per-domain accents) is built so future themes (e.g. dark) can be added as
 * additional theme maps without changing consumers.
 *
 * - Web consumes these as CSS custom properties (see `./css`).
 * - React Native consumes the raw values directly (numbers are unitless px /
 *   ms so they can be used in `StyleSheet` without conversion).
 */

/** Semantic color roles + domain accents (light theme). */
export const color = {
  // Surfaces & text
  background: '#ffffff',
  surface: '#f7f7f5',
  surfaceMuted: '#efeeea',
  border: '#e3e1db',
  text: '#1c1b19',
  textMuted: '#6b6a66',
  textInverse: '#ffffff',

  // Brand / universe accent
  primary: '#2f4858',
  primaryHover: '#243845',
  primaryContrast: '#ffffff',

  // Status
  success: '#2e7d5b',
  warning: '#9a6a14',
  danger: '#b3261e',

  // Accessibility
  focusRing: '#2f6fed',

  // Per-domain accents
  mind: '#5b6cff',
  wear: '#b0648c',
  lab: '#2f9d8e',
} satisfies Record<string, string>;

/** Spacing scale in px (unitless number for RN; `px` appended for CSS). */
export const space = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} satisfies Record<string, number>;

/** Corner radii in px. */
export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
} satisfies Record<string, number>;

/** Font sizes in px. */
export const fontSize = {
  sm: 14,
  base: 16,
  lg: 20,
  xl: 28,
  '2xl': 36,
} satisfies Record<string, number>;

/** Unitless line heights. */
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
} satisfies Record<string, number>;

/**
 * Font weights. `as const` keeps literal types so React Native's strict
 * `fontWeight` union accepts them; the values are also valid CSS.
 */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fontFamily = {
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
} satisfies Record<string, string>;

/** Motion durations in ms. Honor `prefers-reduced-motion` at the app level. */
export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
} satisfies Record<string, number>;

export const easing = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasized: 'cubic-bezier(0.3, 0, 0, 1)',
} satisfies Record<string, string>;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  overlay: 1100,
  modal: 1200,
  toast: 1300,
} satisfies Record<string, number>;
