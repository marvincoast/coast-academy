#!/usr/bin/env bash
# Reindexa o conteúdo das aulas para o Tutor RAG.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

ingest_secret="$(grep -E '^INGEST_SECRET=' .env.local 2>/dev/null | head -1 | cut -d= -f2- | tr -d "\"'" | xargs || true)"
ingest_secret="${ingest_secret:-dev-secret}"

echo "==> POST /api/rag/ingest"
curl -s -X POST "http://localhost/api/rag/ingest" \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"${ingest_secret}\"}"
echo ""
