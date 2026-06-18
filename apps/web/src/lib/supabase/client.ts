'use client';

import { createSupabaseClient, type AltaSupabaseClient } from '@alta/database';
import { env } from '@/env';

/** Browser Supabase client using the publishable key only. */
export function createBrowserSupabaseClient(): AltaSupabaseClient {
  return createSupabaseClient({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    key: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
