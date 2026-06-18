#!/usr/bin/env node
// Generate Supabase-compatible TypeScript types from a live PostgreSQL schema
// using only `psql` (no Docker). This is the no-Docker alternative to
// `supabase gen types typescript` (see `pnpm db:types`).
//
// Usage: DATABASE_URL=postgres://... node scripts/generate-db-types.mjs > out.ts
import { execFileSync } from 'node:child_process';

const DB = process.env.DATABASE_URL;
if (!DB) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const q = (sql) => execFileSync('psql', [DB, '-tAqc', sql], { encoding: 'utf8' }).trim();

const enums = JSON.parse(
  q(`select coalesce(json_object_agg(t.typname, labels), '{}')
     from (
       select t.typname, json_agg(e.enumlabel order by e.enumsortorder) as labels
       from pg_type t
       join pg_enum e on e.enumtypid = t.oid
       join pg_namespace n on n.oid = t.typnamespace
       where n.nspname = 'public'
       group by t.typname
     ) t`),
);

const columns = JSON.parse(
  q(`select coalesce(json_agg(c order by c.table_name, c.ordinal_position), '[]')
     from (
       select c.table_name, c.column_name, c.ordinal_position, c.is_nullable,
              c.column_default, c.is_identity, c.data_type, c.udt_name
       from information_schema.columns c
       join information_schema.tables t
         on t.table_schema = c.table_schema and t.table_name = c.table_name
       where c.table_schema = 'public' and t.table_type = 'BASE TABLE'
     ) c`),
);

const scalar = (udt) => {
  if (udt in enums) return enums[udt].map((v) => JSON.stringify(v)).join(' | ');
  switch (udt) {
    case 'bool':
      return 'boolean';
    case 'int2':
    case 'int4':
    case 'int8':
    case 'numeric':
    case 'float4':
    case 'float8':
      return 'number';
    case 'json':
    case 'jsonb':
      return 'Json';
    default:
      return 'string'; // uuid, text, varchar, bpchar, date, timestamptz, ...
  }
};

const tsType = (col) => {
  if (col.data_type === 'ARRAY') return `${scalar(col.udt_name.replace(/^_/, ''))}[]`;
  return scalar(col.udt_name);
};

const byTable = {};
for (const c of columns) (byTable[c.table_name] ??= []).push(c);

const ind = (n) => '  '.repeat(n);
let out = '';
out += '// GENERATED FILE — do not edit by hand.\n';
out += '// Regenerate with: pnpm db:types (Supabase CLI) or pnpm db:types:local (psql).\n\n';
out +=
  'export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];\n\n';
out += 'export interface Database {\n';
out += ind(1) + 'public: {\n';
out += ind(2) + 'Tables: {\n';

for (const table of Object.keys(byTable).sort()) {
  const cols = byTable[table];
  out += ind(3) + `${table}: {\n`;
  // Row
  out += ind(4) + 'Row: {\n';
  for (const c of cols) {
    const nul = c.is_nullable === 'YES' ? ' | null' : '';
    out += ind(5) + `${c.column_name}: ${tsType(c)}${nul};\n`;
  }
  out += ind(4) + '};\n';
  // Insert
  out += ind(4) + 'Insert: {\n';
  for (const c of cols) {
    const optional =
      c.is_nullable === 'YES' || c.column_default !== null || c.is_identity === 'YES';
    const nul = c.is_nullable === 'YES' ? ' | null' : '';
    out += ind(5) + `${c.column_name}${optional ? '?' : ''}: ${tsType(c)}${nul};\n`;
  }
  out += ind(4) + '};\n';
  // Update (all optional)
  out += ind(4) + 'Update: {\n';
  for (const c of cols) {
    const nul = c.is_nullable === 'YES' ? ' | null' : '';
    out += ind(5) + `${c.column_name}?: ${tsType(c)}${nul};\n`;
  }
  out += ind(4) + '};\n';
  out += ind(4) + 'Relationships: [];\n';
  out += ind(3) + '};\n';
}

out += ind(2) + '};\n';
out += ind(2) + 'Views: Record<string, never>;\n';
out += ind(2) + 'Functions: Record<string, never>;\n';
out += ind(2) + 'Enums: {\n';
for (const name of Object.keys(enums).sort()) {
  out += ind(3) + `${name}: ${enums[name].map((v) => JSON.stringify(v)).join(' | ')};\n`;
}
out += ind(2) + '};\n';
out += ind(2) + 'CompositeTypes: Record<string, never>;\n';
out += ind(1) + '};\n';
out += '}\n';

process.stdout.write(out);
