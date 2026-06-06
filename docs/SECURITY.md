# Segurança — Coast Academy

> Versão viva. Atualize a cada nova superfície ou ameaça identificada.

## Threat model (STRIDE) por bounded context

| Contexto | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation |
|----------|----------|-----------|-------------|-----------------|-----|-----------|
| Auth | JWT Supabase + magic link | RLS + service role split | `audit_log` em login admin | Sem PII em logs | Rate limit no gateway | Roles em `profiles.role` |
| Avaliação | JWT validado | Scoring server-side, hash da tentativa | `audit_log` em submit | `is_correct` nunca exposto | Limite de tentativas, throttler | Service role isolada |
| Certificado | Hash SHA-256 + URL assinada | PDF imutável | `audit_log` em emissão | `/verify/:hash` só nome+curso+data | Cache do verify | Geração só via service role |
| RAG | JWT validado | Prompts imutáveis versionados | `audit_log` em ingest admin | Sem armazenar conversa em prod sem consent | Budget por usuário | Ingest apenas admin |

## Controles obrigatórios

- **Helmet** ativo em todos os serviços NestJS.
- **CSP** estrito no Traefik (ver `infra/traefik/dynamic.yml`).
- **CORS** com allowlist (sem `*`).
- **Rate limit** padrão 120 req/min por IP; rotas críticas (ex.: submit) com `ratelimit-strict`.
- **RLS** deny-by-default em todas as tabelas; libera por policies explícitas.
- **Storage**: buckets privados; URLs assinadas TTL 60s para mídia de prova.
- **Secrets**: `.env.local` (dev), Docker secrets / GitHub Actions Environments (prod). Rotação documentada em [`RUNBOOK.md`](./RUNBOOK.md).

## Anti-cheat (simulado e prova final)

| Vetor | Mitigação |
|-------|-----------|
| Inspecionar `is_correct` no DevTools | Gabarito nunca trafega; cliente só recebe `option.id` + `label` |
| Recarregar página para sortear de novo | Shuffle estável derivado de `attemptId` |
| Auto-clicar sem ler | Tempo mínimo por questão (`ASSESSMENT_MIN_SECONDS_PER_QUESTION`) |
| Múltiplas tentativas paralelas | `ASSESSMENT_MAX_ATTEMPTS` por assessment por user |
| Sair do fullscreen para consultar | Eventos `visibility_change` e `fullscreen_exit` gravados em `audit_log` |
| Adulterar resposta no submit | Transação server-side + hash da sequência de respostas |

## Pipeline de segurança (Etapa 8)

- `pnpm audit --prod` no CI.
- **CodeQL** (SAST) GitHub Actions.
- **Trivy** scan das imagens Docker.
- **SBOM** CycloneDX no release.
- **Dependabot** weekly.

## Política de divulgação

E-mails para `security@coast-academy.example` (TBD). Janela de resposta: 5 dias úteis.
