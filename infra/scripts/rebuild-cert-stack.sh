#!/usr/bin/env bash
# Rebuild web + certificate-service e aplica migration de storage (se Supabase local).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

echo "==> pnpm install..."
pnpm install

export CERTIFICATE_DEV_PREVIEW=true
export VITE_DEV_LOCAL_LINKS=true

if pnpm exec supabase status >/dev/null 2>&1; then
  echo "==> supabase migration (bucket certificates)..."
  pnpm exec supabase db push 2>/dev/null || pnpm exec supabase migration up 2>/dev/null || true
fi

echo "==> build certificate-service..."
./infra/scripts/coast-academy-compose.sh build --no-cache certificate-service

echo "==> build web..."
export VITE_DEV_LOCAL_LINKS="${VITE_DEV_LOCAL_LINKS:-true}"
./infra/scripts/coast-academy-compose.sh build --no-cache web

echo "==> recriar containers..."
./infra/scripts/coast-academy-compose.sh up -d --force-recreate certificate-service web

echo "==> verificar rotas PDF no container..."
sleep 3
if docker exec coast-academy-certificate grep -q preview-pdf /app/dist/certificate/certificate.controller.js 2>/dev/null; then
  echo "OK: bundle contém preview-pdf"
else
  echo "ERRO: imagem antiga — rode build --no-cache certificate-service"
  exit 1
fi
docker logs coast-academy-certificate --tail 5 2>&1 | grep -E 'PDF routes|Certificate PDF storage' || true

echo ""
echo "OK. http://localhost/certificados → Baixar certificado (PDF)"
