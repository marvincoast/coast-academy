#!/usr/bin/env bash
# Atalho raiz (Linux / WSL 2) -> executa o instalador e launcher completo
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$ROOT/infra/scripts/setup-and-run.sh" "$@"
