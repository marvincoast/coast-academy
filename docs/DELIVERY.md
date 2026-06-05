# Registro de entregas — Felix Empire Trading

> Este documento registra **o que foi criado, por quê e como funciona** em cada etapa concluída.
> Serve como referência histórica, onboarding e ponto de partida para revisões.
>
> Atualizar ao concluir cada etapa. Status das etapas pendentes em [`ROADMAP.md`](./ROADMAP.md).

---

## Índice de etapas

| Etapa | Título | Status | Data |
|-------|--------|--------|------|
| 1 | Bootstrap & contexto | ✅ Concluída | 2026-05-17 |
| 2 | Auth + design system | ✅ Concluída | 2026-05-17 |
| 3 | Domínio do curso | ✅ Concluída | 2026-05-17 |
| 4 | Avaliações + seed 100 questões | ✅ Concluída | 2026-05-17 |
| 5 | Ranking + dashboard real | ✅ Concluída | 2026-05-17 |
| 6 | Certificado + e-mail | ✅ Concluída | 2026-05-17 |
| 7 | RAG tutor | ✅ Concluída | 2026-05-17 |
| 8 | Hardening + CI/CD | ✅ Concluída | 2026-05-17 |

---

## Etapa 1 — Bootstrap & contexto

**Data de conclusão**: 2026-05-17
**Critério de aceite**: estrutura física do monorepo criada, tipos compartilhados Zod, docker-compose, docs, ADRs e CI base.

### O que foi criado

#### Raiz do monorepo (`c:\Projetos\Felix\`)

