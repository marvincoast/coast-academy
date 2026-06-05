#!/usr/bin/env bash
# Rebuild + recria o container web (variáveis VITE_* são de build-time).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

export VITE_DEV_LOCAL_LINKS="${VITE_DEV_LOCAL_LINKS:-true}"

echo "==> build web (VITE_DEV_LOCAL_LINKS=$VITE_DEV_LOCAL_LINKS)..."
./infra/scripts/coast-academy-compose.sh build --no-cache web

echo "==> recriar container..."
./infra/scripts/coast-academy-compose.sh up -d --force-recreate web

echo ""
echo "OK. Abra http://localhost/certificados e clique na aba 'dev' (canto inferior esquerdo)."
echo "Hard refresh: Ctrl+Shift+R"
