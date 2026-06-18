import { z } from 'zod';
import { createEnv } from '@alta/config';

/**
 * Validated environment for the web app.
 *
 * Client variables (NEXT_PUBLIC_*) are safe to ship to the browser and may only
 * contain the Supabase **publishable** key. The secret key is server-only and
 * is never prefixed with NEXT_PUBLIC.
 */
export const env = createEnv({
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  },
  server: {
    SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
  },
});
