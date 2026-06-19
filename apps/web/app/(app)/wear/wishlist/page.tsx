import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, fieldStyle, label as labelStyle, muted, page, primaryBtn, formatMoney } from '../ui';
import { createWishlist } from '../actions';

export default async function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: rows } = await supabase
    .from('wear_wishlist')
    .select('id, name, reason, status, est_price, currency')
    .order('created_at', { ascending: false });

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Wishlist</h1>
      <p style={muted}>A space to reflect before buying — a reason, not a buy button.</p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Give it a name.' : sp.error}
        </p>
      ) : null}

      <form action={createWishlist} style={{ ...card, display: 'grid', gap: space.md }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: space.md }}>
          <div>
            <label style={labelStyle} htmlFor="name">
              Item
            </label>
            <input id="name" name="name" required maxLength={160} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="est_price">
              Est. price
            </label>
            <input
              id="est_price"
              name="est_price"
              type="number"
              min="0"
              step="0.01"
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
          <label style={labelStyle} htmlFor="reason">
            Why this? (the reflection)
          </label>
          <input
            id="reason"
            name="reason"
            style={fieldStyle}
            placeholder="Replaces a worn-out pair"
          />
        </div>
        <button type="submit" style={primaryBtn}>
          Add to wishlist
        </button>
      </form>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.sm }}>
        {(rows ?? []).length === 0 ? (
          <p style={muted}>Nothing on your wishlist.</p>
        ) : (
          (rows ?? []).map((w) => (
            <div key={w.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: space.sm }}>
                <h2 style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600, color: color.text }}>
                  {w.name}
                </h2>
                <span style={{ ...muted, fontSize: fontSize.xs, textTransform: 'capitalize' }}>
                  {w.status}
                </span>
              </div>
              {w.est_price !== null ? (
                <span style={{ ...muted, fontSize: fontSize.sm }}>
                  {formatMoney(w.est_price, w.currency)}
                </span>
              ) : null}
              {w.reason ? (
                <p style={{ ...muted, margin: `${space.xs}px 0 0` }}>{w.reason}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
