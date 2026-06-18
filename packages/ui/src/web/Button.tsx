import { type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { color, fontSize, fontWeight, lineHeight, radius, space } from '@alta/design-tokens';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: space.sm,
  paddingBlock: space.sm,
  paddingInline: space.lg,
  borderRadius: radius.md,
  fontSize: fontSize.base,
  fontWeight: fontWeight.semibold,
  lineHeight: lineHeight.tight,
  border: '1px solid transparent',
  cursor: 'pointer',
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: color.primary,
    color: color.primaryContrast,
    borderColor: color.primary,
  },
  secondary: {
    backgroundColor: color.surface,
    color: color.text,
    borderColor: color.border,
  },
};

/**
 * Accessible web button. Focus styling is provided globally via `:focus-visible`
 * (see each app's `globals.css`) so it respects keyboard vs. pointer focus.
 */
export function Button({ variant = 'primary', style, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      style={{ ...baseStyle, ...variantStyles[variant], ...style }}
      {...rest}
    />
  );
}
