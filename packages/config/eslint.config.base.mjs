// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * Shared flat ESLint config for the Alta Universe monorepo.
 * Formatting is handled by Prettier; this config focuses on correctness rules.
 */
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.tsbuildinfo',
      '**/.expo/**',
      'apps/mobile/assets/**',
      '**/*.gen.ts',
      'supabase/functions/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2023,
      },
    },
    rules: {
      // CLAUDE.md: avoid `any`; an unavoidable escape hatch must be justified
      // with an inline eslint-disable comment explaining why.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    // CommonJS config files (Metro, Babel) legitimately use require().
    files: ['**/*.cjs', '**/*.js', '**/metro.config.js', '**/babel.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
