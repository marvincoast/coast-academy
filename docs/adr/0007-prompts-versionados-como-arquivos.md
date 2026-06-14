# 0007 — Prompts versionados como arquivos

- Status: Accepted
- Data: 2026-05-16

## Contexto

Prompts do RAG são código crítico do produto: pequenas mudanças geram drift de comportamento difícil de detectar. Precisamos versionamento, revisão de PR e testes de regressão.

## Decisão

Cada prompt fica em arquivo `*.vN.md` em `apps/rag-service/prompts/`, organizado em `system/`, `tasks/`, `fewshot/`, `tests/`. Regras:

1. Arquivos publicados são **imutáveis** (nunca editar; criar `v(N+1)`).
2. Cada mudança exige **ADR** correspondente.
3. Cada `system/*.vN.md` requer casos em `tests/regression.cases.json`.
4. CI roda a suíte de regressão em cada PR que toca `prompts/`.

## Consequências

- ✅ Diff de prompt é revisável em PR.
- ✅ Rollback trivial: trocar `v2` por `v1` no orquestrador.
- ✅ Telemetria pode atribuir respostas a versão exata.
- ⚠️ Maior overhead operacional (ADR + teste), mas pago pela rastreabilidade.

## Alternativas consideradas

- Prompts em string TS: viola separação, dificulta diff e revisão.
- Prompts em banco: difícil versionar e revisar em PR.
