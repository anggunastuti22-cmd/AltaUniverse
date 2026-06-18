import { describe, expect, it } from 'vitest';
import { color, space } from './tokens';
import { buildThemeCss, buildThemeVars, cssVar, themeCss } from './css';

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

  it('builds a :root block and var() references', () => {
    expect(themeCss).toBe(buildThemeCss());
    expect(themeCss.startsWith(':root {')).toBe(true);
    expect(cssVar('color-text')).toBe('var(--alta-color-text)');
  });
});
