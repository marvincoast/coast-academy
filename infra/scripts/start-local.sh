#!/usr/bin/env bash
# =============================================================================
# Coast Academy — sobe TUDO para desenvolvimento local (um comando só)
# =============================================================================
#
# Uso:
#   ./infra/scripts/start-local.sh
#
# Primeira vez (build completo + banco zerado — demora, principalmente em /mnt/c):
#   COAST_ACADEMY_DB_RESET=1 COAST_ACADEMY_BUILD=1 COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/start-local.sh
#
# Variáveis opcionais:
#   COAST_ACADEMY_SKIP_INSTALL=1   — não roda pnpm install
#   COAST_ACADEMY_DB_RESET=1         — supabase db reset (migrations + seeds)
#   COAST_ACADEMY_SKIP_SEED=1        — não aplica seeds mesmo se banco vazio
#   COAST_ACADEMY_BUILD=1            — rebuild de todos os microserviços
#   COAST_ACADEMY_BUILD_WEB=1        — rebuild do frontend (sem cache se =1 com BUILD)
#   COAST_ACADEMY_SKIP_OLLAMA=1      — não sobe perfil llm / não baixa modelos
#   COAST_ACADEMY_SKIP_INGEST=1      — não chama POST /api/rag/ingest
#   COAST_ACADEMY_SKIP_VERIFY=1      — não roda verify-stack.sh
#
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
SCRIPTS="$ROOT/infra/scripts"

log() { echo "==> $*"; }

