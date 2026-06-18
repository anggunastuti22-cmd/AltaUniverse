import Link from 'next/link';
import { redirect } from 'next/navigation';
import { color, fontSize, fontWeight, radius, space } from '@alta/design-tokens';
import { toDateKey } from '@alta/domain';
import { createClient } from '@/lib/supabase/server';

function greeting(date: Date): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const page = {
  maxWidth: 880,
  margin: '0 auto',
  padding: `${space['2xl']}px ${space.xl}px`,
} as const;
const eyebrow = {
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: color.textSubtle,
} as const;

function DomainCard({
  accent,
  label,
  title,
  body,
  href,
  cta,
}: {
  accent: string;
  label: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div
      style={{
        backgroundColor: color.surface,
        border: `1px solid ${color.border}`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: radius.lg,
        padding: space.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: space.xs,
      }}
    >
      <span style={{ ...eyebrow, color: accent }}>{label}</span>
      <strong style={{ fontSize: fontSize.lg, fontFamily: 'var(--alta-font-family-display)' }}>
        {title}
      </strong>
      <p style={{ color: color.textMuted, margin: 0, flex: 1 }}>{body}</p>
      <Link
        href={href}
        style={{ color: color.textStrong, fontWeight: fontWeight.semibold, fontSize: fontSize.sm }}
      >
        {cta} →
      </Link>
    </div>
  );
}

export default async function AltaHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, timezone')
    .eq('id', user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? 'there';
  const firstName = displayName.split(' ')[0] ?? displayName;
  const now = new Date();
  const todayKey = toDateKey(now, profile?.timezone ?? undefined);

  const { data: checkin } = await supabase
    .from('mind_checkins')
    .select('mood, energy')
    .eq('user_id', user.id)
    .eq('checkin_date', todayKey)
    .maybeSingle();

  const { data: goals } = await supabase
    .from('mind_goals')
    .select('title')
    .eq('status', 'active')
    .limit(3);

  const dateLabel = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);

  return (
    <div style={page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={eyebrow}>alta.universe / home</span>
        <span style={{ ...eyebrow, color: color.textMuted }}>{dateLabel}</span>
      </div>

      <h1 style={{ fontSize: fontSize['2xl'], margin: `${space.md}px 0 ${space.xs}px` }}>
        {greeting(now)}, {firstName}.
      </h1>
      <p style={{ color: color.textMuted, marginTop: 0 }}>
        A calm start. Your three domains, one system —{' '}
        <Link href="/mind" style={{ color: color.mind, fontWeight: fontWeight.semibold }}>
          weekly reset →
        </Link>
      </p>

      <section
        aria-label="Today across your domains"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: space.md,
          marginTop: space.xl,
        }}
      >
        <DomainCard
          accent={color.mind}
          label="Mind · check-in"
          title={checkin ? 'Checked in today' : 'Not yet today'}
          body={
            checkin
              ? `Mood ${checkin.mood ?? '—'} · energy ${checkin.energy ?? '—'}. Thank you for reflecting.`
              : 'A minute of reflection, when you’re ready.'
          }
          href="/mind"
          cta={checkin ? 'Open AltaMind' : 'Check in'}
        />
        <DomainCard
          accent={color.wear}
          label="Wear · wardrobe"
          title="Mindful wardrobe"
          body="Log what you wear to see cost-per-wear over time."
          href="/wear"
          cta="Open AltaWear"
        />
        <DomainCard
          accent={color.lab}
          label="Lab · routine"
          title="Skin, gently tracked"
          body="Build a routine and note what you observe."
          href="/lab"
          cta="Open AltaLab"
        />
      </section>

      <section
        style={{
          marginTop: space.xl,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: space.md,
        }}
      >
        <div
          style={{
            border: `1px solid ${color.border}`,
            borderRadius: radius.lg,
            padding: space.lg,
          }}
        >
          <span style={eyebrow}>Current priorities</span>
          {goals && goals.length > 0 ? (
            <ul style={{ margin: `${space.sm}px 0 0`, paddingLeft: space.lg, color: color.text }}>
              {goals.map((g, i) => (
                <li key={i} style={{ marginBottom: space.xs }}>
                  {g.title}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: color.textMuted, marginTop: space.sm }}>
              No active priorities yet. Set goals in AltaMind.
            </p>
          )}
        </div>

        <div
          style={{
            border: `1px solid ${color.border}`,
            borderRadius: radius.lg,
            padding: space.lg,
            backgroundColor: color.mindSoft,
          }}
        >
          <span style={{ ...eyebrow, color: color.mind }}>Gentle insight</span>
          <p style={{ color: color.text, margin: `${space.sm}px 0 ${space.xs}px` }}>
            You tend to feel steadier on the days you check in before noon.
          </p>
          <span style={{ fontSize: fontSize.xs, color: color.textSubtle }}>
            Observation · you decide what it means
          </span>
        </div>
      </section>

      <section style={{ marginTop: space.xl }}>
        <span style={eyebrow}>Quick actions</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
          {[
            { label: 'Daily check-in', href: '/mind' },
            { label: 'Log an outfit', href: '/wear' },
            { label: 'Skin observation', href: '/lab' },
            { label: 'New journal entry', href: '/mind' },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              style={{
                padding: `${space.sm}px ${space.lg}px`,
                borderRadius: radius.md,
                border: `1px solid ${color.border}`,
                backgroundColor: color.surface,
                color: color.textStrong,
                textDecoration: 'none',
                fontSize: fontSize.sm,
                fontWeight: fontWeight.medium,
              }}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
