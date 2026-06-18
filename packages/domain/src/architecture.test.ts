import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Architecture boundary test (CLAUDE.md §1): `packages/domain` is pure and must
 * not depend on any framework / I/O library. If this fails, framework code has
 * leaked into shared domain logic.
 */
const srcDir = dirname(fileURLToPath(import.meta.url));
const forbidden = ['react', 'react-dom', 'react-native', 'next', 'expo', '@supabase/supabase-js'];

function sourceFiles(): string[] {
  return readdirSync(srcDir, { recursive: true })
    .filter((entry): entry is string => typeof entry === 'string')
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.test.ts'));
}

describe('domain purity', () => {
  it('does not import framework-specific code', () => {
    for (const file of sourceFiles()) {
      const contents = readFileSync(join(srcDir, file), 'utf8');
      for (const dependency of forbidden) {
        expect(
          contents.includes(`from '${dependency}'`) || contents.includes(`from "${dependency}"`),
          `${file} must not import "${dependency}"`,
        ).toBe(false);
      }
    }
  });
});
