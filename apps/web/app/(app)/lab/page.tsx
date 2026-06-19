import Link from 'next/link';
import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { costPerWear } from '@alta/domain';
import { createClient } from '@/lib/supabase/server';
import { card, eyebrow, formatMoney, muted, page } from './ui';

export default async function LabOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: products }, { count: routineCount }, { count: obsCount }] = await Promise.all([
    supabase.from('lab_user_products').select('price_paid, est_uses, currency'),
    supabase.from('lab_routines').select('*', { count: 'exact', head: true }),
    supabase.from('lab_skin_logs').select('*', { count: 'exact', head: true }),
  ]);

  const perUse: number[] = [];
  let currency = 'USD';
  for (const p of products ?? []) {
    const c = costPerWear(p.price_paid, p.est_uses ?? 0);
    if (c !== null) {
      perUse.push(c);
      currency = p.currency;
    }
  }
  const avg = perUse.length ? perUse.reduce((a, b) => a + b, 0) / perUse.length : null;

  const tiles = [
    {
      label: 'Products',
      value: String((products ?? []).length),
      href: '/lab/cabinet',
      cta: 'Open cabinet',
    },
    {
      label: 'Avg cost-per-use',
      value: avg !== null ? formatMoney(avg, currency) : '—',
      href: '/lab/cabinet',
      cta: 'See costs',
    },
    { label: 'Routines', value: String(routineCount ?? 0), href: '/lab/routines', cta: 'Build' },
    { label: 'Observations', value: String(obsCount ?? 0), href: '/lab/observations', cta: 'Log' },
  ];

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Overview</h1>
      <p style={muted}>Track gently, learn calmly. No results promised, nothing diagnosed.</p>
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
                color: color.labText,
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
    </div>
  );
}
