import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createEnv } from './env';

describe('createEnv', () => {
  const client = {
    PUBLIC_URL: z.string().url(),
    PUBLIC_KEY: z.string().min(1),
  };
  const server = {
    SECRET_KEY: z.string().min(1),
  };

  it('parses valid client variables', () => {
    const env = createEnv({
      client,
      runtimeEnv: { PUBLIC_URL: 'https://example.com', PUBLIC_KEY: 'pk' },
      isServer: false,
    });
    expect(env.PUBLIC_URL).toBe('https://example.com');
    expect(env.PUBLIC_KEY).toBe('pk');
  });

  it('throws when a required client variable is missing', () => {
    expect(() =>
      createEnv({
        client,
        runtimeEnv: { PUBLIC_URL: 'https://example.com' },
        isServer: false,
      }),
    ).toThrow(/Invalid environment variables/);
  });

  it('validates server variables only on the server', () => {
    // On the client, missing server secret is fine and not returned.
    expect(() =>
      createEnv({
        client,
        server,
        runtimeEnv: { PUBLIC_URL: 'https://example.com', PUBLIC_KEY: 'pk' },
        isServer: false,
      }),
    ).not.toThrow();

    // On the server, the secret is required.
    expect(() =>
      createEnv({
        client,
        server,
        runtimeEnv: { PUBLIC_URL: 'https://example.com', PUBLIC_KEY: 'pk' },
        isServer: true,
      }),
    ).toThrow(/Invalid environment variables/);
  });

  it('bypasses validation when SKIP_ENV_VALIDATION is set', () => {
    const env = createEnv({
      client,
      runtimeEnv: { SKIP_ENV_VALIDATION: '1' },
      isServer: false,
    });
    expect(env).toBeDefined();
  });
});
