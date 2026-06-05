-- =============================================================================
-- 0002_profiles.sql
-- Tabela de perfis de usuario, RLS, funcao de auditoria de auth.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabela profiles (extensao de auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  full_name                text not null check (char_length(full_name) between 1 and 120),
  display_name             text not null check (char_length(display_name) between 1 and 40),
  email                    text not null,
  role                     text not null default 'student'
                             check (role in ('student', 'instructor', 'admin')),
  market_preference        text not null default 'BR'
                             check (market_preference in ('BR', 'US')),
  accepts_leaderboard      boolean not null default true,
  accepts_marketing_emails boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil estendido do usuario; 1-para-1 com auth.users.';

comment on column public.profiles.role is
  'Papel na plataforma: student (padrao), instructor, admin.';

comment on column public.profiles.accepts_leaderboard is
  'Opt-in para aparecer no ranking publico. Respeitar na consulta de exam_rankings.';

-- Trigger: atualiza updated_at em todo UPDATE
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function felix.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. RLS em profiles
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Leitura: usuario ve apenas o proprio perfil
create policy "profiles: leitura propria"
  on public.profiles for select
  using (auth.uid() = id);

-- Insercao: usuario insere apenas o proprio perfil
create policy "profiles: insercao propria"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Atualizacao: usuario atualiza apenas o proprio perfil
-- e NAO pode alterar o proprio role (apenas service_role pode)
create policy "profiles: atualizacao propria"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Exclusao: apenas service_role (nenhuma policy de delete para client)

-- ---------------------------------------------------------------------------
-- 3. Funcao: criar perfil automaticamente apos signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Cria perfil automaticamente quando um novo usuario e registrado via Supabase Auth.';

-- Trigger em auth.users (requer schema auth visivel)
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 4. Funcao: registrar evento de autenticacao no audit_log
--    Chamada pelo frontend via RPC; SECURITY DEFINER para contornar RLS.
--    Valida que o caller esta autenticado antes de gravar.
-- ---------------------------------------------------------------------------
create or replace function public.log_auth_event(
  p_action    text,
  p_metadata  jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'log_auth_event: caller nao autenticado';
  end if;

  insert into public.audit_log (actor_id, actor_role, action, metadata)
  select
    auth.uid(),
    coalesce((select role from public.profiles where id = auth.uid()), 'student'),
    p_action,
    p_metadata;
end;
$$;

comment on function public.log_auth_event(text, jsonb) is
  'Grava evento de autenticacao em audit_log. Exige usuario autenticado.
   Uso: select log_auth_event(''auth.login'', ''{"provider":"email"}'')';

-- Grant de execucao para usuarios autenticados
grant execute on function public.log_auth_event(text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. View publica segura: perfil minimo para o ranking
--    Expoe apenas display_name de quem optou por accepts_leaderboard = true.
-- ---------------------------------------------------------------------------
create or replace view public.public_profiles as
  select id, display_name
  from public.profiles
  where accepts_leaderboard = true;

comment on view public.public_profiles is
  'Perfis minimos (display_name) de usuarios que optaram por aparecer no ranking.';

-- ---------------------------------------------------------------------------
-- 6. Atualizar metadado de versao
-- ---------------------------------------------------------------------------
update public.app_meta set value = '"0002"', updated_at = now()
where key = 'schema_version';
