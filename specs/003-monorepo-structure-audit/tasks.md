# Tasks: Padronização e Auditoria da Estrutura do Monorepo

**Input**: Design documents from `/specs/003-monorepo-structure-audit/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não solicitados na spec — validação via comandos em quickstart.md (sem tasks de teste automatizado).

**Organization**: Tasks grouped by user story (P1 → P2 → P3) para entrega incremental independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)

- **[Story]**: Which user story this task belongs to (US1, US2, US3)

- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar branch e remover lixo acidental antes de qualquer mudança estrutural

- [x] T001 Checkout branch `003-monorepo-structure-audit` a partir de `main`

- [x] T002 [P] Remover artefatos acidentais de build Docker na raiz se existirem (`=`, `CACHED`, `Containers`, `exporting`, `reading`, `resolve`, `transferring`, `[base`, `[internal]`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Políticas transversais que impedem recorrência de divergências — BLOQUEIA user stories

**⚠️ CRITICAL**: Nenhuma user story deve começar antes desta fase

- [x] T003 Atualizar `.gitignore` adicionando `package-lock.json`, `npm-shrinkwrap.json` e `*.docker-build.log` (FR-010)

- [x] T004 Deletar `fix-lint.sh` na raiz — script legado Felix obsoleto, não mover para `infra/scripts/` (research R5)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Desenvolvedor novo entende a estrutura (Priority: P1) 🎯 MVP

**Goal**: Monorepo previsível — lockfile único PNPM, assets frontend no lugar certo, zero pacotes npm órfãos

**Independent Test**: Dev responde em < 1 min lendo README onde ficam apps/packages/infra e qual lockfile usar; `find . -name package-lock.json` retorna vazio; `apps/web/public/videos/background.mp4` existe

### Implementation for User Story 1

- [x] T005 [P] [US1] Criar diretório `apps/web/public/videos/` e mover `packages/background.mp4` para `apps/web/public/videos/background.mp4` (FR-003)

- [x] T006 [US1] Atualizar `apps/web/src/components/auth/LoginVideoBackground.tsx` para usar `/videos/background.mp4` em vez de import cross-package `packages/background.mp4?url`

- [x] T007 [P] [US1] Deletar `packages/ui/TASK_COMPLETION_SUMMARY.md` (FR-008)

- [x] T008 [P] [US1] Deletar `package-lock.json` na raiz do repositório (FR-001, SC-001)

- [x] T009 [US1] Criar workspace `packages/otel-smoke/` movendo `infra/scripts/otel-smoke/smoke.cjs` e criando `packages/otel-smoke/package.json` com escopo `@coast-academy/otel-smoke` e dependências OTEL (research R2, FR-002)

- [x] T010 [US1] Deletar diretório `infra/scripts/otel-smoke/` incluindo `package-lock.json` após migração para `packages/otel-smoke/` (FR-001, FR-002)

- [x] T011 [US1] Executar `pnpm install` na raiz para atualizar `pnpm-lock.yaml` com o novo workspace `packages/otel-smoke/`

- [x] T012 [US1] Atualizar `infra/scripts/verify-obs-t07.sh` substituindo `npm install` em subpasta por `pnpm --filter @coast-academy/otel-smoke exec node smoke.cjs` (ou equivalente)

- [x] T013 [US1] Validar US1: confirmar zero `package-lock.json` via `find . -name package-lock.json -not -path './node_modules/*'` e presença de `apps/web/public/videos/background.mp4`

**Checkpoint**: US1 completa — estrutura legível, lockfile único, otel-smoke no workspace PNPM

---

## Phase 4: User Story 2 — Pipeline Turbo executa em todos os workspaces (Priority: P2)

**Goal**: `pnpm turbo run build lint typecheck test` funciona uniformemente em todos os 12 workspaces

**Independent Test**: `pnpm turbo run lint typecheck test` completa sem erros de script ausente; eslint-config e otel-smoke executam noop explícito

### Implementation for User Story 2

- [x] T014 [P] [US2] Adicionar scripts noop (`build`, `lint`, `typecheck`, `clean`) em `packages/eslint-config/package.json` conforme `contracts/workspace-contract.md` (FR-005)

- [x] T015 [P] [US2] Adicionar script `"test": "echo 'no tests yet'"` em `packages/shared-types/package.json` (FR-004, M2)

- [x] T016 [P] [US2] Adicionar script `"test": "echo 'no tests yet'"` em `packages/observability/package.json` (FR-004, M2)

- [x] T017 [P] [US2] Adicionar scripts noop (`build`, `lint`, `typecheck`, `clean`) em `packages/otel-smoke/package.json` (FR-004)

- [x] T018 [US2] Corrigir branding em `packages/ui/package.json` — description deve referenciar "Coast Academy", não "Empire Trading" (FR-007, SC-006)

- [x] T019 [US2] Validar US2: executar `pnpm turbo run lint typecheck test` e confirmar 12 workspaces participam sem missing-script errors (SC-002, SC-004)

**Checkpoint**: US2 completa — pipeline Turbo uniforme em todos os workspaces

---

## Phase 5: User Story 3 — Configuração TypeScript consistente (Priority: P3)

**Goal**: Paths workspace centralizados na raiz; NestJS e web resolvem imports de forma documentada e previsível

**Independent Test**: `tsconfig.paths.json` existe na raiz; `apps/tsconfig.workspace.json` ausente; `pnpm turbo run build typecheck` passa (SC-007)

### Implementation for User Story 3

- [x] T020 [US3] Criar `tsconfig.paths.json` na raiz com paths NestJS apontando para `packages/*/dist/` e paths web apontando para `packages/ui/src/` e `packages/shared-types/src/` (research R3, FR-006)

- [x] T021 [P] [US3] Atualizar `apps/course-service/tsconfig.json` para estender `../../tsconfig.paths.json` em vez de `../tsconfig.workspace.json`

- [x] T022 [P] [US3] Atualizar `apps/assessment-service/tsconfig.json` para estender `../../tsconfig.paths.json` em vez de `../tsconfig.workspace.json`

- [x] T023 [P] [US3] Atualizar `apps/certificate-service/tsconfig.json` para estender `../../tsconfig.paths.json` em vez de `../tsconfig.workspace.json`

- [x] T024 [P] [US3] Atualizar `apps/ranking-service/tsconfig.json` para estender `../../tsconfig.paths.json` em vez de `../tsconfig.workspace.json`

- [x] T025 [P] [US3] Atualizar `apps/rag-service/tsconfig.json` para estender `../../tsconfig.paths.json` em vez de `../tsconfig.workspace.json`

- [x] T026 [P] [US3] Atualizar `apps/notification-service/tsconfig.json` para estender `../../tsconfig.paths.json` em vez de `../tsconfig.workspace.json`

- [x] T027 [US3] Atualizar `apps/web/tsconfig.json` para incluir paths de `tsconfig.paths.json` para `@coast-academy/shared-types` e `@coast-academy/ui` mantendo alias local `@/*`

- [x] T028 [US3] Deletar `apps/tsconfig.workspace.json` após todos os consumidores migrados (FR-006, SC-007)

- [x] T029 [US3] Adicionar `tsconfig.paths.json` ao array `globalDependencies` em `turbo.json`

- [x] T030 [US3] Validar US3: executar `pnpm turbo run build typecheck` e confirmar passagem em todos os workspaces (SC-004, SC-007)

**Checkpoint**: US3 completa — config TypeScript transversal na raiz, typecheck consistente

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentação, validação final e conformidade CI

- [x] T031 [P] Atualizar `README.md` com mapa de pastas (`apps/`, `packages/`, `infra/`), política de lockfile PNPM exclusivo e documentação dos atalhos `start.sh`/`start-all.sh` (FR-009, SC-005)

- [x] T032 Criar ou atualizar `docs/CONTRIBUTING.md` com seção "Estrutura do monorepo" e linkar no `README.md` (plan Phase D)

- [x] T033 Documentar escopo `test:e2e` exclusivo de `apps/web` — adicionar comentário em `turbo.json` ou referência no `README.md` (FR-011)

- [x] T034 Executar validação completa descrita em `specs/003-monorepo-structure-audit/quickstart.md` (SC-001 a SC-007)

- [x] T035 Confirmar pipeline CI local espelhando `.github/workflows/ci.yml`: `pnpm turbo run lint typecheck test build` passa sem regressão (FR-012)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente

- **Foundational (Phase 2)**: Depende de Phase 1 — **BLOQUEIA** todas as user stories

- **US1 (Phase 3)**: Depende de Phase 2 — MVP entregável após esta fase

- **US2 (Phase 4)**: Depende de Phase 2; T009–T011 (otel-smoke workspace) devem completar antes de T017

- **US3 (Phase 5)**: Depende de Phase 2; independente de US2 (pode paralelizar após Foundational, mas recomendado após US2)

- **Polish (Phase 6)**: Depende de US1 + US2 + US3 completos

### User Story Dependencies

- **US1 (P1)**: Independente — entrega MVP estrutural

- **US2 (P2)**: Depende de T009–T011 (workspace otel-smoke criado) para T017

- **US3 (P3)**: Independente de US1/US2 — pode rodar em paralelo após Foundational, mas validação final (T030) beneficia de US2 completo

### Within Each User Story

- T005 antes de T006 (mover vídeo antes de atualizar import)

- T009 antes de T010–T012 (criar workspace antes de deletar origem e atualizar script)

- T020 antes de T021–T028 (criar paths raiz antes de migrar consumers)

- T021–T027 antes de T028 (migrar todos antes de deletar config legada)

### Parallel Opportunities

- **Phase 1**: T002 paralelo a T001

- **Phase 3 (US1)**: T005, T007, T008 em paralelo; T009 sequencial antes de T010–T012

- **Phase 4 (US2)**: T014, T015, T016, T017 em paralelo; T018 independente

- **Phase 5 (US3)**: T021–T026 em paralelo após T020; T027 sequencial após T020

- **Phase 6**: T031 paralelo a preparação de T032

---

## Parallel Example: User Story 2

```bash

# Launch all noop script tasks together:

Task T014: "Add noop scripts to packages/eslint-config/package.json"

Task T015: "Add test noop to packages/shared-types/package.json"

Task T016: "Add test noop to packages/observability/package.json"

Task T017: "Add noop scripts to packages/otel-smoke/package.json"



# Then sequentially:

Task T018: "Fix branding in packages/ui/package.json"

Task T019: "Validate pnpm turbo run lint typecheck test"

```

---

## Parallel Example: User Story 3

```bash

# After T020 creates tsconfig.paths.json, launch all NestJS migrations:

Task T021: "Update apps/course-service/tsconfig.json"

Task T022: "Update apps/assessment-service/tsconfig.json"

Task T023: "Update apps/certificate-service/tsconfig.json"

Task T024: "Update apps/ranking-service/tsconfig.json"

Task T025: "Update apps/rag-service/tsconfig.json"

Task T026: "Update apps/notification-service/tsconfig.json"



# Then web + cleanup:

Task T027: "Update apps/web/tsconfig.json"

Task T028: "Delete apps/tsconfig.workspace.json"

```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)

2. Complete Phase 2: Foundational (T003–T004)

3. Complete Phase 3: User Story 1 (T005–T013)

4. **STOP and VALIDATE**: quickstart SC-001, SC-003, US1 acceptance scenarios

5. PR parcial entregável — monorepo já legível para onboarding

### Incremental Delivery

1. Setup + Foundational → base limpa

2. US1 → MVP estrutural (lockfile, assets, otel-smoke) → validar

3. US2 → pipeline Turbo uniforme → validar

4. US3 → TypeScript paths centralizados → validar

5. Polish → docs + CI + quickstart completo

### Parallel Team Strategy

Com 2–3 devs após Foundational:

- **Dev A**: US1 (T005–T013) — caminho crítico MVP

- **Dev B**: US2 (T014–T019) — aguarda T009–T011 para T017

- **Dev C**: US3 (T020–T030) — pode iniciar após T020 independente de US2

---

## Notes

- `pnpm-workspace.yaml` já declara `packages/*` — não precisa alteração para `otel-smoke`

- `shamefully-hoist=true` em `.npmrc` permanece inalterado (research R8)

- `docs/specs/` e `.kiro/specs/` fora do escopo — não migrar

- `start.sh` e `start-all.sh` na raiz permanecem — apenas documentar no README

- Commit sugerido após cada checkpoint (US1, US2, US3, Polish)
