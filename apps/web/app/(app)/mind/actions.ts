'use server';

import { redirect } from 'next/navigation';
import { toDateKey } from '@alta/domain';
import { createClient } from '@/lib/supabase/server';

const NEEDS = ['rest', 'space', 'connection', 'focus', 'movement', 'comfort', 'direction'] as const;
type Need = (typeof NEEDS)[number];

function numField(fd: FormData, key: string): number | null {
  const v = fd.get(key);
  if (v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function strField(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  const s = typeof v === 'string' ? v.trim() : '';
  return s.length > 0 ? s : null;
}

function listField(fd: FormData, key: string): string[] {
  const v = fd.get(key);
  if (typeof v !== 'string') return [];
  return v
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return { supabase, user };
}

/** Current ISO Monday (YYYY-MM-DD) for weekly reviews. */
function currentWeekStart(d: Date): string {
  const day = (d.getUTCDay() + 6) % 7; // 0 = Monday
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
  return monday.toISOString().slice(0, 10);
}

export async function saveCheckin(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .maybeSingle();
  const date = toDateKey(new Date(), profile?.timezone ?? undefined);

  const needRaw = strField(formData, 'primary_need');
  const primary_need: Need | null =
    needRaw && (NEEDS as readonly string[]).includes(needRaw) ? (needRaw as Need) : null;

  const { error } = await supabase.from('mind_checkins').upsert(
    {
      user_id: user.id,
      checkin_date: date,
      mood: numField(formData, 'mood'),
      energy: numField(formData, 'energy'),
      focus: numField(formData, 'focus'),
      mental_load: numField(formData, 'mental_load'),
      primary_need,
      note: strField(formData, 'note'),
    },
    { onConflict: 'user_id,checkin_date' },
  );
  if (error) redirect(`/mind/check-in?error=${encodeURIComponent(error.message)}`);
  redirect('/mind/check-in?saved=1');
}

export async function createJournalEntry(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const body = strField(formData, 'body');
  if (!body) redirect('/mind/journal?error=empty');
  const lifeDomainId = strField(formData, 'life_domain_id');
  const { error } = await supabase.from('mind_journal_entries').insert({
    user_id: user.id,
    body,
    life_domain_id: lifeDomainId,
    tags: listField(formData, 'tags'),
  });
  if (error) redirect(`/mind/journal?error=${encodeURIComponent(error.message)}`);
  redirect('/mind/journal');
}

export async function createLifeDomain(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const name = strField(formData, 'name');
  if (!name) redirect('/mind/domains?error=empty');
  const { error } = await supabase.from('mind_life_domains').insert({
    user_id: user.id,
    name,
    description: strField(formData, 'description'),
  });
  if (error) redirect(`/mind/domains?error=${encodeURIComponent(error.message)}`);
  redirect('/mind/domains');
}

export async function createGoal(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const title = strField(formData, 'title');
  if (!title) redirect('/mind/goals?error=empty');
  const { error } = await supabase.from('mind_goals').insert({
    user_id: user.id,
    title,
    detail: strField(formData, 'detail'),
    life_domain_id: strField(formData, 'life_domain_id'),
  });
  if (error) redirect(`/mind/goals?error=${encodeURIComponent(error.message)}`);
  redirect('/mind/goals');
}

export async function saveWeeklyReview(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from('mind_weekly_reviews').upsert(
    {
      user_id: user.id,
      week_start: currentWeekStart(new Date()),
      wins: strField(formData, 'wins'),
      friction: strField(formData, 'friction'),
      intention: strField(formData, 'intention'),
    },
    { onConflict: 'user_id,week_start' },
  );
  if (error) redirect(`/mind/weekly?error=${encodeURIComponent(error.message)}`);
  redirect('/mind/weekly?saved=1');
}

export async function createDecision(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const title = strField(formData, 'title');
  if (!title) redirect('/mind/decisions?error=empty');
  const { error } = await supabase.from('mind_decisions').insert({
    user_id: user.id,
    title,
    context: strField(formData, 'context'),
    options: listField(formData, 'options'),
    factors: listField(formData, 'factors'),
    reflection: strField(formData, 'reflection'),
  });
  if (error) redirect(`/mind/decisions?error=${encodeURIComponent(error.message)}`);
  redirect('/mind/decisions');
}
