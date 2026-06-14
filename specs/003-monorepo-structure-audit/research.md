# Research: Padronização e Auditoria da Estrutura do Monorepo

**Feature**: 003-monorepo-structure-audit | **Date**: 2026-06-14

## R1 — Política de lockfile exclusivo PNPM

**Context**: `package-lock.json` existe na raiz e em `infra/scripts/otel-smoke/`, violando FR-001.

**Decision**: Remover todos os `package-lock.json` e adicionar entrada no `.gitignore`. CI já usa `pnpm/action-setup` — nenhuma mudança de workflow necessária.

**Rationale**:

- ADR-0001 estabelece pnpm como gerenciador único
- Lockfiles npm coexistindo causam instalação acidental via `npm install`
- Root `package.json` declara `"packageManager": "pnpm@9.12.0"` — npm lockfile é redundante

**Alternatives considered**:

- _Manter lockfile npm como referência_: rejeitado — viola política e confunde onboarding
- _Usar `.npmrc` `engine-strict` para bloquear npm_: insuficiente sozinho; gitignore + remoção é definitivo

---

## R2 — Destino do pacote `otel-smoke`

**Context**: Mini-projeto npm em `infra/scripts/otel-smoke/` com dependências OTEL duplicadas (C2, C3).

**Decision**: Absorver como workspace `packages/otel-smoke` com escopo `@coast-academy/otel-smoke`.

**Rationale**:

- Dependências OTEL já existem em `packages/observability` — PNPM deduplica via workspace
- `verify-obs-t07.sh` hoje faz `npm install` ad-hoc no subdiretório — frágil e lento
- Workspace permite `pnpm --filter @coast-academy/otel-smoke exec node smoke.cjs` sem npm isolado
- Scripts noop (`lint`, `typecheck`, `build`, `clean`) satisfazem pipeline Turbo uniforme

**Alternatives considered**:

- _Script inline sem package.json (node -e ou curl)_: rejeitado — perde tipagem OTEL e duplica lógica de export
- _Manter em infra/ sem workspace, usar `pnpm dlx`_: rejeitado — não deduplica deps nem integra Turbo
- _Mover deps para observability e importar smoke de lá_: rejeitado — acopla teste infra ao pacote de produção

**Migration steps**:

1. Criar `packages/otel-smoke/` com `package.json`, `smoke.cjs` (movido)
2. Adicionar scripts mínimos + `"private": true`
3. Atualizar `verify-obs-t07.sh` para usar pnpm filter
4. Remover `infra/scripts/otel-smoke/` inteiro

---

## R3 — Estratégia de paths TypeScript (src vs dist)

**Context**: `apps/tsconfig.workspace.json` aponta para `packages/*/dist/`; `apps/web/tsconfig.json` aponta para `packages/ui/src/` (M3).

**Decision**: Criar `tsconfig.paths.json` na raiz com **dois perfis de resolução documentados**:

- **Perfil NestJS (serviços)**: paths para `packages/*/dist/index` — alinhado ao runtime compilado
- **Perfil Web (Vite)**: paths para `packages/ui/src/` e `packages/shared-types/src/` — DX sem build prévio

**Rationale**:

- NestJS importa `@coast-academy/shared-types` como módulo compilado (`main: dist/index.js`)
- Vite bundler resolve TypeScript source diretamente — padrão comum em monorepos Turborepo
- `turbo.json` já define `typecheck.dependsOn: ["^build"]` — serviços NestJS typecheck após build de packages
- Centralizar em raiz elimina `apps/tsconfig.workspace.json` (M4) e satisfaz SC-007

**Alternatives considered**:

- _Forçar todos para `src/`_: rejeitado — NestJS em runtime usa `dist/`; quebra imports em produção
- _Forçar todos para `dist/`_: rejeitado — web precisa de HMR sobre source; cold clone web falharia
- _Project references (`tsc -b`) em todos os workspaces_: avaliado para Fase futura (B5 spec); escopo maior que limpeza

---

## R4 — Scripts noop vs reais para pacotes sem código testável

**Context**: `eslint-config` sem scripts; `shared-types`/`observability` sem `test` (M1, M2).

**Decision**:

- `eslint-config`: scripts noop explícitos (`echo 'eslint-config: no lint target'`) para `lint`, `typecheck`, `build`, `clean`
- `shared-types`, `observability`: `"test": "echo 'no tests yet'"` até testes reais serem adicionados
- Documentar em `contracts/turbo-pipeline-contract.md` quais pacotes usam noop e por quê

