-- =============================================================
-- Migration: 0005_ranking
-- Purpose:   Leaderboard views for prova final and simulado
--            scores, module completion stats, user profile stats
-- =============================================================

-- ----- PROVA FINAL LEADERBOARD --------------------------------
-- Top users by best prova final score (passed only, ties broken by earliest submission)
create or replace view public.prova_final_leaderboard
  with (security_invoker = true)
as
select
  row_number() over (
    order by ra.score desc, ra.submitted_at asc
  )::integer                        as position,
  ra.user_id,
  p.display_name,
  null::text                        as avatar_url,
  round(ra.score * 100)::integer    as score_percent,
  ra.score,
  ra.passed,
  ra.submitted_at::date             as completed_date
from public.ranking_attempts ra
join public.profiles        p  on p.id  = ra.user_id
join public.assessments     a  on a.id  = ra.assessment_id
where a.assessment_type = 'prova_final'
  and ra.passed         = true
order by ra.score desc, ra.submitted_at asc;

-- ----- ALL PROVA FINAL ATTEMPTS (including failed) -----------
-- Used to show user's own position even if not passed
create or replace view public.prova_final_all_attempts
  with (security_invoker = true)
as
select
  row_number() over (
    order by ra.score desc, ra.submitted_at asc
  )::integer                        as position,
  ra.user_id,
  p.display_name,
  null::text                        as avatar_url,
  round(ra.score * 100)::integer    as score_percent,
  ra.score,
  ra.passed,
  ra.submitted_at::date             as completed_date
from public.ranking_attempts ra
join public.profiles        p  on p.id  = ra.user_id
join public.assessments     a  on a.id  = ra.assessment_id
where a.assessment_type = 'prova_final'
order by ra.score desc, ra.submitted_at asc;

-- ----- USER SIMULADO SCORES ----------------------------------
-- Best score per user per simulado (module assessment)
create or replace view public.user_simulado_scores
  with (security_invoker = true)
as
select
  ra.user_id,
  ra.module_id,
  m.title                           as module_title,
  m.order_index                     as module_order,
  round(ra.score * 100)::integer    as score_percent,
  ra.score,
  ra.passed,
  ra.submitted_at::date             as completed_date
from public.ranking_attempts ra
join public.assessments a  on a.id  = ra.assessment_id
join public.modules     m  on m.id  = ra.module_id
where a.assessment_type = 'simulado'
  and ra.module_id is not null
order by ra.user_id, m.order_index;

-- ----- USER PROFILE STATS ------------------------------------
-- Aggregated stats per user for profile/dashboard display
create or replace view public.user_profile_stats
  with (security_invoker = true)
as
select
  p.id                                                      as user_id,
  p.display_name,
  null::text                                                as avatar_url,
  -- lesson progress
  coalesce(lp_counts.completed_lessons, 0)                  as completed_lessons,
  coalesce(total_lessons.total, 0)                          as total_lessons,
  -- simulado scores
  coalesce(sim_stats.simulados_passed, 0)                   as simulados_passed,
  -- prova final
  pf.score_percent                                          as prova_final_score,
  pf.passed                                                 as prova_final_passed,
  pf.completed_date                                         as prova_final_date
from public.profiles p
-- lesson progress count
left join (
  select user_id, count(*)::integer as completed_lessons
  from public.lesson_progress
  group by user_id
) lp_counts on lp_counts.user_id = p.id
-- total published lessons
cross join (
  select count(*)::integer as total
  from public.lessons
  where is_published = true
) total_lessons
-- simulados passed
left join (
  select user_id, count(*)::integer as simulados_passed
  from public.user_simulado_scores
  where passed = true
  group by user_id
) sim_stats on sim_stats.user_id = p.id
-- best prova final
left join (
  select distinct on (user_id)
    user_id, score_percent, passed, completed_date
  from public.prova_final_all_attempts
  order by user_id, score desc
) pf on pf.user_id = p.id;
