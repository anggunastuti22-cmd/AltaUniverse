'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const SKIN_TYPES = ['dry', 'oily', 'combination', 'normal', 'sensitive'] as const;
type SkinType = (typeof SKIN_TYPES)[number];
const FUNCTIONS = ['cleanse', 'treat', 'moisturise', 'protect'] as const;
type Func = (typeof FUNCTIONS)[number];

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
function checks(fd: FormData, key: string): string[] {
  return fd.getAll(key).filter((v): v is string => typeof v === 'string');
}
function lines(fd: FormData, key: string): string[] {
  const v = fd.get(key);
  if (typeof v !== 'string') return [];
  return v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

export async function saveBaseline(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const skinRaw = str(formData, 'skin_type');
  const skin_type: SkinType | null =
    skinRaw && (SKIN_TYPES as readonly string[]).includes(skinRaw) ? (skinRaw as SkinType) : null;
  const { error } = await supabase.from('lab_skin_profiles').upsert(
    {
      user_id: user.id,
      skin_type,
      concerns: checks(formData, 'concerns'),
      sensitivities: lines(formData, 'sensitivities'),
      notes: str(formData, 'notes'),
    },
    { onConflict: 'user_id' },
  );
  if (error) redirect(`/lab/baseline?error=${encodeURIComponent(error.message)}`);
  redirect('/lab/baseline?saved=1');
}

export async function addProduct(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const name = str(formData, 'name');
  if (!name) redirect('/lab/cabinet?error=required');
  const fnRaw = str(formData, 'function');
  const fn: Func | null =
    fnRaw && (FUNCTIONS as readonly string[]).includes(fnRaw) ? (fnRaw as Func) : null;
  const { error } = await supabase.from('lab_user_products').insert({
    user_id: user.id,
    custom_name: name,
    brand: str(formData, 'brand'),
    function: fn,
    cadence: str(formData, 'cadence'),
    price_paid: num(formData, 'price_paid'),
    currency: str(formData, 'currency') ?? 'USD',
    est_uses: num(formData, 'est_uses'),
  });
  if (error) redirect(`/lab/cabinet?error=${encodeURIComponent(error.message)}`);
  redirect('/lab/cabinet');
}

export async function createRoutine(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const timeRaw = str(formData, 'time_of_day');
  const time_of_day: 'am' | 'pm' = timeRaw === 'pm' ? 'pm' : 'am';
  const name = str(formData, 'name');
  if (!name) redirect('/lab/routines?error=required');
  const { error } = await supabase
    .from('lab_routines')
    .insert({ user_id: user.id, time_of_day, name });
  if (error) redirect(`/lab/routines?error=${encodeURIComponent(error.message)}`);
  redirect('/lab/routines');
}

export async function addRoutineStep(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const routineId = str(formData, 'routine_id');
  if (!routineId) redirect('/lab/routines?error=required');
  const { error } = await supabase.from('lab_routine_steps').insert({
    user_id: user.id,
    routine_id: routineId,
    user_product_id: str(formData, 'user_product_id'),
    step_order: num(formData, 'step_order') ?? 1,
    instruction: str(formData, 'instruction'),
  });
  if (error) redirect(`/lab/routines?error=${encodeURIComponent(error.message)}`);
  redirect('/lab/routines');
}

export async function logObservation(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();

  let imagePath: string | null = null;
  const image = formData.get('image');
  if (image instanceof File && image.size > 0) {
    const ext =
      (image.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('skin-images')
      .upload(path, image, { contentType: image.type || 'image/jpeg', upsert: false });
    if (!upErr) imagePath = path;
  }

  const { error } = await supabase.from('lab_skin_logs').insert({
    user_id: user.id,
    observed_on: str(formData, 'observed_on') ?? new Date().toISOString().slice(0, 10),
    note: str(formData, 'note'),
    image_path: imagePath,
  });
  if (error) redirect(`/lab/observations?error=${encodeURIComponent(error.message)}`);
  redirect('/lab/observations');
}

export async function createExperiment(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const hypothesis = str(formData, 'hypothesis');
  if (!hypothesis) redirect('/lab/experiments?error=required');
  const { error } = await supabase.from('lab_experiments').insert({
    user_id: user.id,
    hypothesis,
    user_product_id: str(formData, 'user_product_id'),
    started_on: str(formData, 'started_on'),
  });
  if (error) redirect(`/lab/experiments?error=${encodeURIComponent(error.message)}`);
  redirect('/lab/experiments');
}
