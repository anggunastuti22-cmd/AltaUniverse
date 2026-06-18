import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@alta/database';
import { env } from '@/env';

/**
 * Server Supabase client bound to the request's cookies. Uses the publishable
 * key only — the service/secret key is never used here.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // `setAll` from a Server Component — safe to ignore; the session is
            // refreshed by middleware (see src/lib/supabase/middleware.ts).
          }
        },
      },
    },
  );
}
