import Link from 'next/link';
import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { costPerWear } from '@alta/domain';
import { createClient } from '@/lib/supabase/server';
import { card, eyebrow, formatMoney, muted, page } from './ui';

export default async function WearOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: items }, { data: usage }, { count: outfitCount }, { count: wishlistCount }] =
    await Promise.all([
      supabase.from('wear_items').select('id, price, currency'),
      supabase.from('wear_usage_logs').select('item_id'),
      supabase.from('wear_outfits').select('*', { count: 'exact', head: true }),
      supabase.from('wear_wishlist').select('*', { count: 'exact', head: true }),
    ]);

  const wears = new Map<string, number>();
  for (const u of usage ?? []) {
    if (u.item_id) wears.set(u.item_id, (wears.get(u.item_id) ?? 0) + 1);
  }
  const cpws: number[] = [];
  let currency = 'USD';
  for (const it of items ?? []) {
    const cpw = costPerWear(it.price, wears.get(it.id) ?? 0);
    if (cpw !== null) {
      cpws.push(cpw);
      currency = it.currency;
    }
  }
  const avg = cpws.length ? cpws.reduce((a, b) => a + b, 0) / cpws.length : null;

  const tiles = [
    {
      label: 'Items owned',
      value: String((items ?? []).length),
      href: '/wear/wardrobe',
      cta: 'Browse',
    },
    {
      label: 'Avg cost-per-wear',
      value: avg !== null ? formatMoney(avg, currency) : '—',
      href: '/wear/wardrobe',
      cta: 'See value',
    },
    { label: 'Outfits', value: String(outfitCount ?? 0), href: '/wear/outfits', cta: 'Build' },
    { label: 'Wishlist', value: String(wishlistCount ?? 0), href: '/wear/wishlist', cta: 'Open' },
  ];

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Overview</h1>
      <p style={muted}>What you own, and how well it earns its place. No shopping feed.</p>
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
                color: color.wearText,
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
