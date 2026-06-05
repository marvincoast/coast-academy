-- Upsert da ingestão RAG: onConflict (lesson_id, chunk_index) exige UNIQUE CONSTRAINT.
drop index if exists public.knowledge_chunks_lesson_chunk_idx;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'knowledge_chunks_lesson_chunk_key'
  ) then
    alter table public.knowledge_chunks
      add constraint knowledge_chunks_lesson_chunk_key
      unique (lesson_id, chunk_index);
  end if;
end $$;
