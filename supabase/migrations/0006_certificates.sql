-- =============================================================
-- Migration: 0006_certificates
-- Purpose:   Certificate issuance, verification hash and
--            public lookup endpoint support
-- =============================================================

-- Table: certificates
create table if not exists public.certificates (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  attempt_id        uuid        not null references public.attempts(id) on delete restrict,
  course_id         uuid        not null references public.courses(id) on delete restrict,
  full_name         text        not null,
  issued_at         timestamptz not null default now(),
  verification_hash text        not null unique,
  pdf_storage_path  text,       -- Supabase Storage: certificates/{hash}.pdf
  revoked_at        timestamptz,
  updated_at        timestamptz not null default now()
);

create trigger set_certificates_updated_at
  before update on public.certificates
  for each row execute function felix.set_updated_at();

-- Index for fast public lookups
create index if not exists certificates_hash_idx on public.certificates (verification_hash);
create index if not exists certificates_user_idx  on public.certificates (user_id);

-- RLS: deny by default
alter table public.certificates enable row level security;

-- Students can read their own certificates
create policy "owner_read" on public.certificates
  for select
  using ( auth.uid() = user_id );

-- Service role can do everything (no policy needed, bypasses RLS)

-- Public verification function (no auth required)
-- Returns only name, course title and issued_at — no PII beyond name
create or replace function public.verify_certificate(p_hash text)
returns table (
  full_name    text,
  course_title text,
  issued_at    timestamptz,
  is_valid     boolean
)
language sql
security definer
set search_path = public
as $$
  select
    c.full_name,
    co.title  as course_title,
    c.issued_at,
    (c.revoked_at is null) as is_valid
  from public.certificates c
  join public.courses co on co.id = c.course_id
  where c.verification_hash = p_hash
  limit 1;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
