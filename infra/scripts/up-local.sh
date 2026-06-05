#!/usr/bin/env bash
# Atalho — mesmo que start-local.sh (mantido por compatibilidade com docs antigos).
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/start-local.sh" "$@"
