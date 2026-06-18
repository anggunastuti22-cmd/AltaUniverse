'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { consentTypeSchema } from '@alta/validation';
import { createClient } from '@/lib/supabase/server';

export async function setConsent(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const consentType = consentTypeSchema.parse(formData.get('consent_type'));
  const granted = formData.get('granted') === 'true';
  const now = new Date().toISOString();

  await supabase.from('user_consents').upsert(
    {
      user_id: user.id,
      consent_type: consentType,
      granted,
      granted_at: granted ? now : null,
      revoked_at: granted ? null : now,
    },
    { onConflict: 'user_id,consent_type' },
  );

  revalidatePath('/account/privacy');
}
