# course-service

Responsável pelo domínio do curso: módulos, capítulos, aulas, progresso e desbloqueio sequencial.

Implementação completa na **Etapa 3** do plano.

## Endpoints planejados

- `GET /api/courses` — lista cursos disponíveis ao usuário autenticado.
- `GET /api/courses/:id` — curso com módulos e progresso.
- `GET /api/courses/:id/modules/:moduleId` — capítulos + aulas.
- `POST /api/courses/lessons/:lessonId/progress` — marca aula como concluída.

## Saúde

- `GET /health` — usado pelo Traefik e pelo Docker healthcheck.
