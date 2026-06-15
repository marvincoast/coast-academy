# Contract: Turbo Pipeline

**Feature**: 003-monorepo-structure-audit | **Version**: 1.0 | **Date**: 2026-06-14

Contrato que define o comportamento esperado do pipeline Turborepo após padronização.

## Root Commands

Definidos em `package.json` raiz:

| Command          | Turbo Task            | Scope                         |
| ---------------- | --------------------- | ----------------------------- |
| `pnpm build`     | `turbo run build`     | All workspaces                |
| `pnpm lint`      | `turbo run lint`      | All workspaces                |
| `pnpm typecheck` | `turbo run typecheck` | All workspaces                |
| `pnpm test`      | `turbo run test`      | Workspaces with `test` script |
| `pnpm test:e2e`  | `turbo run test:e2e`  | `apps/web` only               |
| `pnpm clean`     | `turbo run clean`     | All workspaces                |

## Task Definitions (`turbo.json`)

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "lint": { "outputs": [] },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["^build"],
      "cache": false,
      "outputs": ["playwright-report/**", "test-results/**"]
    },
    "clean": { "cache": false }
  }
}
```

## Workspace Participation Matrix

| Workspace              | build   | lint      | typecheck | test      | test:e2e      | clean   |
| ---------------------- | ------- | --------- | --------- | --------- | ------------- | ------- |
| apps/web               | ✅      | ✅        | ✅        | ✅ vitest | ✅ playwright | ✅      |
| apps/\*-service (×6)   | ✅ nest | ✅ eslint | ✅ tsc    | ✅ jest   | —             | ✅      |
| packages/shared-types  | ✅ tsc  | ✅        | ✅        | ⚪ noop   | —             | ✅      |
| packages/ui            | ✅ tsc  | ✅        | ✅        | ✅ vitest | —             | ✅      |
| packages/eslint-config | ⚪ noop | ⚪ noop   | ⚪ noop   | —         | —             | ⚪ noop |
| packages/observability | ✅ tsc  | ✅        | ✅        | ⚪ noop   | —             | ✅      |
| packages/otel-smoke    | ⚪ noop | ⚪ noop   | ⚪ noop   | —         | —             | ⚪ noop |

Legend: ✅ = script real | ⚪ = noop explícito | — = script ausente (task não aplicável)

## Task-Specific Rules

### build

- Packages (`shared-types`, `ui`, `observability`) DEVEM emitir `dist/**`
- Apps NestJS DEVEM emitir `dist/**` via `nest build`
- `eslint-config` e `otel-smoke`: noop (sem output compilável)

### typecheck

- **Depends on `^build`**: packages devem estar compilados antes do typecheck de apps NestJS
- Web (`apps/web`) usa paths para `packages/ui/src` — typecheck web funciona sem build de ui em dev, mas CI executa build chain completa
- Cold clone validation: `pnpm install && pnpm turbo run build typecheck` MUST pass

### test

- Workspaces sem testes usam noop — Turbo executa sem falha
- `jest --passWithNoTests` em serviços NestJS é aceitável até testes reais

### test:e2e

- **Exclusive to `apps/web`** — outros workspaces não definem script
- Requer build prévio de dependências (`dependsOn: ^build`)
- Não executado em CI estrutural desta feature (validação manual/local)

### lint

- Todos os 12 workspaces participam (incluindo noop em eslint-config e otel-smoke)
- Zero warnings de "package has no lint script"

## CI Contract (`.github/workflows/ci.yml`)

Pipeline CI DEVE executar, no mínimo:

```yaml
- run: pnpm turbo run lint typecheck test
- run: pnpm turbo run build
```

Ordem pode variar; todas as tasks DEVEM completar sem erro estrutural pós-padronização.

## Failure Modes

| Symptom                | Cause                    | Fix                                    |
| ---------------------- | ------------------------ | -------------------------------------- |
| `Missing script: lint` | Workspace sem script     | Add real or noop script                |
| Typecheck fails cold   | dist/ missing for NestJS | Run `pnpm turbo run build` first       |
| Turbo skips package    | No matching script       | Add noop or exclude with documentation |
| npm lockfile in CI     | Accidental npm install   | Remove lockfile; enforce pnpm only     |

## Validation Commands

```bash
# Full structural pipeline (SC-004)
pnpm install
pnpm turbo run build lint typecheck

# Verify all workspaces participate in lint
pnpm turbo run lint --dry-run=json | jq '.tasks | keys'

# Test pipeline (noop-safe)
pnpm turbo run test
```

Expected: exit code 0 for all commands.

## Global Dependencies

Turbo tracks these as global cache invalidators:

```
.env, .env.local, tsconfig.base.json
```

Após criar `tsconfig.paths.json`, considerar adicioná-lo a `globalDependencies` em implementação (task opcional Fase C).
