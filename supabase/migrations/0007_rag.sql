-- =============================================================
-- Migration: 0007_rag
-- Purpose:   pgvector knowledge base for RAG tutor
--            Stores lesson chunks with embeddings for similarity search
-- =============================================================

-- Ensure pgvector extension is available (enabled in 0001_init)
-- create extension if not exists vector; -- already in 0001

-- Table: knowledge_chunks
-- Each row = a chunk of lesson content with its embedding
create table if not exists public.knowledge_chunks (
  id           uuid         primary key default gen_random_uuid(),
  lesson_id    uuid         references public.lessons(id) on delete cascade,
  module_id    uuid         references public.modules(id) on delete cascade,
  source_label text         not null, -- human-readable e.g. "Módulo 1 · Aula 3"
  chunk_index  integer      not null default 0,
  content      text         not null,
  embedding    vector(1536),          -- text-embedding-3-small (OpenAI) or nomic-embed-text (Ollama)
  tokens       integer,               -- estimated token count for budget tracking
  ingested_at  timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);

create trigger set_knowledge_chunks_updated_at
  before update on public.knowledge_chunks
  for each row execute function felix.set_updated_at();

create index if not exists knowledge_chunks_lesson_idx  on public.knowledge_chunks (lesson_id);
create index if not exists knowledge_chunks_module_idx  on public.knowledge_chunks (module_id);

-- IVFFlat index for approximate nearest neighbor search
-- Lists = sqrt(expected_rows); rebuild when row count grows significantly
create index if not exists knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 50);

-- Table: tutor_sessions (optional — tracks conversations for analytics)
create table if not exists public.tutor_sessions (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  question     text        not null,
  answer       text        not null,
  chunk_ids    uuid[]      not null default '{}',
  model_used   text,
  created_at   timestamptz not null default now()
);

create index if not exists tutor_sessions_user_idx on public.tutor_sessions (user_id);

-- RLS
alter table public.knowledge_chunks  enable row level security;
alter table public.tutor_sessions    enable row level security;

-- Service role bypasses RLS; no client policy needed for knowledge_chunks

-- Users can only read their own sessions
create policy "own_sessions_read" on public.tutor_sessions
  for select using ( auth.uid() = user_id );

-- ── Similarity search function ─────────────────────────────────────────────
-- Called by rag-service (service role) to retrieve relevant chunks
create or replace function public.match_knowledge_chunks(
  query_embedding  vector(1536),
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
