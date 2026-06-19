import Link from 'next/link';
import { color, fontSize, radius, space } from '@alta/design-tokens';

export interface DomainLandingProps {
  name: string;
  tagline: string;
  accent: string;
  intro: string;
  features: string[];
  isNot: string[];
}

export function DomainLanding({
  name,
  tagline,
  accent,
  intro,
  features,
  isNot,
}: DomainLandingProps) {
  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: `${space['3xl']}px ${space.xl}px` }}>
      <span
        style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent }}
      >
        {name}
      </span>
      <h1 style={{ fontSize: 44, lineHeight: 1.08, margin: `${space.sm}px 0` }}>{tagline}</h1>
      <p style={{ fontSize: fontSize.lg, color: color.textMuted, maxWidth: 600 }}>{intro}</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: space.lg,
          marginTop: space.xl,
        }}
      >
        <div
          style={{
            border: `1px solid ${color.border}`,
            borderLeft: `3px solid ${accent}`,
            borderRadius: radius.lg,
            padding: space.lg,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: fontSize.lg }}>What you can do</h2>
          <ul style={{ margin: 0, paddingLeft: space.lg, color: color.text }}>
            {features.map((f) => (
              <li key={f} style={{ marginBottom: space.xs }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div
          style={{
            border: `1px solid ${color.border}`,
            borderRadius: radius.lg,
            padding: space.lg,
            backgroundColor: color.surfaceMuted,
          }}
        >
          <h2 style={{ marginTop: 0, fontSize: fontSize.lg }}>What it is not</h2>
          <ul style={{ margin: 0, paddingLeft: space.lg, color: color.textMuted }}>
            {isNot.map((f) => (
              <li key={f} style={{ marginBottom: space.xs }}>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: space.xl }}>
        <Link
          href="/login"
          style={{
            padding: `${space.sm}px ${space.xl}px`,
            borderRadius: radius.md,
            backgroundColor: color.primary,
            color: color.primaryContrast,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Start with {name}
        </Link>
      </div>
    </main>
  );
}
