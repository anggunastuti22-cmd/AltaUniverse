import { type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  StyleSheet,
  type StyleProp,
  Text,
  type ViewStyle,
} from 'react-native';
import { color, fontSize, fontWeight, radius, space } from '@alta/design-tokens';

export type ButtonVariant = 'primary' | 'secondary';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  variant?: ButtonVariant;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Accessible React Native button mirroring the web variant API. */
export function Button({ variant = 'primary', children, style, ...rest }: ButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.base, isPrimary ? styles.primary : styles.secondary, style]}
      {...rest}
    >
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: { backgroundColor: color.primary, borderColor: color.primary },
  secondary: { backgroundColor: color.surface, borderColor: color.border },
  label: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  labelPrimary: { color: color.primaryContrast },
  labelSecondary: { color: color.text },
});
