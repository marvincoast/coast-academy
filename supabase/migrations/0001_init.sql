-- =============================================================================
-- 0001_init.sql
-- Migration base do projeto Felix Empire Trading.
-- Habilita extensoes necessarias e cria schema utilitario.
-- Schemas de dominio (courses, assessments, certificates, rankings, rag)
-- entram em migrations subsequentes a partir da Etapa 2.
-- =============================================================================

-- Extensoes obrigatorias
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;
create extension if not exists vector;     -- pgvector p/ RAG (Etapa 7)
create extension if not exists btree_gin;

-- Schema utilitario do projeto (helpers reutilizaveis entre migrations)
create schema if not exists felix;
comment on schema felix is 'Funcoes utilitarias internas do projeto Felix Empire Trading.';

-- Funcao: atualiza updated_at automaticamente em triggers
create or replace function felix.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function felix.set_updated_at() is
  'Trigger function que atualiza a coluna updated_at para now() em UPDATEs.';

-- =============================================================================
-- Auditoria (tabela compartilhada para eventos sensiveis)
-- =============================================================================
create table if not exists public.audit_log (
  id           uuid primary key default gen_random_uuid(),
  occurred_at  timestamptz not null default now(),
  actor_id     uuid,                       -- auth.users.id quando aplicavel
  actor_role   text,
  action       text not null,              -- ex: 'attempt.submit', 'certificate.issue'
  target_type  text,
  target_id    text,
  ip           inet,
  user_agent   text,
  metadata     jsonb not null default '{}'::jsonb
);

create index if not exists audit_log_actor_idx on public.audit_log (actor_id, occurred_at desc);
create index if not exists audit_log_action_idx on public.audit_log (action, occurred_at desc);
create index if not exists audit_log_metadata_gin on public.audit_log using gin (metadata jsonb_path_ops);

comment on table public.audit_log is 'Trilha de auditoria para eventos sensiveis (login admin, prova final, emissao de certificado, etc.).';

-- RLS: audit_log deny-by-default; apenas service_role escreve/le.
alter table public.audit_log enable row level security;

-- Sem policies explicitas; service_role contorna RLS.
-- Politicas de leitura para administradores entrarao em migration posterior.

-- =============================================================================
-- Marcadores de versao e meta
-- =============================================================================
create table if not exists public.app_meta (
  key   text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.app_meta (key, value)
values
  ('schema_version', '"0001"'::jsonb),
  ('platform', '"coast-academy"'::jsonb)
on conflict (key) do nothing;

alter table public.app_meta enable row level security;
