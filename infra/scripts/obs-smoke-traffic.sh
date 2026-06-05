#!/usr/bin/env bash
# Gera tráfego HTTP leve para popular métricas do dashboard OBS-T04
set -euo pipefail
BASE="${1:-http://localhost}"
echo "==> Gerando tráfego em $BASE (30 reqs)..."
for _ in $(seq 1 30); do
  curl -sf -o /dev/null "$BASE/" 2>/dev/null || true
  curl -sf -o /dev/null "$BASE/api/courses" 2>/dev/null || true
  curl -sf -o /dev/null -w "" "$BASE/api/certificates/me" 2>/dev/null || true
done
echo "Pronto. Abra Grafana → Coast Academy → Coast Academy Overview"
