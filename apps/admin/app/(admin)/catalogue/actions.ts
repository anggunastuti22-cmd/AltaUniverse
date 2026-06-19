'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length > 0 ? s : null;
}
function lines(fd: FormData, key: string): string[] {
  const v = fd.get(key);
  if (typeof v !== 'string') return [];
  return v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export async function createProduct(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const name = str(formData, 'name');
  const category = str(formData, 'category');
  if (!name || !category) redirect('/catalogue?error=required');
  const { error } = await supabase.from('lab_products').insert({
    name,
    category,
    brand: str(formData, 'brand'),
    key_ingredients: lines(formData, 'key_ingredients'),
    is_published: formData.get('is_published') === 'on',
  });
  if (error) redirect(`/catalogue?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/catalogue');
  redirect('/catalogue');
}

export async function togglePublish(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  const next = formData.get('next') === 'true';
  await supabase.from('lab_products').update({ is_published: next }).eq('id', id);
  revalidatePath('/catalogue');
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  const { error } = await supabase.from('lab_products').delete().eq('id', id);
  if (error) redirect(`/catalogue?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/catalogue');
}
