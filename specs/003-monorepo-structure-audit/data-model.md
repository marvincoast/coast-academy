# Data Model: Entidades Estruturais do Monorepo

**Feature**: 003-monorepo-structure-audit | **Date**: 2026-06-14

Este documento descreve as entidades conceituais da **estrutura do monorepo**, não entidades de domínio de negócio (curso, certificado, etc.).

## Entity: Workspace

Pacote PNPM registrado em `pnpm-workspace.yaml`.

| Campo               | Tipo    | Regras                                     |
| ------------------- | ------- | ------------------------------------------ |
| `name`              | string  | Escopo `@coast-academy/*` obrigatório      |
| `location`          | path    | `apps/*` ou `packages/*` apenas            |
| `private`           | boolean | Sempre `true` (projeto fechado)            |
| `scripts.build`     | script  | Obrigatório (real ou noop)                 |
| `scripts.lint`      | script  | Obrigatório (real ou noop)                 |
| `scripts.typecheck` | script  | Obrigatório (real ou noop)                 |
| `scripts.clean`     | script  | Obrigatório (real ou noop)                 |
| `scripts.test`      | script  | Obrigatório onde aplicável; noop permitido |
| `scripts.dev`       | script  | Opcional (apps only)                       |

### Instâncias (estado alvo — 12 workspaces)

| Workspace                             | Location                    | test                | Notas                |
| ------------------------------------- | --------------------------- | ------------------- | -------------------- |
| `@coast-academy/web`                  | `apps/web`                  | vitest + playwright | Único com `test:e2e` |
| `@coast-academy/course-service`       | `apps/course-service`       | jest                |                      |
| `@coast-academy/assessment-service`   | `apps/assessment-service`   | jest                |                      |
| `@coast-academy/certificate-service`  | `apps/certificate-service`  | jest                |                      |
| `@coast-academy/ranking-service`      | `apps/ranking-service`      | jest                |                      |
| `@coast-academy/rag-service`          | `apps/rag-service`          | jest                |                      |
| `@coast-academy/notification-service` | `apps/notification-service` | jest                |                      |
| `@coast-academy/shared-types`         | `packages/shared-types`     | noop → vitest       | Zod schemas          |
| `@coast-academy/ui`                   | `packages/ui`               | vitest              | Design tokens        |
| `@coast-academy/eslint-config`        | `packages/eslint-config`    | N/A                 | lint/typecheck noop  |
| `@coast-academy/observability`        | `packages/observability`    | noop → vitest       | OTEL/Pino            |
| `@coast-academy/otel-smoke`           | `packages/otel-smoke`       | N/A                 | Smoke OTLP only      |

### Relacionamentos

```text
Workspace ──dependsOn──► Workspace (via workspace:* deps)
Workspace ──extends──► tsconfig.base.json + tsconfig.paths.json
Workspace ──executes──► Turbo Task (build|lint|typecheck|test|clean)
```

---

## Entity: Pacote Órfão

`package.json` com dependências npm **fora** do `pnpm-workspace.yaml`.

| Campo        | Tipo | Regras                                     |
| ------------ | ---- | ------------------------------------------ |
| `location`   | path | Qualquer path não listado em workspace     |
| `lockfile`   | file | Geralmente `package-lock.json` coexistente |
| `resolution` | enum | `absorb` \| `inline` \| `delete`           |

### Instâncias (estado atual → resolução)

| Location                    | Status      | Resolução                                            |
| --------------------------- | ----------- | ---------------------------------------------------- |
| `infra/scripts/otel-smoke/` | Órfão       | **absorb** → `packages/otel-smoke`                   |
| `supabase/`                 | Intencional | **N/A** — CLI Supabase, fora do workspace por design |

---

## Entity: Lockfile Fantasma

Arquivo de lock de gerenciador diferente do oficial (pnpm).

| Campo      | Tipo    | Regras                                                      |
| ---------- | ------- | ----------------------------------------------------------- |
| `type`     | enum    | `package-lock.json` \| `yarn.lock` \| `npm-shrinkwrap.json` |
| `location` | path    | Qualquer path no repo                                       |
| `allowed`  | boolean | Sempre `false`                                              |

### Instâncias (estado atual)

| File                | Location                    | Ação                 |
| ------------------- | --------------------------- | -------------------- |
| `package-lock.json` | Raiz                        | Remover + gitignore  |
| `package-lock.json` | `infra/scripts/otel-smoke/` | Remover com migração |

**Estado alvo**: Zero lockfiles exceto `pnpm-lock.yaml`.

---

## Entity: Asset Fora do Lugar

Arquivo binário ou mídia em pasta incorreta do monorepo.

