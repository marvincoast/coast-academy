# Feature Specification: Padronização e Auditoria da Estrutura do Monorepo

**Feature Branch**: `003-monorepo-structure-audit`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "Padronização e auditoria da estrutura do Monorepo. O objetivo é analisar a organização das pastas apps/, packages/ e infra/, identificar se há arquivos fora do lugar, dependências fantasmas no package.json da raiz ou falta de padronização nos arquivos de configuração (turbo.json, tsconfig.base.json, pnpm-workspace.yaml). Gere a especificação de melhoria estrutural para deixar o projeto limpo e 100% aderente ao padrão Turborepo + PNPM."

## Resultado da Auditoria (estado atual)

Auditoria estática realizada em 2026-06-14 cobrindo `apps/` (7 workspaces),
`packages/` (4 workspaces), `infra/` e arquivos de configuração na raiz.

### Estrutura válida (aderente ao padrão)

| Área                  | Estado                | Detalhe                                                                                            |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------- |
| `apps/`               | ✅ Organizado         | 1 frontend + 6 microserviços NestJS, cada um com `package.json` e `tsconfig.json`                  |
| `packages/`           | ✅ Organizado         | 4 pacotes workspace: `shared-types`, `ui`, `eslint-config`, `observability`                        |
| `infra/`              | ✅ Organizado         | `docker/`, `traefik/`, `obs/`, `scripts/`, `backups/`                                              |
| `pnpm-workspace.yaml` | ✅ Correto            | Declara `apps/*` e `packages/*`                                                                    |
| `turbo.json`          | ✅ Correto            | Tasks `build`, `dev`, `lint`, `typecheck`, `test`, `test:e2e`, `clean` com `dependsOn: ["^build"]` |
| `tsconfig.base.json`  | ✅ Correto            | TypeScript strict completo (inclui `noUncheckedIndexedAccess`)                                     |
| `package.json` raiz   | ✅ Sem deps fantasmas | Apenas `devDependencies` de tooling (turbo, husky, prettier, commitlint, supabase CLI)             |
| Scripts NestJS        | ✅ Padronizados       | 6 serviços com mesmos scripts: `build`, `dev`, `lint`, `typecheck`, `test`, `clean`                |
| Nomenclatura          | ✅ Consistente        | Todos os workspaces usam escopo `@coast-academy/*`                                                 |

### Divergências encontradas (requerem correção)

#### Críticas — integridade do monorepo

| #   | Problema                                                     | Localização                             | Impacto                                                |
| --- | ------------------------------------------------------------ | --------------------------------------- | ------------------------------------------------------ |
| C1  | `package-lock.json` na raiz coexistindo com `pnpm-lock.yaml` | Raiz                                    | Viola política PNPM; risco de instalação npm acidental |
| C2  | `package-lock.json` em pacote isolado                        | `infra/scripts/otel-smoke/`             | Mini-projeto npm fora do workspace PNPM                |
| C3  | Pacote `otel-smoke` fora do workspace                        | `infra/scripts/otel-smoke/package.json` | Dependências OTEL não deduplicadas pelo PNPM           |
| C4  | Asset binário fora do lugar                                  | `packages/background.mp4` (~2.5 MB)     | Vídeo de login pertence ao frontend, não a `packages/` |

#### Médias — padronização de configuração

| #   | Problema                                           | Localização                                                                                     | Impacto                                                    |
| --- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| M1  | `eslint-config` sem scripts Turbo                  | `packages/eslint-config/package.json`                                                           | `pnpm turbo run lint` ignora ou falha neste pacote         |
| M2  | `shared-types` e `observability` sem script `test` | `packages/*/package.json`                                                                       | Pipeline `pnpm test` não cobre pacotes compartilhados      |
| M3  | Paths TypeScript inconsistentes                    | `apps/tsconfig.workspace.json` aponta para `dist/`; `apps/web/tsconfig.json` aponta para `src/` | DX inconsistente entre frontend e serviços                 |
| M4  | `tsconfig.workspace.json` na pasta `apps/`         | `apps/tsconfig.workspace.json`                                                                  | Config transversal deveria estar na raiz ou em `packages/` |
| M5  | Branding desatualizado                             | `packages/ui/package.json` descrição diz "Empire Trading"                                       | Inconsistência com Coast Academy                           |
| M6  | Artefato de dev em pacote                          | `packages/ui/TASK_COMPLETION_SUMMARY.md`                                                        | Documento temporário poluindo pacote publicável            |

#### Baixas — organização e limpeza

| #   | Problema                                            | Localização                                                | Impacto                                               |
| --- | --------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| B1  | Scripts duplicados na raiz                          | `start.sh`, `start-all.sh` (atalhos para `infra/scripts/`) | Aceitável, mas duplica entrypoints                    |
| B2  | Script utilitário solto na raiz                     | `fix-lint.sh`                                              | Deveria viver em `infra/scripts/`                     |
| B3  | Três locais de specs                                | `specs/`, `docs/specs/`, `.kiro/specs/`                    | Fragmentação da documentação de features              |
| B4  | `shamefully-hoist=true` no `.npmrc`                 | Raiz                                                       | Funciona, mas reduz isolamento estrito PNPM           |
| B5  | Nest services usam `tsc --noEmit`; web usa `tsc -b` | `apps/*/package.json`                                      | Comportamento de typecheck diferente entre workspaces |

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Desenvolvedor novo entende a estrutura (Priority: P1)

