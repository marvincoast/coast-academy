# rag-service

Tutor contextual Coast Academy: ingestão de glossário/aulas/referências, embeddings via `pgvector`, retrieval híbrido e respostas **com citação obrigatória**.

Implementação completa na **Etapa 7** do plano.

## Endpoints planejados

- `POST /api/rag/ask` — pergunta do usuário; resposta cita `<source id="...">`.
- `POST /api/rag/ingest` — ingestão administrativa de documentos (role admin).
- `GET /api/rag/sources` — lista de fontes indexadas (público para fins de transparência).

## Prompts versionados

Em [`prompts/`](./prompts) — arquivos imutáveis com `v1`, `v2`, etc.
Mudanças de prompt exigem nova versão **e** uma ADR.

## Guardrails

- Escopo restrito (tape reading dólar BRL).
- Sem recomendação de trade ao vivo (filtro pós-resposta).
- Fallback honesto quando não há contexto suficiente.
- Suíte de regressão em `tests/regression.cases.json` roda no CI.
