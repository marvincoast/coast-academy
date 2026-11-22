#!/usr/bin/env bash
# =============================================================================
# Coast Academy — Instalador e Launcher Unificado (Linux / WSL 2 / macOS)
# =============================================================================
# Uso:
#   bash start.sh
#   (ou: bash infra/scripts/setup-and-run.sh)
#
# Flags opcionais:
#   FIRST_RUN=1 bash start.sh                  # força DB reset + rebuild total
#   COAST_ACADEMY_SKIP_OBS=1 bash start.sh     # sobe sem Grafana/LGTM/Kuma
#   COAST_ACADEMY_SKIP_OLLAMA=1 bash start.sh  # sobe sem Ollama (mais leve)
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}==>${NC} $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[AVISO]${NC} $*"; }
err()  { echo -e "${RED}[ERRO]${NC} $*"; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_DIR="${COAST_ACADEMY_HOME:-$HOME/coast-academy}"

# ── 1. Se rodando em /mnt/* (WSL em disco Windows), sincroniza para ~/coast-academy ──
if [[ "$REPO_ROOT" == /mnt/* ]]; then
  log "Detectado WSL rodando em pasta Windows ($REPO_ROOT)."
  log "Copiando aplicação para filesystem Linux nativo ($TARGET_DIR)..."
  mkdir -p "$TARGET_DIR"

  if command -v rsync >/dev/null 2>&1; then
    rsync -a --delete \
      --exclude 'node_modules' \
      --exclude '.turbo' \
      --exclude 'dist' \
      --exclude '.git' \
      "$REPO_ROOT/" "$TARGET_DIR/"
  else
    (
      cd "$REPO_ROOT"
      tar --exclude='./node_modules' \
          --exclude='./.turbo' \
          --exclude='./.git' \
          -cf - .
    ) | (cd "$TARGET_DIR" && tar -xf -)
  fi

  sed -i 's/\r$//' "$TARGET_DIR/start.sh" "$TARGET_DIR/infra/scripts/"*.sh 2>/dev/null || true
  chmod +x "$TARGET_DIR/start.sh" "$TARGET_DIR/infra/scripts/"*.sh

  ok "Aplicação copiada com sucesso para $TARGET_DIR"
  log "Continuando instalação a partir de $TARGET_DIR..."
  exec bash "$TARGET_DIR/infra/scripts/setup-and-run.sh" "$@"
fi

cd "$REPO_ROOT"
log "Diretório de execução: $REPO_ROOT"

# ── 2. Normaliza quebras de linha (LF) e permissões dos scripts ──────────────
sed -i 's/\r$//' "$REPO_ROOT/start.sh" "$REPO_ROOT/infra/scripts/"*.sh 2>/dev/null || true
chmod +x "$REPO_ROOT/start.sh" "$REPO_ROOT/infra/scripts/"*.sh

# ── 3. Verifica / instala Node.js 20+ e pnpm 9.12.0 ──────────────────────────
export NVM_DIR="$HOME/.nvm"
[[ -s "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh"

need_node=0
if ! command -v node >/dev/null 2>&1; then
  need_node=1
else
  node_major="$(node -v | sed 's/^v//' | cut -d. -f1)"
  [[ "${node_major:-0}" -lt 20 ]] && need_node=1
fi

if [[ "$need_node" == "1" ]]; then
  log "Instalando Node.js 20 via nvm..."
  if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source "$NVM_DIR/nvm.sh"
  fi
  nvm install 20
  nvm use 20
  nvm alias default 20
fi
ok "Node.js $(node -v) pronto."

if ! command -v pnpm >/dev/null 2>&1; then
  log "Ativando pnpm 9.12.0 via corepack..."
  corepack enable || npm install -g pnpm@9.12.0
  corepack prepare pnpm@9.12.0 --activate || true
fi
ok "pnpm $(pnpm -v) pronto."

# ── 4. Verifica / instala / inicia Docker Engine ─────────────────────────────
docker_ready() { docker info >/dev/null 2>&1; }

install_docker_linux() {
  if [[ -f /etc/debian_version ]]; then
    log "Instalando Docker Engine + Compose v2 via repositório oficial (compatível com WSL 2)..."
    sudo dpkg --configure -a || true
    sudo apt-get update -qq || true
    sudo DEBIAN_FRONTEND=noninteractive apt-get --fix-broken install -y || true
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl gnupg lsb-release
    sudo install -m 0755 -d /etc/apt/keyrings
    . /etc/os-release
    local distro_id="${ID:-ubuntu}"
    local codename="${VERSION_CODENAME:-noble}"
    curl -fsSL "https://download.docker.com/linux/${distro_id}/gpg" | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${distro_id} ${codename} stable" \
      | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt-get update -qq
    if ! sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin; then
      warn "Fallback para pacotes docker.io do Ubuntu..."
      sudo DEBIAN_FRONTEND=noninteractive apt-get --fix-broken install -y || true
      sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2
    fi
  else
    log "Instalando Docker Engine..."
    curl -fsSL https://get.docker.com | sudo sh
  fi
  sudo usermod -aG docker "$USER" || true
}

start_docker_daemon() {
  if command -v systemctl >/dev/null 2>&1 && [[ -d /run/systemd/system ]]; then
    sudo systemctl enable --now docker 2>/dev/null || sudo systemctl start docker 2>/dev/null || true
  fi
  if ! docker_ready && command -v service >/dev/null 2>&1; then
    sudo service docker start 2>/dev/null || true
  fi
}

if ! command -v docker >/dev/null 2>&1; then
  warn "Docker não encontrado no Linux/WSL."
  install_docker_linux
fi

if ! docker_ready; then
  log "Iniciando Docker daemon..."
  start_docker_daemon
  for _ in $(seq 1 12); do
    if docker_ready || [[ -S /var/run/docker.sock ]]; then break; fi
    sleep 2
  done

  if ! docker_ready && [[ ! -S /var/run/docker.sock ]] && command -v update-alternatives >/dev/null 2>&1; then
    if [[ -x /usr/sbin/iptables-legacy ]]; then
      warn "Tentando iniciar Docker com iptables-legacy (compatibilidade WSL)..."
      sudo update-alternatives --set iptables /usr/sbin/iptables-legacy 2>/dev/null || true
      sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy 2>/dev/null || true
      start_docker_daemon
      for _ in $(seq 1 10); do
        if docker_ready || [[ -S /var/run/docker.sock ]]; then break; fi
        sleep 2
      done
    fi
  fi

  if ! docker_ready && [[ -S /var/run/docker.sock ]] && [[ -z "${COAST_ACADEMY_DOCKER_GRP:-}" ]]; then
    log "Aplicando permissão de acesso ao Docker na sessão atual..."
    sudo usermod -aG docker "$USER" 2>/dev/null || true
    if command -v sg >/dev/null 2>&1; then
      exec sg docker -c "COAST_ACADEMY_DOCKER_GRP=1 bash '$REPO_ROOT/infra/scripts/setup-and-run.sh'"
    else
      sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    fi
  fi
fi

if ! docker_ready; then
  err "Não foi possível conectar ao Docker daemon (unix:///var/run/docker.sock)."
  exit 1
fi
ok "Docker daemon ativo e respondendo."

# ── 5. .env.local + dependências ─────────────────────────────────────────────
[[ ! -f .env.local ]] && cp .env.example .env.local
log "Instalando dependências do monorepo (pnpm install)..."
pnpm install
ok "Dependências instaladas."

# ── 6. Detecta primeira execução (build completo + reset do banco) ───────────
if [[ "${FIRST_RUN:-}" == "1" ]] || ! docker images --format '{{.Repository}}' | grep -q 'coast-academy'; then
  log "Primeira execução detectada — build completo + reset do banco..."
  export COAST_ACADEMY_DB_RESET=1
  export COAST_ACADEMY_BUILD=1
  export COAST_ACADEMY_BUILD_WEB=1
fi

# ── 7. Sobe toda a stack (App + Observabilidade LGTM + Uptime Kuma) ─────────
if [[ "${COAST_ACADEMY_SKIP_OBS:-}" == "1" ]]; then
  ./infra/scripts/start-local.sh
else
  ./infra/scripts/start-all.sh
fi

echo ""
ok "==================================================================="
ok "  Coast Academy + Observabilidade rodando localmente!"
ok "  • Plataforma (Web):      http://localhost"
ok "  • Mailpit (Login):       http://localhost:54324"
ok "  • Supabase Studio:       http://localhost:54323"
ok "  • Traefik Dashboard:     http://localhost:8081"
ok "  • Grafana (admin/admin): http://localhost:3001"
ok "  • Uptime Kuma:           http://localhost:3002"
ok "  • Prometheus:            http://localhost:9090"
ok "  • Alloy (OpenTelemetry): http://localhost:12345"
ok "==================================================================="
