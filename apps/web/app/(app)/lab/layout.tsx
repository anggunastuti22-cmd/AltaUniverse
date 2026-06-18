import type { ReactNode } from 'react';
import { color, fontSize, space } from '@alta/design-tokens';
import { LabTabs } from '@/components/lab-tabs';

export default function LabLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div style={{ padding: `${space.xl}px ${space.xl}px 0` }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: color.lab,
          }}
        >
          AltaLab · care for yourself
        </span>
        <p
          style={{
            color: color.textMuted,
            margin: `${space.xs}px 0 ${space.md}px`,
            fontSize: fontSize.sm,
          }}
        >
          Educational only — not a diagnosis or a substitute for a dermatologist. Private to you.
        </p>
      </div>
      <LabTabs />
      {children}
    </div>
  );
}
