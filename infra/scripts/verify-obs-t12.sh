#!/usr/bin/env bash
# OBS-T12 — valida alertas Grafana provisionados + firing ao parar certificate-service.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

GRAFANA_URL="${GRAFANA_URL:-http://localhost:3001}"
PROM_URL="${PROM_URL:-http://localhost:9090}"
GRAFANA_USER="${GRAFANA_ADMIN_USER:-admin}"
GRAFANA_PASS="${GRAFANA_ADMIN_PASSWORD:-admin}"
CONTAINER="${ALERT_TEST_CONTAINER:-coast-academy-certificate}"
AUTH="${GRAFANA_USER}:${GRAFANA_PASS}"

echo "==> prereqs"
for c in coast-academy-grafana coast-academy-prometheus "$CONTAINER"; do
  docker ps --format '{{.Names}}' | grep -qx "$c" || {
    echo "ERRO: ${c} nao esta rodando. Rode: ./infra/scripts/obs-up.sh"
    exit 1
  }
  echo "  OK  ${c}"
done

echo ""
echo "==> aguarda Grafana pronto"
for i in $(seq 1 30); do
  if curl --max-time 5 -sf "${GRAFANA_URL}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo ""
echo "==> regras provisionadas no Grafana"
rules_json=$(curl --max-time 15 -sf -u "$AUTH" \
  "${GRAFANA_URL}/api/v1/provisioning/alert-rules" 2>/dev/null || echo "[]")
if ! echo "$rules_json" | grep -q 'coast_cert_down\|Certificate service down'; then
  rules_json=$(curl --max-time 15 -sf -u "$AUTH" \
    "${GRAFANA_URL}/api/ruler/grafana/api/v1/rules" 2>/dev/null || echo "{}")
fi
if echo "$rules_json" | grep -q 'coast_cert_down\|Certificate service down'; then
  echo "  OK  regra certificate-service down encontrada"
else
  echo "ERRO: regras OBS-T12 nao provisionadas — recrie Grafana:"
  echo "  ./infra/scripts/coast-academy-compose.sh -f docker-compose.yml -f docker-compose.obs.yml --profile obs up -d --force-recreate grafana"
  echo "  Logs: docker logs coast-academy-grafana 2>&1 | grep -iE 'provision|alert|error'"
  echo "$rules_json" | head -c 400
  exit 1
fi
if echo "$rules_json" | grep -q 'coast_traefik_5xx\|5xx rate'; then
  echo "  OK  regra 5xx Traefik encontrada"
fi

echo ""
echo "==> Prometheus up{certificate-service}"
up_val=$(curl --max-time 10 -sf "${PROM_URL}/api/v1/query" \
  --data-urlencode 'query=up{job="certificate-service"}' 2>/dev/null \
  | grep -oE '"value":\[[^]]*,"([01])"\]' | sed -n 's/.*,"\([01]\)".*/\1/p' | head -1 || echo "0")
if [[ "$up_val" == "1" ]]; then
  echo "  OK  up=1 (antes do teste)"
else
  echo "  AVISO: up!=1 antes do teste (HTTP ${up_val})"
fi

echo ""
echo "==> para ${CONTAINER} (simula outage)"
docker stop "$CONTAINER" >/dev/null
echo "  container parado"

echo "==> aguardando alerta firing (ate 5 min)..."
fired=0
for i in $(seq 1 30); do
  sleep 10
  up_now=$(curl --max-time 10 -sf "${PROM_URL}/api/v1/query" \
    --data-urlencode 'query=up{job="certificate-service"}' 2>/dev/null \
    | grep -oE '"value":\[[^]]*,"([01])"\]' | sed -n 's/.*,"\([01]\)".*/\1/p' | head -1 || echo "0")
  alerts=$(curl --max-time 10 -sf -u "$AUTH" \
    "${GRAFANA_URL}/api/alertmanager/grafana/api/v2/alerts" 2>/dev/null || echo "[]")
  if echo "$alerts" | grep -qiE 'Certificate service down|coast_cert_down'; then
    fired=1
    echo "  OK  alerta firing (${i}0s) — Certificate service down"
    break
  fi
  if [[ "$up_now" == "0" ]]; then
    echo "  ..  Prometheus up=0 (${i}0s), aguardando Grafana..."
  fi
done

echo ""
echo "==> restaura ${CONTAINER}"
docker start "$CONTAINER" >/dev/null
sleep 5

if [[ "$fired" -ne 1 ]]; then
  echo "ERRO: alerta nao entrou em firing em 5 min"
  echo "  Grafana → Alerting → Alert rules → Coast Academy"
  echo "  Confira: for=2m e datasource coast-prometheus"
  exit 1
fi

echo ""
echo "OK: OBS-T12 — alertas Grafana operacionais"
echo "  UI: ${GRAFANA_URL}/alerting/list"
echo "  Regras: infra/obs/grafana/provisioning/alerting/rules.yml"
