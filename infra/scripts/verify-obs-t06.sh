#!/usr/bin/env bash
# OBS-T06 — valida coleta Docker → Alloy → Loki (e datasource Grafana).
# Uso: ./infra/scripts/verify-obs-t06.sh [container-name]
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

CONTAINER="${1:-coast-academy-certificate}"
LOKI_URL="${LOKI_URL:-http://localhost:3100}"
BASE_URL="${BASE_URL:-http://localhost}"

require_jq() {
  if command -v jq >/dev/null 2>&1; then
    return 0
  fi
  echo "==> instalando jq..."
  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update -qq && sudo apt-get install -y -qq jq
  else
    echo "ERRO: sudo apt install -y jq"
    exit 1
  fi
}

require_jq

echo "==> stack obs (containers)"
for c in coast-academy-loki coast-academy-alloy coast-academy-grafana; do
  if ! docker ps --format '{{.Names}}' | grep -qx "$c"; then
    echo "ERRO: ${c} nao esta rodando."
    echo "  Rode: ./infra/scripts/obs-up.sh"
    exit 1
  fi
  echo "  OK  ${c}"
done

echo ""
echo "==> health Loki / Alloy"
curl -sf "${LOKI_URL}/ready" >/dev/null || { echo "ERRO: Loki nao responde em ${LOKI_URL}/ready"; exit 1; }
echo "  OK  Loki ready"
curl -sf "http://localhost:12345/-/healthy" >/dev/null || { echo "ERRO: Alloy unhealthy"; exit 1; }
echo "  OK  Alloy healthy"

echo ""
echo "==> app container ${CONTAINER}"
if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "ERRO: ${CONTAINER} nao esta rodando (stack app)."
  exit 1
fi

echo "==> trafego HTTP (gera logs)"
curl -s -o /dev/null -w "GET ${BASE_URL}/api/certificates/me -> HTTP %{http_code}\n" \
  "${BASE_URL}/api/certificates/me" || true

echo "==> aguardando Alloy enviar logs (15s)..."
sleep 15

echo ""
echo "==> labels Loki (container)"
labels_json=$(curl -sf "${LOKI_URL}/loki/api/v1/label/container/values" || echo "{}")
echo "$labels_json" | jq -r '.data[]?' 2>/dev/null | head -20 || echo "(nenhum label container ainda)"

if ! echo "$labels_json" | jq -e --arg c "$CONTAINER" '.data | index($c)' >/dev/null 2>&1; then
  echo "AVISO: label container=${CONTAINER} ainda nao apareceu; tentando query ampla..."
fi

end_ns=$(($(date +%s) * 1000000000))
start_ns=$((end_ns - 600 * 1000000000))

query='{container="'"${CONTAINER}"'"}'
resp=$(curl -sf -G "${LOKI_URL}/loki/api/v1/query_range" \
  --data-urlencode "query=${query}" \
  --data-urlencode "limit=5" \
  --data-urlencode "start=${start_ns}" \
  --data-urlencode "end=${end_ns}" || echo "{}")

streams=$(echo "$resp" | jq '[.data.result[]?] | length' 2>/dev/null || echo "0")
if [[ "${streams:-0}" -lt 1 ]]; then
  echo "ERRO: nenhum log no Loki para ${query} (ultimos 10 min)."
  echo "  Confira: docker logs coast-academy-alloy --tail 30"
  echo "  Grafana Explore: ${query}"
  exit 1
fi

echo "  OK  ${streams} stream(s) com logs"
echo "$resp" | jq -r '.data.result[0].values[-1][1]' 2>/dev/null | head -c 200
echo ""

echo ""
echo "==> Grafana datasource Loki (provisioning)"
if curl -sf -u admin:admin "http://localhost:3001/api/datasources/uid/coast-loki" 2>/dev/null | jq -e '.uid == "coast-loki"' >/dev/null; then
  echo "  OK  datasource coast-loki"
else
  echo "  AVISO: nao foi possivel validar datasource (senha admin ou Grafana ainda iniciando)"
fi

echo ""
echo "OK: OBS-T06 — logs no Loki para ${CONTAINER}"
echo "  Grafana: http://localhost:3001 → Explore → ${query}"
echo "  Dashboard: Coast Academy Overview → secao Logs (Loki)"
