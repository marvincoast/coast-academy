-- Renomeia schema utilitário felix -> coast_academy (instalações existentes).
alter schema felix rename to coast_academy;

update public.app_meta
set value = '"coast-academy"'::jsonb
where key = 'platform';

comment on schema coast_academy is 'Funcoes utilitarias internas do projeto Coast Academy.';
