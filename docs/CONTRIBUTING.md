# Contribuindo — Felix Empire Trading

Bem-vindo. Este guia mostra como rodar o projeto, padrões de código e como abrir PR.

## Pré-requisitos

- **Node 20 LTS** (use `nvm use` na raiz; existe `.nvmrc`)
- **pnpm 9.x** (`corepack enable && corepack prepare pnpm@9.12.0 --activate`)
- **Docker Desktop** com Compose v2
- **Supabase CLI** (para banco local): https://supabase.com/docs/guides/cli

## Setup local

```bash
git clone <repo>
cd Felix
cp .env.example .env.local            # preencha conforme necessário
pnpm install
pnpm -w lint && pnpm -w typecheck      # sanity check
```

### Subir o banco local (opcional)

```bash
cd supabase
supabase start                        # sobe Postgres em :54322 e Studio em :54323
supabase db reset                     # aplica migrations + seeds
```

### Subir o frontend + serviços (Compose)

```bash
docker compose up traefik web        # web em http://localhost
# para incluir LLM local para o RAG:
docker compose --profile llm up
```

## Padrões

### Branching

- `main` → sempre verde e deployável.
- `feat/<scope>-<short-name>`, `fix/<scope>-<short-name>`, `docs/...`, `chore/...`.

### Commits — Conventional Commits

```
feat(assessment): scoring server-side com transacao
fix(web): bug de shuffle ao recarregar tentativa
docs(adr): adicionar 0009 sobre cache de embeddings
```

Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `security`.

Escopos sugeridos: `web`, `gateway`, `course`, `assessment`, `certificate`, `ranking`, `rag`, `notification`, `shared`, `ui`, `infra`, `supabase`, `docs`, `ci`, `deps`.

### PRs

- Pequenos e focados (idealmente < 400 linhas).
- Descrição com **o quê** + **por quê** + **como testar**.
- CI verde obrigatório.
- Decisões não-triviais → adicione uma ADR em `docs/adr/`.

### Código

- TypeScript estrito; zero `any` em código novo.
- DTOs sempre via Zod em `@felix/shared-types`.
- Server: nunca exponha `is_correct` em rota pública.
- Frontend: respeite WCAG AA; teste com axe.

## Scripts úteis (raiz)

```bash
pnpm dev          # tudo em watch (web + serviços com filtros)
pnpm build        # build incremental via turbo
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm format
```
