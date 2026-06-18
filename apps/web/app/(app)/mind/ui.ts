import type { CSSProperties } from 'react';
import { color, fontSize, radius, space } from '@alta/design-tokens';

export const page = {
  maxWidth: 820,
  margin: '0 auto',
  padding: `${space.xl}px ${space.xl}px ${space['3xl']}px`,
} satisfies CSSProperties;

export const eyebrow = {
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: color.mind,
} satisfies CSSProperties;

export const card = {
  backgroundColor: color.surface,
  border: `1px solid ${color.border}`,
  borderRadius: radius.lg,
  padding: space.lg,
} satisfies CSSProperties;

export const label = {
  display: 'block',
  fontSize: fontSize.sm,
  fontWeight: 600,
  color: color.textStrong,
  marginBottom: space.xs,
} satisfies CSSProperties;

export const field = {
  display: 'block',
  width: '100%',
  padding: space.sm,
  borderRadius: radius.md,
  border: `1px solid ${color.border}`,
  background: color.surface,
  color: color.text,
  fontSize: fontSize.base,
  fontFamily: 'inherit',
} satisfies CSSProperties;

export const primaryBtn = {
  padding: `${space.sm}px ${space.lg}px`,
  borderRadius: radius.md,
  border: '1px solid transparent',
  backgroundColor: color.primary,
  color: color.primaryContrast,
  fontSize: fontSize.sm,
  fontWeight: 600,
  cursor: 'pointer',
} satisfies CSSProperties;

export const ghostBtn = {
  padding: `${space.sm}px ${space.lg}px`,
  borderRadius: radius.md,
  border: `1px solid ${color.border}`,
  background: 'transparent',
  color: color.textMuted,
  fontSize: fontSize.sm,
  fontWeight: 500,
  cursor: 'pointer',
} satisfies CSSProperties;

export const muted = { color: color.textMuted } satisfies CSSProperties;
