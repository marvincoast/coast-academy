#!/usr/bin/env bash
# =============================================================================
# Coast Academy — Sobe a aplicação completa COM observabilidade (LGTM)
# =============================================================================
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

log() { echo "==> $*"; }

# Garante permissões de execução e quebra de linha LF nos scripts
if ls "$ROOT/infra/scripts"/*.sh >/dev/null 2>&1; then
  sed -i 's/\r$//' "$ROOT/infra/scripts"/*.sh 2>/dev/null || true
  chmod +x "$ROOT/infra/scripts"/*.sh
fi

# 1. Sobe a stack principal da aplicação (Supabase + Microserviços + Web + Traefik)
log "Iniciando stack principal da aplicação local (start-local.sh)..."
bash infra/scripts/start-local.sh "$@"

# 2. Sobe a stack de observabilidade (Grafana, Prometheus, Loki, Tempo, Alloy, Kuma)
log "Iniciando stack de observabilidade (obs-up.sh)..."
bash infra/scripts/obs-up.sh

# 3. Executa a deduplicação de monitores no Uptime Kuma
log "Executando deduplicação de monitores do Uptime Kuma..."
bash infra/scripts/deduplicate-kuma.sh

echo ""
echo "============================================================"
echo "Plataforma Coast Academy & Stack de Observabilidade Ativas!"
echo "============================================================"
echo "Acesse os painéis:"
echo "  - Aplicação (Web):     http://localhost"
echo "  - Grafana Dashboards:  http://localhost:3001 (admin/admin)"
echo "  - Uptime Kuma Status:  http://localhost:3002"
echo "  - Supabase Studio:     http://localhost:54323"
echo "  - Mailpit:             http://localhost:54324"
echo "  - Prometheus Metrics:  http://localhost:9090"
echo "============================================================"
