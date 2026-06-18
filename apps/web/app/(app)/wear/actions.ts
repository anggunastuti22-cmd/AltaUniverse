'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length > 0 ? s : null;
}
function num(fd: FormData, key: string): number | null {
  const v = fd.get(key);
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function lines(fd: FormData, key: string): string[] {
  const v = fd.get(key);
  if (typeof v !== 'string') return [];
  return v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
function checks(fd: FormData, key: string): string[] {
  return fd.getAll(key).filter((v): v is string => typeof v === 'string');
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

export async function addItem(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const name = str(formData, 'name');
  const category = str(formData, 'category');
  if (!name || !category) redirect('/wear/wardrobe?error=required');
  const { error } = await supabase.from('wear_items').insert({
    user_id: user.id,
    name,
    category,
    brand: str(formData, 'brand'),
    color: str(formData, 'color'),
    material: str(formData, 'material'),
    price: num(formData, 'price'),
    currency: str(formData, 'currency') ?? 'USD',
    acquired_on: str(formData, 'acquired_on'),
  });
  if (error) redirect(`/wear/wardrobe?error=${encodeURIComponent(error.message)}`);
  redirect('/wear/wardrobe');
}

export async function createOutfit(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const name = str(formData, 'name');
  if (!name) redirect('/wear/outfits?error=required');
  const { error } = await supabase.from('wear_outfits').insert({
    user_id: user.id,
    name,
    occasion: str(formData, 'occasion'),
  });
  if (error) redirect(`/wear/outfits?error=${encodeURIComponent(error.message)}`);
  redirect('/wear/outfits');
}

export async function addOutfitItem(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const outfitId = str(formData, 'outfit_id');
  const itemId = str(formData, 'item_id');
  if (!outfitId || !itemId) redirect('/wear/outfits?error=required');
  await supabase
    .from('wear_outfit_items')
    .upsert(
      { user_id: user.id, outfit_id: outfitId, item_id: itemId },
      { onConflict: 'outfit_id,item_id', ignoreDuplicates: true },
    );
  redirect('/wear/outfits');
}

export async function logUsage(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const itemId = str(formData, 'item_id');
  const outfitId = str(formData, 'outfit_id');
  if (!itemId && !outfitId) redirect('/wear/usage?error=required');
  const { error } = await supabase.from('wear_usage_logs').insert({
    user_id: user.id,
    worn_on: str(formData, 'worn_on') ?? new Date().toISOString().slice(0, 10),
    item_id: itemId,
    outfit_id: outfitId,
    note: str(formData, 'note'),
  });
  if (error) redirect(`/wear/usage?error=${encodeURIComponent(error.message)}`);
  redirect('/wear/usage');
}

export async function createWishlist(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const name = str(formData, 'name');
  if (!name) redirect('/wear/wishlist?error=required');
  const { error } = await supabase.from('wear_wishlist').insert({
    user_id: user.id,
    name,
    reason: str(formData, 'reason'),
    est_price: num(formData, 'est_price'),
    currency: str(formData, 'currency') ?? 'USD',
  });
  if (error) redirect(`/wear/wishlist?error=${encodeURIComponent(error.message)}`);
  redirect('/wear/wishlist');
}

export async function saveStyleProfile(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('wear_style_profiles').upsert(
    {
      user_id: user.id,
      preferred_colors: lines(formData, 'preferred_colors'),
      preferred_fits: checks(formData, 'preferred_fits'),
      occasions: checks(formData, 'occasions'),
      notes: str(formData, 'notes'),
    },
    { onConflict: 'user_id' },
  );
  if (error) redirect(`/wear/style?error=${encodeURIComponent(error.message)}`);
  redirect('/wear/style?saved=1');
}