**Rationale**:

- Turbo executa task em todos os workspaces por padrão — script ausente causa skip silencioso ou erro
- Noop explícito é preferível a exclusão no `turbo.json` — transparência para CI
- `eslint-config` é config pura (.cjs) — lint nele mesmo é circular

**Alternatives considered**:

- _Excluir pacotes no turbo.json `lint.passThroughEnv`_: rejeitado — esconde pacotes do pipeline
- _Adicionar vitest mínimo em shared-types_: deferido — escopo de testes é feature separada

---

## R5 — Tratamento de `fix-lint.sh` na raiz

**Context**: Spec propõe mover para `infra/scripts/` (FR-009, B2).

**Decision**: **Remover** `fix-lint.sh` em vez de mover.

**Rationale** (revisão durante plan):

- Conteúdo atual referencia paths obsoletos (`~/Felix`, `/mnt/c/Projetos/Felix/`)
- Script era utilitário de migração one-off, não manutenção Coast Academy
- Mover preservaria código morto; deletar satisfaz FR-009 (utilitários de manutenção em `infra/scripts/` — este não é utilitário válido)

**Alternatives considered**:

- _Mover para infra/scripts/_: rejeitado após inspeção do conteúdo legado Felix

---

## R6 — Asset `background.mp4` relocation

**Context**: Vídeo (~2.5 MB) em `packages/background.mp4`, importado via Vite `?url` (C4).

**Decision**: Mover para `apps/web/public/videos/background.mp4` e referenciar como `/videos/background.mp4`.

**Rationale**:

- Assets estáticos de frontend pertencem a `apps/web/public/` (FR-003)
- Import relativo cross-package (`../../../../../packages/`) é anti-pattern monorepo
- Public path é cacheável pelo Vite dev server e deploy estático

**Alternatives considered**:

- _Manter em packages como asset compartilhado_: rejeitado — único consumidor é login web
- _Import via `@coast-academy/ui`_: rejeitado — vídeo não é componente design system

---

## R7 — `.gitignore` e artefatos temporários

**Context**: `.gitignore` não bloqueia `package-lock.json`; git status mostra artefatos Docker acidentais na raiz.

**Decision**: Adicionar ao `.gitignore`:

```
package-lock.json
npm-shrinkwrap.json
*.docker-build.log
```

Manter regra existente `.cursor/` e `.specify/` (exceto `memory/`).

**Rationale**: FR-010 exige prevenção de recorrência; lockfile npm é o caso mais crítico.

**Alternatives considered**:

- _Pre-commit hook para detectar lockfiles npm_: deferido — gitignore + CI check futuro

---

## R8 — `shamefully-hoist=true` (B4 spec)

**Context**: `.npmrc` usa hoist agressivo; spec marca como baixa prioridade.

**Decision**: **Não alterar** nesta feature (confirma assumption da spec).

**Rationale**: Mudança pode quebrar resolução de módulos em containers Docker; requer validação isolada.

**Alternatives considered**: Documentar como item de backlog técnico em spec 002 gaps.

---

## R9 — Documentação de specs fragmentadas (B3)

**Context**: Três locais: `specs/`, `docs/specs/`, `.kiro/specs/`.

**Decision**: Fora do escopo desta feature. Apenas referenciar em README que `specs/` (Spec Kit) é fonte de verdade para features novas.

**Rationale**: Migração de `docs/specs/observability/` é ciclo separado (edge case spec).

---

## Summary Table

| ID  | Tópico             | Decisão                                     |
| --- | ------------------ | ------------------------------------------- |
| R1  | Lockfile           | PNPM exclusivo + gitignore                  |
| R2  | otel-smoke         | Workspace `packages/otel-smoke`             |
| R3  | TS paths           | `tsconfig.paths.json` na raiz, dual profile |
| R4  | Scripts noop       | eslint-config + packages sem test           |
| R5  | fix-lint.sh        | Deletar (legado Felix)                      |
| R6  | background.mp4     | `apps/web/public/videos/`                   |
| R7  | gitignore          | Bloquear lockfiles npm                      |
| R8  | shamefully-hoist   | Manter inalterado                           |
| R9  | specs fragmentadas | Fora do escopo                              |

**All NEEDS CLARIFICATION resolved.**
