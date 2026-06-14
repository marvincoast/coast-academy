# Coast Academy

Plataforma de ensino interativa para **tape reading** e **análise de fluxo de ordens do Dólar Futuro (B3)** — com simulados, prova final, certificados, ranking e tutor com IA.

![stack](https://img.shields.io/badge/stack-React%2019%20%2B%20NestJS%20%2B%20Supabase-blue)
![types](https://img.shields.io/badge/types-TypeScript%20strict-3178c6)
![pages](https://img.shields.io/badge/demo-GitHub%20Pages-success)

---

## Preview online

Interface publicada no GitHub Pages **apenas para visualização** (login e APIs completas exigem ambiente local ou Supabase na nuvem):

**[https://marvincoast.github.io/coast-academy/](https://marvincoast.github.io/coast-academy/)**

> Preview estático: tela de login, vídeo de fundo, painel de mercado e layout. Para usar a plataforma de ponta a ponta, siga [Como rodar localmente](#como-rodar-localmente).

---

## O que é este projeto?

O **Coast Academy** é um monorepo que reúne frontend, microserviços, banco de dados e infraestrutura Docker. O aluno acessa com **magic link** (e-mail), percorre módulos de aula, faz simulados com anti-cheat, conclui a prova final, recebe certificado verificável e pode consultar um **tutor RAG** treinado no conteúdo do curso.

### Funcionalidades

| Área             | O que faz                                                          |
| ---------------- | ------------------------------------------------------------------ |
| **Autenticação** | Login por e-mail (Supabase Auth), perfil criado no primeiro acesso |
| **Curso**        | 8 módulos, 48 aulas, progresso e desbloqueio sequencial            |
| **Simulados**    | Questões de tape reading, timer, tela cheia, correção no servidor  |
| **Prova final**  | Avaliação conclusiva com limite de tentativas                      |
| **Ranking**      | Leaderboard sazonal com pódio                                      |
| **Certificados** | PDF com QR code e verificação pública (`/verify/:hash`)            |
| **Tutor IA**     | RAG com pgvector, citações e guardrails                            |
| **Design**       | Tema de terminal financeiro (bid/ask, ticker, fluxo de ordens)     |

---

## Stack

| Camada         | Tecnologias                                                                          |
| -------------- | ------------------------------------------------------------------------------------ |
| Monorepo       | pnpm 9 + Turborepo 2                                                                 |
| Frontend       | React 19, Vite, TailwindCSS, TanStack Query, i18next                                 |
| Design system  | `@coast-academy/ui`                                                                  |
| Backend        | 6 microserviços NestJS (curso, avaliações, certificados, ranking, RAG, notificações) |
| Gateway        | Traefik (proxy, TLS, rate limit)                                                     |
| Dados / Auth   | Supabase (Postgres 16, pgvector, RLS)                                                |
| LLM local      | Ollama (tutor RAG)                                                                   |
| Testes / CI    | Vitest, Playwright, GitHub Actions                                                   |
| Deploy preview | GitHub Pages (frontend estático)                                                     |

---

## Estrutura do repositório

```
coast-academy/
├── apps/
│   ├── web/                   # Frontend React (SPA)
│   ├── course-service/        # Conteúdo e progresso
│   ├── assessment-service/    # Simulados e prova final
│   ├── certificate-service/   # Certificados PDF
│   ├── ranking-service/       # Leaderboard
│   ├── rag-service/           # Tutor IA (RAG)
│   └── notification-service/  # E-mails (Resend)
├── packages/
│   ├── ui/                    # Tokens e componentes compartilhados
│   ├── shared-types/          # Tipos e schemas Zod
│   ├── eslint-config/         # ESLint compartilhado
│   ├── observability/         # Pino, OTEL e Prometheus
│   └── otel-smoke/            # Smoke test OTLP (infra obs)
├── supabase/                  # Migrations, seeds, auth (fora do workspace PNPM)
├── infra/                     # Docker, Traefik, scripts de deploy
│   └── scripts/               # start-local.sh, verify-stack.sh, etc.
├── specs/                     # Spec Kit — specs de features
├── docs/                      # Arquitetura, ADRs, runbook
├── start.sh                   # Atalho → infra/scripts/start-local.sh
├── start-all.sh               # Atalho → infra/scripts/start-all.sh
├── pnpm-lock.yaml             # Único lockfile (PNPM exclusivo — não use npm)
├── tsconfig.base.json         # TypeScript strict compartilhado
├── tsconfig.paths.json        # Paths workspace centralizados
└── .github/workflows/         # CI e GitHub Pages
```

### Política de lockfile

Este monorepo usa **pnpm 9 exclusivamente**. Use apenas `pnpm-lock.yaml` para dependências.
Não commite `package-lock.json` nem `yarn.lock` — estão no `.gitignore`.

### Atalhos na raiz

| Script             | Destino                        |
| ------------------ | ------------------------------ |
| `start.sh`         | `infra/scripts/start-local.sh` |
| `start-all.sh`     | `infra/scripts/start-all.sh`   |
| `pnpm start:local` | Equivalente ao `start.sh`      |

---

## Como rodar localmente

Ambiente completo: Supabase local, Docker, microserviços, Ollama e frontend.

### Pré-requisitos

- **Node.js** 20+
- **pnpm** 9 (`corepack enable`)
- **Docker** + Compose v2
- **WSL 2** (recomendado no Windows)

### Passo a passo

```bash
git clone https://github.com/marvincoast/coast-academy.git
cd coast-academy
pnpm install
cp .env.example .env.local   # ajuste chaves após supabase start
pnpm start:local               # ou: ./infra/scripts/start-local.sh
```

Na **primeira execução** (build de imagens + banco zerado):

```bash
COAST_ACADEMY_DB_RESET=1 COAST_ACADEMY_BUILD=1 COAST_ACADEMY_BUILD_WEB=1 ./infra/scripts/start-local.sh
```

### URLs locais

| Serviço                  | URL                                     |
| ------------------------ | --------------------------------------- |
| **App**                  | http://localhost ou http://coastacademy |
| **Login**                | http://localhost/                       |
| **Mailpit** (magic link) | http://127.0.0.1:54324                  |
| **Supabase Studio**      | http://127.0.0.1:54323                  |

Fluxo de login: informe o e-mail → abra o link em **Mailpit** → você entra no dashboard.

### Frontend com hot reload (sem Docker)

```bash
pnpm exec supabase start
pnpm --filter @coast-academy/web dev
```

→ http://localhost:5173

---

## Comandos úteis

| Comando                           | Descrição                          |
| --------------------------------- | ---------------------------------- |
| `pnpm start:local`                | Sobe stack completa                |
| `pnpm build`                      | Build de todos os pacotes          |
| `pnpm test`                       | Testes unitários                   |
| `pnpm test:e2e`                   | Testes E2E (Playwright)            |
| `pnpm lint` / `pnpm typecheck`    | Qualidade de código                |
| `pnpm test:e2e`                   | E2E Playwright — apenas `apps/web` |
| `./infra/scripts/verify-stack.sh` | Smoke test dos serviços            |

---

## Deploy e preview

| Ambiente           | Como funciona                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Pages**   | Push na `main` → workflow `.github/workflows/pages.yml` publica o frontend em [marvincoast.github.io/coast-academy](https://marvincoast.github.io/coast-academy/) |
| **Local (Docker)** | Traefik + nginx + microserviços via `start-local.sh`                                                                                                              |
| **Produção**       | Supabase cloud, `.env.prod`, TLS — ver [`docs/RUNBOOK.md`](docs/RUNBOOK.md)                                                                                       |

---

## Documentação

| Tema                                   | Arquivo                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| Arquitetura                            | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)           |
| Runbook (WSL, Docker, troubleshooting) | [`docs/RUNBOOK.md`](docs/RUNBOOK.md)                     |
| Segurança                              | [`docs/SECURITY.md`](docs/SECURITY.md)                   |
| ADRs (decisões técnicas)               | [`docs/adr/`](docs/adr/)                                 |
| Observabilidade                        | [`docs/specs/observability/`](docs/specs/observability/) |
| Contribuição                           | [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md)           |

---

## Licença

Projeto privado — `UNLICENSED`. Uso restrito aos mantenedores do repositório.
