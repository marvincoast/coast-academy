# Quickstart: Validação da Limpeza do Monorepo

**Feature**: 003-monorepo-structure-audit | **Date**: 2026-06-14

Guia de validação end-to-end após implementação das 4 fases do plano. Referencia [data-model.md](./data-model.md) e [contracts/](./contracts/) sem duplicar detalhes.

## Prerequisites

- Node.js ≥ 20
- pnpm 9.12 (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- Git clean ou branch `003-monorepo-structure-audit`
- WSL ou Linux/macOS (scripts bash em `infra/scripts/`)

## Setup

```bash
git clone <repo-url> coast-academy-clean-test
cd coast-academy-clean-test
git checkout 003-monorepo-structure-audit  # após implementação

pnpm install
```

## Validation Scenarios

### SC-001 — Zero lockfiles npm

**Given** implementação completa da Fase A  
**When** busca por lockfiles npm:

```bash
find . -name 'package-lock.json' -not -path './node_modules/*'
find . -name 'yarn.lock' -not -path './node_modules/*'
```

**Then** ambos retornam vazio (exit 0, sem output).

---

### SC-002 — Scripts lint e typecheck em 100% dos workspaces

**Given** Fase B implementada  
**When**:

```bash
pnpm turbo run lint --dry-run 2>&1 | tee /tmp/turbo-lint-dry.log
pnpm turbo run typecheck --dry-run 2>&1 | tee /tmp/turbo-typecheck-dry.log
```

**Then** 12 workspaces listados; nenhum "missing script" error.

Verificação manual por workspace:

```bash
for pkg in apps/* packages/*; do
  name=$(node -p "require('./$pkg/package.json').name")
  lint=$(node -p "require('./$pkg/package.json').scripts?.lint || 'MISSING'")
  tc=$(node -p "require('./$pkg/package.json').scripts?.typecheck || 'MISSING'")
  echo "$name lint=$lint typecheck=$tc"
done
```

**Then** zero `MISSING` values.

---

### SC-003 — Zero assets binários grandes em packages/

**Given** Fase A (move background.mp4)  
**When**:

```bash
find packages/ -type f -size +100k -not -path '*/dist/*' -not -path '*/node_modules/*'
```

**Then** vazio.

---

### SC-004 — Pipeline Turbo completo em cold clone

**Given** clone limpo com `pnpm install`  
**When**:

```bash
pnpm turbo run build lint typecheck
```

**Then** exit code 0; sem erros estruturais.

Opcional — test suite:

```bash
pnpm turbo run test
```

**Then** exit code 0 (noop scripts incluídos).

---

### SC-005 — Onboarding: estrutura localizável em < 2 min

**Given** README atualizado (Fase D)  
**When** desenvolvedor novo lê `README.md` seção estrutura  
**Then** consegue responder:

| Pergunta                  | Resposta esperada                                                        |
| ------------------------- | ------------------------------------------------------------------------ |
| Onde ficam apps?          | `apps/` (web + 6 NestJS)                                                 |
| Onde ficam packages?      | `packages/` (shared-types, ui, eslint-config, observability, otel-smoke) |
| Onde ficam scripts infra? | `infra/scripts/`                                                         |
| Qual lockfile usar?       | `pnpm-lock.yaml` exclusivamente                                          |
| Como subir local?         | `pnpm start:local` ou `./start.sh`                                       |

---

### SC-006 — Zero branding legado

**Given** Fase B (branding ui)  
**When**:

```bash
rg -i 'empire trading|felix' apps/*/package.json packages/*/package.json
```

**Then** zero matches.

---

### SC-007 — Config TS transversal na raiz

**Given** Fase C implementada  
**When**:

```bash
test -f tsconfig.paths.json && echo "OK: tsconfig.paths.json exists"
test ! -f apps/tsconfig.workspace.json && echo "OK: legacy config removed"
rg 'tsconfig.paths.json' apps/*/tsconfig.json packages/*/tsconfig.json
```

**Then** `tsconfig.paths.json` existe; `apps/tsconfig.workspace.json` ausente; workspaces referenciam paths raiz.

---

## User Story Validation

### US-1 — Desenvolvedor novo entende a estrutura

1. Listar raiz: confirmar apenas `pnpm-lock.yaml` (sem `package-lock.json`)
2. Navegar `apps/web/public/videos/` → encontrar `background.mp4`
3. `pnpm install` → sem subpastas `node_modules` isoladas em `infra/`

### US-2 — Pipeline Turbo uniforme

```bash
pnpm turbo run lint typecheck test build
```

Todos completam; eslint-config e otel-smoke executam noop sem falha.

### US-3 — TypeScript paths consistentes

Cold typecheck após build:

```bash
pnpm turbo run build --filter=@coast-academy/shared-types --filter=@coast-academy/observability
pnpm turbo run typecheck --filter=@coast-academy/course-service
pnpm turbo run typecheck --filter=@coast-academy/web
```

Todos passam.

---

## Smoke: Observabilidade (otel-smoke migration)

**Prerequisites**: Docker stack obs running (`./infra/scripts/obs-up.sh`)

```bash
./infra/scripts/verify-obs-t07.sh
```

**Then** script usa pnpm workspace (não npm install em subpasta); trace aparece no Tempo.

---

## Smoke: Login video (asset migration)

**Prerequisites**: `pnpm --filter @coast-academy/web dev`

1. Abrir `/login` no browser
2. **Then** vídeo de fundo carrega (ou fallback gradient se reduced-motion)
3. Network tab: request para `/videos/background.mp4` (não cross-package import)

---

## Regression Checklist

| Check           | Command                                    | Expected |
| --------------- | ------------------------------------------ | -------- |
| Lint            | `pnpm lint`                                | ✅       |
| Typecheck       | `pnpm typecheck`                           | ✅       |
| Build           | `pnpm build`                               | ✅       |
| Test            | `pnpm test`                                | ✅       |
| Format          | `pnpm format:check`                        | ✅       |
| CI local mirror | `pnpm turbo run lint typecheck test build` | ✅       |

---

## Troubleshooting

| Problem                                                 | Solution                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| NestJS typecheck fails on `@coast-academy/shared-types` | Run `pnpm turbo run build --filter=@coast-academy/shared-types` first |
| verify-obs-t07 npm install                              | Update to pnpm filter (Fase B1-B3)                                    |
| Video 404 on login                                      | Confirm file at `apps/web/public/videos/background.mp4`               |
| Turbo skips eslint-config                               | Add noop lint script (Fase B4)                                        |

## Related Documents

- [plan.md](./plan.md) — fases de implementação
- [research.md](./research.md) — decisões técnicas
- [contracts/workspace-contract.md](./contracts/workspace-contract.md)
- [contracts/turbo-pipeline-contract.md](./contracts/turbo-pipeline-contract.md)
