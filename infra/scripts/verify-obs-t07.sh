#!/usr/bin/env bash
# OBS-T07 — valida pipeline OTLP Alloy → Tempo (+ Prometheus remote_write).
# Uso: ./infra/scripts/verify-obs-t07.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

SERVICE_NAME="${OTEL_SMOKE_SERVICE:-obs-t07-smoke}"
TEMPO_URL="${TEMPO_URL:-http://localhost:3200}"
ALLOY_URL="${ALLOY_URL:-http://localhost:12345}"
SMOKE_DIR="$ROOT/infra/scripts/otel-smoke"

docker_ok() {
  docker ps >/dev/null 2>&1
}

if ! docker_ok; then
  echo "ERRO: sem acesso ao Docker."
  echo "  sudo usermod -aG docker \$USER  # depois reinicie o terminal WSL"
  exit 1
fi

echo "==> stack obs"
for c in coast-academy-alloy coast-academy-tempo coast-academy-prometheus; do
  if ! docker ps --format '{{.Names}}' | grep -qx "$c"; then
    echo "ERRO: ${c} nao esta rodando."
    echo "  Rode: ./infra/scripts/obs-up.sh"
    exit 1
  fi
  echo "  OK  ${c}"
done

echo ""
echo "==> Alloy healthy"
curl -sf "${ALLOY_URL}/-/healthy" >/dev/null || { echo "ERRO: Alloy unhealthy"; exit 1; }
echo "  OK  ${ALLOY_URL}/-/healthy"

NET=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' coast-academy-alloy 2>/dev/null | head -1)
if [[ -z "$NET" ]]; then
  echo "ERRO: rede Docker do Alloy nao encontrada"
  exit 1
fi
echo "  rede: ${NET}"

echo ""
echo "==> deps otel-smoke (uma vez)"
if [[ ! -d "$SMOKE_DIR/node_modules/@opentelemetry/sdk-node" ]]; then
  if command -v npm >/dev/null 2>&1; then
    (cd "$SMOKE_DIR" && npm install --no-audit --no-fund)
  else
    echo "npm nao encontrado no host; instalando deps via container node..."
    docker run --rm \
      -v "$SMOKE_DIR:/app" \
      -w /app \
      node:22-bookworm-slim \
      npm install --no-audit --no-fund
  fi
fi

echo ""
echo "==> envia trace OTLP/HTTP (alloy:4318)"
docker run --rm --network "$NET" \
  -e OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4318 \
  -e OTEL_SMOKE_SERVICE="$SERVICE_NAME" \
  -v "$SMOKE_DIR:/app:ro" \
  -w /app \
  node:22-bookworm-slim \
  node smoke.cjs

echo "==> aguardando ingestao no Tempo (15s)..."
sleep 15

echo ""
echo "==> busca traces no Tempo (service.name=${SERVICE_NAME})"
tag_query="service.name%3D${SERVICE_NAME}"
search=$(curl -sf "${TEMPO_URL}/api/search?tags=${tag_query}&limit=5" 2>/dev/null || echo "{}")
if echo "$search" | grep -qE '"traces"|"traceID"'; then
  echo "  OK  trace encontrado no Tempo"
else
  search=$(curl -sf "${TEMPO_URL}/api/search?limit=10" 2>/dev/null || echo "{}")
  if echo "$search" | grep -qE '"traces"|"traceID"'; then
    echo "  OK  Tempo retornou traces (Grafana Explore → Tempo)"
  else
    echo "ERRO: nenhum trace no Tempo. Logs Alloy:"
    docker logs coast-academy-alloy 2>&1 | tail -20
    exit 1
  fi
fi

echo ""
echo "OK: OBS-T07 — OTLP Alloy → Tempo operacional"
echo "  Grafana: http://localhost:3001 → Explore → Tempo"
echo "  Proximo: OBS-T08 (OTEL SDK no certificate-service)"
