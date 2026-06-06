#!/usr/bin/env bash
# Atalho na raiz do repo — sobe o ambiente local completo COM observabilidade.
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/infra/scripts/start-all.sh" "$@"
