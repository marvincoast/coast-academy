#!/usr/bin/env bash
# Build Docker de microserviços — um por vez (evita 6× tsc em paralelo no /mnt/c).
# Uso:
#   ./infra/scripts/build-services.sh              # todos, sequencial, com cache
#   ./infra/scripts/build-services.sh course-service
#   ./infra/scripts/build-services.sh --no-cache certificate-service
# Após adicionar @coast-academy/observability, use --no-cache uma vez se o build falhar com TS2307.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

DC="./infra/scripts/coast-academy-compose.sh"
export COMPOSE_PARALLEL_LIMIT=1
export DOCKER_BUILDKIT=1

if [[ "$(pwd)" == /mnt/* ]]; then
  echo "AVISO: projeto em $(pwd)"
  echo "  Builds no /mnt/c costumam levar 15–40 min POR serviço."
  echo "  Muito mais rápido: cp -a \"$(pwd)\" ~/Coast-Academy && cd ~/Coast-Academy"
  echo ""
fi

SERVICES=(
  course-service
  assessment-service
  certificate-service
  ranking-service
  rag-service
  notification-service
)

if [[ $# -eq 0 ]]; then
  for svc in "${SERVICES[@]}"; do
    echo "==> build ${svc}"
    $DC build "$svc"
  done
  echo "==> build web"
  $DC build web
else
  $DC build "$@"
fi

echo "Done."
