'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@alta/database';
import { env } from '@/env';

/** Browser Supabase client (cookie-based session) using the publishable key only. */
export function createClient() {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
