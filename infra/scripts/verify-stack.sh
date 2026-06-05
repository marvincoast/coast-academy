#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

DC="./infra/scripts/coast-academy-compose.sh"
SUPABASE_NET="${SUPABASE_DOCKER_NETWORK:-supabase_network_coast-academy}"
VERIFY_OBS=0

for arg in "$@"; do
  case "$arg" in
    --obs) VERIFY_OBS=1 ;;
    -h|--help)
      echo "Uso: $0 [--obs]"
      echo "  --obs  checa Grafana, Prometheus, Loki e targets UP (OBS-T14)"
      exit 0
      ;;
  esac
done

verify_obs_stack() {
  local obs_ok=1
  local grafana_url="${GRAFANA_URL:-http://localhost:3001}"
  local prom_url="${PROM_URL:-http://localhost:9090}"
  local loki_url="${LOKI_URL:-http://localhost:3100}"

  echo "==> Observabilidade (OBS-T14)"
  for c in coast-academy-grafana coast-academy-prometheus coast-academy-loki; do
    if docker ps --format '{{.Names}}' | grep -qx "$c"; then
      echo "  OK  container ${c}"
    else
      echo "ERRO: ${c} nao esta rodando — rode: ./infra/scripts/obs-up.sh"
      obs_ok=0
    fi
  done

  if curl --max-time 10 -sf "${grafana_url}/api/health" >/dev/null 2>&1; then
    echo "  OK  Grafana ${grafana_url}/api/health"
  else
    echo "ERRO: Grafana nao responde em ${grafana_url}"
    obs_ok=0
  fi

  if curl --max-time 10 -sf "${prom_url}/-/healthy" >/dev/null 2>&1; then
    echo "  OK  Prometheus ${prom_url}/-/healthy"
  else
    echo "ERRO: Prometheus nao responde em ${prom_url}"
    obs_ok=0
  fi

  if curl --max-time 10 -sf "${loki_url}/ready" >/dev/null 2>&1; then
    echo "  OK  Loki ${loki_url}/ready"
  else
    echo "ERRO: Loki nao responde em ${loki_url}/ready"
    obs_ok=0
  fi

  targets_up=0
  if targets_json=$(curl --max-time 15 -sf "${prom_url}/api/v1/targets" 2>/dev/null); then
    targets_up=$(echo "$targets_json" | grep -o '"health":"up"' | wc -l | tr -d ' ')
  fi
  if [[ "${targets_up:-0}" -ge 1 ]]; then
    echo "  OK  Prometheus targets UP: ${targets_up}"
  else
    echo "ERRO: nenhum target UP no Prometheus (${prom_url}/targets)"
    obs_ok=0
  fi

  if [[ "$obs_ok" -eq 1 ]]; then
    echo "  Resumo: observabilidade OK"
  else
    echo "  Resumo: observabilidade com falhas"
    return 1
  fi
  return 0
}

echo "==> Containers"
$DC ps

echo ""
echo "==> Aguardando Traefik (ate 30s)"
for _ in $(seq 1 15); do
  if curl -sf -o /dev/null http://localhost:8081/ping 2>/dev/null; then
    break
  fi
  sleep 2
done

echo ""
echo "==> HTTP (host)"
code_root=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ || echo "000")
echo "http://localhost/          ${code_root}"
code_coast=$(curl -s -o /dev/null -w "%{http_code}" http://coastacademy/ 2>/dev/null || echo "000")
echo "http://coastacademy/       ${code_coast} (000 = falta entrada no /etc/hosts)"
code_3000=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")
echo "http://localhost:3000/     ${code_3000}"
code_ping=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/ping || echo "000")
echo "http://localhost:8081/ping ${code_ping}"
code_api=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://localhost/api/courses/c0000000-0000-0000-0000-000000000001" || echo "000")
echo "http://localhost/api/courses/... ${code_api} (401=rota OK sem token)"

echo ""
echo "==> Health (in-container)"
for c in coast-academy-course coast-academy-assessment coast-academy-certificate coast-academy-ranking coast-academy-rag coast-academy-notification; do
  if docker ps --format '{{.Names}}' | grep -qx "$c"; then
    out=$(docker exec "$c" wget -qO- "http://localhost:3000/health" 2>/dev/null || true)
    if [[ -n "$out" ]]; then
      echo "$c OK: $out"
    else
      echo "$c FAIL: no /health"
    fi
  fi
done

echo ""
echo "==> Supabase from course-service"
supabase_ok=0
if docker ps --format '{{.Names}}' | grep -qx coast-academy-course; then
  env_url=$(docker exec coast-academy-course printenv SUPABASE_URL 2>/dev/null || true)
  [[ -n "$env_url" ]] && echo "SUPABASE_URL no container: ${env_url}"

  if docker inspect coast-academy-course --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | grep -qF "$SUPABASE_NET"; then
    echo "Rede ${SUPABASE_NET}: conectada"
  else
    echo "AVISO: coast-academy-course NÃO está em ${SUPABASE_NET}"
    echo "  Rode: ./infra/scripts/connect-supabase-network.sh"
  fi

  try_supabase_url() {
    local base="$1"
    docker exec coast-academy-course wget -q --spider --timeout=5 "${base}/rest/v1/" 2>/dev/null
  }

  for base in \
    "${env_url:-}" \
    "http://kong:8000" \
    "http://api-gw:8000" \
    "http://supabase_kong_coast-academy-empire-trading:8000" \
    "http://host.docker.internal:54321"; do
    [[ -z "$base" ]] && continue
    if try_supabase_url "$base"; then
      echo "${base} OK"
      supabase_ok=1
      break
    fi
  done

  if [[ "$supabase_ok" -eq 0 ]]; then
    echo "Supabase FAIL — rode: npx supabase start && ./infra/scripts/connect-supabase-network.sh"
    echo "  .env.local: SUPABASE_URL=http://kong:8000"
    docker exec coast-academy-course wget -S --timeout=3 http://kong:8000/rest/v1/ 2>&1 | head -3 || true
  fi
fi

echo ""
echo "==> VITE no bundle web (deve conter 127.0.0.1:54321)"
if docker exec coast-academy-web sh -c "grep -r '127.0.0.1:54321' /usr/share/nginx/html/assets/*.js 2>/dev/null | head -1" | grep -q .; then
  echo "VITE_SUPABASE_URL embutida no build OK"
else
  echo "AVISO: VITE não encontrada no JS — rode: ./infra/scripts/coast-academy-compose.sh build --no-cache web"
fi

echo ""
if [[ "$code_root" == "200" || "$code_root" == "304" ]] && [[ "$code_3000" == "200" || "$code_3000" == "304" ]] && [[ "$supabase_ok" -eq 1 ]]; then
  echo "Resumo: stack OK para dev local."
elif [[ "$code_root" == "200" || "$code_root" == "304" ]] && [[ "$code_3000" == "200" || "$code_3000" == "304" ]]; then
  echo "Resumo: frontend OK; corrija Supabase (acima) para curso/login com dados."
else
  echo "Resumo: verifique Traefik ou use http://localhost:3000"
fi

if [[ "$VERIFY_OBS" -eq 1 ]]; then
  echo ""
  verify_obs_stack || exit 1
fi

echo "Done."
