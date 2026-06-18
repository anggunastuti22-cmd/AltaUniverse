import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { toDateKey } from '@alta/domain';
import { createClient } from '@/lib/supabase/server';
import { card, field, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { saveCheckin } from '../actions';

const MOOD = [
  { v: 1, l: 'Low' },
  { v: 2, l: 'Tender' },
  { v: 3, l: 'Even' },
  { v: 4, l: 'Good' },
  { v: 5, l: 'Bright' },
];
const SCALE = [1, 2, 3, 4, 5];
const LOAD = [
  { v: 1, l: 'Light' },
  { v: 2, l: '·' },
  { v: 3, l: '·' },
  { v: 4, l: '·' },
  { v: 5, l: 'Heavy' },
];
const NEEDS = ['rest', 'space', 'connection', 'focus', 'movement', 'comfort', 'direction'];

function Segments({
  name,
  options,
  current,
}: {
  name: string;
  options: { v: string | number; l: string }[];
  current: number | string | null;
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <label key={o.v} className="seg-opt">
          <input
            type="radio"
            name={name}
            value={o.v}
            defaultChecked={current !== null && String(current) === String(o.v)}
          />
          <span>{o.l}</span>
        </label>
      ))}
    </div>
  );
}

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const sp = await searchParams;
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

  const { data: existing } = await supabase
    .from('mind_checkins')
    .select('mood, energy, focus, mental_load, primary_need, note')
    .eq('user_id', user.id)
    .eq('checkin_date', today)
    .maybeSingle();

  return (
    <div style={page}>
      <style>{`
        .seg{display:flex;gap:6px;flex-wrap:wrap}
        .seg-opt{position:relative;display:inline-flex;align-items:center;justify-content:center;
          min-width:44px;min-height:44px;padding:8px 14px;border:1px solid var(--alta-color-border);
          border-radius:8px;background:var(--alta-color-surface);color:var(--alta-color-textMuted);
          cursor:pointer;font-size:14px;user-select:none}
        .seg-opt input{position:absolute;inset:0;opacity:0;cursor:pointer;margin:0}
        .seg-opt:has(input:checked){background:var(--alta-color-mindSoft);border-color:var(--alta-color-mind);
          color:var(--alta-color-textStrong);font-weight:600}
        .seg-opt:has(input:focus-visible){outline:2px solid var(--alta-color-focusRing);outline-offset:2px}
      `}</style>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
        }}
      >
        <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>How is your mind today?</h1>
        <span style={{ ...muted, fontSize: fontSize.sm }}>Editable until midnight</span>
      </div>
      <p style={muted}>
        A one-minute reflection. We record, we never grade — no scores, no streaks, load is neutral.
      </p>

      {sp.saved ? (
        <p role="status" style={{ color: color.success }}>
          Saved. Thank you for checking in.
        </p>
      ) : null}
      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {decodeURIComponent(sp.error)}
        </p>
      ) : null}

      <form
        action={saveCheckin}
        style={{ ...card, display: 'grid', gap: space.lg, marginTop: space.md }}
      >
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>Mood</legend>
          <Segments name="mood" options={MOOD} current={existing?.mood ?? null} />
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>Energy</legend>
          <Segments
            name="energy"
            options={SCALE.map((v) => ({ v, l: String(v) }))}
            current={existing?.energy ?? null}
          />
          <span style={{ ...muted, fontSize: fontSize.xs }}>
            Low is welcome too — and that&apos;s okay.
          </span>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>Focus</legend>
          <Segments
            name="focus"
            options={SCALE.map((v) => ({ v, l: String(v) }))}
            current={existing?.focus ?? null}
          />
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>Mental load</legend>
          <Segments name="mental_load" options={LOAD} current={existing?.mental_load ?? null} />
          <span style={{ ...muted, fontSize: fontSize.xs }}>
            Information about capacity, never a failure.
          </span>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>Primary need right now</legend>
          <Segments
            name="primary_need"
            options={NEEDS.map((n) => ({ v: n, l: n.charAt(0).toUpperCase() + n.slice(1) }))}
            current={existing?.primary_need ?? null}
          />
        </fieldset>

        <div>
          <label style={labelStyle} htmlFor="note">
            A note <span style={muted}>(optional, private)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={4}
            defaultValue={existing?.note ?? ''}
            placeholder="Anything you want to remember about today…"
            style={{ ...field, resize: 'vertical' }}
          />
          <span style={{ ...muted, fontSize: fontSize.xs }}>
            Private to you · admin can never read it.
          </span>
        </div>

        <div>
          <button type="submit" style={primaryBtn}>
            {existing ? 'Update check-in' : 'Save check-in'}
          </button>
        </div>
      </form>
    </div>
  );
}