| Arquivo | Finalidade |
|---------|-----------|
| `package.json` | Package raiz; scripts `build`, `dev`, `lint`, `typecheck`, `test`, `test:e2e`, `format`. Node 20 + pnpm 9 como `engines`. |
| `pnpm-workspace.yaml` | Declara `apps/*` e `packages/*` como workspaces pnpm. |
| `turbo.json` | Orquestrador Turborepo com tasks `build`, `dev`, `lint`, `typecheck`, `test`, `test:e2e`, `clean` e as `globalEnv` necessárias para cache. |
| `tsconfig.base.json` | TypeScript **strict** compartilhado: `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Herança por todos os pacotes. |
| `.editorconfig` | Indentação 2 espaços, LF, UTF-8, `insert_final_newline`. |
| `.gitattributes` | Normaliza LF; binários (png, pdf, mp4) marcados como `binary`. |
| `.gitignore` | `node_modules`, `dist`, `.env*` (exceto `.env.example`), `infra/backups/*`, `certificates/*.pdf`, artefatos de build. |
| `.nvmrc` | Node 20 (compatível com `nvm use` e Asdf). |
| `.npmrc` | `engine-strict=true`, `shamefully-hoist=false`. |
| `.env.example` | Todas as variáveis de ambiente documentadas e agrupadas por serviço — **sem segredos reais**. Copiar para `.env.local`. |
| `.prettierrc` | `printWidth: 100`, `singleQuote: true`, `trailingComma: 'all'`, `endOfLine: 'lf'`. |
| `.prettierignore` | Ignora `pnpm-lock.yaml`, `dist`, `build`, artefatos de test. |
| `.eslintrc.cjs` | Raiz aponta para `@felix/eslint-config`; ignora artefatos de build. |
| `commitlint.config.cjs` | Conventional Commits (tipos válidos + escopos do projeto Felix). |
| `.husky/pre-commit` | Roda `lint-staged` em cada commit. |
| `.husky/commit-msg` | Valida formato Conventional Commits via `commitlint`. |

#### Infraestrutura Docker (`infra/`)

| Arquivo | Finalidade |
|---------|-----------|
| `docker-compose.yml` | Compose único do projeto. Serviços: `traefik`, `web`, `course-service`, `assessment-service`, `certificate-service`, `ranking-service`, `rag-service`, `notification-service`. Perfis opcionais: `llm` (Ollama), `cache` (Redis). Healthchecks em todos os serviços. |
| `infra/traefik/traefik.yml` | Config estática: entrypoints `web :80` e `websecure :443`, provider Docker + file, log em JSON, ping endpoint. |
| `infra/traefik/dynamic.yml` | Middlewares: `secureheaders` (CSP estrito, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy), `ratelimit` (120 req/min), `ratelimit-strict` (20 req/min), `cors-api`. TLS mínimo TLS 1.2. |
| `infra/docker/Dockerfile.service` | Dockerfile multi-stage para todos os microsserviços NestJS. Stages: `base` (pnpm), `deps` (install com cache), `build` (nest build do serviço-alvo via `SERVICE_NAME`), `runtime` (Alpine não-root, tini, `wget` para healthcheck). |
| `infra/docker/Dockerfile.web` | Multi-stage para o frontend: `build` (Vite) → `runtime` (nginx 1.27-alpine) com configuração de SPA (try_files), Brotli/gzip e cache-control para assets imutáveis. |
| `infra/docker/nginx.conf` | nginx configurado para SPA: gzip, headers de segurança básicos, cache 30d em assets estáticos. |
| `infra/backups/.gitkeep` | Pasta para dumps manuais de Postgres — gitignored em conteúdo, preservada em estrutura. |

#### Supabase (`supabase/`)

| Arquivo | Finalidade |
|---------|-----------|
| `supabase/config.toml` | Config do projeto local: Auth habilitado (magic link, confirmação de e-mail), Studio em `:54323`, inbucket em `:54324`, Storage com limite 200 MiB. |
| `supabase/migrations/0001_init.sql` | Migration base: extensões `pgcrypto`, `uuid-ossp`, `pg_trgm`, `vector` (pgvector), `btree_gin`. Schema utilitário `felix` com função trigger `felix.set_updated_at()`. Tabela `public.audit_log` com RLS habilitado (deny-by-default) e índices em `actor_id` e `action`. Tabela `app_meta` para versionamento do schema. |

#### Packages compartilhados

##### `packages/eslint-config`

Config ESLint/Prettier compartilhada com três flavors:

| Arquivo | Uso |
|---------|-----|
| `index.cjs` | Base: TypeScript, import order, unicorn, prettier |
| `react.cjs` | Extends base + react, react-hooks, jsx-a11y |
| `node.cjs` | Extends base + env node, explicit return types |

##### `packages/shared-types`

Tipos e schemas Zod — **única fonte de verdade entre frontend e backend**. Nenhum `any`. Nunca expõe `is_correct`.

| Módulo | Conteúdo-chave |
|--------|----------------|
| `domain/common.ts` | `UuidSchema`, `TimestampSchema`, `PaginationQuerySchema`, `PaginatedResponseSchema<T>`, `ProblemDetailsSchema` |
| `domain/market.ts` | `MarketSchema` (`'BR' \| 'US'`), `DEFAULT_MARKET = 'BR'` |
| `domain/question-tag.ts` | 16 tags canônicas de tape reading do dólar BRL: `absorcao_preco_fixo`, `absorcao_multiplos_niveis`, `exaustao_compradora`, `exaustao_vendedora`, `escora_player`, `iceberg_lote_escondido`, `range_volatilidade_dia`, `zona_0_5`, `zona_1_0`, `zona_1_5`, `book_ofertas`, `times_and_trades`, `macroeconomia_brasil`, `macroeconomia_global`, `gestao_risco`, `psicologia_operacional`. Labels em `QUESTION_TAG_LABELS`. Distribuição alvo do seed em `TARGET_SEED_DISTRIBUTION`. |
| `domain/question.ts` | `PublicQuestionSchema` (sem gabarito — enviado ao cliente), `AuthoringQuestionSchema` (com `isCorrect` e `rationale` — apenas server-side). Refinement: exatamente 4 opções, exatamente 1 correta. |
| `domain/assessment.ts` | `AssessmentSchema`, `AssessmentTypeSchema` (`module_simulation \| final_exam`), `PASSING_SCORE_DEFAULT = 0.75`. |
| `domain/attempt.ts` | `StartAttemptRequest/Response`, `AnswerQuestionRequest` (com `clientElapsedMs` para anti-cheat), `VisibilityEventSchema` (eventos de troca de aba / saída de fullscreen), `SubmitAttemptRequest`, `AttemptResultSchema` (score, passed, certificateId). |
| `domain/certificate.ts` | `CertificateSchema` com `verificationHash` SHA-256, `CertificateVerificationPublicSchema` (apenas nome, curso, data — sem PII sensível). |
| `domain/ranking.ts` | `RankingSeasonSchema` (formato `YYYY-Q1` a `YYYY-Q4` / `YYYY-M01` a `YYYY-M12`), `RankingEntrySchema` com `prizeEligible`, `MyRankingSchema`. |
| `domain/profile.ts` | `ProfileSchema` com `UserRoleSchema` (`student \| instructor \| admin`), `acceptsLeaderboard`, `acceptsMarketingEmails`, `UpdateProfileRequestSchema` (parcial). |

##### `packages/ui`

Design tokens e Tailwind preset do tema Empire Trading.

| Arquivo | Conteúdo |
|---------|---------|
| `src/tokens.ts` | `colors` (bg, text, flow bid/ask, brand gold, state, border), `fonts` (sans Inter, mono JetBrains Mono, display Sora), `radii`, `space`, `shadows` (card, glowGold), `motion` (duração e easing), `layout` (sidebar, topbar, maxWidth do simulado). |
| `tailwind-preset.cjs` | Reexporta os tokens em formato Tailwind (`colors.flow.bid`, `colors.brand.gold`, `fontFamily.mono`, `boxShadow.glow-gold`, etc.). Em `apps/web/tailwind.config.cjs` basta `presets: [require('@felix/ui/tailwind-preset')]`. |

#### Apps — esqueletos

##### `apps/web`

| Arquivo | Conteúdo |
|---------|---------|
| `package.json` | React 19, Vite 5, Tailwind, TanStack Query, react-router-dom, Zustand, i18next/react-i18next, Supabase JS. Dev: Vitest, Testing Library, Playwright, axe-core. |
| `vite.config.ts` | Plugin React, alias `@/` para `src/`, environment jsdom para Vitest. |
| `tailwind.config.cjs` | Aplica o preset `@felix/ui/tailwind-preset`. |
| `index.html` | `lang="pt-BR"`, `theme-color #0B0F14`, sem scripts inline. |
| `src/main.tsx` | Ponto de entrada com `React.StrictMode`, carrega `global.css`. |
| `src/App.tsx` | Placeholder da Etapa 1; substituído na Etapa 2 pelo shell real do dashboard. |
| `src/styles/global.css` | Tailwind `@layer base`: `color-scheme: dark`, `font-family`, `background-color`, `:focus-visible` com outline dourado. |
| `src/test/setup.ts` | `@testing-library/jest-dom/vitest` para matchers customizados. |

##### Microsserviços NestJS (6 serviços)

Todos com o mesmo padrão:

| Arquivo | Conteúdo |
|---------|---------|
| `package.json` | Dependências NestJS 10 + `@felix/shared-types` + `nestjs-pino` + `helmet` + dependências específicas por serviço. |
| `tsconfig.json` | Extends `tsconfig.base.json` com `experimentalDecorators`, `emitDecoratorMetadata`, `module: CommonJS` (NestJS exige). |
| `nest-cli.json` | `sourceRoot: src`, `deleteOutDir: true`. |
| `src/main.ts` | Bootstrap NestJS com `helmet`, prefixo global do serviço, escuta em `0.0.0.0:3000`. |
| `src/app.module.ts` | `AppModule` mínimo com `HealthController`. |
| `src/health.controller.ts` | `GET /health` → `{ status: 'ok', service, uptime }`. Usado pelo Traefik e Docker healthcheck. |
| `README.md` | Responsabilidade do serviço, endpoints planejados e em qual etapa será implementado. |

Dependências específicas por serviço:

| Serviço | Dependência extra | Motivo |
|---------|-------------------|--------|
| `assessment-service` | `@nestjs/throttler` | Rate limit por rota de submit |
| `certificate-service` | `@react-pdf/renderer`, `qrcode` | Geração de PDF + QR (Etapa 6) |
| `rag-service` | `openai` | SDK compatível com qualquer API OpenAI-compatible (Ollama local ou cloud) |
| `notification-service` | `resend` | E-mail transacional (Etapa 6) |

#### RAG — engenharia de contexto (`apps/rag-service/prompts/`)

| Arquivo | Finalidade |
|---------|-----------|
| `system/tutor.v1.md` | Persona e guardrails do Tutor: escopo restrito (tape reading BRL), proibição de sinal operacional, formato de citação obrigatória, fallback honesto quando sem contexto. |
| `system/question-author.v1.md` | Prompt de sugestão de questões (status `draft`; revisão humana obrigatória antes de usar). |
| `tasks/answer-with-cites.v1.md` | Template de resposta com contexto recuperado; instrução de não inventar fora dos chunks. |
| `tasks/explain-concept.v1.md` | Explicação de um conceito de tape reading com definição, exemplo, sinais e armadilhas. |
| `tasks/grade-rationale.v1.md` | Explicação do gabarito após resposta do aluno, com citação de fonte e sugestão de revisão. |
| `fewshot/absorcao.examples.json` | Exemplos curados de perguntas sobre absorção com keywords esperadas. |
| `tests/regression.cases.json` | 3 casos de regressão: (1) pergunta fora do escopo, (2) conceito com fixture de contexto, (3) pergunta sem contexto (honestidade). Roda no CI da Etapa 7+. |

#### Documentação (`docs/`)

| Documento | Conteúdo |
|-----------|---------|
| `ARCHITECTURE.md` | Diagrama de fluxo (Mermaid), tabela de bounded contexts, fluxos críticos (simulado fullscreen e prova final + certificado). |
| `CONTRIBUTING.md` | Pré-requisitos, setup local, branching, Conventional Commits, checklist de PR, scripts raiz. |
| `SECURITY.md` | Threat model STRIDE por bounded context, controles obrigatórios, tabela anti-cheat, pipeline de segurança (Etapa 8), política de divulgação. |
| `PRIVACY.md` | Tabela de dados pessoais com finalidade, base legal e retenção. Endpoints de export/delete/revogação. Sub-processadores. |
| `CONTENT_GUIDE.md` | Tags canônicas com descrição de quando usar, distribuição alvo do seed, rubrica de qualidade para questões novas. |
| `RUNBOOK.md` | Tabela de ambientes, setup WSL + Docker, comandos de backup/restore, RTO/RPO, troubleshooting, rotação de segredos, guia de deploy em VPS. |
| `ROADMAP.md` | MVP (Etapas 1–8) + 8 fases pós-MVP (mercado US, gamificação, CMS, proctoring, mesa proprietária, PWA, IA generativa). |
| `adr/0001` a `adr/0008` | ADRs MADR cobrindo todas as decisões arquiteturais da Etapa 1 (monorepo, Supabase, NestJS, Traefik, pgvector, certificado PDF, prompts versionados, Zod cross-stack). |

#### CI (``.github/``)

| Arquivo | Jobs |
|---------|------|
| `workflows/ci.yml` | `install-and-cache`, `lint` (Prettier + ESLint), `typecheck` (`tsc --noEmit`), `test` (Vitest/Jest), `docker-compose-validate` (`docker compose config -q`), `security-audit` (`pnpm audit --prod`, `continue-on-error`). |
| `pull_request_template.md` | Checklist: Conventional Commit, sem `any`, sem `is_correct` vazando, docs atualizados, testes, WCAG. |

---

### Decisões registradas na Etapa 1

Ver `docs/adr/` para texto completo. Resumo:

| ADR | Decisão | Motivo principal |
|-----|---------|-----------------|
| 0001 | pnpm + Turborepo | Cache incremental e compartilhamento natural de tipos |
| 0002 | Supabase como source of truth | Auth + RLS + pgvector em um só lugar; open-source |
| 0003 | NestJS nos microserviços | DI, OpenAPI, padronização; equipe familiarizada com TS |
| 0004 | Traefik como API Gateway | Labels Docker, CSP centralizado, Let's Encrypt integrado |
| 0005 | pgvector para RAG | Sem serviço extra; joins naturais com dados do curso |
| 0006 | `@react-pdf/renderer` para certificado | Sem Chromium (peso); templating JSX versionável |
| 0007 | Prompts versionados como arquivos | Revisão em PR, rollback trivial, regressão no CI |
| 0008 | Zod shared-types cross-stack | Mesmo contrato em runtime TS no front e no back |

---

### O que NÃO está nesta etapa (proposital)

- **Banco de questões** — Etapa 4 (`supabase/seed/questions.json`).
- **Auth e login real** — Etapa 2.
- **UI completa do curso / simulado** — Etapas 3 e 4.
- **Emissão de certificado** — Etapa 6.
- **Ranking funcional** — Etapa 5.
- **RAG indexado** — Etapa 7 (estrutura de prompts entregue, ingestão não).
- **Testes e2e Playwright** — Etapa 8.
- **TLS de produção** (Let's Encrypt) — ativado na Etapa 8 com domínio real.

---

## Etapas futuras (a preencher ao concluir cada uma)

### Etapa 2 — Auth + design system

**Data de conclusão**: 2026-05-17

#### Supabase — `supabase/migrations/0002_profiles.sql`

| Objeto | Detalhes |
|--------|---------|
| `public.profiles` | Extensão de `auth.users` com `full_name`, `display_name`, `email`, `role` (`student/instructor/admin`), `market_preference` (`BR/US`), `accepts_leaderboard`, `accepts_marketing_emails`. Trigger `set_updated_at` aplicado. |
| RLS | Deny-by-default; 3 policies: leitura própria, inserção própria, atualização própria (sem escalar `role`). Sem policy de delete no client. |
| `handle_new_user()` | Trigger `AFTER INSERT ON auth.users` que cria o perfil automaticamente com dados do `raw_user_meta_data`. |
| `log_auth_event(action, metadata)` | Função `SECURITY DEFINER` chamada via RPC; valida `auth.uid() IS NOT NULL` antes de gravar em `audit_log`. Grant para `authenticated`. |
| `public.public_profiles` | View com apenas `id` e `display_name` de quem optou por `accepts_leaderboard = true`. |

#### Web — dependências adicionadas

| Pacote | Motivo |
|--------|--------|
| `lucide-react` | Ícones SVG tree-shakeable para sidebar e topbar |
| `clsx` + `tailwind-merge` | Composição segura de classes Tailwind (`cn()`) |
| `react-hot-toast` | Notificações (toast) com tema Empire |
| `i18next-browser-languagedetector` | Detecção de idioma via `localStorage`/`navigator` |

#### Web — arquivos criados

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/cn.ts` | Utilitário `cn(...classes)` com `clsx` + `tailwind-merge` |
| `src/lib/supabase.ts` | Cliente Supabase singleton com `autoRefreshToken`, `detectSessionInUrl`. Função `logAuthEvent()` (best-effort, não bloqueia UX). |
| `src/lib/query-client.ts` | `QueryClient` TanStack com `staleTime: 2min`, retry inteligente (não retenta 4xx). |
| `src/stores/auth.store.ts` | Zustand store: `status` (`loading/authenticated/unauthenticated`), `session`, `user`, `setSession`, `setLoading`. |
| `src/hooks/use-auth.ts` | `useAuthListener()` (inicializa `onAuthStateChange`, chama `logAuthEvent` nos eventos SIGNED_IN/OUT). `useAuth()` para consumir o estado. |
| `src/i18n/index.ts` | Inicialização do i18next com LanguageDetector; namespaces `common`, `auth`, `dashboard`, `course`. |
| `src/i18n/locales/pt-BR/*.json` | 4 arquivos de tradução pt-BR cobrindo nav, ações, status, auth (login/callback/profile), dashboard e tags do curso. |
| `src/router/index.tsx` | `createBrowserRouter` com rotas públicas (`/login`, `/auth/callback`, `/verify/:hash`) e protegidas (dentro de `ProtectedRoute` + `AppShell`). Simulado/ProvaFinal fora do `AppShell` (layout fullscreen próprio). Code split via `lazy` + `Suspense`. |
| `src/router/ProtectedRoute.tsx` | Guard: `loading` → `<FullPageSpinner>`, `unauthenticated` → `<Navigate to="/login" state={{ from }}>`, `authenticated` → `<Outlet>`. |
| `src/components/ui/Spinner.tsx` | `<Spinner size>` e `<FullPageSpinner>` (fixed, centro da tela). Tema dourado. `role="status"`. |
| `src/components/ui/Logo.tsx` | Monograma "FE" em box com borda dourada + wordmark. Variantes `full/icon` e sizes `sm/md/lg`. |
| `src/components/ui/Button.tsx` | Variants `primary/secondary/ghost/danger`, sizes `sm/md/lg`, `loading` (mostra Spinner), `leftIcon/rightIcon`. `forwardRef`, `aria-disabled`. |
| `src/components/ui/Input.tsx` | Label, error (`role="alert"`, `aria-invalid`), hint, `aria-describedby`. Borda vermelha no estado de erro. |
| `src/components/ui/Badge.tsx` | Variants: `bid`, `ask`, `neutral`, `gold`, `success`, `warning`, `danger`, `info`. |
| `src/components/layout/AppShell.tsx` | `Sidebar` + `TopBar` + `<main id="main-content">` para skip link. `<Outlet>` do React Router. |
| `src/components/layout/TopBar.tsx` | Skip link (WCAG 2.4.1), menu do usuário com dropdown acessível (`aria-expanded`, `aria-haspopup`, `role="menu"`), `signOut` via Supabase. |
| `src/components/layout/Sidebar.tsx` | Logo, nav items com Lucide icons; itens `locked` renderizados sem link (visual cinza + `Lock` icon); item ativo com destaque dourado (`aria-current="page"`). |
| `src/pages/auth/LoginPage.tsx` | Formulário magic link com validação Zod, estado `idle/submitting/success/error`. `TapeStripDecor` (ticker animado no topo), `PriceTickerDecor` (bottom bar com BID/ASK/VAR/MIN/MAX/VOL). Grade decorativa de fundo. Feedback visual de sucesso. |
| `src/pages/auth/AuthCallbackPage.tsx` | Detecta sessão após click no magic link; redireciona ao dashboard ou mostra erro. |
| `src/pages/dashboard/DashboardPage.tsx` | Boas-vindas, 4 quick-action cards, progress bar com `role="progressbar"`, atividade recente. Placeholder com dados reais na Etapa 3. |
| `src/pages/**/...Page.tsx` | Placeholders para: `CoursePage`, `RankingPage`, `CertificatesPage`, `VerifyPage`, `TutorPage`, `SimuladoPage`, `ProvaFinalPage`, `NotFoundPage`. Cada um indica a etapa de implementação. |
| `src/App.tsx` | `QueryClientProvider` + `AuthGate` (listener) + `RouterProvider` + `<Toaster>` com tema dark Empire. |
| `src/styles/global.css` | Keyframes `slideLeft` (tape strip), `fadeIn`, `slideInFromTop` (dropdown). `color-scheme: dark`, `focus-visible` dourado global. |

#### Fluxo de autenticação entregue

```
1. Usuário acessa /login
2. Digita e-mail → validação Zod no client
3. supabase.auth.signInWithOtp() → magic link enviado
4. Feedback de sucesso (não há redirecionamento automático)
5. Usuário clica no link → /auth/callback
6. AuthCallbackPage detecta sessão (detectSessionInUrl)
7. onAuthStateChange dispara SIGNED_IN
8. logAuthEvent('auth.login') gravado via RPC
9. Redirect → /dashboard
10. ProtectedRoute libera acesso
11. AppShell renderiza com sidebar e topbar
```

---

### Etapa 3 — Domínio do curso

**Data de conclusão**: 2026-05-17
**Critério de aceite**: migration com tabelas do curso, seed com 8 módulos e 48 aulas do Felix Empire Trading, course-service NestJS funcional (REST), UI de curso completa com desbloqueio sequencial e marcação de progresso.

#### O que foi criado

##### Supabase — migration e seed

| Arquivo | Finalidade |
|---------|-----------|
| `supabase/migrations/0003_course_domain.sql` | Cria `courses`, `modules`, `chapters`, `lessons` (com `content_type`, `content_markdown`, `content_url`) e `lesson_progress`. RLS: leitura pública para conteúdo publicado; cada usuário só lê/escreve seu próprio progresso. Views `module_progress_summary` e `course_progress_summary` com `security_invoker`. Triggers `set_updated_at` em todas as tabelas. |
| `supabase/seed/01_course.sql` | Seed com o curso **Felix Empire Trading** completo: 8 módulos · 18 capítulos · 48 aulas. Todo o conteúdo é texto markdown real com fundamentos de tape reading, book de ofertas, Times & Trades, absorção, exaustão, escora, iceberg, zonas de variação e macroeconomia. UUIDs fixos para idempotência (`ON CONFLICT DO NOTHING`). |

##### apps/course-service — NestJS completo

| Arquivo | Finalidade |
|---------|-----------|
| `src/common/supabase.service.ts` | Cliente Supabase admin (service_role) com `getUser(token)` para validação de JWT. |
| `src/common/auth.guard.ts` | `CanActivate` que extrai o Bearer token, valida via Supabase Auth e injeta `userId` + `userEmail` no request. |
| `src/common/current-user.decorator.ts` | `@CurrentUser()` param decorator que lê do request injetado pelo guard. |
| `src/common/common.module.ts` | Módulo compartilhado exportando `SupabaseService` e `AuthGuard`. |
| `src/course/course.dto.ts` | Interfaces locais (`CourseDto`, `ModuleDto`, `ChapterDto`, `LessonDto`, `CourseListItemDto`) que definem o contrato da API. |
| `src/course/course.service.ts` | Busca o curso completo com todos os módulos/capítulos/aulas via join Supabase, calcula progresso e determina `isLocked` por módulo (desbloqueio sequencial: cada módulo requer 100% do anterior). |
| `src/course/course.controller.ts` | `GET /courses`, `GET /courses/:id`, `GET /courses/lessons/:lessonId`. Todos protegidos pelo `AuthGuard`. |
| `src/progress/progress.service.ts` | `completeLesson` (upsert idempotente), `uncompleteLesson` (delete), `getCourseProgress` (via view `module_progress_summary`). |
| `src/progress/progress.controller.ts` | `POST /progress/lessons/:id/complete`, `DELETE /progress/lessons/:id/complete`, `GET /progress/courses/:id`. |

##### apps/web — camada de API e UI do curso

| Arquivo | Finalidade |
|---------|-----------|
| `src/api/client.ts` | Fetch wrapper (`apiGet`, `apiPost`, `apiDelete`) com injeção automática do JWT Supabase no header `Authorization: Bearer`. |
| `src/api/course.api.ts` | Funções `courseApi.*` com tipos de resposta espelhando os DTOs do service. |
| `src/hooks/use-course.ts` | Hooks TanStack Query: `useCourseList`, `useCourse`, `useLesson`, `useCompleteLesson`. Invalidação automática ao completar aula. |
| `src/components/course/ProgressRing.tsx` | SVG animado de progresso circular (0-100%) com cores: cinza → âmbar → verde. |
| `src/components/course/LessonRow.tsx` | Link/item para cada aula: ícone por tipo (video/text/pdf), estado bloqueado, duração, checkmark ao concluir. |
| `src/components/course/ChapterAccordion.tsx` | Capítulo expansível com contagem de aulas concluídas. |
| `src/components/course/ModuleCard.tsx` | Card de módulo com número, título, progresso (ProgressRing), estado bloqueado/desbloqueado, lista de capítulos expansível. |
| `src/pages/course/CoursePage.tsx` | Página real do curso: header com stats, barra de progresso global, lista de ModuleCards. CTA para prova final quando progresso = 100%. |
| `src/pages/course/LessonPage.tsx` | Visualizador de aula: suporte a vídeo (YouTube embed + video nativo), texto markdown com renderização básica (h1-h3, blockquote, listas, bold) e placeholder para PDF. Botão "Concluir aula" que chama a API e invalida cache. |
| `src/router/index.tsx` | Adicionada rota `/aula/:lessonId` → `LessonPage`. Corrigida rota `/curso/:courseId`. |

#### Lógica de desbloqueio sequencial

```
Módulo 1: sempre desbloqueado
Módulo N (N > 1): desbloqueado apenas se 100% das aulas do Módulo N-1 concluídas

