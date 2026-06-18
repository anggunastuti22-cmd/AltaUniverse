import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/app-shell';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, onboarded_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.onboarded_at) redirect('/onboarding');

  return <AppShell displayName={profile.display_name}>{children}</AppShell>;
}
