import Link from 'next/link';
import { redirect } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { toDateKey } from '@alta/domain';
import { createClient } from '@/lib/supabase/server';
import { page, eyebrow, card, muted } from './ui';

export default async function MindOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .maybeSingle();
  const today = toDateKey(new Date(), profile?.timezone ?? undefined);

  const [{ data: checkin }, { count: journalCount }, { count: domainCount }, { count: goalCount }] =
    await Promise.all([
      supabase
        .from('mind_checkins')
        .select('mood')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .maybeSingle(),
      supabase.from('mind_journal_entries').select('*', { count: 'exact', head: true }),
      supabase.from('mind_life_domains').select('*', { count: 'exact', head: true }),
      supabase
        .from('mind_goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
    ]);

  const tiles = [
    {
      label: "Today's check-in",
      value: checkin ? 'Done' : 'Not yet',
      href: '/mind/check-in',
      cta: checkin ? 'Edit' : 'Check in',
    },
    {
      label: 'Journal entries',
      value: String(journalCount ?? 0),
      href: '/mind/journal',
      cta: 'Write',
    },
    {
      label: 'Life domains',
      value: String(domainCount ?? 0),
      href: '/mind/domains',
      cta: 'Manage',
    },
    { label: 'Active goals', value: String(goalCount ?? 0), href: '/mind/goals', cta: 'Open' },
  ];

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Overview</h1>
      <p style={muted}>A calm read on your inner life. Nothing here is scored.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: space.md,
          marginTop: space.lg,
        }}
      >
        {tiles.map((t) => (
          <div
            key={t.label}
            style={{ ...card, display: 'flex', flexDirection: 'column', gap: space.xs }}
          >
            <span style={{ ...eyebrow, color: color.textSubtle }}>{t.label}</span>
            <strong
              style={{ fontSize: fontSize.xl, fontFamily: 'var(--alta-font-family-display)' }}
            >
              {t.value}
            </strong>
            <Link
              href={t.href}
              style={{
                color: color.mind,
                fontWeight: 600,
                fontSize: fontSize.sm,
                marginTop: space.xs,
              }}
            >
              {t.cta} →
            </Link>
          </div>
        ))}
      </div>

      <div
        style={{
          ...card,
          marginTop: space.lg,
          backgroundColor: color.mindSoft,
          borderRadius: radius.lg,
        }}
      >
        <span style={eyebrow}>Decision room</span>
        <p style={{ margin: `${space.xs}px 0 ${space.sm}px`, color: color.text }}>
          Facing a choice? Frame the options and factors, then reflect. AltaMind never decides for
          you.
        </p>
        <Link
          href="/mind/decisions"
          style={{ color: color.mind, fontWeight: 600, fontSize: fontSize.sm }}
        >
          Open decision room →
        </Link>
      </div>
    </div>
  );
}
