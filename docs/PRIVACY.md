# Privacidade e LGPD — Coast Academy

> Documento operacional para conformidade com a LGPD (Lei 13.709/2018).
> A versão final juridicamente revisada vai para a página `/privacidade` do produto.

## Dados pessoais tratados

| Dado                | Origem   | Finalidade                         | Base legal           | Retenção                                     |
| ------------------- | -------- | ---------------------------------- | -------------------- | -------------------------------------------- |
| Nome completo       | Cadastro | Emissão de certificado             | Execução de contrato | Enquanto conta ativa + 5 anos (certificados) |
| E-mail              | Cadastro | Autenticação, envio de certificado | Execução de contrato | Enquanto conta ativa                         |
| `displayName`       | Cadastro | Exibição no ranking (opt-in)       | Consentimento        | Até revogação                                |
| IP / user-agent     | Logs     | Segurança e auditoria              | Legítimo interesse   | 90 dias                                      |
| Tentativas e scores | Uso      | Progresso, ranking, certificado    | Execução de contrato | Enquanto conta ativa                         |
| Conversas com Tutor | Uso      | Qualidade do RAG                   | Consentimento        | Não armazenadas em prod sem opt-in           |

## Direitos do titular

Implementados ou planejados:

- **Acesso / portabilidade**: `GET /api/me/export` retorna JSON com todos os dados do usuário.
- **Correção**: `PATCH /api/me` para `fullName`, `displayName`, `marketPreference`.
- **Exclusão**: `DELETE /api/me` faz soft delete em 24h + hard delete em 30 dias (preservando `certificates` pseudonimizados, por exigência regulatória de comprovação de emissão).
- **Revogação de consentimento**: toggles em `/configuracoes/privacidade` para ranking e e-mails de marketing.

## Logs e PII

- Logs em JSON com **redaction** de e-mail, nome, IP via Pino.
- `user_id` é UUID; logs internos usam hash truncado.

## Sub-processadores

| Serviço                 | Função              | Localização de dados                                                     |
| ----------------------- | ------------------- | ------------------------------------------------------------------------ |
| Supabase                | Auth, DB, Storage   | a confirmar (preferência por região AWS sa-east-1)                       |
| Resend                  | E-mail transacional | EU/US                                                                    |
| Provedor LLM (se cloud) | RAG                 | a confirmar; preferência por opção local (Ollama) para conteúdo sensível |

## Encarregado (DPO)

A definir antes do go-live. Contato: `dpo@coast-academy.example` (TBD).
