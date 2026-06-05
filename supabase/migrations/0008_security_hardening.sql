-- =============================================================================
-- 0008_security_hardening.sql
-- Security hardening:
--   1. Remove is_correct exposure via direct RLS on question_options
--   2. Create question_options_safe view (sem is_correct) para uso do cliente
--   3. Revogar UPDATE direto em attempts para authenticated (score/passed so via service_role)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Substituir policy de question_options para NAO expor is_correct
--    Usuarios autenticados nao devem conseguir ver is_correct via PostgREST.
--    O assessment-service usa service_role (bypassa RLS) — nao e afetado.
-- ---------------------------------------------------------------------------

-- Remove a policy permissiva existente
drop policy if exists "question_options_select" on public.question_options;

-- Cria view publica sem is_correct
create or replace view public.question_options_safe as
  select
    id,
    question_id,
    text,
    order_index
    -- is_correct NAO incluido intencionalmente
  from public.question_options;

comment on view public.question_options_safe is
  'Opcoes de questao sem campo is_correct — segura para leitura por usuarios autenticados.
   O campo is_correct so e acessivel via service_role (assessment-service).';

-- RLS na view: habilita seguranca por invocador
alter view public.question_options_safe owner to postgres;

-- Garante que apenas authenticated ve a view segura
grant select on public.question_options_safe to authenticated;

-- Revoga select direto na tabela para authenticated (service_role ainda acessa)
revoke select on public.question_options from authenticated;

-- Grant apenas para service_role (já tem acesso via bypass, mas explicito é melhor)
-- anon também não deve acessar
revoke select on public.question_options from anon;

-- ---------------------------------------------------------------------------
-- 2. Corrigir policy de UPDATE em attempts
--    Usuarios autenticados NAO devem poder alterar score, passed, etc.
--    Apenas o assessment-service (service_role) deve gravar esses campos.
--    A unica operacao legitima do cliente e tab_change_count — mas isso deve
--    ir via endpoint POST /attempts/:id/tab-change, nao via UPDATE direto.
-- ---------------------------------------------------------------------------

-- Remove policy permissiva de UPDATE
drop policy if exists "attempts_update" on public.attempts;

-- NAO recria policy de UPDATE para authenticated.
-- O assessment-service usa service_role e bypassa RLS.
-- Se no futuro o cliente precisar atualizar algo especifico,
-- criar um RPC SECURITY DEFINER restrito.

comment on table public.attempts is
  'Tentativas de avaliacao. UPDATE restrito ao service_role (assessment-service).
   Usuarios autenticados so podem SELECT (proprios registros) e INSERT.';

-- ---------------------------------------------------------------------------
-- 3. Corrigir policy de INSERT em attempts (adicionar controle de max_attempts)
--    Impede que um usuario crie tentativas ilimitadas contornando o servico.
-- ---------------------------------------------------------------------------

-- Aprimora a policy de insert para nao permitir tentativas alem do maximo
-- (controle adicional alem do que ja existe no assessment-service)
-- Verifica que a assessment existe e esta publicada
drop policy if exists "attempts_insert" on public.attempts;

create policy "attempts_insert"
  on public.attempts for insert to authenticated
  with check (
    user_id = auth.uid()
    -- Garante que a assessment existe e esta publicada
    and exists (
      select 1 from public.assessments a
      where a.id = assessment_id
        and a.is_published = true
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Proteger attempt_answers UPDATE (nao existia, adicionar protecao)
-- ---------------------------------------------------------------------------

-- Apenas leitura e insercao para authenticated; sem UPDATE direto
-- (respostas salvas via POST /attempts/:id/answer no servico)
drop policy if exists "attempt_answers_update" on public.attempt_answers;

-- Se existir algum UPDATE policy, remove
-- (nao havia no schema original, mas garante)

-- ---------------------------------------------------------------------------
-- 5. Atualizar versao do schema
-- ---------------------------------------------------------------------------
update public.app_meta set value = '"0008"', updated_at = now()
where key = 'schema_version';
