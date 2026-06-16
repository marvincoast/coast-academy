#!/usr/bin/env bash
# Falha se artefatos acidentais existirem na raiz (tracked ou no disco).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

ARTIFACTS=(
  '='
  CACHED
  Containers
  exporting
  reading
  resolve
  transferring
  '[base'
  '[internal]'
  Esta
  Este
  FETCH_HEAD
  Procedimentos
  Serve
  Versão
)

ALLOWED_ROOT_FILES=(
  .dockerignore
  .editorconfig
  .env.example
  .eslintrc.cjs
  .gitattributes
  .gitignore
  .npmrc
  .nvmrc
  .prettierignore
  .prettierrc
  README.md
  commitlint.config.cjs
  docker-compose.obs.yml
  docker-compose.yml
  package.json
  pnpm-lock.yaml
  pnpm-workspace.yaml
  start-all.sh
  start.sh
  tsconfig.base.json
  tsconfig.paths.json
  turbo.json
)

is_allowed_root_file() {
  local f=$1
  local allowed
  for allowed in "${ALLOWED_ROOT_FILES[@]}"; do
    [[ "$f" == "$allowed" ]] && return 0
  done
  return 1
}

fail=0
for f in "${ARTIFACTS[@]}"; do
  if [[ -e "$f" ]] || git ls-files --error-unmatch -- "$f" >/dev/null 2>&1; then
    echo "ERRO: artefato na raiz: $f"
    fail=1
  fi
done

for f in *; do
  [[ -e "$f" ]] || continue
  [[ -f "$f" ]] || continue
  is_allowed_root_file "$f" && continue
  [[ ! -s "$f" ]] || continue
  echo "ERRO: arquivo vazio suspeito na raiz: $f"
  fail=1
done

if find infra/scripts -maxdepth 1 -type f -name 'sed*' 2>/dev/null | grep -q .; then
  echo "ERRO: temporário sed em infra/scripts/"
  fail=1
fi

while IFS= read -r logfile; do
  [[ -z "$logfile" ]] && continue
  echo "ERRO: log na raiz versionado: $logfile"
  fail=1
done < <(git ls-files '*.log' 2>/dev/null | grep -E '^[^/]+\.log$' || true)

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "Execute: ./infra/scripts/clean-docker-root-artifacts.sh"
  exit 1
fi

echo "OK: raiz livre de artefatos acidentais."
