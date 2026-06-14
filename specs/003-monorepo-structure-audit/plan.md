# Implementation Plan: Padronização e Auditoria da Estrutura do Monorepo

**Branch**: `003-monorepo-structure-audit` | **Date**: 2026-06-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-monorepo-structure-audit/spec.md`

## Summary

Limpeza estrutural do monorepo Coast Academy para conformidade total com **pnpm 9 + Turborepo 2** (ADR-0001). A auditoria identificou 4 divergências críticas (lockfiles npm, pacote OTEL órfão, asset de vídeo fora do lugar), 6 médias (scripts Turbo ausentes, paths TypeScript inconsistentes, branding legado) e 5 baixas (scripts duplicados, specs fragmentadas, `.npmrc` hoist).

A abordagem técnica segue **4 fases incrementais de baixo risco**: (1) remoção de artefatos fantasmas e realocação de assets; (2) absorção do `otel-smoke` no workspace PNPM e padronização de scripts; (3) centralização de paths TypeScript em `tsconfig.paths.json` na raiz; (4) documentação e validação CI.

Nenhuma mudança de domínio de negócio, schema Supabase ou contrato API — apenas integridade estrutural e DX.

## Technical Context

**Language/Version**: TypeScript 5.5 (strict), Node.js ≥ 20, pnpm 9.12, Turborepo 2.1

**Primary Dependencies**: pnpm workspaces, turbo, NestJS 10 (6 serviços), React 19 + Vite (web), Vitest/Jest/Playwright (testes)

**Storage**: N/A (feature de estrutura; sem persistência)

**Testing**: Vitest (`packages/ui`), Jest (NestJS apps), Playwright E2E (`apps/web`); validação via `pnpm turbo run build lint typecheck test`

**Target Platform**: Monorepo local (WSL/Linux/macOS) + CI GitHub Actions (ubuntu-latest)

**Project Type**: Turborepo monorepo — 7 apps + 4 packages (+ 1 novo workspace `packages/otel-smoke` proposto)

**Performance Goals**: Pipeline `pnpm turbo run build lint typecheck` completa em cold clone sem erros estruturais (SC-004)

**Constraints**:

- Manter `shamefully-hoist=true` inalterado (validação Docker pendente — spec assumption)
- `start.sh` / `start-all.sh` na raiz permanecem como atalhos documentados
- `docs/specs/` e `.kiro/specs/` fora do escopo de migração
- `supabase/` permanece fora do workspace PNPM por design

**Scale/Scope**: 11 workspaces existentes → 12 com `otel-smoke`; ~15 arquivos modificados/removidos; zero mudanças de runtime

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Reference: `.specify/memory/constitution.md` (Coast Academy v1.0.0)

| Gate                 | Requirement                                          | Pass?           | Notas                                                                                                                |
| -------------------- | ---------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------- |
| G1 — Bounded context | Feature maps to one NestJS service + Supabase tables | ✅ N/A          | Feature estrutural; não adiciona serviço nem tabela                                                                  |
| G2 — Security        | RLS policies; no client-side secrets                 | ✅ N/A          | Sem mudança de superfície de segurança                                                                               |
| G3 — Shared types    | New DTOs in `packages/shared-types`                  | ✅ N/A          | Sem novos contratos de domínio                                                                                       |
| G4 — Observability   | Pino + OTEL for new endpoints                        | ✅ N/A          | `otel-smoke` é utilitário de smoke test, não endpoint                                                                |
| G5 — Design system   | UI uses `@coast-academy/ui` tokens                   | ✅ Pass         | Correção de branding em `packages/ui/package.json` alinha com Princípio V                                            |
| G6 — ADR             | Non-trivial decisions in `docs/adr/`                 | ⚠️ Pass c/ nota | Decisão de `tsconfig.paths.json` documentada em `research.md`; ADR-0001 permanece base; patch ADR opcional na Fase 4 |
| G7 — RAG prompts     | Prompt versioning if touching RAG                    | ✅ N/A          | Sem alteração em `apps/rag-service/prompts/`                                                                         |

**Post-design re-check**: Todos os gates permanecem ✅ ou N/A. Nenhuma violação requer Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/003-monorepo-structure-audit/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas (Phase 0)
├── data-model.md        # Entidades estruturais e convenções
├── quickstart.md        # Cenários de validação pós-limpeza
├── contracts/           # Contratos de workspace e pipeline Turbo
│   ├── workspace-contract.md
│   └── turbo-pipeline-contract.md
└── tasks.md             # Phase 2 (/speckit-tasks — ainda não gerado)
```

