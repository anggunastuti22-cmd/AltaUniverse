import type { ReactNode } from 'react';
import { color, fontSize, space } from '@alta/design-tokens';
import { MindTabs } from '@/components/mind-tabs';

export default function MindLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div style={{ padding: `${space.xl}px ${space.xl}px 0` }}>
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: color.mindText,
          }}
        >
          AltaMind · understand yourself
        </span>
        <p
          style={{
            color: color.textMuted,
            margin: `${space.xs}px 0 ${space.md}px`,
            fontSize: fontSize.sm,
          }}
        >
          Reflective, never judgmental. Every entry is private — admin can never read it.
        </p>
      </div>
      <MindTabs />
      {children}
    </div>
  );
}
