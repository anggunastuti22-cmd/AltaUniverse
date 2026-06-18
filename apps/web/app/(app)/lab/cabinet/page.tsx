import Link from 'next/link';
import { redirect } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';
import { costPerWear } from '@alta/domain';
import { createClient } from '@/lib/supabase/server';
import {
  card,
  eduBox,
  fieldStyle,
  label as labelStyle,
  muted,
  page,
  primaryBtn,
  formatMoney,
} from '../ui';
import { addProduct } from '../actions';

const FUNCTIONS = ['cleanse', 'treat', 'moisturise', 'protect'];

export default async function CabinetPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; fn?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: products } = await supabase
    .from('lab_user_products')
    .select('id, custom_name, brand, function, cadence, price_paid, currency, est_uses')
    .order('created_at', { ascending: false });

  const all = products ?? [];
  let routineCost = 0;
  let currency = 'USD';
  const byFunction = new Map<string, number>();
  for (const p of all) {
    if (p.function) byFunction.set(p.function, (byFunction.get(p.function) ?? 0) + 1);
    const c = costPerWear(p.price_paid, p.est_uses ?? 0);
    if (c !== null) {
      routineCost += c;
      currency = p.currency;
    }
  }
  const overlaps = [...byFunction.entries()].filter(([, n]) => n > 1).map(([f]) => f);
  const filtered = sp.fn ? all.filter((p) => p.function === sp.fn) : all;

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
        <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Your cabinet</h1>
        <span style={muted}>
          {all.length} products · routine cost{' '}
          <strong style={{ color: color.textStrong }}>
            {formatMoney(routineCost, currency)}/use
          </strong>
        </span>
      </div>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Give the product a name.' : sp.error}
        </p>
      ) : null}

      {overlaps.length > 0 ? (
        <div style={{ ...eduBox, marginBottom: space.lg }}>
          <strong>Educational.</strong> Two or more products share a function ({overlaps.join(', ')}
          ). Overlap isn&apos;t wrong — it&apos;s just worth knowing as you simplify or budget.
          Nothing here tells you to throw anything away.
        </div>
      ) : null}

      <details style={{ ...card, marginBottom: space.lg }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>+ Add product</summary>
        <form action={addProduct} style={{ display: 'grid', gap: space.md, marginTop: space.md }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.md }}>
            <div>
              <label style={labelStyle} htmlFor="name">
                Product name
              </label>
              <input id="name" name="name" required style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="brand">
                Brand
              </label>
              <input id="brand" name="brand" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle} htmlFor="function">
                Function
              </label>
              <select id="function" name="function" style={fieldStyle} defaultValue="">
                <option value="">—</option>
                {FUNCTIONS.map((f) => (
                  <option key={f} value={f} style={{ textTransform: 'capitalize' }}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="cadence">
                Cadence
              </label>
              <input id="cadence" name="cadence" style={fieldStyle} placeholder="AM·PM" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="price_paid">
                Price paid
              </label>
              <input
                id="price_paid"
                name="price_paid"
                type="number"
                min="0"
                step="0.01"
                style={fieldStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="est_uses">
                Estimated uses
              </label>
              <input
                id="est_uses"
                name="est_uses"
                type="number"
                min="1"
                step="1"
                style={fieldStyle}
              />
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
          </div>
          <div>
            <button type="submit" style={primaryBtn}>
              Add to cabinet
            </button>
          </div>
        </form>
      </details>

      <div style={{ display: 'flex', gap: space.xs, flexWrap: 'wrap', marginBottom: space.lg }}>
        <Chip label={`All · ${all.length}`} href="/lab/cabinet" active={!sp.fn} />
        {FUNCTIONS.map((f) => (
          <Chip key={f} label={f} href={`/lab/cabinet?fn=${f}`} active={sp.fn === f} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={muted}>No products yet. Add your first above.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: space.md,
          }}
        >
          {filtered.map((p) => {
            const cpu = costPerWear(p.price_paid, p.est_uses ?? 0);
            const overlapping = p.function ? (byFunction.get(p.function) ?? 0) > 1 : false;
            return (
              <div key={p.id} style={{ ...card, borderLeft: `3px solid ${color.lab}` }}>
                <strong style={{ display: 'block', color: color.text }}>{p.custom_name}</strong>
                <span style={{ ...muted, fontSize: fontSize.xs, textTransform: 'capitalize' }}>
                  {p.brand ? `${p.brand} · ` : ''}
                  {p.function ?? 'unset'}
                </span>
                <div style={{ marginTop: space.sm, fontSize: fontSize.sm }}>
                  {cpu !== null ? (
                    <span style={{ color: color.textStrong, fontWeight: 600 }}>
                      {formatMoney(cpu, p.currency)}/use
                    </span>
                  ) : (
                    <span style={muted}>No cost yet</span>
                  )}
                  {p.cadence ? (
                    <span style={{ ...muted, marginLeft: space.sm }}>{p.cadence}</span>
                  ) : null}
                </div>
                {overlapping ? (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: space.sm,
                      padding: `2px ${space.sm}px`,
                      borderRadius: radius.full,
                      backgroundColor: color.mindSoft,
                      color: color.mind,
                      fontSize: fontSize.xs,
                    }}
                  >
                    Overlaps
                    <span style={{ position: 'absolute', left: -9999 }}>
                      {' '}
                      shares a function with another product
                    </span>
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: `6px ${space.md}px`,
        borderRadius: radius.full,
        border: `1px solid ${active ? color.lab : color.border}`,
        backgroundColor: active ? color.labSoft : color.surface,
        color: active ? color.textStrong : color.textMuted,
        fontSize: fontSize.sm,
        textDecoration: 'none',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </Link>
  );
}