### Source Code (repository root — estado alvo)

```text
coast-academy/
├── apps/
│   ├── web/                    # React 19 SPA (frontend)
│   ├── course-service/         # NestJS microserviços (×6)
│   ├── assessment-service/
│   ├── certificate-service/
│   ├── ranking-service/
│   ├── rag-service/
│   └── notification-service/
├── packages/
│   ├── shared-types/           # Zod DTOs (Princípio III)
│   ├── ui/                     # Design tokens + componentes
│   ├── eslint-config/          # ESLint compartilhado
│   ├── observability/          # Pino + OTEL + Prometheus
│   └── otel-smoke/             # NOVO — smoke OTLP (absorve infra/scripts/otel-smoke)
├── infra/
│   ├── docker/
│   ├── traefik/
│   ├── obs/
│   ├── scripts/                # fix-lint.sh REMOVIDO (legado Felix)
│   └── backups/
├── supabase/                   # Fora do workspace PNPM (por design)
├── specs/                      # Spec Kit (fonte de verdade de features)
├── docs/                       # ADRs, arquitetura, runbooks
├── tsconfig.base.json          # Strict TS compartilhado
├── tsconfig.paths.json         # NOVO — paths workspace centralizados
├── pnpm-workspace.yaml         # apps/* + packages/*
├── pnpm-lock.yaml              # Único lockfile
├── turbo.json                  # Pipeline Turbo
├── package.json                # Scripts raiz + devDeps tooling
├── start.sh                    # Atalho → infra/scripts/start-local.sh
└── start-all.sh                # Atalho → infra/scripts/start-all.sh
```

**Structure Decision**: Manter layout ADR-0001 (`apps/` + `packages/` + `infra/`). Mudanças limitadas a: absorver `otel-smoke` em `packages/`, mover `background.mp4` para `apps/web/public/videos/`, criar `tsconfig.paths.json` na raiz, remover artefatos npm legados.

## Complexity Tracking

> Nenhuma violação de constitution requer justificativa.

## Implementation Phases

### Phase A — Limpeza imediata (baixo risco)

| ID  | Ação                      | Arquivos                                                                 | Validação                                    |
| --- | ------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| A1  | Remover lockfiles npm     | `package-lock.json` (raiz), `infra/scripts/otel-smoke/package-lock.json` | `find . -name package-lock.json` → vazio     |
| A2  | Mover vídeo de login      | `packages/background.mp4` → `apps/web/public/videos/background.mp4`      | Asset servido via `/videos/background.mp4`   |
| A3  | Atualizar import do vídeo | `apps/web/src/components/auth/LoginVideoBackground.tsx`                  | `pnpm --filter @coast-academy/web typecheck` |
| A4  | Remover artefato dev      | `packages/ui/TASK_COMPLETION_SUMMARY.md`                                 | Grep zero matches                            |
| A5  | Remover script legado     | `fix-lint.sh` (referências Felix/Felix paths — obsoleto)                 | Arquivo ausente na raiz                      |
| A6  | Atualizar `.gitignore`    | Adicionar `package-lock.json`, `npm-shrinkwrap.json`, logs Docker        | Commit impede recorrência                    |

### Phase B — Integridade do workspace

| ID  | Ação                     | Arquivos                                                                          | Validação                                  |
| --- | ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------ |
| B1  | Migrar otel-smoke        | `infra/scripts/otel-smoke/` → `packages/otel-smoke/`                              | Workspace listado em `pnpm-workspace.yaml` |
| B2  | Scripts otel-smoke       | `build`, `lint`, `typecheck`, `clean` noop; sem `test` ou noop                    | Turbo não falha                            |
| B3  | Atualizar verify script  | `infra/scripts/verify-obs-t07.sh` usa `pnpm --filter @coast-academy/otel-smoke`   | `./infra/scripts/verify-obs-t07.sh` passa  |
| B4  | Scripts eslint-config    | Adicionar `lint`, `typecheck`, `build`, `clean` noop                              | Turbo lint/typecheck inclui pacote         |
| B5  | Scripts test em packages | `shared-types`, `observability`: `"test": "echo 'no tests yet'"` ou vitest mínimo | `pnpm turbo run test` sem erro             |
| B6  | Branding ui              | `packages/ui/package.json` description → Coast Academy                            | Grep zero "Empire Trading"                 |

