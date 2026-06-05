#!/usr/bin/env bash
# OBS-T05 — valida logs JSON (Pino) nos microservicos NestJS.
# Uso: ./infra/scripts/verify-obs-t05.sh [container-name]
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

CONTAINER="${1:-coast-academy-certificate}"
HEALTH_URL="${2:-http://localhost/api/certificates/me}"

require_jq() {
  if command -v jq >/dev/null 2>&1; then
    return 0
  fi
  echo "==> instalando jq (OBS-T05 verify)..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -qq && sudo apt-get install -y -qq jq
  elif command -v apk >/dev/null 2>&1; then
    sudo apk add --no-cache jq
  else
    echo "ERRO: instale jq manualmente: sudo apt install -y jq"
    exit 1
  fi
}

assert_json_fields() {
  local line="$1"
  local ctx="$2"
  echo "$line" | jq -e '
    (.service | type) == "string" and
    (.level | type) == "string" and
    (.time | type) == "string" and
    (.msg | type) == "string"
  ' >/dev/null || {
    echo "ERRO: linha de log invalida (${ctx}):"
    echo "$line"
    exit 1
  }
}

require_jq

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "ERRO: container ${CONTAINER} nao esta rodando."
  echo "  Suba a stack: ./infra/scripts/up-local.sh"
  echo "  Rebuild: ./infra/scripts/rebuild-all-services.sh"
  exit 1
fi

log_level=$(docker exec "$CONTAINER" printenv LOG_LEVEL 2>/dev/null || true)
service_env=$(docker exec "$CONTAINER" printenv SERVICE_NAME 2>/dev/null || true)
echo "==> ${CONTAINER} (SERVICE_NAME=${service_env:-?}, LOG_LEVEL=${log_level:-?})"

echo "==> ultima linha de log (bootstrap / app)"
last=$(docker logs "$CONTAINER" --tail 20 2>&1 | grep -E '^\{' | tail -1 || true)
if [[ -z "$last" ]]; then
  echo "AVISO: nenhuma linha JSON nos ultimos 20 logs — imagem pode ser antiga (sem Pino)."
  echo "  Rode: ./infra/scripts/rebuild-all-services.sh --no-cache"
  exit 1
fi
assert_json_fields "$last" "bootstrap"
echo "$last" | jq '{service, level, time, msg}'

echo ""
echo "==> request HTTP (gera log com requestId)"
code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
echo "GET ${HEALTH_URL} -> HTTP ${code}"

sleep 1
req_log=$(docker logs "$CONTAINER" --tail 30 2>&1 | grep -E '^\{' | grep -E 'requestId|"req"' | tail -1 || true)
if [[ -z "$req_log" ]]; then
  req_log=$(docker logs "$CONTAINER" --tail 10 2>&1 | grep -E '^\{' | tail -1 || true)
fi
if [[ -z "$req_log" ]]; then
  echo "ERRO: nenhum log JSON apos request HTTP"
  exit 1
fi
assert_json_fields "$req_log" "http"
echo "$req_log" | jq '{service, level, time, msg, requestId}'

echo ""
echo "OK: OBS-T05 — logs estruturados validados em ${CONTAINER}"
