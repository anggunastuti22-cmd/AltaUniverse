import { describe, expect, it } from 'vitest';
import { color, space } from './tokens';
import { buildThemeCss, buildThemeVars, cssVar, themeCss } from './css';

/** WCAG 2.x relative-luminance contrast ratio between two #rrggbb colors. */
function contrastRatio(a: string, b: string): number {
  const channels = (h: string) =>
    [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16));
  const linear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const luminance = (h: string) => {
    const [r, g, bl] = channels(h).map(linear) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [l1, l2] = [luminance(a), luminance(b)];
  const [hi, lo] = [Math.max(l1, l2), Math.min(l1, l2)];
  return (hi + 0.05) / (lo + 0.05);
}

describe('design tokens', () => {
  it('defines light-theme semantic colors and domain accents', () => {
    expect(color.background).toBe('#f4f0e8');
    expect(color.text).toBeDefined();
    expect(color.core).toBeDefined();
    expect(color.mind).toBeDefined();
    expect(color.wear).toBeDefined();
    expect(color.lab).toBeDefined();
    expect(color.focusRing).toBeDefined();
  });

  it('exposes every color token as a CSS custom property (no drift)', () => {
    const vars = buildThemeVars();
    for (const key of Object.keys(color)) {
      expect(vars[`--alta-color-${key}`]).toBeDefined();
    }
  });

  it('appends units to numeric scales', () => {
    const vars = buildThemeVars();
    expect(vars['--alta-space-md']).toBe(`${space.md}px`);
    expect(vars['--alta-duration-base']).toBe('180ms');
  });

  it('meets WCAG AA 4.5:1 for every text-role color on paper', () => {
    // Worst case is the (darker) ivory background, not the lighter surface.
    const paper = color.background;
    const textRoles = [
      'text',
      'textStrong',
      'textMuted',
      'textSubtle',
      'success',
      'warning',
      'danger',
      'coreText',
      'mindText',
      'wearText',
      'labText',
    ] as const;
    for (const role of textRoles) {
      expect(contrastRatio(color[role], paper)).toBeGreaterThanOrEqual(4.5);
    }
    // Inverse text sits on the ink primary.
    expect(contrastRatio(color.textInverse, color.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it('meets WCAG AA 3:1 for the focus ring against paper', () => {
    expect(contrastRatio(color.focusRing, color.background)).toBeGreaterThanOrEqual(3);
  });

  it('builds a :root block and var() references', () => {
    expect(themeCss).toBe(buildThemeCss());
    expect(themeCss.startsWith(':root {')).toBe(true);
    expect(cssVar('color-text')).toBe('var(--alta-color-text)');
  });
});
