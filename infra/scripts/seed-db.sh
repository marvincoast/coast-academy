#!/usr/bin/env bash
# Aplica seeds SQL manualmente (útil se db reset não rodou os arquivos em supabase/seed/).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DB_CONTAINER="${SUPABASE_DB_CONTAINER:-supabase_db_coast-academy}"

run_sql() {
  local file="$1"
  if command -v psql >/dev/null 2>&1; then
    local db_url="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
    psql "$db_url" -v ON_ERROR_STOP=1 -f "$file"
  elif docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
    docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$file"
  else
    echo "Erro: psql não encontrado e container $DB_CONTAINER não está rodando."
    echo "  Rode: pnpm exec supabase start"
    exit 1
  fi
}

echo "==> Seed curso"
run_sql supabase/seed/01_course.sql
echo "==> Seed questões"
run_sql supabase/seed/02_questions.sql
echo "Done."
