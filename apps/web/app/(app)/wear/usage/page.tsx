import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, fieldStyle, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { logUsage } from '../actions';

export default async function UsagePage({
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

  const [{ data: items }, { data: logs }] = await Promise.all([
    supabase.from('wear_items').select('id, name').order('name'),
    supabase
      .from('wear_usage_logs')
      .select('id, worn_on, item_id, note')
      .order('worn_on', { ascending: false })
      .limit(40),
  ]);
  const itemName = new Map((items ?? []).map((i) => [i.id, i.name]));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Usage log</h1>
      <p style={muted}>Log what you actually wore — this is what powers cost-per-wear.</p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error === 'required' ? 'Choose an item.' : sp.error}
        </p>
      ) : null}

      <form action={logUsage} style={{ ...card, display: 'grid', gap: space.md }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: space.md }}>
          <div>
            <label style={labelStyle} htmlFor="item_id">
              Item worn
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
          <div>
            <label style={labelStyle} htmlFor="worn_on">
              Date
            </label>
            <input
              id="worn_on"
              name="worn_on"
              type="date"
              defaultValue={today}
              style={fieldStyle}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle} htmlFor="note">
            Note (optional)
          </label>
          <input id="note" name="note" style={fieldStyle} />
        </div>
        <button type="submit" style={primaryBtn}>
          Log wear
        </button>
      </form>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.xs }}>
        {(logs ?? []).length === 0 ? (
          <p style={muted}>No wears logged yet.</p>
        ) : (
          (logs ?? []).map((l) => (
            <div
              key={l.id}
              style={{ ...card, display: 'flex', justifyContent: 'space-between', gap: space.sm }}
            >
              <span style={{ color: color.text }}>
                {l.item_id ? (itemName.get(l.item_id) ?? 'Item') : 'Outfit'}
                {l.note ? <span style={muted}> · {l.note}</span> : null}
              </span>
              <span style={{ ...muted, fontSize: fontSize.xs }}>{l.worn_on}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
