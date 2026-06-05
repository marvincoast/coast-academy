# Seeds

Seeds versionados em JSON, validados por script em `apps/assessment-service/scripts/validate-seed.ts` (Etapa 4) antes de irem para o banco.

## Arquivos previstos (Etapas 3 e 4)

- `course.json` — estrutura do curso Felix (módulos / capítulos / aulas placeholder).
- `questions.json` — banco de ~100 questões com tags, mídia e gabarito (não exposto ao cliente).
- `glossary.md` — glossário canônico de termos de tape reading (ingerido pelo RAG).

## Regras

- Toda mídia referenciada deve existir no Storage (ou ter URL pública estável).
- Cada questão tem exatamente 4 alternativas, com 1 marcada `is_correct: true`.
- Distribuição alvo das tags está em `docs/CONTENT_GUIDE.md`.
