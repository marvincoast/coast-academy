# Plano de melhorias — Coast Academy

Documento de referência para evolução da plataforma (produto, técnica e operações).

## Prioridade alta (próximas 4–6 semanas)

### Produto e UX

| Item                            | Por quê                                                          | Esforço |
| ------------------------------- | ---------------------------------------------------------------- | ------- |
| Fluxo único pós–Prova Final     | Emitir certificado + download na tela de resultado (já iniciado) | Baixo   |
| Painel PDF à direita com hide   | Prévia/download sem poluir a página principal                    | Baixo   |
| Progresso claro até Prova Final | Dashboard com “falta X módulos” e CTA direto                     | Médio   |
| E-mail transacional             | Certificado emitido, lembrete de simulado (notification-service) | Médio   |

### Certificados

| Item                                             | Por quê                                     | Esforço |
| ------------------------------------------------ | ------------------------------------------- | ------- |
| Appwrite S3cert com credenciais válidas          | Storage dedicado de PDFs                    | Baixo   |
| Regenerar PDF em lote (admin)                    | Certificados antigos sem `pdf_storage_path` | Médio   |
| Template PDF v2 (logo, assinatura, número série) | Aparência profissional                      | Médio   |

### Confiabilidade

| Item                                          | Por quê                        | Esforço |
| --------------------------------------------- | ------------------------------ | ------- |
| Health checks unificados + smoke no CI        | Evitar deploy de imagem antiga | Baixo   |
| Testes E2E: login → prova → certificado → PDF | Regressão do fluxo crítico     | Médio   |
| Idempotência emissão + fila (opcional)        | Pico de emissão na prova       | Médio   |

---

## Prioridade média (1–3 meses)

### Arquitetura

- **BFF ou API Gateway único** documentado (Traefik já roteia; padronizar erros JSON).
- **Eventos** (Supabase Realtime ou fila Redis): `certificate.issued`, `attempt.submitted` para ranking/notificações.
- **Cache** (Redis profile no compose): ranking, catálogo de curso.

### Qualidade de código

- Cobertura de testes nos 6 microserviços (hoje variável).
- Contratos OpenAPI gerados + validação no frontend (Zod compartilhado já existe em `shared-types`).
- Remover duplicação entre painéis dev (cert dev / pdf / local links).

### Segurança

- Rotação de secrets; nunca commitar `.env.local`.
- Rate limit mais rígido em `issue` e `preview-pdf`.
- Auditoria RLS Supabase periódica.
- CSP e headers já no Traefik — revisar `connect-src` por ambiente.

### Internacionalização

- Completar `pt-BR` / `en` em simulados e certificados (parcial hoje no curso).

---

## Prioridade longa (3+ meses)

- **Multi-tenant / multi-curso** (hoje `FELIX_COURSE_ID` fixo).
- **Painel admin** (conteúdo, usuários, revogação de certificado).
- **Mobile PWA** (offline de aulas, push).
- **Analytics de aprendizado** (tempo por aula, abandono, heatmap de questões).

---

## Observabilidade — recomendação

> **Plano executável (Spec-Driven):** [`docs/specs/observability/SPEC.md`](specs/observability/SPEC.md) + [`TASKS.md`](specs/observability/TASKS.md)

Stack atual no README: **OpenTelemetry + Pino**, profile `obs` no Docker (Prometheus/Grafana a habilitar), **Sentry** no frontend.

### Recomendação principal: **Grafana LGTM** (self-hosted ou Cloud)

| Ferramenta     | Uso                                                      |
| -------------- | -------------------------------------------------------- |
| **Prometheus** | Métricas HTTP, latência, filas, Traefik                  |
| **Loki**       | Logs dos containers (Pino JSON)                          |
| **Tempo**      | Traces OpenTelemetry entre web → Traefik → microserviços |
| **Grafana**    | Dashboards + alertas                                     |

**Por quê:** combina bem com Docker Compose local, OSS, e escala para produção. O monorepo já cita OTEL — falta collector + backends.

### Alternativas

| Opção                          | Quando escolher                                          |
| ------------------------------ | -------------------------------------------------------- |
| **Datadog**                    | Orçamento SaaS, time pequeno, quer tudo integrado rápido |
| **Sentry** (já parcial)        | Erros frontend + backend, release tracking               |
| **Supabase Dashboard**         | Queries lentas, auth, storage                            |
| **Uptime Kuma / Better Stack** | Ping simples em `/health` e URLs públicas                |

### Métricas mínimas a instrumentar

1. `http_requests_total` / latência por serviço e rota.
2. Taxa de erro 4xx/5xx em `/api/certificates/*`.
3. Tempo de geração de PDF e upload Appwrite/Supabase.
4. Tentativas de prova, aprovações, emissões de certificado.
5. Latência RAG e ingest.

### Logs

- Manter **Pino** estruturado (JSON) com `requestId`, `userId`, `service`.
- Agregar com **Loki** via Promtail ou Alloy no Compose.

### Alertas sugeridos

- Certificate-service down > 2 min.
- Taxa de 5xx > 5% em 5 min.
- Fila de e-mail / ingest RAG falhando.

### Próximo passo técnico (obs)

1. Subir profile `obs` no `docker-compose.yml`.
2. OTEL Collector → Prometheus + Tempo.
3. Promtail → Loki.
4. Dashboard Grafana “Coast Academy Overview”.
5. `VITE_SENTRY_DSN` + DSN nos microserviços para erros não tratados.

---

## Quick wins esta semana

1. `pnpm install` + rebuild `certificate-service` e `web` após cada mudança de PDF.
2. Preencher `APPWRITE_*` ou manter `CERTIFICATE_STORAGE_PROVIDER=supabase`.
3. Rodar `./infra/scripts/verify-stack.sh` antes de demo.
4. Documentar fluxo de certificado no README (1 diagrama).

---

## Métricas de sucesso (KPIs)

- % alunos que concluem Prova Final.
- % aprovados que baixam/emitem certificado em 24h.
- Tempo médio de geração PDF < 3s.
- Uptime API > 99.5% (ambiente demo/prod).
- Zero certificados sem PDF após emissão (storage ok).