Dentro do módulo:
  Aula 1 de cada capítulo: desbloqueada se módulo desbloqueado
  Aula N: desbloqueada se Aula N-1 concluída
```

O cálculo ocorre **no servidor** (course-service), sem lógica de desbloqueio no cliente. O frontend apenas renderiza o estado `isLocked` recebido da API.

#### Fluxo de progresso

```
1. Usuário acessa /curso → CoursePage carrega GET /courses/:id
2. Clica numa aula → LessonPage carrega GET /courses/lessons/:id
3. Lê/assiste o conteúdo
4. Clica "Concluir aula" → POST /progress/lessons/:id/complete
5. TanStack Query invalida cache do curso e da aula
6. CoursePage recarrega com progresso atualizado
7. Próxima aula desbloqueada automaticamente
```

### Etapa 4 — Avaliações + seed 100 questões

**Data de conclusão**: 2026-05-17
**Critério de aceite**: banco de 100 questões reais de tape reading, 8 simulados por módulo + prova final (40 questões), assessment-service com shuffle server-side e scoring seguro, SimuladoPage fullscreen com timer, anti-cheat e gabarito comentado.

#### O que foi criado

##### Supabase — migration e seed

| Arquivo | Finalidade |
|---------|-----------|
| `supabase/migrations/0004_assessments.sql` | Tabelas `question_tags`, `questions`, `question_options`, `question_question_tags`, `assessments`, `assessment_questions`, `attempts`, `attempt_answers`. RLS: tags/questions/options/assessments → leitura autenticada; attempts/answers → cada usuário só acessa os próprios. Trigger `enforce_single_correct_option` garante exatamente 1 resposta correta por questão. View `ranking_attempts` (melhor attempt por usuário por assessment). |
| `supabase/seed/02_questions.sql` | 100 questões reais de tape reading, distribuídas em 8 tags temáticas. Cada questão tem enunciado, 4 alternativas (1 correta), explicação e dificuldade 1-3. 8 simulados (pool de 12-14 questões cada, 10 sorteadas por attempt) + 1 prova final (pool de 100, 40 sorteadas). UUIDs fixos e idempotentes. |

##### apps/assessment-service — NestJS completo

| Arquivo | Finalidade |
|---------|-----------|
| `src/common/*` | Reutiliza `SupabaseService`, `AuthGuard`, `CurrentUser` do padrão do monorepo. |
| `src/assessment/assessment.service.ts` | `getByModule(moduleId)`, `getProvaFinal(courseId)`, `getById(assessmentId)`. |
| `src/assessment/assessment.controller.ts` | `GET /assessments/module/:id`, `GET /assessments/prova-final/:courseId`, `GET /assessments/:id`. |
| `src/attempt/attempt.service.ts` | Lógica central: `startAttempt` (draw aleatório + shuffle server-side + armazena `question_order` e `option_order`), `saveAnswer` (auto-save idempotente), `submitAttempt` (scoring server-side, validação de timer), `recordTabChange` (anti-cheat), `getAttemptResult`, `listUserAttempts`. |
| `src/attempt/attempt.controller.ts` | `GET /attempts`, `POST /attempts`, `GET /attempts/:id`, `POST /attempts/:id/answer`, `POST /attempts/:id/submit`, `POST /attempts/:id/tab-change`. |

##### apps/web — API e SimuladoPage

| Arquivo | Finalidade |
|---------|-----------|
| `src/api/assessment.api.ts` | Funções tipadas para todos os endpoints do assessment-service. |
| `src/pages/assessment/SimuladoPage.tsx` | Interface fullscreen: fases (loading → quiz → submitting → result). Navegador de questões, timer com cores (normal → âmbar → vermelho pulsante), detecção de troca de aba via `visibilitychange`, auto-save por questão, tela de resultado com score, aprovação/reprovação e gabarito comentado. |
| `src/pages/assessment/ProvaFinalPage.tsx` | Redireciona para `/simulado/e0000000-ffff-...` (prova final). |
| `src/components/course/ModuleCard.tsx` | Adicionado botão "Fazer Simulado do Módulo" quando módulo está 100% completo. |

#### Segurança e anti-cheat

```
Servidor:
  - Questões e alternativas embaralhadas SERVER-SIDE (Fisher-Yates)
  - Ordem armazenada em attempts.question_order e option_order (JSON)
  - is_correct NUNCA enviado ao cliente durante attempt ativo
  - Scoring 100% server-side no submit
  - Validação de tempo: submitted_at ≤ started_at + time_limit + 60s

Cliente:
  - visibilitychange → POST /attempts/:id/tab-change
  - Contagem de trocas exibida no header e no resultado
  - Sem acesso a gabarito antes do submit
```

#### Fluxo do simulado

```
1. Usuário clica "Fazer Simulado" no ModuleCard (após 100% do módulo)
2. SimuladoPage: POST /attempts {assessmentId} → retorna questões embaralhadas
3. Usuário responde; cada resposta dispara POST /attempts/:id/answer (auto-save)
4. Timer countdown; troca de aba gera alerta + registro
5. Usuário clica "Finalizar" → POST /attempts/:id/submit
6. Servidor calcula score e retorna resultado
7. Tela de resultado: score, aprovado/reprovado, gabarito comentado
```

### Etapa 5 — Ranking + Dashboard real

**Data de conclusão**: 2026-05-17
**Critério de aceite**: leaderboard público da Prova Final com pódio animado, posição pessoal destacada, badge de candidatura à mesa proprietária, dashboard com métricas reais de progresso.

### O que foi criado

#### `supabase/migrations/0005_ranking.sql`

4 views SQL com `security_invoker = true`:

| View | Propósito |
|------|-----------|
| `prova_final_leaderboard` | Apenas aprovados, ranking por maior score |
| `prova_final_all_attempts` | Todos que tentaram (para posição do usuário) |
| `user_simulado_scores` | Melhor score por usuário por simulado |
| `user_profile_stats` | Estatísticas agregadas: aulas, simulados, prova final |

Laços de join:
- `ranking_attempts` (view da etapa 4) → `profiles` → `assessments` → `modules`
- `lesson_progress` agregado para contagem de aulas concluídas

#### `apps/ranking-service/src/ranking/`

Microserviço NestJS leve, dois endpoints:

| Endpoint | Payload |
|----------|---------|
| `GET /ranking/prova-final?limit=N` | `{ entries[], totalParticipants, myEntry }` |
| `GET /ranking/me` | `{ provaFinal, simulados[], profileStats }` |

`RankingService` consulta as views Supabase e mapeia para DTOs tipados. Reutiliza `CommonModule` (SupabaseService + AuthGuard) da mesma forma que os outros serviços.

#### `apps/web/src/api/ranking.api.ts` + `src/hooks/use-ranking.ts`

- `rankingApi.getProvaFinalLeaderboard(limit)` e `rankingApi.getMyRanking()`
- `useLeaderboard()` com `staleTime: 30s` (atualiza sem reload)
- `useMyRanking()` com `staleTime: 60s`

#### `apps/web/src/pages/ranking/RankingPage.tsx`

Página completa `/ranking` com:

- **Banner de prêmios** — 1º Notebook, 2º Kit Café, 3º Copo Empire Trading
- **Painel "Meu desempenho"** — aulas concluídas, simulados aprovados, score da Prova Final, posição, barra de progresso geral, mini-grid de scores por módulo
- **Badge Mesa Proprietária** — aparece quando `scorePercent ≥ 80%` e aprovado
- **Pódio** (top 3) — colunas de alturas escalonadas, medalhas emoji, ordenadas 2-1-3
- **Tabela de leaderboard** — entrada destacada para o usuário autenticado, badges de elegibilidade para mesa proprietária, cores por score (emerald ≥ 90%, amber ≥ 75%)
- **Estado vazio** — mensagem quando nenhum aprovado ainda

#### `apps/web/src/pages/dashboard/DashboardPage.tsx` (reescrito)

Dashboard totalmente conectado a dados reais:

- `useCourse(FELIX_COURSE_ID)` → barra de progresso geral, mini-grid de módulos clicáveis
- `useMyRanking()` → 4 stat cards: aulas concluídas, simulados aprovados, score da Prova Final, posição no ranking
- CTA contextual: "Iniciar curso" / "Continuar" / "Você completou tudo — faça a Prova Final"
- Badge Mesa Proprietária no dashboard quando qualificado

### Fluxo de dados

```
Supabase views (0005)
  └── ranking-service  GET /ranking/*
        └── ranking.api.ts
              └── useLeaderboard / useMyRanking  (TanStack Query)
                    └── RankingPage / DashboardPage  (React)
```

### Decisões técnicas

- **Views com `security_invoker`**: a view executa com as permissões do chamador (service role), garantindo que RLS não bloqueie os dados mesmo em consultas JOIN
- **Ranking apenas de aprovados**: o leaderboard público exibe apenas quem passou (≥ 75%); a posição pessoal usa a view `prova_final_all_attempts` que inclui todos os que tentaram
- **Stale time curto no leaderboard** (30s): permite que rankings subam em tempo próximo-ao-real sem WebSockets

### Etapa 6 — Certificado + e-mail

**Data de conclusão**: 2026-05-17
**Critério de aceite**: certificate-service emite certificado com hash SHA-256 único, verificável publicamente em `/verify/:hash`; notification-service envia e-mail HTML via Resend; página Meus Certificados exibe certificados do usuário.

#### O que foi criado

##### `supabase/migrations/0006_certificates.sql`

| Objeto | Detalhes |
|--------|---------|
| `public.certificates` | `id`, `user_id`, `attempt_id`, `course_id`, `full_name`, `issued_at`, `verification_hash` (unique), `pdf_storage_path`, `revoked_at`. Trigger `set_updated_at`. |
| RLS | Deny-by-default; policy `owner_read` permite que cada usuário leia apenas seus próprios certificados. Service role bypassa RLS. |
| `verify_certificate(hash)` | Função SQL `SECURITY DEFINER` acessível para `anon` e `authenticated`; retorna apenas `full_name`, `course_title`, `issued_at`, `is_valid` — sem PII sensível. |

##### `apps/certificate-service/src/`

| Arquivo | Finalidade |
|---------|-----------|
| `common/` | Reutiliza o padrão `SupabaseService`, `AuthGuard`, `CurrentUser` do monorepo. |
| `certificate/certificate.service.ts` | `issueCertificate` (valida attempt passado + tipo prova_final, gera hash SHA-256 com salt aleatório, insere certificado); `getUserCertificates`; `verifyCertificate` (chama RPC pública). |
| `certificate/certificate.controller.ts` | `POST /api/certificates/issue`, `GET /api/certificates/me`, `GET /verify/:hash` (público, sem auth). |

##### `apps/notification-service/src/`

| Arquivo | Finalidade |
|---------|-----------|
| `notification/notification.service.ts` | `sendCertificateEmail` e `sendWelcomeEmail` via Resend. Templates HTML inline com tema Empire Trading. Fallback dry-run quando `RESEND_API_KEY` não está configurado. |
| `notification/notification.controller.ts` | `POST /api/notifications/certificate`, `POST /api/notifications/welcome`. Endpoint interno (não exposto pelo Traefik para o público). |

##### `apps/web/src/`

| Arquivo | Finalidade |
|---------|-----------|
| `api/certificate.api.ts` | `certificateApi.issue`, `listMine`, `verify`. |
| `hooks/use-certificate.ts` | `useMyCertificates`, `useIssueCertificate`, `useVerifyCertificate`. |
| `pages/certificates/CertificatesPage.tsx` | Lista certificados com hash, data de emissão, links para PDF e verificação pública. |
| `pages/certificates/VerifyPage.tsx` | Página pública `/verify/:hash`: exibe nome, curso, data e badge "Autêntico" ou "Revogado". |

---

### Etapa 7 — RAG tutor

**Data de conclusão**: 2026-05-17
**Critério de aceite**: rag-service indexa conteúdo das aulas com pgvector (embeddings 1536-dim), responde perguntas com citações de fonte e guardrails (sem sinal operacional), TutorPage com chat interativo.

#### O que foi criado

##### `supabase/migrations/0007_rag.sql`

| Objeto | Detalhes |
|--------|---------|
| `public.knowledge_chunks` | `id`, `lesson_id`, `module_id`, `source_label`, `chunk_index`, `content`, `embedding vector(1536)`, `tokens`. IVFFlat index para ANN cosine search. |
| `public.tutor_sessions` | Histórico de perguntas e respostas por usuário; `chunk_ids[]` rastreia quais chunks foram usados. RLS: cada usuário lê apenas suas sessões. |
| `match_knowledge_chunks(embedding, threshold, count)` | Função `SECURITY DEFINER` para similarity search com `<=>` (cosine). Acessível para `authenticated` e `service_role`. |

##### `apps/rag-service/src/`

| Arquivo | Finalidade |
|---------|-----------|
| `tutor/embedding.service.ts` | Conecta à OpenAI-compatible API (Ollama local ou cloud). Modelo configurável via `EMBEDDING_MODEL` (default: `nomic-embed-text`). |
| `tutor/ingestion.service.ts` | `ingestAll()`: carrega aulas publicadas, divide em chunks (800 chars, 150 overlap), embeda em batch de 20 e faz upsert com `(lesson_id, chunk_index)` como chave de deduplicação. |
| `tutor/tutor.service.ts` | `ask(userId, question)`: embed da pergunta → `match_knowledge_chunks` → monta contexto → chama LLM com system prompt `tutor.v1.md` e task template `answer-with-cites.v1.md` → extrai citações → persiste sessão. |
| `tutor/tutor.controller.ts` | `POST /api/rag/ask` (autenticado); `POST /api/rag/ingest` (protegido por `INGEST_SECRET`, para CI/admin). |

##### `apps/web/src/`

| Arquivo | Finalidade |
|---------|-----------|
| `api/tutor.api.ts` | `tutorApi.ask(question)`. |
| `pages/tutor/TutorPage.tsx` | Chat completo: área de mensagens com bolhas usuário/assistente, painel de citações por resposta, sugestões iniciais, disclaimer anti-sinal, loading animado. Enter para enviar, Shift+Enter nova linha. |

#### Arquitetura RAG

```
Pergunta do usuário
  └─ EmbeddingService.embedOne()
       └─ match_knowledge_chunks() (pgvector cosine search)
            └─ top-5 chunks → contexto montado
                 └─ OpenAI Chat (LLM) com tutor.v1.md + answer-with-cites.v1.md
                      └─ Resposta com [source:id] inline + seção Fontes
                           └─ TutorPage exibe com CitationsPanel
```

---

### Etapa 8 — Hardening + CI/CD

**Data de conclusão**: 2026-05-17
**Critério de aceite**: TLS 1.3 obrigatório, rate limit para rotas de auth, Playwright e2e (login + a11y), CI 8-stage com Trivy + SBOM, script de backup com retenção.

#### O que foi criado

##### `infra/traefik/dynamic.yml` (melhorias)

| Adição | Detalhe |
|--------|---------|
| `ratelimit-auth` | 10 req/min, burst 5 — para rotas de autenticação e submit (anti-brute-force) |
| TLS cipher suites explícitos | Apenas ECDHE+AES256+GCM e ChaCha20; `minVersion: VersionTLS13` |
| `request-id` middleware | Injeta `X-Request-Id` em todas as respostas para rastreabilidade |

##### `apps/web/e2e/`

| Arquivo | Testes |
|---------|--------|
| `auth.spec.ts` | Login page renderiza; validação de e-mail inválido; redirecionamento para `/login` sem auth; `/verify/:hash` acessível sem auth. |
| `dashboard.spec.ts` | Smoke tests autenticados (skipados em CI sem credenciais); redirecionamento sem auth. |
| `accessibility.spec.ts` | axe-core WCAG AA na login page e na verify page; falha apenas em `critical`/`serious`. |

##### `apps/web/playwright.config.ts`

Configuração multi-browser (Chromium, Firefox, Mobile Chrome), retries em CI, `webServer` com `pnpm preview`, `trace: 'on-first-retry'`, screenshots e relatório HTML.

##### `.github/workflows/ci.yml` (8 stages)

| Stage | Jobs |
|-------|------|
| 1 | `install-and-cache` — pnpm + cache de `node_modules` |
| 2 | `lint` (Prettier + ESLint), `typecheck` |
| 3 | `test` (Vitest/Jest) |
| 4 | `build` (Turbo build + artifact `web-dist`) |
| 5 | `e2e` (Playwright; download artifact; upload report on failure) |
| 6 | `docker-compose-validate` |
| 7 | `security-audit` (pnpm audit), `trivy-scan` (SARIF → GitHub Security) |
| 8 | `sbom` (Syft SPDX JSON; apenas em `main`) |

##### `infra/scripts/backup.sh`

Script bash `pg_dump | gzip` com prune automático por `RETENTION_DAYS` (default 30 dias) e upload opcional para S3 em modo `remote`.
