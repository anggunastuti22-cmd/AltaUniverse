import { StyleSheet } from 'react-native';
import { color, fontSize, radius, space } from '@alta/design-tokens';

export { color, fontSize, radius, space };

export const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: space.xl,
    backgroundColor: color.background,
    gap: space.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: color.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: color.textMuted,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: color.textStrong,
    marginBottom: space.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    padding: space.sm,
    fontSize: fontSize.base,
    color: color.text,
    backgroundColor: color.surface,
  },
  card: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.md,
    backgroundColor: color.surface,
    gap: space.xs,
  },
  scaleRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  scaleDot: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  scaleDotActive: {
    borderColor: color.mind,
    backgroundColor: color.mindSoft,
  },
  scaleText: { color: color.text, fontWeight: '600' },
});
