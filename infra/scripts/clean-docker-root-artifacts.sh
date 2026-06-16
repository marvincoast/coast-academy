#!/usr/bin/env bash
# Remove artefatos acidentais na raiz (saída Docker BuildKit, redirecionamentos quebrados, etc.).
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

# Arquivos legítimos na raiz — qualquer outro arquivo vazio é lixo de redirecionamento.
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

removed=0
for f in "${ARTIFACTS[@]}"; do
  if [[ -e "$f" ]]; then
    rm -f -- "$f"
    echo "deleted: $f"
    removed=$((removed + 1))
  fi
  if git ls-files --error-unmatch -- "$f" >/dev/null 2>&1; then
    git rm -f --cached -- "$f"
    echo "untracked from git: $f"
    removed=$((removed + 1))
  fi
done

# Remove arquivos vazios suspeitos na raiz
for f in *; do
  [[ -e "$f" ]] || continue
  [[ -f "$f" ]] || continue
  is_allowed_root_file "$f" && continue
  [[ ! -s "$f" ]] || continue
  rm -f -- "$f"
  git rm -f --cached -- "$f" 2>/dev/null || true
  echo "deleted empty root file: $f"
  removed=$((removed + 1))
done

# Temporários sed em infra/scripts
while IFS= read -r tmp; do
  [[ -z "$tmp" ]] && continue
  rm -f -- "$tmp"
  git rm -f --cached -- "$tmp" 2>/dev/null || true
  echo "deleted sed temp: $tmp"
  removed=$((removed + 1))
done < <(find infra/scripts -maxdepth 1 -type f -name 'sed*' 2>/dev/null || true)

# Logs soltos na raiz
while IFS= read -r logfile; do
  [[ -z "$logfile" ]] && continue
  rm -f -- "$logfile"
  git rm -f --cached -- "$logfile" 2>/dev/null || true
  echo "removed log: $logfile"
  removed=$((removed + 1))
done < <(git ls-files '*.log' 2>/dev/null | grep -E '^[^/]+\.log$' || true)

if [[ "$removed" -eq 0 ]]; then
  echo "Nenhum artefato na raiz."
else
  echo "Limpeza concluída ($removed item(ns)). Faça commit das remoções."
fi
