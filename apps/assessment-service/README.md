# assessment-service

Domínio de avaliações: questões, tentativas, scoring server-side, anti-cheat e prova final.

Implementação completa nas **Etapas 4 e 5** do plano.

## Endpoints planejados

- `GET /api/assessments` — simulados de módulo + prova final disponíveis.
- `POST /api/attempts` — inicia uma tentativa (sorteia pool, gera shuffle estável por `attemptId`).
- `PATCH /api/attempts/:id/answer` — registra resposta de uma questão.
- `POST /api/attempts/:id/events/visibility` — registra troca de aba / saída de fullscreen.
- `POST /api/attempts/:id/submit` — finaliza, calcula score server-side e dispara evento `ExamPassed`.

## Regras críticas

- **Gabarito nunca cruza a rede para o cliente.**
- Scoring sempre server-side em transação.
- Tempo mínimo por questão (`ASSESSMENT_MIN_SECONDS_PER_QUESTION`) é validado.
- Aprovação: `score >= PASSING_SCORE` (default 0.75).
