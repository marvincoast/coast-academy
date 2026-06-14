# Contract: Workspace Structure

**Feature**: 003-monorepo-structure-audit | **Version**: 1.0 | **Date**: 2026-06-14

Contrato que define a estrutura válida de workspaces no monorepo Coast Academy.

## Registration

Todo workspace DEVE ser registrado em `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Paths fora destes globs **NÃO** podem conter `package.json` com campo `dependencies` ou `devDependencies` não vazio.

## Naming

| Campo         | Pattern                             | Example                                 |
| ------------- | ----------------------------------- | --------------------------------------- |
| `name`        | `@coast-academy/<kebab-case>`       | `@coast-academy/course-service`         |
| `description` | Português, menciona "Coast Academy" | `"Microserviço de curso Coast Academy"` |
| `version`     | Semver `0.x.y`                      | `"0.1.0"`                               |
| `private`     | `true`                              | Sempre                                  |

**Proibido** em `description` ou `name`: "Empire Trading", "Felix", nomes de projetos legados.

## Required Scripts

Cada workspace em `apps/*` e `packages/*` DEVE definir em `package.json`:

```json
{
  "scripts": {
    "build": "<real|noop>",
    "lint": "<real|noop>",
    "typecheck": "<real|noop>",
    "clean": "<real|noop>"
  }
}
```

Workspaces com código testável DEVEM incluir `"test"`. Workspaces sem testes DEVEM usar noop explícito:

```json
"test": "echo 'no tests yet'"
```

### Noop convention

Scripts noop DEVEM imprimir mensagem identificável:

```json
"lint": "echo '@coast-academy/eslint-config: lint noop'"
```

## Dependency Rules

| Rule     | Description                                             |
| -------- | ------------------------------------------------------- |
| W-DEP-01 | Dependências internas usam `"workspace:*"`              |
| W-DEP-02 | Apps importam packages; packages NÃO importam apps      |
| W-DEP-03 | `eslint-config` é devDependency only                    |
| W-DEP-04 | Zero dependências npm instaladas fora do workspace root |

## TypeScript Extension

Workspaces TypeScript DEVEM estender configs da raiz:

```json
{
  "extends": ["../../tsconfig.base.json", "../../tsconfig.paths.json"]
}
```

Ajustes de `paths` locais (ex.: `@/*` no web) são permitidos **além** dos paths raiz.

## Lockfile Policy

| Allowed                 | Forbidden             |
| ----------------------- | --------------------- |
| `pnpm-lock.yaml` (raiz) | `package-lock.json`   |
|                         | `yarn.lock`           |
|                         | `npm-shrinkwrap.json` |

## Asset Placement

| Asset type                       | Location                       |
| -------------------------------- | ------------------------------ |
| Frontend static (images, videos) | `apps/web/public/**`           |
| Shared TypeScript source         | `packages/*/src/**`            |
| ESLint/Prettier config           | `packages/eslint-config/**`    |
| Infra scripts (shell)            | `infra/scripts/**`             |
| Infra smoke with npm deps        | `packages/<name>/` (workspace) |

## Exclusions (intentional non-workspaces)

| Path                              | Reason                       |
| --------------------------------- | ---------------------------- |
| `supabase/`                       | Supabase CLI project         |
| `infra/docker/`, `infra/traefik/` | Config only, no package.json |
| `.specify/`, `.cursor/`           | Tooling (gitignored)         |

## Compliance Check

```bash
# Zero npm lockfiles
find . -name 'package-lock.json' -not -path './node_modules/*'

# All workspaces have lint script
pnpm -r exec node -e "const p=require('./package.json'); if(!p.scripts?.lint) throw new Error(p.name)"

# Zero legacy branding
rg -i 'empire trading|felix' apps/*/package.json packages/*/package.json
```

Expected: all commands exit 0 with empty output.
