import { redirect } from 'next/navigation';
import { color, fontSize, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { card, eduBox, fieldStyle, label as labelStyle, muted, page, primaryBtn } from '../ui';
import { saveBaseline } from '../actions';

const SKIN_TYPES = ['dry', 'combination', 'normal', 'oily', 'sensitive'];
const CONCERNS = ['Dryness', 'Texture', 'Redness', 'Breakouts', 'Dullness'];

export default async function BaselinePage({
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
    .from('lab_skin_profiles')
    .select('skin_type, concerns, sensitivities, notes')
    .eq('user_id', user.id)
    .maybeSingle();
  const concerns = new Set(profile?.concerns ?? []);

  return (
    <div style={page}>
      <h1 style={{ fontSize: fontSize['2xl'], marginTop: 0 }}>Skin baseline</h1>
      <p style={muted}>
        Describe your skin in your own words. A personal starting point for tracking — never a
        diagnosis, and easy to change.
      </p>

      <div style={{ ...eduBox, marginBottom: space.lg }}>
        There are no right answers and nothing is permanent. This is self-described, not clinical.
      </div>

      {sp.saved ? (
        <p role="status" style={{ color: color.success }}>
          Saved.
        </p>
      ) : null}

      <form action={saveBaseline} style={{ ...card, display: 'grid', gap: space.lg }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>Skin type, as you&apos;d describe it</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.md }}>
            {SKIN_TYPES.map((t) => (
              <label
                key={t}
                style={{
                  display: 'flex',
                  gap: space.xs,
                  alignItems: 'center',
                  textTransform: 'capitalize',
                }}
              >
                <input
                  type="radio"
                  name="skin_type"
                  value={t}
                  defaultChecked={profile?.skin_type === t}
                />
                {t}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={labelStyle}>Things you&apos;d like to track</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: space.md }}>
            {CONCERNS.map((c) => (
              <label key={c} style={{ display: 'flex', gap: space.xs, alignItems: 'center' }}>
                <input type="checkbox" name="concerns" value={c} defaultChecked={concerns.has(c)} />
                {c}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label style={labelStyle} htmlFor="sensitivities">
            Known sensitivities (optional, one per line)
          </label>
          <textarea
            id="sensitivities"
            name="sensitivities"
            rows={2}
            defaultValue={(profile?.sensitivities ?? []).join('\n')}
            placeholder="Fragrance"
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="notes">
            Anything else to note (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            defaultValue={profile?.notes ?? ''}
            placeholder="Tightness after cleansing in winter."
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        <div>
          <button type="submit" style={primaryBtn}>
            Save baseline
          </button>
        </div>
      </form>
    </div>
  );
}
