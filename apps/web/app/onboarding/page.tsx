import { redirect } from 'next/navigation';
import { Button } from '@alta/ui';
import { color, space } from '@alta/design-tokens';
import { createClient } from '@/lib/supabase/server';
import { saveOnboarding } from './actions';

const fieldStyle = {
  display: 'block',
  width: '100%',
  padding: space.sm,
  marginTop: space.xs,
  marginBottom: space.md,
  borderRadius: 8,
  border: `1px solid ${color.border}`,
  fontSize: 16,
} as const;

export default async function OnboardingPage({
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at')
    .eq('id', user.id)
    .maybeSingle();
  if (profile?.onboarded_at) redirect('/home');

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: space.xl }}>
      <h1>Welcome to Alta Universe</h1>
      <p style={{ color: color.textMuted }}>
        A few basics to set up your profile. You can change everything later in your privacy centre.
      </p>

      {sp.error ? (
        <p role="alert" style={{ color: color.danger }}>
          {sp.error}
        </p>
      ) : null}

      <form action={saveOnboarding}>
        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          required
          maxLength={80}
          style={fieldStyle}
        />

        <label htmlFor="timezone">Timezone</label>
        <input
          id="timezone"
          name="timezone"
          type="text"
          defaultValue="UTC"
          required
          style={fieldStyle}
        />

        <fieldset
          style={{ border: `1px solid ${color.border}`, borderRadius: 8, padding: space.md }}
        >
          <legend>Consent (all optional, change anytime)</legend>

          <label
            style={{ display: 'flex', gap: space.sm, alignItems: 'center', marginBottom: space.sm }}
          >
            <input type="checkbox" name="consent_analytics" />
            Allow privacy-safe, aggregated analytics (no private content).
          </label>

          <label
            style={{ display: 'flex', gap: space.sm, alignItems: 'center', marginBottom: space.sm }}
          >
            <input type="checkbox" name="consent_notifications" />
            Allow reminders and notifications.
          </label>

          <label style={{ display: 'flex', gap: space.sm, alignItems: 'center' }}>
            <input type="checkbox" name="consent_ai" />
            Allow AI processing (off by default; reflection/education only — never diagnosis).
          </label>
        </fieldset>

        <div style={{ marginTop: space.lg }}>
          <Button type="submit">Finish setup</Button>
        </div>
      </form>
    </main>
  );
}
