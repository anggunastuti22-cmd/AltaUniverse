'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Database } from '@alta/database';
import { createClient } from '@/lib/supabase/server';

type IngredientClass = Database['public']['Enums']['ingredient_class'];

const INGREDIENT_CLASSES: readonly IngredientClass[] = [
  'retinoid',
  'aha',
  'bha',
  'vitamin_c',
  'niacinamide',
  'benzoyl_peroxide',
  'peptide',
  'hydrator',
  'ceramide',
  'spf',
  'antioxidant',
  'exfoliant_physical',
  'other',
];

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length > 0 ? s : null;
}

function ingredientClass(fd: FormData, key: string): IngredientClass | null {
  const s = str(fd, key);
  if (!s) return null;
  return (INGREDIENT_CLASSES as readonly string[]).includes(s) ? (s as IngredientClass) : null;
}

export async function createIngredient(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const name = str(formData, 'name');
  const slug = str(formData, 'slug');
  if (!name || !slug) redirect('/ingredients?error=required');
  const { error } = await supabase.from('lab_ingredients').insert({
    name,
    slug,
    inci_name: str(formData, 'inci_name'),
    class: ingredientClass(formData, 'class'),
    summary: str(formData, 'summary'),
    is_published: formData.get('is_published') === 'on',
  });
  if (error) redirect(`/ingredients?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/ingredients');
  redirect('/ingredients');
}

export async function togglePublishIngredient(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  const next = formData.get('next') === 'true';
  await supabase.from('lab_ingredients').update({ is_published: next }).eq('id', id);
  revalidatePath('/ingredients');
}

export async function deleteIngredient(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  const { error } = await supabase.from('lab_ingredients').delete().eq('id', id);
  if (error) redirect(`/ingredients?error=${encodeURIComponent(error.message)}`);
  revalidatePath('/ingredients');
}
