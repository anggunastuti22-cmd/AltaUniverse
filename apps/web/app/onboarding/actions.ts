'use server';

import { redirect } from 'next/navigation';
import { profileSchema } from '@alta/validation';
import type { ConsentType } from '@alta/validation';
import { createClient } from '@/lib/supabase/server';

const onboardingSchema = profileSchema.pick({ displayName: true, timezone: true });

export async function saveOnboarding(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const parsed = onboardingSchema.safeParse({
    displayName: String(formData.get('displayName') ?? ''),
    timezone: String(formData.get('timezone') ?? 'UTC'),
  });
  if (!parsed.success) {
    redirect(`/onboarding?error=${encodeURIComponent('Please enter a valid name.')}`);
  }

  const now = new Date().toISOString();

  const { error: profileError } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      display_name: parsed.data.displayName,
      timezone: parsed.data.timezone,
      locale: 'en',
      onboarded_at: now,
    },
    { onConflict: 'id' },
  );
  if (profileError) {
    redirect(`/onboarding?error=${encodeURIComponent(profileError.message)}`);
  }

  await supabase.from('user_preferences').upsert({ user_id: user.id }, { onConflict: 'user_id' });

  // Consent is opt-in. AI processing is OFF unless explicitly checked.
  const consentFlags: Record<ConsentType, boolean> = {
    analytics: formData.get('consent_analytics') === 'on',
    notifications: formData.get('consent_notifications') === 'on',
    ai_processing: formData.get('consent_ai') === 'on',
  };

  const consentRows = (Object.entries(consentFlags) as [ConsentType, boolean][]).map(
    ([consentType, granted]) => ({
      user_id: user.id,
      consent_type: consentType,
      granted,
      granted_at: granted ? now : null,
      revoked_at: null,
    }),
  );

  await supabase.from('user_consents').upsert(consentRows, { onConflict: 'user_id,consent_type' });

  redirect('/home');
}
