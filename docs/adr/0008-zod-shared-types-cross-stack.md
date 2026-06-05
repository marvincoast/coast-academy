# 0008 — Zod shared-types cross-stack

- Status: Accepted
- Data: 2026-05-16

## Contexto

Frontend e backend precisam concordar sobre formatos de DTO (questão pública sem gabarito, AttemptResult, RankingEntry, etc.). Tipagem TS sem validação em runtime não cobre o backend.

## Decisão

Centralizar schemas em `packages/shared-types/src/domain/*.ts` usando **Zod**. Exportar tanto o `Schema` quanto o `type` inferido. Frontend usa para parse de respostas; backend usa em pipes de validação. Eventualmente geramos OpenAPI a partir desses schemas via `@asteasolutions/zod-to-openapi`.

## Consequências

- ✅ Mesmo contrato em runtime e tipo TS.
- ✅ Refactors são rastreáveis (mudar um schema quebra o build de quem o usa).
- ✅ Validação automática em endpoints e em respostas externas.
- ⚠️ Bundle do frontend cresce um pouco (Zod ~13kb gz).

## Alternativas consideradas

- **class-validator + class-transformer**: padrão NestJS, mas não roda no frontend.
- **io-ts**: ergonomia inferior ao Zod.
- **TypeBox**: ótima opção, mas Zod tem ecossistema mais maduro.
