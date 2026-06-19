'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

export async function markRead(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const { supabase } = await requireUser();
  await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  revalidatePath('/notifications');
}

export async function markAllRead(): Promise<void> {
  const { supabase, user } = await requireUser();
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);
  revalidatePath('/notifications');
}

export async function deleteNotification(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '');
  const { supabase } = await requireUser();
  await supabase.from('notifications').delete().eq('id', id);
  revalidatePath('/notifications');
}
