#!/usr/bin/env bash
# SPEC-001 / OBS-T01 — sobe stack observabilidade (profile obs)
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/infra/scripts/obs-up.sh" ]]; then
  sed -i 's/\r$//' "$ROOT/infra/scripts/obs-"*.sh 2>/dev/null || true
fi

echo "==> Coast Academy — observabilidade (LGTM + Alloy)"
./infra/scripts/coast-academy-compose.sh \
  -f docker-compose.yml \
  -f docker-compose.obs.yml \
  --profile obs \
  up -d

echo ""
echo "Aguardando healthchecks (até ~60s)..."
sleep 5

check() {
  local name="$1" url="$2"
  if curl -sf "$url" >/dev/null 2>&1; then
    echo "  OK  $name — $url"
  else
    echo "  ..  $name — $url (ainda iniciando)"
  fi
}

check "Grafana" "http://localhost:3001/api/health"
check "Prometheus" "http://localhost:9090/-/healthy"
check "Loki" "http://localhost:3100/ready"
check "Tempo" "http://localhost:3200/ready"
check "Alloy" "http://localhost:12345/-/healthy"
check "Uptime Kuma" "http://localhost:3002"

echo ""
echo "URLs:"
echo "  Grafana:    http://localhost:3001  (user: admin, senha: admin ou GRAFANA_ADMIN_PASSWORD)"
echo "  Prometheus: http://localhost:9090"
echo "  Loki:       http://localhost:3100"
echo "  Tempo:      http://localhost:3200"
echo "  Alloy:      http://localhost:12345"
echo "  Uptime Kuma: http://localhost:3002"
echo "  OTLP gRPC:  localhost:4317"
echo "  OTLP HTTP:  http://localhost:4318"
echo ""
echo "Traefik metrics: http://localhost:8082/metrics (recreate traefik se porta nova)"
echo ""
echo "OBS-T06: logs no Loki:"
echo "  ./infra/scripts/verify-obs-t06.sh coast-academy-certificate"
echo "OBS-T07: traces OTLP → Tempo:"
echo "  ./infra/scripts/verify-obs-t07.sh"
echo "OBS-T08: OTEL certificate-service:"
echo "  ./infra/scripts/verify-obs-t08.sh"
echo "OBS-T09: trace Traefik → Nest:"
echo "  ./infra/scripts/verify-obs-t09.sh"
echo "OBS-T10: Sentry:"
echo "  ./infra/scripts/verify-obs-t10.sh"
echo "OBS-T11: Uptime Kuma:"
echo "  ./infra/scripts/verify-obs-t11.sh"
echo "OBS-T12: alertas Grafana:"
echo "  ./infra/scripts/verify-obs-t12.sh"
echo "OBS-T14: smoke stack + obs:"
echo "  ./infra/scripts/verify-stack.sh --obs"
