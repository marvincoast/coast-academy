#!/usr/bin/env bash
# Reindexa o conteúdo das aulas para o Tutor RAG.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

ingest_secret="$(grep -E '^INGEST_SECRET=' .env.local 2>/dev/null | head -1 | cut -d= -f2- | tr -d "\"'" | xargs || true)"
ingest_secret="${ingest_secret:-dev-secret}"
payload="{\"secret\":\"${ingest_secret}\"}"

call_ingest() {
  local url="$1"
  local code body
  body=$(curl -s -w $'\n__HTTP_CODE__:%{http_code}' -X POST "$url" \
    -H "Content-Type: application/json" \
    -d "$payload" 2>/dev/null || echo $'\n__HTTP_CODE__:000')
  code="${body##*$'\n'__HTTP_CODE__:}"
  body="${body%$'\n'__HTTP_CODE__:*}"
  echo "${code}|${body}"
}

is_success() {
  local result="$1"
  echo "$result" | cut -d'|' -f2- | grep -qE '"chunksUpserted":[1-9]'
}

echo "==> POST /api/rag/ingest"
result=""
for attempt in 1 2 3 4 5; do
  result=$(call_ingest "http://localhost/api/rag/ingest")
  if is_success "$result"; then
    echo "$(echo "$result" | cut -d'|' -f2-)"
    exit 0
  fi
  code="$(echo "$result" | cut -d'|' -f1)"
  body="$(echo "$result" | cut -d'|' -f2-)"
  echo "    tentativa ${attempt}/5 — HTTP ${code}"
  [[ -n "$body" && "$body" != *"<html"* ]] && echo "    ${body}"
  sleep 8
done

# Fallback: chama o rag-service direto no container (evita Traefik/nginx).
if docker ps --format '{{.Names}}' | grep -qx coast-academy-rag; then
  echo "==> fallback: ingest direto no container coast-academy-rag"
  for _ in $(seq 1 10); do
    if docker exec coast-academy-rag wget -qO- http://127.0.0.1:3000/health >/dev/null 2>&1; then
      break
    fi
    sleep 3
  done
  result=$(docker exec coast-academy-rag wget -qO- \
    --header='Content-Type: application/json' \
    --post-data="$payload" \
    http://127.0.0.1:3000/api/rag/ingest 2>/dev/null || echo '{"errors":["container fetch failed"]}')
  if echo "$result" | grep -qE '"chunksUpserted":[1-9]'; then
    echo "$result"
    exit 0
  fi
  echo "$result"
fi

echo ""
echo "ERRO: ingest não indexou chunks. Verifique:"
echo "  - ./infra/scripts/coast-academy-compose.sh up -d --force-recreate rag-service"
echo "  - docker exec coast-academy-rag wget -qO- http://127.0.0.1:3000/health"
echo "  - docker logs coast-academy-rag --tail 50"
exit 1
