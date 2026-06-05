#!/usr/bin/env bash
# OBS-T09 — valida trace distribuido Traefik (traefik-gateway) → Nest (certificate-service).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

TEMPO_URL="${TEMPO_URL:-http://localhost:3200}"
GATEWAY_SERVICE="${TRAEFIK_SERVICE_NAME:-traefik-gateway}"
BACKEND_SERVICE="${OTEL_SERVICE_NAME:-certificate-service}"
CONTAINER="${OTEL_VERIFY_CONTAINER:-coast-academy-certificate}"

require_jq() {
  command -v jq >/dev/null 2>&1 || {
    echo "ERRO: instale jq (sudo apt install -y jq)"
    exit 1
  }
}

trace_has_service() {
  local detail="$1"
  local name="$2"
  echo "$detail" | grep -q "\"service.name\"" && echo "$detail" | grep -q "$name"
}

require_jq

echo "==> prereqs (obs + traefik + certificate-service)"
for c in coast-academy-alloy coast-academy-tempo coast-academy-traefik "$CONTAINER"; do
  docker ps --format '{{.Names}}' | grep -qx "$c" || {
    echo "ERRO: ${c} nao esta rodando."
    echo "  ./infra/scripts/obs-up.sh"
    echo "  ./infra/scripts/coast-academy-compose.sh up -d traefik certificate-service"
    exit 1
  }
  echo "  OK  ${c}"
done

echo ""
echo "==> trafego via Traefik (nao direto no container)"
for n in 1 2 3 4 5; do
  code=$(curl --max-time 10 -s -o /dev/null -w "%{http_code}" \
    http://localhost/api/certificates/me 2>/dev/null || echo "000")
  echo "  GET /api/certificates/me #${n} -> HTTP ${code}"
done

echo "==> aguardando Tempo (25s)..."
sleep 25

echo ""
echo "==> busca trace com gateway + backend no mesmo traceID"
tag_query="service.name%3D${BACKEND_SERVICE}"
search=$(curl --max-time 15 -sf "${TEMPO_URL}/api/search?tags=${tag_query}&limit=25" 2>/dev/null || echo "{}")
trace_count=$(echo "$search" | jq -r '.traces | length // 0')
if [[ "$trace_count" -eq 0 ]]; then
  echo "ERRO: nenhum trace de ${BACKEND_SERVICE} no Tempo"
  docker logs coast-academy-traefik --tail 15 2>&1 | grep -iE 'trace|otel|error' || docker logs coast-academy-traefik --tail 8 2>&1
  exit 1
fi
echo "  candidatos: ${trace_count} trace(s) (${BACKEND_SERVICE})"

linked=0
linked_id=""
while read -r trace_id; do
  [[ -z "$trace_id" ]] && continue
  detail=$(curl --max-time 15 -sf "${TEMPO_URL}/api/traces/${trace_id}" 2>/dev/null || echo "{}")
  has_gateway=0
  for gw in "$GATEWAY_SERVICE" traefik; do
    if trace_has_service "$detail" "$gw"; then
      has_gateway=1
      break
    fi
  done
  if [[ "$has_gateway" -eq 1 ]] && trace_has_service "$detail" "$BACKEND_SERVICE"; then
    linked=1
    linked_id="$trace_id"
    echo "  OK  trace ${trace_id} — ${GATEWAY_SERVICE:-traefik} + ${BACKEND_SERVICE}"
    break
  fi
done < <(echo "$search" | jq -r '.traces[]?.traceID // empty')

if [[ "$linked" -ne 1 ]]; then
  echo "ERRO: traces de ${BACKEND_SERVICE} sem span do gateway no mesmo traceID"
  echo "  Verifique infra/traefik/traefik.yml (tracing.otlp) e recrie traefik:"
  echo "  ./infra/scripts/coast-academy-compose.sh up -d --force-recreate traefik"
  echo ""
  echo "  Limitacao: request direto ao container (porta 3000) nao passa pelo Traefik — trace comeca so no Nest."
  exit 1
fi

echo ""
echo "OK: OBS-T09 — propagacao Traefik → Nest (traceparent)"
echo "  Grafana → Explore → Tempo → traceID=${linked_id}"
echo "  Nota: bypass do gateway (curl container:3000) gera trace apenas no microservico."
