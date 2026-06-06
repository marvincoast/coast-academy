# notification-service

Envio de e-mails transacionais via [Resend](https://resend.com) com templates Coast Academy.

Implementação completa na **Etapa 6** do plano.

## Eventos planejados

- `certificate.issued` → envia PDF do certificado em anexo / link assinado.
- `attempt.failed.final` → e-mail motivacional com áreas de revisão sugeridas (tags com pior desempenho).
- `account.welcome` → boas-vindas após primeiro login.

## Notas

- Templates em `templates/*.hbs` (Etapa 6).
- Não é exposto pelo gateway — recebe apenas chamadas internas (somente rede `coast-academy-net`).
