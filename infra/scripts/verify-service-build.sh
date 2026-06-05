#!/usr/bin/env bash
# Verifica build local de um microservico (antes do Docker).
# Uso: ./infra/scripts/verify-service-build.sh certificate-service
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

SVC="${1:-certificate-service}"
echo "==> workspace packages"
pnpm --filter @coast-academy/shared-types run build
pnpm --filter @coast-academy/observability run build

echo "==> resolve @coast-academy/observability from apps/${SVC}"
(
  cd "apps/${SVC}"
  node -e "console.log(require.resolve('@coast-academy/observability'))"
)

echo "==> nest build apps/${SVC}"
pnpm --filter "./apps/${SVC}" run build

echo "OK: ${SVC} build passou"
