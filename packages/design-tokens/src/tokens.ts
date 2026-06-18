/**
 * Alta Universe design tokens — "Editorial Light" direction.
 *
 * A calm magazine sensibility: warm ivory paper, hairline rules, a transitional
 * serif (Newsreader) for strategic moments, a humanist sans (Hanken Grotesk)
 * for daily work. Domain identity enters as a single accent — never a flood of
 * tint. Source: docs design handoff "Alta Universe Directions" (Editorial).
 *
 * Light mode first; structured so future themes can be added without changing
 * consumers. Numeric scales are unitless (px / ms) for direct React Native use.
 */

/** Semantic color roles + per-domain accents (Editorial Light). */
export const color = {
  // Paper & surfaces
  background: '#f4f0e8',
  surface: '#fcfaf5',
  surfaceWarm: '#faf7ef',
  surfaceMuted: '#ece5d6',
  border: '#e2dacb',
  borderStrong: '#cbc0ad',

  // Ink & text
  text: '#2b261f',
  textStrong: '#1f1c17',
  textMuted: '#6c6457',
  textSubtle: '#9a917f',
  textInverse: '#fcfaf5',

  // Brand / primary (ink)
  primary: '#2b261f',
  primaryHover: '#363029',
  primaryContrast: '#fcfaf5',

  // Status
  success: '#5e806a',
  warning: '#b0895b',
  danger: '#c9534b',

  // Accessibility
  focusRing: '#8b7bb8',

  // Domain accents + soft tints
  core: '#b0895b',
  coreSoft: '#efe8d9',
  mind: '#8b7bb8',
  mindSoft: '#ece8f3',
  wear: '#c58b86',
  wearSoft: '#f4e7e3',
  lab: '#7fa088',
  labSoft: '#e7efe8',
} satisfies Record<string, string>;

/** Spacing scale in px (4 · 8 · 12 · 16 · 24 · 32 · 40). */
export const space = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} satisfies Record<string, number>;

/** Corner radii in px (6 / 8 / 12). */
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  full: 9999,
} satisfies Record<string, number>;

/** Font sizes in px. */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 20,
  xl: 28,
  '2xl': 38,
} satisfies Record<string, number>;

/** Unitless line heights. */
export const lineHeight = {
  tight: 1.15,
  normal: 1.55,
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
  display: "'Newsreader', Georgia, 'Times New Roman', serif",
  sans: "'Hanken Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
} satisfies Record<string, string>;

/** Motion durations in ms. Honor `prefers-reduced-motion` at the app level. */
export const duration = {
  fast: 120,
  base: 180,
  slow: 280,
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