### Phase C — Padronização TypeScript

| ID  | Ação                      | Arquivos                                                                          | Validação                           |
| --- | ------------------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| C1  | Criar tsconfig.paths.json | Raiz com paths para `packages/*/src/`                                             | Arquivo referenciado por workspaces |
| C2  | Migrar paths NestJS       | Substituir `apps/tsconfig.workspace.json` extends por `../../tsconfig.paths.json` | 6 serviços NestJS typecheck         |
| C3  | Alinhar web paths         | `apps/web/tsconfig.json` inclui `@coast-academy/shared-types` via paths raiz      | Cold typecheck web                  |
| C4  | Remover config obsoleta   | Deletar `apps/tsconfig.workspace.json`                                            | Grep zero references                |
| C5  | Documentar ordem build    | `turbo.json` typecheck `dependsOn: ["^build"]` já exige build prévio de packages  | Documentado em quickstart.md        |

**Decisão paths**: NestJS serviços continuam resolvendo `dist/` em runtime (build output); dev typecheck usa `dependsOn: ^build` do Turbo. Web usa `src/` para DX sem build prévio de `@coast-academy/ui` — ver `research.md` R3.

### Phase D — Documentação e validação

| ID  | Ação                  | Arquivos                                                 | Validação                   |
| --- | --------------------- | -------------------------------------------------------- | --------------------------- |
| D1  | README mapa de pastas | `README.md` seção estrutura + política lockfile          | Onboarding SC-005           |
| D2  | CONTRIBUTING          | `docs/CONTRIBUTING.md` seção monorepo                    | Link no README              |
| D3  | turbo.json filters    | Documentar `test:e2e` exclusivo de `apps/web`            | Comentário ou contracts doc |
| D4  | CI smoke              | Confirmar `.github/workflows/ci.yml` roda turbo pipeline | PR verde                    |

## Risk Matrix

| Risco                                        | Probabilidade | Impacto | Mitigação                                              |
| -------------------------------------------- | ------------- | ------- | ------------------------------------------------------ |
| Vídeo login quebra após move                 | Baixa         | Médio   | Testar LoginVideoBackground manualmente                |
| verify-obs-t07 falha após otel-smoke migrate | Média         | Baixo   | Atualizar script antes de remover pasta antiga         |
| Typecheck cold clone falha                   | Média         | Alto    | Manter `dependsOn: ^build`; documentar em quickstart   |
| Remover fix-lint.sh quebra workflow          | Baixa         | Baixo   | Script referencia projeto Felix obsoleto — safe delete |

## Dependencies & Ordering

```text
Phase A (limpeza) ──► Phase B (workspace) ──► Phase C (TS paths) ──► Phase D (docs)
         │                      │
         └─ A2/A3 antes de A1 commit ─────────┘
         B1 bloqueia B3
         C1 bloqueia C2/C3/C4
```

## Success Validation

Critérios mensuráveis da spec (SC-001 a SC-007) mapeados em [quickstart.md](./quickstart.md).

## References

| Documento                                  | Uso                                     |
| ------------------------------------------ | --------------------------------------- |
| [spec.md](./spec.md)                       | Requisitos FR-001–FR-012 e user stories |
| [research.md](./research.md)               | Decisões técnicas Phase 0               |
| [data-model.md](./data-model.md)           | Entidades estruturais                   |
| [contracts/](./contracts/)                 | Contratos workspace e Turbo             |
| [quickstart.md](./quickstart.md)           | Validação end-to-end                    |
| `docs/adr/0001-monorepo-pnpm-turborepo.md` | Decisão arquitetural base               |
| `.specify/memory/constitution.md`          | Princípio I — Monorepo                  |
