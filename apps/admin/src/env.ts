import { z } from 'zod';
import { createEnv } from '@alta/config';

/**
 * Validated environment for the admin (operator) console.
 *
 * The admin app operates on operational/public data and anonymized analytics
 * only. It never holds a key that bypasses RLS on private user tables
 * (see WEB_MOBILE_ADMIN_BOUNDARIES.md).
 */
export const env = createEnv({
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
  },
});