Como **desenvolvedor** entrando no projeto, quero uma estrutura de monorepo
previsível onde cada pasta tem um papel claro, para encontrar código e configs
sem ambiguidade.

**Why this priority**: Divergências atuais (lockfile npm, asset em `packages/`,
pacote fora do workspace) confundem onboarding.

**Independent Test**: Um dev consegue responder "onde ficam apps, packages, infra
e scripts?" e "qual lockfile usar?" em menos de 1 minuto lendo o README.

**Acceptance Scenarios**:

1. **Given** um dev abre a raiz do repositório,
   **When** lista arquivos,
   **Then** encontra apenas `pnpm-lock.yaml` (sem `package-lock.json`).
2. **Given** um dev procura assets de mídia do frontend,
   **When** navega `apps/web/public/`,
   **Then** encontra vídeos e imagens — não em `packages/`.
3. **Given** um dev executa `pnpm install`,
   **When** a instalação completa,
   **Then** todas as dependências resolvem via PNPM workspace sem subpastas npm isoladas.

---

### User Story 2 - Pipeline Turbo executa em todos os workspaces (Priority: P2)

Como **mantenedor de CI**, quero que `pnpm turbo run build lint typecheck test`
funcione de forma uniforme em todos os workspaces, sem pacotes ignorados ou
scripts ausentes.

**Why this priority**: `eslint-config` não tem scripts; `shared-types` não tem
`test` — pipeline parcial mascara problemas.

**Independent Test**: `pnpm turbo run lint typecheck` completa sem warnings de
pacotes sem script, ou com scripts noop explícitos documentados.

**Acceptance Scenarios**:

1. **Given** todos os workspaces em `apps/*` e `packages/*`,
   **When** `pnpm turbo run lint` é executado,
   **Then** cada workspace tem script `lint` definido (ou está explicitamente
   excluído no `turbo.json` com justificativa).
2. **Given** pacotes compartilhados `shared-types` e `observability`,
   **When** `pnpm turbo run test` é executado,
   **Then** testes rodam ou retornam noop documentado — não falham por script
   ausente.

---

### User Story 3 - Configuração TypeScript consistente (Priority: P3)

Como **desenvolvedor** trabalhando em frontend e backend, quero resolução de
paths workspace uniforme (`workspace:*` + paths para `src/`), para imports
funcionarem igual em dev e CI.

**Why this priority**: `apps/tsconfig.workspace.json` resolve `dist/` enquanto
web resolve `src/` — fonte de bugs em cold build.

**Independent Test**: `pnpm typecheck` passa em cold clone sem build prévio de
pacotes (ou documenta ordem de build obrigatória).

**Acceptance Scenarios**:

1. **Given** um dev clona o repo sem `dist/` nos packages,
   **When** executa typecheck do frontend,
   **Then** paths resolvem para `src/` dos pacotes workspace (comportamento atual
   do web) OU documentação exige `pnpm build` prévio.
2. **Given** config transversal de paths,
   **When** localizada,
   **Then** está na raiz (`tsconfig.paths.json`) e não dentro de `apps/`.

---

### Edge Cases

- `start.sh` / `start-all.sh` na raiz são atalhos válidos — manter com
  documentação, não deletar sem atualizar README.
- `docs/specs/observability/` é spec técnica legada — migrar para `specs/` em
  ciclo separado, não bloquear esta feature.
- `.kiro/specs/` é ferramenta paralela — fora do escopo desta padronização.
- `infra/scripts/otel-smoke` pode ser absorvido como workspace `packages/otel-smoke`
  ou script inline sem `package.json` próprio.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O monorepo DEVE usar exclusivamente `pnpm-lock.yaml` como lockfile;
  `package-lock.json` DEVE ser removido da raiz e de subpastas.
- **FR-002**: Todo `package.json` com dependências DEVE estar dentro do
  `pnpm-workspace.yaml` ou ser convertido em script sem dependências npm.
- **FR-003**: Assets de mídia do frontend (vídeos, imagens) DEVEM residir em
  `apps/web/public/`, não em `packages/`.
- **FR-004**: Cada workspace em `apps/*` e `packages/*` DEVE ter scripts
  padronizados: `build`, `lint`, `typecheck`, `clean` (mínimo); `test` onde
  aplicável.
- **FR-005**: `packages/eslint-config` DEVE ter scripts noop ou reais para
  `lint` e `typecheck` para participar do pipeline Turbo.
- **FR-006**: Configuração TypeScript transversal DEVE ser centralizada na raiz
  (não em `apps/tsconfig.workspace.json`); paths DEVEM seguir convenção única.
- **FR-007**: Nomenclatura e descrições em `package.json` DEVEM refletir
  "Coast Academy", não nomes legados ("Empire Trading", "Felix").