if [[ "$(pwd)" == /mnt/* ]]; then
  echo "AVISO: projeto em $(pwd) — Docker em /mnt/c pode levar 15–40 min no primeiro build."
  echo "  Copie para ~/Coast-Academy para ir muito mais rápido."
  echo ""
fi

# ── Scripts executáveis + LF (Windows/WSL) ───────────────────────────────────
if ls "$SCRIPTS"/*.sh >/dev/null 2>&1; then
  sed -i 's/\r$//' "$SCRIPTS"/*.sh 2>/dev/null || true
  chmod +x "$SCRIPTS"/*.sh
fi

# ── .env.local ───────────────────────────────────────────────────────────────
if [[ ! -f .env.local ]]; then
  log ".env.local ausente — copiando de .env.example"
  cp .env.example .env.local
  echo "    Edite .env.local depois do primeiro 'supabase start' (chaves em: pnpm exec supabase status)"
fi

# ── Dependências Node ────────────────────────────────────────────────────────
if [[ "${COAST_ACADEMY_SKIP_INSTALL:-}" != "1" ]]; then
  if [[ ! -d node_modules ]] || [[ ! -x node_modules/.bin/supabase ]]; then
    log "pnpm install"
    if command -v pnpm >/dev/null 2>&1; then
      pnpm install
    elif command -v corepack >/dev/null 2>&1; then
      corepack enable
      corepack prepare pnpm@9.12.0 --activate
      pnpm install
    else
      echo "Erro: instale Node 20+ e pnpm (corepack enable && corepack prepare pnpm@9.12.0 --activate)"
      exit 1
    fi
  fi
fi

SUPABASE_BIN=""
if command -v supabase >/dev/null 2>&1; then
  SUPABASE_BIN=supabase
elif [[ -x node_modules/.bin/supabase ]]; then
  SUPABASE_BIN="$ROOT/node_modules/.bin/supabase"
fi

DB_CONTAINER="${SUPABASE_DB_CONTAINER:-supabase_db_coast-academy}"

lesson_count() {
  if ! docker ps --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
    echo 0
    return
  fi
  docker exec "$DB_CONTAINER" psql -U postgres -d postgres -t -A -c \
    "select count(*)::int from public.lessons where content_markdown is not null;" 2>/dev/null \
    | tr -d '[:space:]' || echo 0
}

wait_container_running() {
  local name=$1 tries=${2:-45}
  for _ in $(seq 1 "$tries"); do
    if docker ps --format '{{.Names}}' | grep -qx "$name"; then
      return 0
    fi
    sleep 2
  done
  return 1
}

wait_http() {
  local url=$1 tries=${2:-30}
  for _ in $(seq 1 "$tries"); do
    if curl -sf -o /dev/null "$url" 2>/dev/null; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# ── Supabase ─────────────────────────────────────────────────────────────────
log "Supabase"
if [[ -n "$SUPABASE_BIN" ]]; then
  "$SUPABASE_BIN" start
else
  echo "    Supabase CLI não encontrado. Rode: pnpm install"
  exit 1
fi

if [[ "${COAST_ACADEMY_DB_RESET:-}" == "1" ]]; then
  log "Banco: db reset (migrations + seeds do config.toml)"
  "$SUPABASE_BIN" db reset
else
  log "Migrations pendentes (ex.: RAG unique, embedding 768)"
  "$SUPABASE_BIN" migration up
fi

if [[ "${COAST_ACADEMY_DB_RESET:-}" != "1" ]] && [[ "${COAST_ACADEMY_SKIP_SEED:-}" != "1" ]]; then
  count="$(lesson_count)"
  if [[ "${count:-0}" == "0" ]]; then
    log "Banco sem aulas — aplicando seeds SQL"
    "$SCRIPTS/seed-db.sh"
  else
    log "Banco já tem $count aula(s) com conteúdo — pulando seed"
    log "    Para zerar tudo: COAST_ACADEMY_DB_RESET=1 $0"
  fi
elif [[ "${COAST_ACADEMY_SKIP_SEED:-}" == "1" ]]; then
  log "Seed ignorado (COAST_ACADEMY_SKIP_SEED=1)"
fi

# ── .env.local ↔ Supabase local ──────────────────────────────────────────────
sync_out="$("$SCRIPTS/sync-env-from-supabase.sh" 2>&1 || true)"
echo "$sync_out"
if echo "$sync_out" | grep -q 'ENV_SYNCED=1'; then
  log "Chaves atualizadas — rebuild web e recriação dos containers"
  COAST_ACADEMY_BUILD_WEB=1
  COAST_ACADEMY_RECREATE=1
fi

# ── Docker build ─────────────────────────────────────────────────────────────
log "Docker — build"
if [[ "${COAST_ACADEMY_BUILD_WEB:-}" == "1" ]]; then
  if [[ "${COAST_ACADEMY_BUILD:-}" == "1" ]]; then
    "$SCRIPTS/coast-academy-compose.sh" build --no-cache web
  else
    "$SCRIPTS/coast-academy-compose.sh" build --no-cache web
  fi
else
  "$SCRIPTS/coast-academy-compose.sh" build web
fi

if [[ "${COAST_ACADEMY_BUILD:-}" == "1" ]]; then
  log "Docker — rebuild microserviços"
  "$SCRIPTS/build-services.sh"
fi

# ── Docker up ────────────────────────────────────────────────────────────────
log "Docker — subindo stack"
compose_up_args=(-d)
if [[ "${COAST_ACADEMY_RECREATE:-}" == "1" ]]; then
  compose_up_args=(--force-recreate -d)
fi
if [[ "${COAST_ACADEMY_SKIP_OLLAMA:-}" != "1" ]]; then
  "$SCRIPTS/coast-academy-compose.sh" --profile llm up "${compose_up_args[@]}"
else
  "$SCRIPTS/coast-academy-compose.sh" up "${compose_up_args[@]}"
fi

log "Rede Supabase ↔ microserviços"
"$SCRIPTS/connect-supabase-network.sh" || true

# ── Ollama (modelos para RAG local) ──────────────────────────────────────────
if [[ "${COAST_ACADEMY_SKIP_OLLAMA:-}" != "1" ]]; then
  log "Ollama — modelos (pode demorar na 1ª vez)"
  if wait_container_running coast-academy-ollama 30; then
    embed_model="$(grep -E '^EMBEDDING_MODEL=' .env.local 2>/dev/null | head -1 | cut -d= -f2- | tr -d "\"'" | xargs || true)"
    embed_model="${embed_model:-nomic-embed-text}"
    chat_model="$(grep -E '^LLM_MODEL=' .env.local 2>/dev/null | head -1 | cut -d= -f2- | tr -d "\"'" | xargs || true)"
    chat_model="${chat_model:-${CHAT_MODEL:-llama3.2}}"
    docker exec coast-academy-ollama ollama pull "$embed_model" || true
    docker exec coast-academy-ollama ollama pull "$chat_model" || true
  else
    echo "    AVISO: coast-academy-ollama não subiu — Tutor RAG pode falhar até o Ollama estar ok"
  fi
fi

log "Aguardando serviços"
sleep 15
if docker ps --format '{{.Names}}' | grep -qx coast-academy-rag; then
  for _ in $(seq 1 40); do
    if docker exec coast-academy-rag wget -qO- http://127.0.0.1:3000/health >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done
else
  echo "    AVISO: coast-academy-rag não está rodando"
fi

# ── Ingest RAG ───────────────────────────────────────────────────────────────
if [[ "${COAST_ACADEMY_SKIP_INGEST:-}" != "1" ]]; then
  log "RAG — indexando aulas"
  ingest_secret="$(grep -E '^INGEST_SECRET=' .env.local 2>/dev/null | head -1 | cut -d= -f2- | tr -d "\"'" | xargs || true)"
  ingest_secret="${ingest_secret:-dev-secret}"
  ingest_json='{"errors":["fetch failed"]}'
  for attempt in 1 2 3 4 5; do
    ingest_json=$(curl -sf -X POST "http://localhost/api/rag/ingest" \
      -H "Content-Type: application/json" \
      -d "{\"secret\":\"${ingest_secret}\"}" 2>/dev/null || echo '{"errors":["fetch failed"]}')
    if echo "$ingest_json" | grep -qE '"chunksUpserted":[1-9]'; then
      break
    fi
    echo "    tentativa ${attempt}/5 — aguardando rag-service..."
    sleep 10
  done
  echo "    $ingest_json"
  if echo "$ingest_json" | grep -q '"chunksUpserted":0' && ! echo "$ingest_json" | grep -q '"errors":\[\]'; then
    echo "    AVISO: ingest com erros — rode: ./infra/scripts/rag-ingest.sh"
    echo "    logs: docker logs coast-academy-rag --tail 50"
  elif echo "$ingest_json" | grep -q '"chunksUpserted":0'; then
    echo "    AVISO: 0 chunks — confira lessons no banco e logs do rag-service"
    echo "    Reindexar: ./infra/scripts/rag-ingest.sh"
  fi
fi

# ── Verificação ──────────────────────────────────────────────────────────────
if [[ "${COAST_ACADEMY_SKIP_VERIFY:-}" != "1" ]]; then
  log "Smoke test"
  "$SCRIPTS/verify-stack.sh" || true
fi

echo ""
echo "=== Pronto ==="
echo "App:        http://coastacademy  |  http://localhost  |  :3000"
echo "Login:      http://coastacademy/login"
echo "Tutor IA:   http://coastacademy/tutor"
echo "Traefik:    http://localhost:8081"
echo "Hosts:      veja infra/hosts.local.example (127.0.0.1 coastacademy)"
echo "Supabase:   http://127.0.0.1:54323"
echo "Mailpit:    http://127.0.0.1:54324  (magic link de login)"
echo ""
echo "Parar tudo:  ./infra/scripts/down-local.sh && pnpm exec supabase stop"