| Campo              | Tipo     | Regras                                      |
| ------------------ | -------- | ------------------------------------------- |
| `path`             | path     | Localização atual                           |
| `size_bytes`       | number   | > 100 KB em `packages/` é violação (SC-003) |
| `correct_location` | path     | Destino conforme tipo                       |
| `consumers`        | string[] | Workspaces que referenciam                  |

### Instâncias

| Asset            | Current                   | Target                                  | Consumer                   |
| ---------------- | ------------------------- | --------------------------------------- | -------------------------- |
| `background.mp4` | `packages/background.mp4` | `apps/web/public/videos/background.mp4` | `LoginVideoBackground.tsx` |

### Regras de colocação

| Tipo de asset                  | Localização correta                           |
| ------------------------------ | --------------------------------------------- |
| Mídia frontend (vídeo, imagem) | `apps/web/public/**`                          |
| Design tokens / componentes    | `packages/ui/src/**`                          |
| Tipos compartilhados           | `packages/shared-types/src/**`                |
| Scripts infra                  | `infra/scripts/**` (sem package.json próprio) |
| Migrations DB                  | `supabase/migrations/**`                      |

---

## Entity: Script Padronizado

Comando Turbo executável em cada workspace.

| Campo            | Tipo   | Valores                                                                      |
| ---------------- | ------ | ---------------------------------------------------------------------------- |
| `name`           | enum   | `build` \| `lint` \| `typecheck` \| `test` \| `clean` \| `dev` \| `test:e2e` |
| `implementation` | enum   | `real` \| `noop`                                                             |
| `turbo_task`     | string | Nome da task em `turbo.json`                                                 |

### Matriz de conformidade (estado alvo)

| Script    | Apps (7) | shared-types | ui   | eslint-config | observability | otel-smoke |
| --------- | -------- | ------------ | ---- | ------------- | ------------- | ---------- |
| build     | real     | real         | real | noop          | real          | noop       |
| lint      | real     | real         | real | noop          | real          | noop       |
| typecheck | real     | real         | real | noop          | real          | noop       |
| test      | real\*   | noop         | real | —             | noop          | —          |
| clean     | real     | real         | real | noop          | real          | noop       |
| test:e2e  | web only | —            | —    | —             | —             | —          |

\*NestJS apps: `jest --passWithNoTests`

---

## Entity: Config TypeScript Transversal

Arquivo de configuração compartilhado na raiz.

| Campo                          | Tipo | Regras                                   |
| ------------------------------ | ---- | ---------------------------------------- |
| `tsconfig.base.json`           | file | Strict mode completo (existente)         |
| `tsconfig.paths.json`          | file | **Novo** — paths workspace centralizados |
| `apps/tsconfig.workspace.json` | file | **Remover** após migração                |

### State Transition

```text
[Atual]
  apps/tsconfig.workspace.json (dist paths)
  apps/web/tsconfig.json (src paths, inline)

[Alvo]
  tsconfig.paths.json (raiz, dual profile)
  apps/*/tsconfig.json extends tsconfig.paths.json
  apps/tsconfig.workspace.json DELETED
```

---

## Entity: Artefato Temporário

Documento ou log de desenvolvimento que não pertence a workspace publicável.

| Campo      | Tipo | Regras                                                            |
| ---------- | ---- | ----------------------------------------------------------------- |
| `path`     | path | Localização                                                       |
| `category` | enum | `dev-summary` \| `docker-log` \| `cursor-temp` \| `legacy-script` |

### Instâncias (remoção)

| Path                                     | Category      | Ação                                     |
| ---------------------------------------- | ------------- | ---------------------------------------- |
| `packages/ui/TASK_COMPLETION_SUMMARY.md` | dev-summary   | Delete                                   |
| `fix-lint.sh`                            | legacy-script | Delete (Felix migration)                 |
| Raiz: `=`, `CACHED`, `Containers`, etc.  | docker-log    | Delete (artefatos acidentais git status) |

---

## Validation Rules Summary

| Rule ID | Entity              | Constraint                                                     |
| ------- | ------------------- | -------------------------------------------------------------- |
| VR-001  | Lockfile Fantasma   | Zero `package-lock.json` no repo                               |
| VR-002  | Pacote Órfão        | Zero package.json com deps fora workspace                      |
| VR-003  | Asset Fora do Lugar | Zero binários > 100KB em `packages/` (exceto dist/)            |
| VR-004  | Script Padronizado  | 100% workspaces com lint + typecheck                           |
| VR-005  | Workspace           | Nomenclatura `@coast-academy/*`; zero "Empire Trading"/"Felix" |
| VR-006  | Config TS           | Single `tsconfig.paths.json` na raiz (SC-007)                  |
