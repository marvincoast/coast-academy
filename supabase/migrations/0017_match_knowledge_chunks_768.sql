-- Alinha match_knowledge_chunks com embeddings Ollama (768 dims, migration 0012).
drop function if exists public.match_knowledge_chunks(vector, float, int);

create or replace function public.match_knowledge_chunks(
  query_embedding  vector(768),
  match_threshold  float  default 0.5,
  match_count      int    default 5
)
returns table (
  id           uuid,
  source_label text,
  content      text,
  similarity   float
)
language sql
security definer
set search_path = public
as $$
  select
    kc.id,
    kc.source_label,
    kc.content,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  where kc.embedding is not null
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_knowledge_chunks(vector, float, int)
  to authenticated, service_role;
