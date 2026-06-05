#!/usr/bin/env bash
# Garante que microserviços Coast Academy estejam na rede Docker do Supabase CLI.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

NET="${SUPABASE_DOCKER_NETWORK:-supabase_network_coast-academy}"
SERVICES=(
  coast-academy-course
  coast-academy-assessment
  coast-academy-certificate
  coast-academy-ranking
  coast-academy-rag
  coast-academy-notification
)

if ! docker network inspect "$NET" >/dev/null 2>&1; then
  echo "Rede $NET não encontrada. Rode: npx supabase start"
  exit 1
fi

for c in "${SERVICES[@]}"; do
  if ! docker ps --format '{{.Names}}' | grep -qx "$c"; then
    continue
  fi
  if docker inspect "$c" --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' | grep -qF "$NET"; then
    echo "$c já está em $NET"
  else
    echo "Conectando $c → $NET"
    docker network connect "$NET" "$c"
  fi
done
