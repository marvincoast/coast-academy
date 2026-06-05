#!/usr/bin/env bash
# OBS-T08 — valida OTEL no certificate-service (HTTP spans + storage.upload opcional).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

TEMPO_URL="${TEMPO_URL:-http://localhost:3200}"
SERVICE_NAME="${OTEL_SERVICE_NAME:-certificate-service}"
CONTAINER="${OTEL_VERIFY_CONTAINER:-coast-academy-certificate}"
CURL_IMAGE="${CURL_IMAGE:-curlimages/curl:8.11.1}"

require_jq() {
  command -v jq >/dev/null 2>&1 || {
    echo "ERRO: instale jq (sudo apt install -y jq)"
    exit 1
  }
}

# Evita docker exec+wget (trava no WSL); usa curl em sidecar na network do container.
curl_in_container() {
  local url="$1"
  docker run --rm --network "container:${CONTAINER}" "$CURL_IMAGE" \
    -sf --max-time 5 "$url" >/dev/null 2>&1
}

require_jq

echo "==> prereqs (obs + certificate-service)"
for c in coast-academy-alloy coast-academy-tempo "$CONTAINER"; do
  docker ps --format '{{.Names}}' | grep -qx "$c" || {
    echo "ERRO: ${c} nao esta rodando. Rode: ./infra/scripts/obs-up.sh"
    exit 1
  }
  echo "  OK  ${c}"
done

otel_endpoint=$(docker exec "$CONTAINER" printenv OTEL_EXPORTER_OTLP_ENDPOINT 2>/dev/null || true)
[[ -n "$otel_endpoint" ]] || {
  echo "ERRO: OTEL_EXPORTER_OTLP_ENDPOINT ausente — rebuild certificate-service"
  exit 1
}
echo "  OTEL_EXPORTER_OTLP_ENDPOINT=${otel_endpoint}"

echo ""
echo "==> aguardando /health (ate 60s, curl sidecar)"
health_ok=0
for i in $(seq 1 60); do
  if curl_in_container "http://127.0.0.1:3000/health"; then
    health_ok=1
    echo "  OK  /health (${i}s)"
    break
  fi
  if (( i % 10 == 0 )); then
    echo "  ..  ainda aguardando (${i}s)"
  fi
  sleep 1
done
if [[ "$health_ok" -ne 1 ]]; then
  echo "ERRO: /health nao respondeu"
  docker logs "$CONTAINER" --tail 40 2>&1 || true
  exit 1
fi

echo ""
echo "==> trafego HTTP"
for n in 1 2 3; do
  curl_in_container "http://127.0.0.1:3000/health" && echo "  ping /health #${n}"
done
curl --max-time 10 -s -o /dev/null -w "  GET /api/certificates/me -> HTTP %{http_code}\n" \
  http://localhost/api/certificates/me || echo "  GET /api/certificates/me -> erro/timeout"

if [[ -n "${AUTH_TOKEN:-}" ]]; then
  code=$(curl --max-time 30 -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    http://localhost/api/certificates/preview-pdf || echo "000")
  echo "  GET /api/certificates/preview-pdf -> HTTP ${code}"
else
  echo "  AVISO: AUTH_TOKEN=<jwt> para validar span storage.upload"
fi

echo "==> aguardando Tempo (20s)..."
sleep 20

echo ""
echo "==> busca traces (${SERVICE_NAME})"
tag_query="service.name%3D${SERVICE_NAME}"
search=$(curl --max-time 10 -sf "${TEMPO_URL}/api/search?tags=${tag_query}&limit=10" 2>/dev/null || echo "{}")
echo "$search" | jq -e '.traces | length > 0' >/dev/null || {
  echo "ERRO: nenhum trace no Tempo"
  docker logs "$CONTAINER" --tail 25 2>&1 | grep -iE 'otel|error|trace' || docker logs "$CONTAINER" --tail 10 2>&1
  exit 1
}
echo "  OK  $(echo "$search" | jq '.traces | length') trace(s)"

storage_ok=0
while read -r trace_id; do
  [[ -z "$trace_id" ]] && continue
  detail=$(curl --max-time 10 -sf "${TEMPO_URL}/api/traces/${trace_id}" 2>/dev/null || echo "{}")
  if echo "$detail" | grep -q 'storage.upload'; then
    storage_ok=1
    echo "  OK  storage.upload em ${trace_id}"
    break
  fi
done < <(echo "$search" | jq -r '.traces[]?.traceID // empty')

if [[ "$storage_ok" -eq 1 ]]; then
  echo ""
  echo "OK: OBS-T08 — HTTP + storage.upload"
elif [[ -n "${AUTH_TOKEN:-}" ]]; then
  echo "ERRO: sem span storage.upload"
  exit 1
else
  echo ""
  echo "OK: OBS-T08 — HTTP traces no Tempo"
fi
echo "  Grafana → Explore → Tempo → service.name=${SERVICE_NAME}"
