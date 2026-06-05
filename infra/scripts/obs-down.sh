#!/usr/bin/env bash
# SPEC-001 / OBS-T01 — para apenas a stack observabilidade (nao derruba app/traefik).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts/obs-"*.sh 2>/dev/null || true

OBS_SERVICES=(
  uptime-kuma
  grafana
  alloy
  prometheus
  loki
  tempo
)

./infra/scripts/coast-academy-compose.sh \
  -f docker-compose.yml \
  -f docker-compose.obs.yml \
  stop "${OBS_SERVICES[@]}"

echo "Stack obs parada (microservicos e traefik mantidos)."
echo "Para subir de novo: ./infra/scripts/obs-up.sh"
