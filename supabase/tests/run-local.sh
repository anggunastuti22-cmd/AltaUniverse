#!/usr/bin/env bash
# Run the database tests against a throwaway PostgreSQL cluster (no Docker).
#
# Canonical path (with Docker) is `supabase test db`, which runs these same
# pgTAP files against the local Supabase stack. This script lets the tests run
# in environments without Docker by emulating Supabase's auth/storage preamble
# via _shim.sql.
#
# Requirements: PostgreSQL server binaries + the pgTAP extension installed.
set -euo pipefail

PG_BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS="$HERE/../migrations"
WORK="$(mktemp -d)"
PGDATA="$WORK/data"
PORT="${PGPORT:-54399}"
export PGHOST="$WORK" PGPORT="$PORT" PGDATABASE="altatest" PGUSER="${PGUSER:-postgres}"

cleanup() { "$PG_BIN/pg_ctl" -D "$PGDATA" stop -m immediate >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

"$PG_BIN/initdb" -D "$PGDATA" -U "$PGUSER" --auth=trust >/dev/null
"$PG_BIN/pg_ctl" -D "$PGDATA" -o "-p $PORT -k '$WORK' -c listen_addresses=''" -w start >/dev/null
createdb -h "$WORK" -p "$PORT" -U "$PGUSER" altatest

psql -v ON_ERROR_STOP=1 -q -f "$HERE/_shim.sql"
psql -v ON_ERROR_STOP=1 -q -c 'create extension if not exists pgtap;'
for m in "$MIGRATIONS"/*.sql; do
  psql -v ON_ERROR_STOP=1 -q -f "$m"
done

status=0
for t in "$HERE"/*.test.sql; do
  echo "── $(basename "$t") ──"
  psql -tA -v ON_ERROR_STOP=1 -q -f "$t" | tee "$WORK/out.tap" | grep -E '^(ok|not ok|# )' || true
  if grep -qE '^not ok' "$WORK/out.tap"; then status=1; fi
done

[ "$status" -eq 0 ] && echo "ALL DATABASE TESTS PASSED" || echo "DATABASE TESTS FAILED"
exit "$status"
