# Prompts versionados — rag-service

Esta pasta é a **fonte única de verdade** dos prompts do Tutor Coast Academy.

## Regras

1. **Imutabilidade**: arquivos têm sufixo de versão (`v1`, `v2`, ...). Nunca editar uma versão publicada — crie uma nova.
2. **Toda mudança de prompt exige ADR**: arquivo em `docs/adr/NNNN-prompt-*.md` justificando.
3. **Suíte de regressão**: cada `system/*.vN.md` precisa de casos em `tests/regression.cases.json`.
4. **Sem PII**: nada de dados de usuário em prompts; placeholders apenas.

## Estrutura

```
prompts/
├── system/
│   ├── tutor.v1.md
│   └── question-author.v1.md
├── tasks/
│   ├── explain-concept.v1.md
│   ├── answer-with-cites.v1.md
│   └── grade-rationale.v1.md
├── fewshot/
│   └── absorcao.examples.json
└── tests/
    └── regression.cases.json
```
