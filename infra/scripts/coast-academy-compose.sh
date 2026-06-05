#!/usr/bin/env bash
# Wrapper: sempre usa .env.local (evita WARN e containers sem env).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
if [[ ! -f .env.local ]]; then
  echo "Erro: .env.local não encontrado. Copie de .env.example e preencha."
  exit 1
fi
if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Erro: docker compose ou docker-compose não encontrado."
  exit 1
fi
exec "${COMPOSE[@]}" --env-file .env.local "$@"
