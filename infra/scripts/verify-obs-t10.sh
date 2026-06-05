#!/usr/bin/env bash
# OBS-T10 — dispara erro de teste Sentry no certificate-service (requer SENTRY_DSN).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

CONTAINER="${SENTRY_VERIFY_CONTAINER:-coast-academy-certificate}"
CURL_IMAGE="${CURL_IMAGE:-curlimages/curl:8.11.1}"
TRAEFIK_URL="${SENTRY_TEST_URL:-http://localhost/api/certificates/debug/sentry-test}"
DIRECT_URL="http://127.0.0.1:3000/api/certificates/debug/sentry-test"
HEALTH_URL="http://127.0.0.1:3000/health/sentry-test"

http_code() {
  curl --max-time 15 -s -o /dev/null -w "%{http_code}" "$1" 2>/dev/null || echo "000"
}

http_code_in_container() {
  local url="$1"
  docker run --rm --network "container:${CONTAINER}" "$CURL_IMAGE" \
    -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000"
}

echo "==> prereqs"
docker ps --format '{{.Names}}' | grep -qx "$CONTAINER" || {
  echo "ERRO: ${CONTAINER} nao esta rodando"
  exit 1
}
echo "  OK  ${CONTAINER}"

env_local="${ROOT}/.env.local"
dsn=$(docker exec "$CONTAINER" printenv SENTRY_DSN 2>/dev/null | tr -d '\r' || true)
if [[ -z "$dsn" ]]; then
  echo ""
  echo "AVISO: SENTRY_DSN vazio no container — Sentry em no-op."
  echo "  Preencha SENTRY_DSN e VITE_SENTRY_DSN em .env.local (DSN real do sentry.io)."
  exit 0
fi
echo "  SENTRY_DSN=***$(echo "$dsn" | tail -c 9)"
if [[ "$dsn" == *"SUA_KEY"* ]] || [[ "$dsn" == *"SEU_ORG"* ]] || [[ "$dsn" == *"SEU_PROJECT"* ]]; then
  echo "  AVISO: DSN ainda e placeholder — troque pelo DSN real do sentry.io para ver eventos."
fi

sentry_test=$(docker exec "$CONTAINER" printenv SENTRY_TEST 2>/dev/null | tr -d '\r' || true)
node_env=$(docker exec "$CONTAINER" printenv NODE_ENV 2>/dev/null | tr -d '\r' || true)
echo "  SENTRY_TEST=${sentry_test:-<unset>}"
echo "  NODE_ENV=${node_env:-<unset>}"

echo ""
echo "==> dispara erro de teste (backend)"
code_direct=$(http_code_in_container "$DIRECT_URL")
code_health=$(http_code_in_container "$HEALTH_URL")
code_traefik=$(http_code "$TRAEFIK_URL")
echo "  direto container:  ${DIRECT_URL} -> HTTP ${code_direct}"
echo "  health (container): ${HEALTH_URL} -> HTTP ${code_health}"
echo "  via Traefik:        ${TRAEFIK_URL} -> HTTP ${code_traefik}"

code_ok=""
for c in "$code_direct" "$code_health" "$code_traefik"; do
  if [[ "$c" == "500" ]]; then
    code_ok=1
    break
  fi
done

if [[ -z "$code_ok" ]]; then
  echo "ERRO: esperava HTTP 500 em pelo menos um endpoint (rebuild certificate-service)"
  docker logs "$CONTAINER" --tail 20 2>&1 || true
  exit 1
fi
echo "  OK  erro de teste disparado (HTTP 500)"

echo "==> aguardando envio Sentry (8s)..."
sleep 8

echo ""
echo "OK: OBS-T10 — pipeline de erro de teste operacional"
echo "  Confira no Sentry: OBS-T10 Sentry test — certificate-service"
echo "  Web: login -> painel Dev links -> Sentry test"
