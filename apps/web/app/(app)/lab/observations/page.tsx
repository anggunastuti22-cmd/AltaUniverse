import { redirect } from 'next/navigation';
import { color, fontSize, radius, space } from '@alta/design-tokens';
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
    .select('id, observed_on, note, image_path')
    .order('observed_on', { ascending: false })
    .limit(60);
  const today = new Date().toISOString().slice(0, 10);

  // Resolve private skin-image paths to short-lived signed URLs.
  const imageUrl = new Map<string, string>();
  const withImages = (logs ?? []).filter(
    (l): l is typeof l & { image_path: string } => !!l.image_path,
  );
  if (withImages.length > 0) {
    const { data: signed } = await supabase.storage.from('skin-images').createSignedUrls(
      withImages.map((l) => l.image_path),
      3600,
    );
    const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
    for (const l of withImages) {
      const url = byPath.get(l.image_path);
      if (url) imageUrl.set(l.id, url);
    }
  }

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
        <div>
          <label style={labelStyle} htmlFor="image">
            Photo (optional, private)
          </label>
          <input id="image" name="image" type="file" accept="image/*" style={fieldStyle} />
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
              {imageUrl.get(l.id) ? (
                <img
                  src={imageUrl.get(l.id)}
                  alt="Skin observation"
                  style={{
                    marginTop: space.sm,
                    maxWidth: 220,
                    borderRadius: radius.md,
                    display: 'block',
                  }}
                />
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
