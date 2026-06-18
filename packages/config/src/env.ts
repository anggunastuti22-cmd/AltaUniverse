import { z } from 'zod';

/**
 * Minimal, framework-agnostic environment validator.
 *
 * Rules enforced (see CLAUDE.md / PRIVACY_AND_SECURITY.md):
 * - Environment variables are validated at startup; invalid config fails fast.
 * - `client` variables are safe to expose to web/mobile bundles (e.g. the
 *   Supabase *publishable* key). They MUST be validated everywhere.
 * - `server` variables (e.g. the Supabase *secret* key) are only validated and
 *   returned in a server context, never shipped to a client.
 *
 * Set `SKIP_ENV_VALIDATION=1` to bypass validation during build/CI steps that
 * do not have real values available.
 */
export interface CreateEnvOptions<TClient extends z.ZodRawShape, TServer extends z.ZodRawShape> {
  /** Variables safe to expose to clients. */
  client: TClient;
  /** Server-only variables (secrets). Never validated/returned on the client. */
  server?: TServer;
  /** Raw values, typically `process.env`. */
  runtimeEnv: Record<string, string | undefined>;
  /** Whether this is a trusted server runtime. Defaults to `typeof window === 'undefined'`. */
  isServer?: boolean;
}

export type InferEnv<TClient extends z.ZodRawShape, TServer extends z.ZodRawShape> = z.infer<
  z.ZodObject<TClient>
> &
  Partial<z.infer<z.ZodObject<TServer>>>;

export function createEnv<
  TClient extends z.ZodRawShape,
  TServer extends z.ZodRawShape = Record<never, never>,
>(options: CreateEnvOptions<TClient, TServer>): InferEnv<TClient, TServer> {
  const { client, server, runtimeEnv } = options;
  // Avoid referencing the DOM `window` type so this stays usable in pure
  // (non-DOM) tsconfig contexts.
  const isServer =
    options.isServer ?? typeof (globalThis as { window?: unknown }).window === 'undefined';

  const skip = runtimeEnv.SKIP_ENV_VALIDATION === '1' || runtimeEnv.SKIP_ENV_VALIDATION === 'true';
  if (skip) {
    return runtimeEnv as unknown as InferEnv<TClient, TServer>;
  }

  const clientSchema = z.object(client);
  const serverSchema = z.object((server ?? {}) as TServer);
  const schema = isServer ? clientSchema.merge(serverSchema) : clientSchema;

  const parsed = schema.safeParse(runtimeEnv);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment variables: ${JSON.stringify(fieldErrors, null, 2)}`);
  }

  return parsed.data as InferEnv<TClient, TServer>;
}
