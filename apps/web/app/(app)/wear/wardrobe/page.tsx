import Link from 'next/link';
import { redirect } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { costPerWear } from '@alta/domain';
import { createClient } from '@/lib/supabase/server';
import { card, fieldStyle, label as labelStyle, muted, page, primaryBtn, formatMoney } from '../ui';
import { addItem } from '../actions';

export default async function WardrobePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; cat?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: items }, { data: usage }, { data: images }] = await Promise.all([
    supabase
      .from('wear_items')
      .select('id, name, category, brand, color, price, currency')
      .order('created_at', { ascending: false }),
    supabase.from('wear_usage_logs').select('item_id'),
    supabase.from('wear_item_images').select('item_id, storage_path'),
  ]);

  const wears = new Map<string, number>();
  for (const u of usage ?? []) {
    if (u.item_id) wears.set(u.item_id, (wears.get(u.item_id) ?? 0) + 1);
  }

  // First image per item, resolved to a short-lived signed URL (private bucket).
  const firstPath = new Map<string, string>();
  for (const im of images ?? []) {
    if (!firstPath.has(im.item_id)) firstPath.set(im.item_id, im.storage_path);
  }
  const imageUrl = new Map<string, string>();
  const paths = [...firstPath.values()];
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('wardrobe-images')
      .createSignedUrls(paths, 3600);
    const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
    for (const [itemId, p] of firstPath) {
      const url = byPath.get(p);
      if (url) imageUrl.set(itemId, url);
    }
  }

  const all = items ?? [];
  const categories = Array.from(new Set(all.map((i) => i.category))).sort();
  const filtered = sp.cat ? all.filter((i) => i.category === sp.cat) : all;

  return (
    <div style={page}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
        }}
      >
        <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Your wardrobe</h1>
        <span style={muted}>{all.length} items</span>
      </div>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Name and category are required.' : sp.error}
        </p>
      ) : null}

      <details style={{ ...card, marginBottom: space.lg }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>+ Add item</summary>
        <form action={addItem} style={{ display: 'grid', gap: space.md, marginTop: space.md }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.md }}>
            <div>
              <label style={labelStyle} htmlFor="name">
                Name
              </label>
              <input id="name" name="name" required maxLength={160} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="category">
                Category
              </label>
              <input
                id="category"
                name="category"
                required
                style={fieldStyle}
                placeholder="Outerwear"
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="brand">
                Brand
              </label>
              <input id="brand" name="brand" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="color">
                Colour
              </label>
              <input id="color" name="color" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="price">
                Price
              </label>
              <input id="price" name="price" type="number" min="0" step="0.01" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="currency">
                Currency
              </label>
              <input
                id="currency"
                name="currency"
                defaultValue="USD"
                maxLength={3}
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="acquired_on">
                Acquired on
              </label>
              <input id="acquired_on" name="acquired_on" type="date" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="image">
                Photo (optional)
              </label>
              <input id="image" name="image" type="file" accept="image/*" style={fieldStyle} />
            </div>
          </div>
          <div>
            <button type="submit" style={primaryBtn}>
              Add to wardrobe
            </button>
          </div>
        </form>
      </details>

      <div style={{ display: 'flex', gap: space.xs, flexWrap: 'wrap', marginBottom: space.lg }}>
        <FilterChip label={`All · ${all.length}`} href="/wear/wardrobe" active={!sp.cat} />
        {categories.map((c) => (
          <FilterChip
            key={c}
            label={c}
            href={`/wear/wardrobe?cat=${encodeURIComponent(c)}`}
            active={sp.cat === c}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={muted}>No items yet. Add your first piece above.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: space.md,
          }}
        >
          {filtered.map((it) => {
            const count = wears.get(it.id) ?? 0;
            const cpw = costPerWear(it.price, count);
            return (
              <div key={it.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
                {imageUrl.get(it.id) ? (
                  <img
                    src={imageUrl.get(it.id)}
                    alt={it.name}
                    style={{
                      width: '100%',
                      aspectRatio: '4 / 5',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    aria-hidden
                    style={{
                      aspectRatio: '4 / 5',
                      background: color.surfaceMuted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: color.textSubtle,
                      fontFamily: 'var(--alta-font-family-mono)',
                      fontSize: fontSize.xs,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {it.category.slice(0, 8).toUpperCase()}
                  </div>
                )}
                <div style={{ padding: space.md }}>
                  <strong style={{ display: 'block', color: color.text }}>{it.name}</strong>
                  <span style={{ ...muted, fontSize: fontSize.xs }}>
                    {it.category}
                    {it.brand ? ` · ${it.brand}` : ''}
                  </span>
                  <div style={{ marginTop: space.sm, fontSize: fontSize.sm }}>
                    {cpw !== null ? (
                      <span style={{ color: color.textStrong, fontWeight: 600 }}>
                        {formatMoney(cpw, it.currency)}/wear
                      </span>
                    ) : (
                      <span style={muted}>Not yet worn</span>
                    )}
                    <span style={{ ...muted, marginLeft: space.sm }}>worn {count}×</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: `6px ${space.md}px`,
        borderRadius: radius.full,
        border: `1px solid ${active ? color.wear : color.border}`,
        backgroundColor: active ? color.wearSoft : color.surface,
        color: active ? color.textStrong : color.textMuted,
        fontSize: fontSize.sm,
        textDecoration: 'none',
      }}
    >
      {label}
    </Link>
  );
}
