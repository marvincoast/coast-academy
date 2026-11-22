# Coast Academy

> **Projeto de Aplicação — Pós-Graduação PUCPR Digital**  
> **Curso:** Arquitetura de Soluções: Aplicações Inteligentes e Estratégicas  
> **Título da Entrega:** _Plataforma Inteligente e Inovadora Voltada ao Mercado Financeiro_  
> **Autor:** Marvin Andersen dos Santos Costa

Plataforma de ensino interativa para **tape reading** e **análise de fluxo de ordens do Dólar Futuro (B3)** — com simulados anti-cheat, prova final, certificados verificáveis, ranking sazonal, observabilidade LGTM/OpenTelemetry e tutor inteligente com IA (RAG + `pgvector` + guardrails regulatórios).

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
├── infra/                     # Docker, Traefik, Observabilidade LGTM e scripts
│   └── scripts/               # setup-and-run.sh, setup-and-run.ps1, start-all.sh, etc.
├── specs/                     # Spec Kit — specs de features
├── docs/                      # Arquitetura, ADRs, segurança, privacidade, runbook
├── start.bat                  # Instalador/launcher rápido no Windows (via WSL 2)
├── start.sh                   # Instalador/launcher rápido no Linux / WSL 2
├── pnpm-lock.yaml             # Único lockfile (PNPM exclusivo — não use npm)
├── tsconfig.base.json         # TypeScript strict compartilhado
├── tsconfig.paths.json        # Paths workspace centralizados
└── .github/                   # CI, CodeQL, Dependabot, CODEOWNERS e GitHub Pages
```

### Política de lockfile

Este monorepo usa **pnpm 9 exclusivamente**. Use apenas `pnpm-lock.yaml` para dependências.
Não commite `package-lock.json` nem `yarn.lock` — estão no `.gitignore`.

### Atalhos na raiz

| Script / Comando   | Plataforma          | Destino                           |
| ------------------ | ------------------- | --------------------------------- |
| `start.bat`        | Windows (via WSL 2) | `infra/scripts/setup-and-run.ps1` |
| `bash start.sh`    | Linux / WSL 2       | `infra/scripts/setup-and-run.sh`  |
| `pnpm setup`       | Linux / WSL 2       | Equivalente a `bash start.sh`     |
| `pnpm start:all`   | Linux / WSL 2       | `infra/scripts/start-all.sh`      |
| `pnpm start:local` | Linux / WSL 2       | `infra/scripts/start-local.sh`    |

---

## Como rodar localmente

Ambiente completo com **1 único comando**: Supabase local, Docker, 6 microserviços, frontend, Ollama RAG e stack completa de observabilidade (Grafana, Prometheus, Loki, Tempo, Alloy/OpenTelemetry e Uptime Kuma).

### Windows (via WSL 2)

Dê dois cliques em **`start.bat`** na raiz do repositório (ou execute `.\infra\scripts\setup-and-run.ps1` no PowerShell).

### Linux / WSL 2 (Ubuntu)

```bash
git clone https://github.com/marvincoast/coast-academy.git
cd coast-academy
bash start.sh
```

> O script instala/verifica automaticamente Node 20, pnpm 9 e Docker Engine, copia para o filesystem Linux nativo (`~/coast-academy`) caso executado a partir de `/mnt/*` no WSL, aplica migrations/seeds e sobe todos os serviços.

### URLs locais

| Serviço                      | URL                                      | Observação                        |
| ---------------------------- | ---------------------------------------- | --------------------------------- |
| **Aplicação (Web)**          | http://localhost                         | Login por Magic Link              |
| **Mailpit (Magic Link)**     | http://localhost:54324                   | Caixa de e-mails de login local   |
| **Supabase Studio**          | http://localhost:54323                   | Banco PostgreSQL + `pgvector`     |
| **Supabase API (Kong)**      | http://localhost:54321                   | Gateway Auth / Storage / REST     |
| **Traefik Dashboard**        | http://localhost:8081                    | API Gateway (rotas e middlewares) |
| **Grafana (Dashboards)**     | http://localhost:3001                    | `admin` / `admin`                 |
| **Uptime Kuma**              | http://localhost:3002                    | Monitoramento de disponibilidade  |
| **Prometheus**               | http://localhost:9090                    | Métricas `/metrics`               |
| **Grafana Alloy (OTEL UI)**  | http://localhost:12345                   | Coletor OpenTelemetry / Loki      |
| **OpenTelemetry OTLP**       | `localhost:4317` (gRPC) / `:4318` (HTTP) | Ingestão de traces OTLP           |
| **Loki / Tempo (readiness)** | `:3100/ready` / `:3200/ready`            | Logs e traces distribuídos        |

Fluxo de login: informe qualquer e-mail em `http://localhost` → abra o link em **Mailpit** (`http://localhost:54324`) → entre no dashboard.

### Frontend com hot reload (sem Docker)

```bash
pnpm exec supabase start
pnpm --filter @coast-academy/web dev
```

→ http://localhost:5173

---

## Comandos úteis

| Comando                           | Descrição                              |
| --------------------------------- | -------------------------------------- |
| `bash start.sh` / `start.bat`     | Setup completo + App + Observabilidade |
| `pnpm start:local`                | Sobe apenas a aplicação (sem LGTM)     |
| `pnpm build`                      | Build de todos os pacotes              |
| `pnpm test`                       | Testes unitários                       |
| `pnpm test:e2e`                   | Testes E2E (Playwright em `apps/web`)  |
| `pnpm lint` / `pnpm typecheck`    | Qualidade e checagem estática de tipos |
| `./infra/scripts/verify-stack.sh` | Smoke test dos serviços                |

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
