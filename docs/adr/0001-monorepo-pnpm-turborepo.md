# 0001 — Monorepo com pnpm + Turborepo

- Status: Accepted
- Data: 2026-05-16
- Decisores: Equipe Felix Empire Trading

## Contexto

Precisamos coordenar um frontend React 19 e 6 microserviços NestJS que compartilham tipos (Zod), tema (design tokens) e configuração de lint. Precisamos de instalação rápida, cache de build incremental e pipelines de CI eficientes.

## Decisão

Usar **pnpm workspaces** (instalação rápida, deduplicação eficiente, `workspace:*` para tipos compartilhados) com **Turborepo** orquestrando tarefas (`build`, `lint`, `test`, `typecheck`) com cache local e remoto opcional.

## Consequências

- ✅ Compartilhamento natural via `@felix/shared-types`, `@felix/ui`, `@felix/eslint-config`.
- ✅ Build incremental e paralelo via Turbo.
- ✅ CI executa só o que mudou (`turbo run ... --filter=...[origin/main]`).
- ⚠️ Curva de aprendizado para quem nunca usou pnpm/turbo.
- ⚠️ Necessário cuidar de `pnpm-lock.yaml` para evitar drift.

## Alternativas consideradas

- **npm workspaces + Nx**: Nx é mais opinativo; tradeoff de complexidade não vale para 7 packages.
- **Yarn Berry**: PnP gera fricção com algumas libs (ex.: Vite plugins).
- **Multi-repo**: complica versionamento de tipos compartilhados.
