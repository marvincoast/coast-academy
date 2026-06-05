#!/usr/bin/env bash
# Para a stack Coast Academy por completo (Traefik, web, microserviços, Ollama).
# `docker compose down` sozinho pode falhar com "network ... still in use" se
# algum container (ex.: profile llm) ainda estiver na rede.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
SCRIPTS="$ROOT/infra/scripts"
DC="$SCRIPTS/coast-academy-compose.sh"

# Repo em /mnt/c pode vir com CRLF; corrige antes de chamar outros scripts.
sed -i 's/\r$//' "$SCRIPTS"/*.sh 2>/dev/null || true

NET="coast-academy_coast-academy-net"

echo "==> compose down (perfis llm + cache, remove órfãos)..."
bash "$DC" --profile llm --profile cache down --remove-orphans "$@" || true

echo "==> parando containers coast-academy-* restantes..."
mapfile -t REMAINING < <(docker ps -a --filter "name=coast-academy-" --format '{{.Names}}' 2>/dev/null || true)
if ((${#REMAINING[@]})); then
  for c in "${REMAINING[@]}"; do
    echo "    stop/rm $c"
    docker stop "$c" >/dev/null 2>&1 || true
    docker rm -f "$c" >/dev/null 2>&1 || true
  done
else
  echo "    (nenhum)"
fi

if docker network inspect "$NET" >/dev/null 2>&1; then
  mapfile -t ON_NET < <(
    docker network inspect "$NET" --format '{{range $id, $c := .Containers}}{{$c.Name}}{{"\n"}}{{end}}' 2>/dev/null | sed '/^$/d' || true
  )
  if ((${#ON_NET[@]})); then
    echo "==> ainda na rede $NET:"
    for c in "${ON_NET[@]}"; do
      echo "    $c"
      docker stop "$c" >/dev/null 2>&1 || true
      docker rm -f "$c" >/dev/null 2>&1 || true
    done
  fi
  echo "==> removendo rede $NET..."
  docker network rm "$NET" >/dev/null 2>&1 || true
fi

if docker network inspect "$NET" >/dev/null 2>&1; then
  echo "AVISO: rede $NET ainda existe. Containers externos podem estar conectados."
  docker network inspect "$NET" --format '{{range $id, $c := .Containers}}  - {{$c.Name}}{{"\n"}}{{end}}' 2>/dev/null || true
  exit 1
fi

echo "OK: stack Coast Academy parada (Traefik incluído). Supabase CLI não foi parado."
echo "     Para parar Supabase: pnpm exec supabase stop"
