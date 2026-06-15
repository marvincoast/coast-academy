#!/usr/bin/env bash
# Sincroniza chaves do Supabase local em .env.local (dev).
# Uso: ./infra/scripts/sync-env-from-supabase.sh
# Imprime ENV_SYNCED=1 quando o arquivo foi alterado.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="$ROOT/.env.local"

log() { echo "==> $*"; }

json_field() {
  local json="$1"
  local field="$2"
  echo "$json" | sed -n "s/.*\"${field}\": \"\\([^\"]*\\)\".*/\\1/p" | head -1
}

if [[ ! -f "$ENV_FILE" ]]; then
  log ".env.local ausente — copiando de .env.example"
  cp .env.example "$ENV_FILE"
fi

SUPABASE_BIN=""
if command -v supabase >/dev/null 2>&1; then
  SUPABASE_BIN=supabase
elif [[ -x node_modules/.bin/supabase ]]; then
  SUPABASE_BIN="$ROOT/node_modules/.bin/supabase"
fi

if [[ -z "$SUPABASE_BIN" ]]; then
  log "Supabase CLI não encontrado — pule sync ou rode pnpm install"
  exit 0
fi

if ! "$SUPABASE_BIN" status >/dev/null 2>&1; then
  log "Supabase local não está rodando — pule sync ou rode: pnpm exec supabase start"
  exit 0
fi

status_json="$("$SUPABASE_BIN" status -o json 2>/dev/null | awk '/^\{/{found=1} found{print} /^\}/{exit}')"

anon_key="$(json_field "$status_json" ANON_KEY)"
service_role_key="$(json_field "$status_json" SERVICE_ROLE_KEY)"

if [[ -z "$anon_key" || -z "$service_role_key" ]]; then
  log "Não foi possível ler ANON_KEY / SERVICE_ROLE_KEY do supabase status"
  exit 0
fi

set_env_var() {
  local key="$1"
  local value="$2"
  local escaped="${value//\\/\\\\}"
  escaped="${escaped//|/\\|}"

  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i "s|^${key}=.*|${key}=${escaped}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >>"$ENV_FILE"
  fi
}

declare -A TARGET=(
  [VITE_SUPABASE_URL]="http://127.0.0.1:54321"
  [VITE_SUPABASE_ANON_KEY]="$anon_key"
  [SUPABASE_URL]="http://kong:8000"
  [SUPABASE_ANON_KEY]="$anon_key"
  [SUPABASE_SERVICE_ROLE_KEY]="$service_role_key"
)

PLACEHOLDER_PATTERN='your-anon-key|your-service-role-key|YOUR-PROJECT'

changed=0
for key in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY SUPABASE_URL SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
  current="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | head -1 | cut -d= -f2- || true)"
  target="${TARGET[$key]}"

  if [[ -z "$current" ]] || echo "$current" | grep -qE "$PLACEHOLDER_PATTERN"; then
    set_env_var "$key" "$target"
    changed=1
    continue
  fi

  if [[ "$current" != "$target" ]]; then
    set_env_var "$key" "$target"
    changed=1
  fi
done

if [[ "$changed" -eq 1 ]]; then
  log "Chaves Supabase sincronizadas em .env.local"
  echo "ENV_SYNCED=1"
else
  log ".env.local já está alinhado ao Supabase local"
fi
