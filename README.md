# Coast Academy

> Plataforma de ensino interativa para **tape reading e análise de fluxo do Dólar Futuro (B3)** — com design de mercado financeiro, simulados fullscreen, prova final, certificado PDF, ranking sazonal e tutor RAG. Tudo neste repositório.

![status](https://img.shields.io/badge/etapa-9%20visual%20redesign%20conclu%C3%ADdo-brightgreen)
![stack](https://img.shields.io/badge/stack-React%2019%20%2B%20NestJS%20%2B%20Supabase-blue)
![types](https://img.shields.io/badge/types-TypeScript%20strict-3178c6)
![design](https://img.shields.io/badge/design-financial%20market%20theme-c9a227)

---

## Visão geral

| Área | Tecnologia |
|------|------------|
| Monorepo | pnpm 9 + Turborepo 2 |
| Frontend | React 19 + Vite + TailwindCSS + TanStack Query + i18next |
| Design System | `@coast-academy/ui` — tokens, preset Tailwind, componentes market |
| Microserviços | NestJS 10 + Pino + Zod (6 serviços) |
| API Gateway | Traefik v3 (TLS, rate limit, CSP, HSTS) |
| Banco / Auth / Storage | Supabase (Postgres 16 + pgvector + RLS) |
| RAG | pgvector + prompts versionados em `apps/rag-service/prompts/` |
| Observabilidade | OpenTelemetry + Pino |
| Testes | Vitest + Jest + Playwright + axe-core |
| CI | GitHub Actions — lint / typecheck / test / docker / audit |

---

## Design — tema mercado financeiro

A plataforma usa uma identidade visual de **terminal de análise financeira**, construída sobre um sistema de tokens centralizado em `packages/ui`.

### Paleta de cores

| Token | Cor | Uso |
|-------|-----|-----|
| `brand-gold` | `#C9A227` | Marca, CTAs, destaque |
| `flow-bid` | `#00C853` | Compra — valores positivos |
| `flow-ask` | `#FF5252` | Venda — valores negativos |
| `bg-base` | `#0B0F14` | Fundo principal |
| `bg-surface` | `#101720` | Cards e painéis |
| `bg-elevated` | `#161E2A` | Dropdowns e camadas superiores |

### Componentes de UI

| Componente | Localização | Descrição |
|------------|-------------|-----------|
| `GlassCard` | `apps/web/src/components/ui/` | Card com glassmorphism, 3 variantes de profundidade |
| `StatCard` | `apps/web/src/components/ui/` | Métrica com ícone, tendência e estado de carregamento |
| `ProgressBar` | `apps/web/src/components/ui/` | Barra animada com variantes bid/ask/gold |
| `MarketBadge` | `apps/web/src/components/ui/` | Badge temático de mercado |
| `MarketTicker` | `apps/web/src/components/market/` | Faixa de cotações com scroll infinito |
| `PriceDisplay` | `apps/web/src/components/market/` | Preço colorizado com animação de variação |
| `TapeReadingVisualization` | `apps/web/src/components/market/` | Visualizador de fluxo de ordens |
| `DataGrid` | `apps/web/src/components/market/` | Tabela financeira com sorting |

---

## Estrutura do projeto

```
Coast-Academy/
├── apps/
│   ├── web/                   # SPA React (frontend)
│   ├── course-service/        # NestJS — conteúdo e progresso
│   ├── assessment-service/    # NestJS — scoring server-side, anti-cheat
│   ├── certificate-service/   # NestJS — PDF + QR + SHA-256
│   ├── ranking-service/       # NestJS — leaderboard sazonal
│   ├── rag-service/           # NestJS — tutor RAG + pgvector
│   └── notification-service/  # NestJS — e-mails via Resend
├── packages/
│   ├── ui/                    # design tokens, Tailwind preset, utilitários
│   ├── shared-types/          # Zod + tipos de domínio compartilhados
│   └── eslint-config/         # ESLint/Prettier centralizado
├── supabase/                  # migrations, seeds, config.toml
├── infra/
│   ├── docker/                # Dockerfiles por serviço
│   ├── traefik/               # traefik.yml, routers, middlewares
│   └── scripts/               # up-local.sh, build-services.sh, verify-stack.sh
├── docs/                      # ARCHITECTURE, ADRs, SECURITY, RUNBOOK...
├── .github/workflows/         # CI (8 stages)
├── docker-compose.yml
├── turbo.json
├── tsconfig.base.json
└── pnpm-workspace.yaml
```

---

## Pré-requisitos

| Ferramenta | Versão | Observação |
|------------|--------|------------|
| **Node.js** | 20 LTS (ver `.nvmrc`) | `nvm install && nvm use` |
| **pnpm** | 9.x | `corepack enable && corepack prepare pnpm@9.12.0 --activate` |
| **Docker** + Compose v2 | recente | Engine rodando; no Windows use **Docker Desktop** com integração WSL |
| **Supabase CLI** | 2.x | Vem com `pnpm install` (`node_modules/.bin/supabase`) — não precisa instalar global |
| **Git** | qualquer | Clone com `core.autocrlf=input` ou corrija scripts (ver abaixo) |

### Windows (recomendado: WSL 2 + Ubuntu)

1. Instale [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) e habilite **Use the WSL 2 based engine**.
2. Clone o repositório **dentro do Linux**, não em `C:\...` montado no WSL:

```bash
cd ~
git clone <url-do-repo> Coast-Academy
cd Coast-Academy
```

> Repositórios em `/mnt/c/Users/...` funcionam, mas o **build Docker pode levar 15–40 min por serviço**. Em `~/Coast-Academy` o mesmo build costuma levar minutos.

### Linux / macOS

Clone em qualquer pasta local (ex.: `~/Coast-Academy`) e siga os mesmos comandos abaixo no terminal.

---

## Início rápido — um comando só

No **WSL/Linux** (recomendado: `~/Coast-Academy`, não `/mnt/c/...`):

```bash
cd ~/Coast-Academy
cp .env.example .env.local   # só na 1ª vez; depois ajuste chaves do supabase status

# Sobe Supabase + seeds (se vazio) + Docker + Ollama + ingest RAG + smoke test
./infra/scripts/start-local.sh
```

Equivalente via pnpm:

```bash
pnpm start:local
```

**Primeira vez** (banco zerado + build de todas as imagens — pode demorar):

```bash
COAST_ACADEMY_DB_RESET=1 COAST_ACADEMY_BUILD=1 COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/start-local.sh
```

Abra **http://coastacademy/login** (ou **http://localhost/login**) → magic link em **http://127.0.0.1:54324** (Mailpit).

**Hostname local `coastacademy`:** no Windows, PowerShell **como Administrador**:

```powershell
cd Coast-Academy
powershell -ExecutionPolicy Bypass -File infra/scripts/add-coastacademy-hosts.ps1
```

Modelo manual: [`infra/hosts.local.example`](infra/hosts.local.example).

O script `start-local.sh` também corrige fins de linha dos `.sh`, roda `pnpm install` se faltar `node_modules`, aplica seed quando não há aulas, puxa modelos no Ollama e chama `/api/rag/ingest`.

Atalho antigo: `./infra/scripts/up-local.sh` (mesma coisa).

---

## Como rodar — detalhado

### 1. Clonar e instalar

```bash
git clone <url-do-repo> Coast-Academy
cd Coast-Academy
pnpm install
```

O Supabase CLI fica em `node_modules/.bin/supabase`. Prefira:

```bash
pnpm exec supabase <comando>
# ou
./node_modules/.bin/supabase <comando>
```

### 2. Preparar scripts (Windows / clone com CRLF)

Se aparecer `env: bash\r: No such file or directory`:

```bash
sed -i 's/\r$//' infra/scripts/*.sh
chmod +x infra/scripts/*.sh
```

O repositório define `*.sh text eol=lf` em `.gitattributes`; use `git clone` no WSL ou `git config core.autocrlf input` para evitar o problema.

### 3. Configurar `.env.local`

```bash
cp .env.example .env.local
```

Depois de `pnpm exec supabase start`, rode `pnpm exec supabase status` e preencha (exemplo **desenvolvimento local**):

```env
# Frontend — use caminho relativo (nginx/Traefik fazem proxy de /api)
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<Publishable key do supabase status>
# Aba discreta de URLs na tela de login (só build local; ver nota abaixo)
VITE_DEV_LOCAL_LINKS=true

# Microserviços dentro do Docker (rede supabase_network_coast-academy)
SUPABASE_URL=http://kong:8000
SUPABASE_ANON_KEY=<mesma publishable key>
SUPABASE_SERVICE_ROLE_KEY=<Secret key do supabase status>
```

> **Importante:** variáveis `VITE_*` são embutidas no bundle do frontend no **build Docker**. Depois de alterar `.env.local`, rebuild: `COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/up-local.sh`.

### 4. Supabase local (banco + auth + e-mail)

```bash
pnpm exec supabase start
```

URLs úteis:

| Serviço | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio | http://127.0.0.1:54323 |
| Mailpit (magic link) | http://127.0.0.1:54324 |
| Postgres direto | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

### 5. Migrations e dados iniciais (seed)

Com o Supabase **rodando**:

```bash
pnpm exec supabase db reset
```

Isso aplica todas as migrations em `supabase/migrations/` e os seeds em `supabase/seed/` (configurados em `supabase/config.toml`).

Se o curso aparecer vazio ou `db reset` falhar com *supabase start is not running*:

```bash
pnpm exec supabase start
pnpm exec supabase db reset
# fallback manual:
./infra/scripts/seed-db.sh
```

### 6. Subir a aplicação (Docker)

O script [`infra/scripts/up-local.sh`](infra/scripts/up-local.sh):

1. Garante Supabase (via CLI local, se disponível)
2. Faz build do container **web** (Vite → nginx)
3. Sobe **Traefik**, **frontend**, **6 microserviços** e **Ollama** (perfil `llm`)
4. Conecta microserviços à rede Docker do Supabase
5. Roda smoke test (`verify-stack.sh`)

**Primeira vez** (build de todas as imagens — pode demorar):

```bash
COAST_ACADEMY_BUILD=1 COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/up-local.sh
```

**Dia a dia** (sem rebuild):

```bash
./infra/scripts/up-local.sh
```

Saída esperada:

```
=== URLs ===
App:        http://coastacademy  |  http://localhost  |  :3000
Login:      http://coastacademy/login
Traefik:    http://localhost:8081
Supabase:   http://127.0.0.1:54323
Mailpit:    http://127.0.0.1:54324
```

### 7. Login

1. Acesse **http://coastacademy/login** ou **http://localhost/login** (preferível ao `:3000` — APIs passam pelo Traefik).
2. Informe um e-mail → **Enviar link de acesso**.
3. Abra **http://127.0.0.1:54324**, clique no link do e-mail.
4. Você cai no dashboard.

Na tela de login, uma aba fina (`·`) no canto inferior direito lista URLs locais de dev (se `VITE_DEV_LOCAL_LINKS=true` no build). Para demo sem ela: `VITE_DEV_LOCAL_LINKS=false` e rebuild do web.

---

## Comandos do dia a dia

| Objetivo | Comando |
|----------|---------|
| Subir stack (sem rebuild) | `./infra/scripts/up-local.sh` |
| Rebuild só frontend | `COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/up-local.sh` |
| Rebuild todos os microserviços | `COAST_ACADEMY_BUILD=1 ./infra/scripts/up-local.sh` |
| Status / health | `./infra/scripts/coast-academy-compose.sh ps` e `./infra/scripts/verify-stack.sh` |
| Logs do frontend | `./infra/scripts/coast-academy-compose.sh logs coast-academy-web --tail 50` |
| Parar app Docker (Traefik + rede) | `./infra/scripts/down-local.sh` |
| Parar Supabase | `pnpm exec supabase stop` |
| Resetar banco + seeds | `pnpm exec supabase db reset` |

Build de um microserviço isolado:

```bash
./infra/scripts/build-services.sh course-service
./infra/scripts/coast-academy-compose.sh up -d --force-recreate course-service
```

### Frontend sem Docker (hot reload)

Útil para UI; APIs de curso/simulado/ranking **não** sobem automaticamente.

```bash
pnpm exec supabase start
pnpm install
pnpm --filter @coast-academy/web dev
```

→ http://localhost:5173/login

---

## URLs de acesso

| Serviço | URL |
|---------|-----|
| **Aplicação** (recomendado) | http://coastacademy |
| Alternativa | http://localhost |
| Frontend direto (nginx) | http://coastacademy:3000 ou http://localhost:3000 |
| Login | http://coastacademy/login |
| Dashboard | http://coastacademy/dashboard |
| Traefik (dashboard dev) | http://localhost:8081 |
| Supabase Studio | http://127.0.0.1:54323 |
| Mailpit (e-mails) | http://127.0.0.1:54324 |

Requer `127.0.0.1 coastacademy` no arquivo hosts — [`infra/hosts.local.example`](infra/hosts.local.example).

**APIs** (prefixo `/api` via Traefik em http://coastacademy ou http://localhost):

| Serviço | Prefixo |
|---------|---------|
| Cursos e progresso | `/api/courses`, `/api/progress` |
| Simulados | `/api/assessments`, `/api/attempts` |
| Certificados | `/api/certificates`, `/verify` |
| Ranking | `/api/ranking` |
| Tutor RAG | `/api/rag` |

---

## Scripts raiz (Turborepo)

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Watch mode em todos os pacotes (Turbo) |
| `pnpm build` | Build incremental de todos os pacotes |
| `pnpm lint` | ESLint em todo o monorepo |
| `pnpm typecheck` | `tsc --noEmit` em todos os pacotes |
| `pnpm test` | Vitest/Jest em todos os pacotes |
| `pnpm test:e2e` | Playwright e2e (login, a11y, verify) |
| `pnpm format` | Prettier write |

Scripts em `infra/scripts/`:

| Script | Função |
|--------|--------|
| `start-local.sh` | **Um comando:** install, Supabase, seed, Docker, Ollama, ingest RAG, verify |
| `up-local.sh` | Atalho para `start-local.sh` |
| `coast-academy-compose.sh` | Wrapper `docker compose --env-file .env.local` |
| `build-services.sh` | Build sequencial dos microserviços |
| `connect-supabase-network.sh` | Liga containers à rede `supabase_network_coast-academy` |
| `verify-stack.sh` | Smoke test HTTP + health |
| `seed-db.sh` | Seeds SQL manuais via `psql` |

---

## Solução de problemas comuns

| Sintoma | Solução |
|---------|---------|
| `supabase start is not running` ao rodar `db reset` | Rode `pnpm exec supabase start` **antes** de `db reset` |
| `env: bash\r: No such file or directory` | `sed -i 's/\r$//' infra/scripts/*.sh && `chmod +x infra/scripts/*.sh` |
| `Supabase CLI não encontrado` no `up-local.sh` | `pnpm install` — o script usa `node_modules/.bin/supabase` |
| Build Docker 30+ min | Repo em `/mnt/c/...` — mova para `~/Coast-Academy` no WSL |
| Frontend desatualizado / aba dev não aparece | `COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/up-local.sh` (variáveis `VITE_*` são de build-time) |
| `404` em http://coastacademy ou http://localhost | `./infra/scripts/coast-academy-compose.sh up -d traefik web` ou `./infra/scripts/up-local.sh` |
| `coastacademy` não abre / `NXDOMAIN` | Rode `infra/scripts/add-coastacademy-hosts.ps1` como Admin (ou `http://localhost`) |
| `network ... still in use` no `compose down` | `./infra/scripts/down-local.sh` (para Traefik, Ollama e libera a rede) |
| Traefik / porta 80 presos após `down` | `docker ps -a \| grep coast-academy` → `./infra/scripts/down-local.sh` |
| `env: bash\r: No such file or directory` | `sed -i 's/\r$//' infra/scripts/*.sh` ou `bash infra/scripts/down-local.sh` |
| Curso vazio / `/404` no curso | `pnpm exec supabase db reset` ou `./infra/scripts/seed-db.sh` |
| Curso ok na `:3000` mas API falha | Use **http://coastacademy** ou **http://localhost** (Traefik), não só a porta 3000 |
| Página em branco / erro Supabase no console | Confira `VITE_SUPABASE_*` no `.env.local` + rebuild web |
| `Supabase FAIL` no smoke test | `pnpm exec supabase start` → `./infra/scripts/connect-supabase-network.sh` |
| `permission denied` no Docker socket (WSL) | Abra Docker Desktop; `sudo usermod -aG docker $USER` e novo login |
| Migration falha (`column does not exist`, etc.) | Atualize o repo (`git pull`) e `pnpm exec supabase db reset` |
| `WARN: no files matched pattern: supabase/seed.sql` | Resolvido em `supabase/config.toml` (`[db.seed]`); use `db reset` ou `seed-db.sh` |

Mais detalhes: [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

---

## Produção (visão geral)

Este README cobre **desenvolvimento local**. Para VPS/staging:

- Supabase **cloud** (ou Postgres gerenciado) em vez de `supabase start`
- Preencher `.env.prod` com URLs e chaves reais (nunca commitar)
- Build das imagens com `VITE_*` de produção e `VITE_DEV_LOCAL_LINKS=false`
- TLS via Traefik + domínio (ver comentários em `infra/traefik/` e `docs/RUNBOOK.md`)

---

## Documentação

| Documento | Link |
|-----------|------|
| Arquitetura | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| ADRs | [`docs/adr/`](docs/adr/) |
| Segurança | [`docs/SECURITY.md`](docs/SECURITY.md) |
| LGPD / Privacidade | [`docs/PRIVACY.md`](docs/PRIVACY.md) |
| Guia de conteúdo (questões) | [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) |
| Runbook (WSL, Docker, VPS) | [`docs/RUNBOOK.md`](docs/RUNBOOK.md) |
| Roadmap | [`docs/ROADMAP.md`](docs/ROADMAP.md) |
| Observabilidade (SPEC-001, SDD) | [`docs/specs/observability/`](docs/specs/observability/) |
| Contribuição | [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) |

---

## Princípios de engenharia

1. **Type-safety ponta a ponta** — TypeScript strict + Zod compartilhado entre frontend e serviços
2. **Contratos antes de código** — OpenAPI gerado dos DTOs NestJS
3. **Secure by default** — RLS em todas as tabelas, scoring server-side, gabarito nunca trafega ao browser
4. **Observabilidade desde o dia 1** — Pino structured logs + OpenTelemetry em todos os serviços
5. **Engenharia de contexto versionada** — prompts RAG imutáveis com regressão automática
6. **Decisões documentadas** — todas as ADRs em `docs/adr/`
7. **Acessibilidade** — WCAG AA, ARIA, testes axe-core no CI

---

## Status das etapas

- ✅ **Etapa 1 — Bootstrap & contexto**: monorepo pnpm+Turborepo, TS strict, ESLint/Prettier/Husky, Docker, Traefik, docs completos
- ✅ **Etapa 2 — Auth + design system**: Supabase Auth magic link, profiles + RLS, shell, i18n pt-BR, login page, dashboard
- ✅ **Etapa 3 — Domínio do curso**: migrations + seed (8 módulos, 48 aulas), course-service NestJS, UI com desbloqueio sequencial
- ✅ **Etapa 4 — Avaliações**: 100 questões de tape reading, assessment-service, SimuladoPage fullscreen com timer e anti-cheat
- ✅ **Etapa 5 — Prova final + ranking**: ranking-service, leaderboard público com pódio, badge Mesa Proprietária
- ✅ **Etapa 6 — Certificado + e-mail**: certificate-service (SHA-256 + QR), notification-service (Resend), /verify/:hash público
- ✅ **Etapa 7 — RAG Tutor**: rag-service com pgvector, ingestão versionada, TutorPage com citações e guardrails
- ✅ **Etapa 8 — Hardening + CI/CD**: TLS 1.3, rate limits, Playwright e2e, CI com 8 stages, Trivy, SBOM, backup
- ✅ **Etapa 9 — Visual redesign (tema mercado financeiro)**: design system `@coast-academy/ui` com tokens, glassmorphism, glows, `MarketTicker`, `TapeReadingVisualization`, split-layout login, sidebar com gradiente gold, animações escalonadas
