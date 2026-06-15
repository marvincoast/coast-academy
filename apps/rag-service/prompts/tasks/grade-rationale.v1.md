---
id: grade-rationale
version: 1
status: active
---

# Task prompt — Explicar gabarito (v1)

Use o **System: tutor.v1**.

## Contexto

- Pergunta: {{question_prompt}}
- Alternativas: {{options_json}}
- Resposta do aluno: {{selected_option_label}}
- Resposta correta: {{correct_option_label}}
- Tag da questão: {{question_tag}}
- Trechos recuperados: {{retrieved_chunks}}

## Instruções

1. Comece dizendo se o aluno acertou ou errou (1 frase).
2. Explique **por que** a alternativa correta está correta, citando fontes.
3. Explique **por que** cada uma das outras está incorreta (1 linha cada).
4. Sugira 1 módulo / aula do curso para revisar (se identificável no contexto).
