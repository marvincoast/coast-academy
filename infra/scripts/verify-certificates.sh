#!/usr/bin/env bash
# Smoke test: certificate-service + PDF preview
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true

echo "==> health certificate-service"
code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/certificates/me 2>/dev/null || echo "000")
echo "GET /api/certificates/me (sem token) HTTP $code (esperado 401)"

if docker ps --format '{{.Names}}' | grep -qx coast-academy-certificate; then
  echo "container coast-academy-certificate: Up"
  docker logs coast-academy-certificate --tail 8 2>&1 | tail -5
else
  echo "AVISO: coast-academy-certificate não está rodando"
fi

echo ""
echo "Após rebuild, teste logado em http://localhost/certificados → Baixar certificado (PDF)"
