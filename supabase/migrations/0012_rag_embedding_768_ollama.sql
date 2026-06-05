-- Ollama nomic-embed-text usa 768 dimensões (não 1536 do OpenAI text-embedding-3-small).
drop index if exists public.knowledge_chunks_embedding_idx;

alter table public.knowledge_chunks
  alter column embedding type vector(768)
  using (
    case
      when embedding is null then null
      else embedding::text::vector(768)
    end
  );

create index knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 50);
