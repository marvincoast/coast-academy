---
id: answer-with-cites
version: 1
status: active
---

# Task prompt — Responder com citações (v1)

Use o **System: tutor.v1**.

## Contexto recuperado

{{retrieved_chunks}}

## Pergunta do estudante

{{user_question}}

## Instruções específicas

1. Se a pergunta sair do escopo, responda explicando o escopo do curso.
2. Use **apenas** informação presente em `retrieved_chunks`; não invente.
3. Cite cada afirmação técnica com `[source:<id>]`.
4. Encerre com a seção `Fontes:` listando IDs usados.
