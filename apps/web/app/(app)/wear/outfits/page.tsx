import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, fieldStyle, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { addOutfitItem, createOutfit } from '../actions';

export default async function OutfitsPage({
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

  const [{ data: outfits }, { data: items }, { data: outfitItems }] = await Promise.all([
    supabase
      .from('wear_outfits')
      .select('id, name, occasion')
      .order('created_at', { ascending: false }),
    supabase.from('wear_items').select('id, name').order('name'),
    supabase.from('wear_outfit_items').select('outfit_id, item_id'),
  ]);

  const itemName = new Map((items ?? []).map((i) => [i.id, i.name]));
  const byOutfit = new Map<string, string[]>();
  for (const oi of outfitItems ?? []) {
    const arr = byOutfit.get(oi.outfit_id) ?? [];
    const n = itemName.get(oi.item_id);
    if (n) arr.push(n);
    byOutfit.set(oi.outfit_id, arr);
  }

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Outfits</h1>
      <p style={muted}>Compose outfits from pieces you own.</p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Please complete the form.' : sp.error}
        </p>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.md }}>
        <form action={createOutfit} style={{ ...card, display: 'grid', gap: space.md }}>
          <h2 style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600 }}>New outfit</h2>
          <div>
            <label style={labelStyle} htmlFor="name">
              Name
            </label>
            <input id="name" name="name" required maxLength={160} style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle} htmlFor="occasion">
              Occasion (optional)
            </label>
            <input id="occasion" name="occasion" style={fieldStyle} placeholder="Work" />
          </div>
          <button type="submit" style={primaryBtn}>
            Create outfit
          </button>
        </form>

        <form action={addOutfitItem} style={{ ...card, display: 'grid', gap: space.md }}>
          <h2 style={{ margin: 0, fontSize: fontSize.base, fontWeight: 600 }}>
            Add a piece to an outfit
          </h2>
          <div>
            <label style={labelStyle} htmlFor="outfit_id">
              Outfit
            </label>
            <select id="outfit_id" name="outfit_id" required style={fieldStyle} defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {(outfits ?? []).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="item_id">
              Item
            </label>
            <select id="item_id" name="item_id" required style={fieldStyle} defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              {(items ?? []).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={primaryBtn}>
            Add piece
          </button>
        </form>
      </div>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.sm }}>
        {(outfits ?? []).length === 0 ? (
          <p style={muted}>No outfits yet.</p>
        ) : (
          (outfits ?? []).map((o) => (
            <div key={o.id} style={{ ...card, borderLeft: `3px solid ${color.wear}` }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: 'var(--alta-font-family-display)',
                  fontSize: fontSize.lg,
                }}
              >
                {o.name}
              </h2>
              {o.occasion ? (
                <span style={{ ...muted, fontSize: fontSize.xs }}> · {o.occasion}</span>
              ) : null}
              <p style={{ ...muted, margin: `${space.xs}px 0 0` }}>
                {(byOutfit.get(o.id) ?? []).join(', ') || 'No pieces yet.'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
