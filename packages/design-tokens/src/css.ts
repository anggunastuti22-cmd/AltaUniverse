import {
  color,
  duration,
  easing,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  space,
  zIndex,
} from './tokens';

interface CssGroup {
  name: string;
  tokens: Readonly<Record<string, string | number>>;
  unit: string;
}

const cssGroups: CssGroup[] = [
  { name: 'color', tokens: color, unit: '' },
  { name: 'space', tokens: space, unit: 'px' },
  { name: 'radius', tokens: radius, unit: 'px' },
  { name: 'font-size', tokens: fontSize, unit: 'px' },
  { name: 'line-height', tokens: lineHeight, unit: '' },
  { name: 'font-weight', tokens: fontWeight, unit: '' },
  { name: 'font-family', tokens: fontFamily, unit: '' },
  { name: 'duration', tokens: duration, unit: 'ms' },
  { name: 'easing', tokens: easing, unit: '' },
  { name: 'z-index', tokens: zIndex, unit: '' },
];

/** Build the flat map of CSS custom properties for the (light) theme. */
export function buildThemeVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const group of cssGroups) {
    for (const [key, value] of Object.entries(group.tokens)) {
      vars[`--alta-${group.name}-${key}`] = `${value}${group.unit}`;
    }
  }
  return vars;
}

/** Reference a token as a CSS `var()` expression, e.g. `cssVar('color-text')`. */
export function cssVar(token: string): string {
  return `var(--alta-${token})`;
}

/** The full `:root { ... }` block injected by web apps as the source of truth. */
export function buildThemeCss(): string {
  const vars = buildThemeVars();
  const body = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
  return `:root {\n${body}\n}\n`;
}

export const themeCss = buildThemeCss();
