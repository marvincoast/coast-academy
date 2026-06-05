# Architecture Decision Records (ADRs)

Toda decisão arquitetural não-trivial vira um ADR aqui, no formato [MADR](https://adr.github.io/madr/).

## Convenção

- Nome do arquivo: `NNNN-titulo-curto.md` com `NNNN` sequencial e zero-padded.
- Status: `Proposed` → `Accepted` → eventualmente `Superseded by NNNN`.
- Mudanças em prompts do RAG **sempre** geram uma ADR.

## Índice

| Nº | Título | Status |
|----|--------|--------|
| 0001 | Monorepo com pnpm + Turborepo | Accepted |
| 0002 | Supabase como source of truth | Accepted |
| 0003 | NestJS para microserviços | Accepted |
| 0004 | Traefik como API Gateway | Accepted |
| 0005 | pgvector para RAG | Accepted |
| 0006 | @react-pdf/renderer para certificado | Proposed |
| 0007 | Prompts versionados como arquivos | Accepted |
| 0008 | Zod shared-types cross-stack | Accepted |
