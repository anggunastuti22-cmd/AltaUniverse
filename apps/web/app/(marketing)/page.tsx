import Link from 'next/link';
import { color, fontSize, radius, space } from '@alta/design-tokens';

const domains = [
  {
    href: '/altamind',
    name: 'AltaMind',
    tagline: 'Understand yourself.',
    blurb: 'Reflect on your mind, decisions, and direction — never graded, never judged.',
    accent: color.mind,
  },
  {
    href: '/altawear',
    name: 'AltaWear',
    tagline: 'Express yourself.',
    blurb: 'Know your wardrobe and dress well for the life you actually live — never a store.',
    accent: color.wear,
  },
  {
    href: '/altalab',
    name: 'AltaLab',
    tagline: 'Care for yourself.',
    blurb: 'Track skincare gently and learn calmly — educational, never a diagnosis.',
    accent: color.lab,
  },
];

export default function MarketingHome() {
  return (
    <main>
      <section
        style={{ maxWidth: 880, margin: '0 auto', padding: `${space['3xl']}px ${space.xl}px` }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: color.textSubtle,
          }}
        >
          One intelligent life system
        </span>
        <h1 style={{ fontSize: 52, lineHeight: 1.05, margin: `${space.md}px 0` }}>
          Understand, express, and care for yourself.
        </h1>
        <p style={{ fontSize: fontSize.lg, color: color.textMuted, maxWidth: 620 }}>
          Alta Universe connects three quiet, private spaces — AltaMind, AltaWear, and AltaLab —
          into one human-centered, privacy-conscious system. Reflective rather than judgmental.
          Mindful rather than consumption-driven.
        </p>
        <div style={{ display: 'flex', gap: space.md, marginTop: space.xl, flexWrap: 'wrap' }}>
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
            Get started
          </Link>
          <Link
            href="/altamind"
            style={{
              padding: `${space.sm}px ${space.xl}px`,
              borderRadius: radius.md,
              border: `1px solid ${color.border}`,
              color: color.textStrong,
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Explore the domains
          </Link>
        </div>
      </section>

      <section
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: `0 ${space.xl}px ${space['3xl']}px`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: space.lg,
        }}
      >
        {domains.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            style={{
              textDecoration: 'none',
              border: `1px solid ${color.border}`,
              borderTop: `3px solid ${d.accent}`,
              borderRadius: radius.lg,
              padding: space.lg,
              backgroundColor: color.surface,
              display: 'block',
            }}
          >
            <strong
              style={{
                fontFamily: 'var(--alta-font-family-display)',
                fontSize: fontSize.xl,
                color: color.textStrong,
              }}
            >
              {d.name}
            </strong>
            <div style={{ color: d.accent, fontStyle: 'italic', margin: `${space.xs}px 0` }}>
              {d.tagline}
            </div>
            <p style={{ color: color.textMuted, margin: 0 }}>{d.blurb}</p>
          </Link>
        ))}
      </section>

      <section
        style={{
          maxWidth: 880,
          margin: '0 auto',
          padding: `0 ${space.xl}px ${space['3xl']}px`,
          color: color.textMuted,
        }}
      >
        <h2 style={{ color: color.textStrong }}>Built around your privacy</h2>
        <p>
          Your entries belong to you. Private content is owner-only by design, admins can never read
          it, AI is opt-in and off by default, and you can export or delete everything at any time.
        </p>
      </section>
    </main>
  );
}
