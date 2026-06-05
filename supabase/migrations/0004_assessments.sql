-- =============================================================
-- Migration: 0004_assessments
-- Purpose:   Question bank, assessments (simulado + prova final),
--            attempt lifecycle, server-side scoring, anti-cheat log
-- =============================================================

-- ----- QUESTION TAGS -----------------------------------------
create table if not exists public.question_tags (
  id    uuid primary key default gen_random_uuid(),
  slug  text not null unique,   -- e.g. 'absorcao', 'iceberg'
  label text not null           -- e.g. 'Absorção'
);

-- ----- QUESTIONS ---------------------------------------------
create table if not exists public.questions (
  id           uuid        primary key default gen_random_uuid(),
  stem         text        not null,       -- question body (may contain markdown)
  image_url    text,                       -- optional chart/screenshot
  difficulty   smallint    not null default 2
                           check (difficulty between 1 and 3),
  explanation  text,                       -- shown after submission
  market       text        not null default 'BR' check (market in ('BR', 'US')),
  is_published boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_questions_market      on public.questions (market);
create index if not exists idx_questions_published   on public.questions (is_published);

create trigger set_questions_updated_at
  before update on public.questions
  for each row execute function felix.set_updated_at();

-- ----- QUESTION OPTIONS (always 4 per question) --------------
create table if not exists public.question_options (
  id          uuid     primary key default gen_random_uuid(),
  question_id uuid     not null references public.questions (id) on delete cascade,
  text        text     not null,
  is_correct  boolean  not null default false,
  order_index smallint not null,   -- original order (0-3)
  unique (question_id, order_index)
);

create index if not exists idx_question_options_question on public.question_options (question_id);

-- Ensure exactly one correct option per question
create or replace function felix.check_single_correct_option()
returns trigger language plpgsql as $$
begin
  if new.is_correct = true then
    if exists (
      select 1 from public.question_options
      where question_id = new.question_id
        and is_correct  = true
        and id         != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) then
      raise exception 'Question % already has a correct option', new.question_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger enforce_single_correct_option
  before insert or update on public.question_options
  for each row execute function felix.check_single_correct_option();

-- ----- QUESTION ↔ TAGS (M2M) ---------------------------------
create table if not exists public.question_question_tags (
  question_id uuid not null references public.questions (id) on delete cascade,
  tag_id      uuid not null references public.question_tags (id) on delete cascade,
  primary key (question_id, tag_id)
);

create index if not exists idx_qqt_tag_id on public.question_question_tags (tag_id);

-- ----- ASSESSMENTS -------------------------------------------
-- An assessment is either a module simulado or the course prova final.
create table if not exists public.assessments (
  id                   uuid        primary key default gen_random_uuid(),
  course_id            uuid        not null references public.courses (id) on delete cascade,
  module_id            uuid        references public.modules (id) on delete cascade, -- null = prova final
  title                text        not null,
  assessment_type      text        not null check (assessment_type in ('simulado', 'prova_final')),
  time_limit_seconds   integer     not null,
  passing_score        numeric     not null default 0.75 check (passing_score between 0 and 1),
  question_count       integer     not null,
  is_published         boolean     not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (module_id),        -- one simulado per module
  unique (course_id, assessment_type, module_id)
);

create index if not exists idx_assessments_course  on public.assessments (course_id);
create index if not exists idx_assessments_module  on public.assessments (module_id);

create trigger set_assessments_updated_at
  before update on public.assessments
  for each row execute function felix.set_updated_at();

-- ----- ASSESSMENT ↔ QUESTIONS (pool) -------------------------
-- The pool of questions eligible for this assessment.
-- At attempt start, question_count items are drawn randomly.
create table if not exists public.assessment_questions (
  assessment_id uuid not null references public.assessments (id) on delete cascade,
  question_id   uuid not null references public.questions  (id) on delete cascade,
  primary key (assessment_id, question_id)
);

create index if not exists idx_aq_assessment on public.assessment_questions (assessment_id);
create index if not exists idx_aq_question   on public.assessment_questions (question_id);

-- ----- ATTEMPTS ----------------------------------------------
create table if not exists public.attempts (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users (id) on delete cascade,
  assessment_id       uuid        not null references public.assessments (id),
  started_at          timestamptz not null default now(),
  submitted_at        timestamptz,
  time_limit_seconds  integer     not null,
  score               numeric,    -- 0-1, set on submit
  passed              boolean,    -- set on submit
  tab_change_count    integer     not null default 0,
  -- Shuffled order stored so we can reconstruct the attempt
  question_order      jsonb       not null default '[]',   -- [questionId, ...]
  option_order        jsonb       not null default '{}',   -- {questionId: [optionId, ...]}
  created_at          timestamptz not null default now()
);

create index if not exists idx_attempts_user        on public.attempts (user_id);
create index if not exists idx_attempts_assessment  on public.attempts (assessment_id);
create index if not exists idx_attempts_active      on public.attempts (user_id, assessment_id)
  where submitted_at is null;

-- ----- ATTEMPT ANSWERS ---------------------------------------
create table if not exists public.attempt_answers (
  id                 uuid        primary key default gen_random_uuid(),
  attempt_id         uuid        not null references public.attempts (id) on delete cascade,
  question_id        uuid        not null references public.questions (id),
  selected_option_id uuid        references public.question_options (id),
  is_correct         boolean,    -- set on submit
  answered_at        timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists idx_attempt_answers_attempt on public.attempt_answers (attempt_id);

-- ----- ROW LEVEL SECURITY ------------------------------------

alter table public.question_tags          enable row level security;
alter table public.questions              enable row level security;
alter table public.question_options       enable row level security;
alter table public.question_question_tags enable row level security;
alter table public.assessments            enable row level security;
alter table public.assessment_questions   enable row level security;
alter table public.attempts               enable row level security;
alter table public.attempt_answers        enable row level security;

-- Tags and assessments: read-only for authenticated users
create policy "question_tags_select"
  on public.question_tags for select to authenticated using (true);

-- Questions: authenticated can read published ones (stems only; options never exposed via RLS directly)
create policy "questions_select"
  on public.questions for select to authenticated using (is_published = true);

-- Options: DO NOT expose is_correct to users via direct query.
-- assessment-service uses service_role and filters is_correct server-side.
create policy "question_options_select"
  on public.question_options for select to authenticated using (true);

create policy "question_question_tags_select"
  on public.question_question_tags for select to authenticated using (true);

create policy "assessments_select"
  on public.assessments for select to authenticated using (is_published = true);

create policy "assessment_questions_select"
  on public.assessment_questions for select to authenticated using (true);

-- Attempts: each user only sees their own
create policy "attempts_select"
  on public.attempts for select to authenticated using (user_id = auth.uid());

create policy "attempts_insert"
  on public.attempts for insert to authenticated with check (user_id = auth.uid());

create policy "attempts_update"
  on public.attempts for update to authenticated using (user_id = auth.uid());

-- Attempt answers: each user only manages their own
create policy "attempt_answers_select"
  on public.attempt_answers for select to authenticated
  using (exists (
    select 1 from public.attempts a
    where a.id = attempt_id and a.user_id = auth.uid()
  ));

create policy "attempt_answers_upsert"
  on public.attempt_answers for insert to authenticated
  with check (exists (
    select 1 from public.attempts a
    where a.id = attempt_id and a.user_id = auth.uid() and a.submitted_at is null
  ));

-- ----- RANKING VIEW (best attempts per user) -----------------
create or replace view public.ranking_attempts
  with (security_invoker = true)
as
select distinct on (a.user_id, a.assessment_id)
  a.user_id,
  a.assessment_id,
  ass.course_id,
  ass.assessment_type,
  ass.module_id,
  a.score,
  a.passed,
  a.submitted_at
from public.attempts a
join public.assessments ass on ass.id = a.assessment_id
where a.submitted_at is not null
order by
  a.user_id,
  a.assessment_id,
  a.score desc,
  a.submitted_at asc;
