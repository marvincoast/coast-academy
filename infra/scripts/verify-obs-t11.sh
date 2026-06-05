#!/usr/bin/env bash
# OBS-T11 — valida Uptime Kuma + alvos dos monitores (RF-06).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

KUMA_URL="${KUMA_URL:-http://localhost:3002}"
BASE_URL="${BASE_URL:-http://localhost}"

check_code() {
  local label="$1"
  local url="$2"
  shift 2
  local expect=("$@")
  local code
  code=$(curl --max-time 15 -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  local ok=0
  for e in "${expect[@]}"; do
    if [[ "$code" == "$e" ]]; then
      ok=1
      break
    fi
  done
  if [[ "$ok" -eq 1 ]]; then
    echo "  OK  ${label} -> HTTP ${code}"
  else
    echo "  ERRO ${label} -> HTTP ${code} (esperava: ${expect[*]})"
    return 1
  fi
}

echo "==> prereqs"
for c in coast-academy-uptime-kuma coast-academy-traefik; do
  docker ps --format '{{.Names}}' | grep -qx "$c" || {
    echo "ERRO: ${c} nao esta rodando."
    echo "  ./infra/scripts/obs-up.sh"
    echo "  ./infra/scripts/coast-academy-compose.sh up -d traefik web certificate-service"
    exit 1
  }
  echo "  OK  ${c}"
done

echo ""
echo "==> Uptime Kuma UI (${KUMA_URL})"
if curl --max-time 15 -sf "${KUMA_URL}/" >/dev/null 2>&1; then
  echo "  OK  UI responde"
else
  echo "ERRO: ${KUMA_URL} nao responde — aguarde healthcheck ou rode obs-up.sh"
  docker logs coast-academy-uptime-kuma --tail 15 2>&1 || true
  exit 1
fi

echo ""
echo "==> alvos dos monitores (host)"
fail=0
check_code "Web — Home" "${BASE_URL}/" 200 301 302 || fail=1
check_code "Traefik — Ping" "http://localhost:8081/ping" 200 || fail=1
check_code "Certificate — GET /me" "${BASE_URL}/api/certificates/me" 401 || fail=1
check_code "Grafana — health" "http://localhost:3001/api/health" 200 || fail=1

echo ""
echo "==> Supabase (opcional)"
sb_code=$(curl --max-time 5 -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:54321/rest/v1/" 2>/dev/null || echo "000")
if [[ "$sb_code" == "200" || "$sb_code" == "401" ]]; then
  echo "  OK  Supabase -> HTTP ${sb_code}"
else
  echo "  AVISO: Supabase offline (HTTP ${sb_code}) — monitor opcional em monitors.json"
fi

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "ERRO: um ou mais alvos falharam — corrija a stack app antes dos monitores Kuma ficarem green"
  exit 1
fi

echo ""
echo "==> probe a partir do container Kuma (mesma rede que a UI usa)"
kuma_code=$(docker exec coast-academy-uptime-kuma curl --max-time 10 -s -o /dev/null -w "%{http_code}" \
  "http://host.docker.internal/api/certificates/me" 2>/dev/null || echo "000")
if [[ "$kuma_code" == "401" ]]; then
  echo "  OK  Kuma -> host.docker.internal/api/certificates/me -> HTTP 401"
else
  echo "  AVISO: Kuma -> host.docker.internal falhou (HTTP ${kuma_code})"
  echo "  Na UI use: http://host.docker.internal/api/certificates/me (aceitar 401)"
  echo "  Nao use http://traefik/ no WSL se der EAI_AGAIN"
fi

echo ""
echo "OK: OBS-T11 — Uptime Kuma + alvos operacionais"
echo "  UI: ${KUMA_URL} — configure monitores (veja infra/obs/uptime-kuma/README.md)"
echo "  Seed: infra/obs/uptime-kuma/monitors.json"
