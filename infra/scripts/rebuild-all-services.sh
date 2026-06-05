#!/usr/bin/env bash
# Rebuild sequencial dos microservicos (evita 6 builds paralelos cancelando uns aos outros).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

DC="./infra/scripts/coast-academy-compose.sh"
NO_CACHE="${1:-}"

SERVICES=(
  certificate-service
  assessment-service
  course-service
  ranking-service
  rag-service
  notification-service
)

echo "==> workspace packages"
pnpm --filter @coast-academy/shared-types run build
pnpm --filter @coast-academy/observability run build

for svc in "${SERVICES[@]}"; do
  echo ""
  echo "==> docker build ${svc} (sequencial)"
  if [[ "$NO_CACHE" == "--no-cache" ]]; then
    $DC build --no-cache "$svc" || { echo "ERRO: docker build falhou em ${svc}"; exit 1; }
  else
    $DC build "$svc" || { echo "ERRO: docker build falhou em ${svc}"; exit 1; }
  fi
done

echo ""
echo "==> recreate containers"
$DC up -d --force-recreate "${SERVICES[@]}" || { echo "ERRO: docker compose up falhou"; exit 1; }
echo "Done. Rode: ./infra/scripts/verify-obs-t05.sh coast-academy-certificate"
