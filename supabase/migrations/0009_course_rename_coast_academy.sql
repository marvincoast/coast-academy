-- Renomeia o curso Felix Empire Trading para Coast Academy (instalações existentes).
update public.courses
set title = 'Coast Academy — Tape Reading e Análise de Fluxo'
where id = 'c0000000-0000-0000-0000-000000000001';

update public.assessments
set title = 'Prova Final — Coast Academy'
where course_id = 'c0000000-0000-0000-0000-000000000001'
  and assessment_type = 'prova_final';