- **FR-008**: Artefatos temporários de desenvolvimento (TASK_COMPLETION_SUMMARY,
  logs Docker) NÃO DEVEM permanecer em workspaces publicáveis.
- **FR-009**: Scripts utilitários de manutenção (`fix-lint.sh`) DEVEM residir em
  `infra/scripts/` com atalhos documentados na raiz quando necessário.
- **FR-010**: `.gitignore` DEVE impedir recorrência de artefatos fantasmas
  (lockfiles npm, logs Docker, temporários Cursor/Spec Kit).
- **FR-011**: `turbo.json` DEVE documentar ou configurar workspaces sem task
  específica (ex.: `test:e2e` apenas em `apps/web`).
- **FR-012**: Após padronização, `pnpm turbo run build lint typecheck` DEVE
  completar sem erros estruturais em cold clone com `pnpm install`.

### Key Entities

- **Workspace**: Pacote PNPM em `apps/*` ou `packages/*` com `package.json` próprio.
- **Pacote Órfão**: `package.json` com dependências fora do `pnpm-workspace.yaml`.
- **Lockfile Fantasma**: `package-lock.json` em projeto que usa PNPM.
- **Asset Fora do Lugar**: Arquivo binário ou mídia em pasta incorreta do monorepo.
- **Script Padronizado**: Comando Turbo (`build`, `lint`, `typecheck`, `test`)
  presente e com comportamento documentado em cada workspace.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Zero arquivos `package-lock.json` no repositório após implementação.
- **SC-002**: 100% dos workspaces (11) possuem scripts `lint` e `typecheck` definidos.
- **SC-003**: Zero assets binários (> 100 KB) em `packages/` fora de `dist/`.
- **SC-004**: `pnpm turbo run build lint typecheck` completa com sucesso após
  `pnpm install` em ambiente limpo.
- **SC-005**: Um desenvolvedor novo localiza qualquer app, package ou script
  infra em menos de 2 minutos seguindo convenção documentada.
- **SC-006**: Zero referências a "Empire Trading" ou "Felix" em `package.json`
  de workspaces.
- **SC-007**: Config TypeScript transversal em um único arquivo na raiz,
  referenciado por todos os workspaces.

## Plano de Melhoria Estrutural (escopo da implementação)

### Fase 1 — Limpeza imediata (baixo risco)

| Ação      | Item                                                     |
| --------- | -------------------------------------------------------- |
| Remover   | `package-lock.json` (raiz e `infra/scripts/otel-smoke/`) |
| Mover     | `packages/background.mp4` → `apps/web/public/videos/`    |
| Remover   | `packages/ui/TASK_COMPLETION_SUMMARY.md`                 |
| Mover     | `fix-lint.sh` → `infra/scripts/fix-lint.sh`              |
| Atualizar | `.gitignore` com `package-lock.json` e artefatos Docker  |

### Fase 2 — Integridade do workspace

| Ação                 | Item                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| Absorver ou eliminar | `infra/scripts/otel-smoke/` como pacote npm isolado                        |
| Adicionar scripts    | `packages/eslint-config`: `lint` e `typecheck` noop                        |
| Adicionar scripts    | `packages/shared-types`, `packages/observability`: `test` (vitest ou noop) |
| Corrigir branding    | `packages/ui/package.json` descrição → Coast Academy                       |

### Fase 3 — Padronização TypeScript

| Ação    | Item                                                                     |
| ------- | ------------------------------------------------------------------------ |
| Criar   | `tsconfig.paths.json` na raiz com paths para `src/` dos packages         |
| Migrar  | Conteúdo de `apps/tsconfig.workspace.json` → raiz                        |
| Remover | `apps/tsconfig.workspace.json` após migração                             |
| Alinhar | Nest services: avaliar `tsc -b` vs `tsc --noEmit` com project references |

### Fase 4 — Documentação e validação

| Ação      | Item                                                           |
| --------- | -------------------------------------------------------------- |
| Atualizar | `README.md` com mapa de pastas e política de lockfile          |
| Adicionar | `docs/CONTRIBUTING.md` seção "Estrutura do monorepo"           |
| Validar   | CI executa `pnpm turbo run build lint typecheck` sem regressão |

## Assumptions

- `start.sh` e `start-all.sh` na raiz permanecem como atalhos documentados.
- `docs/specs/` e `.kiro/specs/` não são migrados nesta feature.
- `shamefully-hoist=true` permanece por ora (mudança requer validação de build Docker).
- `supabase/` na raiz está correto (fora do workspace PNPM por design).
- Constitution v1.0.0 (Princípio I) valida estrutura atual de `apps/` + `packages/`.

## Referências

| Documento                                  | Papel                                       |
| ------------------------------------------ | ------------------------------------------- |
| `docs/adr/0001-monorepo-pnpm-turborepo.md` | Decisão arquitetural base                   |
| `.specify/memory/constitution.md`          | Princípio I — Monorepo com Bounded Contexts |
| `specs/001-product-vision-backlog/spec.md` | Baseline de produto                         |
| `specs/002-baseline-reality-sync/spec.md`  | Auditoria código vs. docs                   |
