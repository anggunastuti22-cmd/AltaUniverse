import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, fieldStyle, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { logObservation } from '../actions';

export default async function ObservationsPage({
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

  const { data: logs } = await supabase
    .from('lab_skin_logs')
    .select('id, observed_on, note')
    .order('observed_on', { ascending: false })
    .limit(60);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Observation log</h1>
      <p style={muted}>Note what you observe, gently and in your own words. Private to you.</p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error}
        </p>
      ) : null}

      <form action={logObservation} style={{ ...card, display: 'grid', gap: space.md }}>
        <div>
          <label style={labelStyle} htmlFor="observed_on">
            Date
          </label>
          <input
            id="observed_on"
            name="observed_on"
            type="date"
            defaultValue={today}
            style={fieldStyle}
          />
        </div>
        <div>
          <label style={labelStyle} htmlFor="note">
            What did you notice?
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            required
            placeholder="Skin felt balanced today."
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>
        <button type="submit" style={primaryBtn}>
          Save observation
        </button>
      </form>

      <div style={{ marginTop: space.xl, display: 'grid', gap: space.sm }}>
        {(logs ?? []).length === 0 ? (
          <p style={muted}>No observations yet.</p>
        ) : (
          (logs ?? []).map((l) => (
            <article key={l.id} style={card}>
              <span style={{ ...muted, fontSize: fontSize.xs }}>{l.observed_on}</span>
              <p style={{ margin: `${space.xs}px 0 0`, color: color.text, whiteSpace: 'pre-wrap' }}>
                {l.note}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
