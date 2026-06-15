# Runbook operacional — Coast Academy

> Procedimentos de operação, troubleshooting e disaster recovery.

## Ambientes

| Ambiente    | Frontend         | API                  | DB                        | Onde rodar     |
| ----------- | ---------------- | -------------------- | ------------------------- | -------------- |
| local (dev) | http://localhost | http://localhost/api | Supabase local (`:54321`) | WSL 2 / Ubuntu |
| staging     | TBD              | TBD                  | Supabase staging          | VPS (TBD)      |
| prod        | TBD              | TBD                  | Supabase cloud            | VPS (TBD)      |

---

## Desenvolvimento local via WSL 2

> O Docker está instalado no **WSL 2** (Ubuntu). Todo o fluxo abaixo roda dentro do WSL; o Windows acessa via `localhost` transparentemente graças ao port-forwarding automático do WSL 2.

### 1 — Clonar / mover o projeto para dentro do WSL

Para melhor performance de I/O, mantenha os arquivos **dentro** do filesystem Linux:

```bash
# No terminal WSL (Ubuntu)
cd ~
git clone <repo> coast-academy
# OU, se já existir em Windows e quiser copiar:
cp -r /mnt/c/Projetos/coast-academy ~/coast-academy
cd ~/coast-academy
```

> Evite rodar `docker compose` apontando para `/mnt/c/...` — o I/O cruzado Windows↔WSL degrada a performance.

### 2 — Instalar pré-requisitos no WSL

```bash
# Node 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20

# pnpm
corepack enable
corepack prepare pnpm@9.12.0 --activate

# Supabase CLI (opcional, para banco local)
npm install -g supabase
```

### 3 — Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase, Resend, etc.
nano .env.local
```

### 4 — Instalar dependências

```bash
pnpm install
```

### 5 — Verificar código (sanity check)

```bash
pnpm -w lint
pnpm -w typecheck
pnpm -w test
```

### 6 — Subir serviços com Docker Compose

```bash
# Core (traefik + frontend + microserviços)
docker compose up -d

# Para incluir LLM local (Ollama) para testar o RAG:
docker compose --profile llm up -d

# Para incluir Redis (cache de leaderboard):
docker compose --profile cache up -d

# Tudo junto:
docker compose --profile llm --profile cache up -d
```

Acessos após subir:

| URL                    | O quê                                 |
| ---------------------- | ------------------------------------- |
| http://localhost       | Frontend Coast Academy                |
| http://localhost:8081  | Traefik dashboard (dev only)          |
| http://localhost:54323 | Supabase Studio (se `supabase start`) |
| http://localhost:54321 | Supabase API local                    |

### 7 — Supabase local (banco de desenvolvimento)

```bash
cd ~/coast-academy
supabase start                 # sobe Postgres, Auth, Studio, etc.
supabase db reset              # aplica todas as migrations e seeds
supabase migration list        # verifica status das migrations
```

Para parar:

```bash
supabase stop
```

### 8 — Verificar saúde dos serviços

```bash
curl http://localhost/api/courses/health
curl http://localhost/api/assessments/health
curl http://localhost/api/certificates/health
curl http://localhost/api/ranking/health
curl http://localhost/api/rag/health
```

---

## Deploy em VPS (produção / staging)

> Guia para subir o Coast Academy em uma VPS Linux (Ubuntu 22.04+ recomendado).

### Pré-requisitos na VPS

```bash
# Docker Engine + Compose v2
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # logout/login depois

# Git
sudo apt install -y git

# (Opcional) Supabase CLI para migrations remotas
npm install -g supabase
```

### Estrutura recomendada na VPS

```
/opt/coast-academy/                   # raiz do deploy
├── .env.prod                 # segredos reais (chmod 600, fora do Git)
├── docker-compose.prod.yml   # override de produção (a criar na Etapa 8)
└── coast-academy/            # clone do repositório
```

### Clonar e configurar

```bash
mkdir -p /opt/coast-academy
cd /opt/coast-academy
git clone <repo> coast-academy
cd coast-academy

# Criar arquivo de segredos de produção (chmod 600)
cp .env.example .env.prod
chmod 600 .env.prod
nano .env.prod    # preencher SUPABASE_*, RESEND_API_KEY, LLM_*, etc.
```

### Build e subida inicial

```bash
cd /opt/coast-academy/coast-academy

# Passar o arquivo de env correto
docker compose --env-file ../.env.prod up -d --build
```

### TLS com Let's Encrypt (Etapa 8)

Quando tiver domínio configurado (ex.: `coast-academy.com`):

1. Aponte o DNS A/AAAA para o IP da VPS.
2. No `infra/traefik/traefik.yml`, descomente o bloco `certificatesResolvers`.
3. Em `docker-compose.yml`, adicione o label `traefik.http.routers.*.tls.certresolver=le` nos serviços.
4. Crie o arquivo de armazenamento: `touch traefik_certs/acme.json && chmod 600 traefik_certs/acme.json`.
5. Redeploy: `docker compose up -d`.

### Atualizar para nova versão

```bash
cd /opt/coast-academy/coast-academy
git pull origin main
docker compose --env-file ../.env.prod up -d --build
```

### Executar migrations em produção

```bash
# Via Supabase CLI apontando para o projeto cloud
supabase db push --linked

# OU via pg_dump direto (se self-hosted)
psql $POSTGRES_URL < supabase/migrations/NNNN_*.sql
```

---

## Healthchecks

Cada microsserviço expõe `GET /health`. Traefik usa essa rota e o Compose também.

```bash
curl http://localhost/api/courses/health || echo "course-service down"
```

## Backup

- **Postgres (prod)**: snapshots diários do Supabase + `pg_dump` semanal manual para `infra/backups/` (somente local; gitignored).
- **Storage**: replicação cross-region planejada para Fase 2.

```bash
pg_dump -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB \
  -F c -f infra/backups/coast-academy-$(date +%Y%m%d).dump
```

## Restore

```bash
pg_restore -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d $POSTGRES_DB -c \
  infra/backups/coast-academy-YYYYMMDD.dump
```

## RTO / RPO

- **RTO** alvo MVP: 4 horas.
- **RPO** alvo MVP: 24 horas (snapshot diário Supabase).

## Incidentes comuns

### Healthcheck falhando em um serviço

```bash
docker compose ps
docker compose logs --tail=200 <serviço>
```

### Banco bloqueado por migration

1. Verifique `supabase migration list`.
2. Se necessário, aplique manualmente via Supabase Studio.

### Pico de requisições no Tutor (RAG)

- Aumente `RATE_LIMIT_RPM` no gateway via env.
- Verifique cache Redis (perfil `cache`) e taxa de hit.

## Rotação de segredos

1. Gerar novo segredo no provedor (Supabase / Resend / LLM).
2. Atualizar GitHub Actions Environment.
3. Atualizar `.env.local` da equipe.
4. Redeploy.
5. Revogar segredo antigo.
