# 0002 — Supabase como source of truth

- Status: Accepted
- Data: 2026-05-16

## Contexto

A plataforma precisa de auth, banco relacional, storage de mídia e — por causa do RAG — extensão vetorial. Time pequeno, prazo de MVP curto.

## Decisão

Adotar **Supabase** como plataforma central:

- **Postgres 16** (com `pgvector`) como banco único.
- **Supabase Auth** com magic link (e OAuth opcional).
- **Supabase Storage** para mídia das questões e PDFs de certificado.
- **RLS** como camada primária de autorização.
- **Service role** usada **apenas** nos microserviços.

## Consequências

- ✅ Reduz drasticamente boilerplate (auth, RLS, migrations, storage assinado).
- ✅ pgvector elimina dependência externa para RAG.
- ✅ Open-source: podemos self-host se preciso (`supabase` localmente, ou Kubernetes em prod).
- ⚠️ Vendor coupling parcial (CLI, formatos de migration); mitigado por uso de SQL puro.
- ⚠️ Precisamos disciplina rigorosa em RLS para não vazar `is_correct` ou dados de outros usuários.

## Alternativas consideradas

- **Postgres puro + Auth.js + S3 separados**: mais flexível, muito mais código.
- **Firebase**: NoSQL impróprio para o domínio relacional do curso/avaliação.
