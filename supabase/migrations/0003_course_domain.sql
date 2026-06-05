-- =============================================================
-- Migration: 0003_course_domain
-- Purpose:   Course structure tables + lesson progress tracking
-- Tables:    courses, modules, chapters, lessons, lesson_progress
-- =============================================================

-- ----- COURSES -----------------------------------------------
create table if not exists public.courses (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  subtitle      text,
  description   text,
  cover_url     text,
  market        text        not null default 'BR'
                            check (market in ('BR', 'US')),
  is_published  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_courses_market          on public.courses (market);
create index if not exists idx_courses_is_published    on public.courses (is_published);

create trigger set_courses_updated_at
  before update on public.courses
  for each row execute function felix.set_updated_at();

-- ----- MODULES -----------------------------------------------
create table if not exists public.modules (
  id            uuid        primary key default gen_random_uuid(),
  course_id     uuid        not null references public.courses (id) on delete cascade,
  title         text        not null,
  description   text,
  cover_url     text,
  order_index   integer     not null,
  is_published  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (course_id, order_index)
);

create index if not exists idx_modules_course_id on public.modules (course_id);

create trigger set_modules_updated_at
  before update on public.modules
  for each row execute function felix.set_updated_at();

-- ----- CHAPTERS ----------------------------------------------
create table if not exists public.chapters (
  id            uuid        primary key default gen_random_uuid(),
  module_id     uuid        not null references public.modules (id) on delete cascade,
  title         text        not null,
  description   text,
  order_index   integer     not null,
  is_published  boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (module_id, order_index)
);

create index if not exists idx_chapters_module_id on public.chapters (module_id);

create trigger set_chapters_updated_at
  before update on public.chapters
  for each row execute function felix.set_updated_at();

-- ----- LESSONS -----------------------------------------------
create table if not exists public.lessons (
  id                 uuid        primary key default gen_random_uuid(),
  chapter_id         uuid        not null references public.chapters (id) on delete cascade,
  title              text        not null,
  description        text,
  content_type       text        not null default 'text'
                                 check (content_type in ('text', 'video', 'pdf')),
  content_url        text,        -- Supabase Storage URL (video/pdf)
  content_markdown   text,        -- markdown body (text lessons)
  thumbnail_url      text,
  duration_seconds   integer,     -- estimated reading/viewing time
  order_index        integer      not null,
  is_published       boolean      not null default false,
  created_at         timestamptz  not null default now(),
  updated_at         timestamptz  not null default now(),
  unique (chapter_id, order_index)
);

create index if not exists idx_lessons_chapter_id on public.lessons (chapter_id);

create trigger set_lessons_updated_at
  before update on public.lessons
  for each row execute function felix.set_updated_at();

-- ----- LESSON PROGRESS ---------------------------------------
create table if not exists public.lesson_progress (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users (id) on delete cascade,
  lesson_id    uuid        not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists idx_lesson_progress_user_id   on public.lesson_progress (user_id);
create index if not exists idx_lesson_progress_lesson_id on public.lesson_progress (lesson_id);

-- ----- ROW LEVEL SECURITY ------------------------------------

-- Courses: anyone authenticated can read published courses
alter table public.courses        enable row level security;
alter table public.modules        enable row level security;
alter table public.chapters       enable row level security;
alter table public.lessons        enable row level security;
alter table public.lesson_progress enable row level security;

-- Read policies (authenticated users)
create policy "courses_select"
  on public.courses for select
  to authenticated
  using (is_published = true);

create policy "modules_select"
  on public.modules for select
  to authenticated
  using (is_published = true);

create policy "chapters_select"
  on public.chapters for select
  to authenticated
  using (is_published = true);

create policy "lessons_select"
  on public.lessons for select
  to authenticated
  using (is_published = true);

-- lesson_progress: each user manages their own rows
create policy "lesson_progress_select"
  on public.lesson_progress for select
  to authenticated
  using (user_id = auth.uid());

create policy "lesson_progress_insert"
  on public.lesson_progress for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "lesson_progress_delete"
  on public.lesson_progress for delete
  to authenticated
  using (user_id = auth.uid());

-- ----- HELPER VIEWS -------------------------------------------

-- Aggregated progress per module (for dashboard / ranking)
create or replace view public.module_progress_summary
  with (security_invoker = true)
as
select
  lp.user_id,
  m.id                                               as module_id,
  m.course_id,
  m.order_index                                      as module_order,
  count(distinct l.id)                               as total_lessons,
  count(distinct lp.lesson_id)                       as completed_lessons,
  case
    when count(distinct l.id) = 0 then 0
    else round(
      count(distinct lp.lesson_id)::numeric /
      count(distinct l.id)::numeric * 100, 2
    )
  end                                                as progress_pct
from public.modules m
join public.chapters   c  on c.module_id  = m.id
join public.lessons    l  on l.chapter_id = c.id
left join public.lesson_progress lp
  on lp.lesson_id = l.id
where m.is_published  = true
  and c.is_published  = true
  and l.is_published  = true
group by lp.user_id, m.id, m.course_id, m.order_index;

-- Aggregated progress per course (for profile / ranking)
create or replace view public.course_progress_summary
  with (security_invoker = true)
as
select
  lp.user_id,
  co.id                                              as course_id,
  co.title                                           as course_title,
  count(distinct l.id)                               as total_lessons,
  count(distinct lp.lesson_id)                       as completed_lessons,
  case
    when count(distinct l.id) = 0 then 0
    else round(
      count(distinct lp.lesson_id)::numeric /
      count(distinct l.id)::numeric * 100, 2
    )
  end                                                as progress_pct
from public.courses    co
join public.modules    m  on m.course_id  = co.id
join public.chapters   c  on c.module_id  = m.id
join public.lessons    l  on l.chapter_id = c.id
left join public.lesson_progress lp
  on lp.lesson_id = l.id
where co.is_published = true
  and m.is_published  = true
  and c.is_published  = true
  and l.is_published  = true
group by lp.user_id, co.id, co.title;
