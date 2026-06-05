# 0005 — pgvector para RAG

- Status: Accepted
- Data: 2026-05-16

## Contexto

O Tutor (rag-service) precisa armazenar embeddings de chunks de aulas e referências, com busca por similaridade e (idealmente) hybrid search.

## Decisão

Usar **pgvector** dentro do Postgres do Supabase. Embeddings com `vector(1536)` (compatível com `text-embedding-3-small`). Hybrid search via combinação de vetorial + `tsvector` (BM25-like).

## Consequências

- ✅ Sem dependência adicional (Qdrant, Pinecone, Weaviate).
- ✅ Joins naturais com `rag_documents`, `lessons`, `modules`.
- ✅ Backups unificados com o resto do schema.
- ⚠️ Para >1M chunks, talvez seja necessário index `ivfflat` ou `hnsw` ajustado.
- ⚠️ Latência aceitável para o volume do MVP (≪ 100k chunks).

## Alternativas consideradas

- **Qdrant**: ótima performance mas adiciona um serviço a operar.
- **Pinecone**: lock-in cloud + custo.
