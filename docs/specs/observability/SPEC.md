# SPEC-001 — Observabilidade Coast Academy

| Campo | Valor |
|-------|--------|
| **ID** | SPEC-001 |
| **Status** | Approved (2026-06-02) |
| **Autor** | Coast Academy team |
| **Criado** | 2026-06-02 |
| **Stack alvo** | Docker Compose local + Traefik + 6× NestJS + React + Supabase |

---

## 1. Contexto e problema

Hoje a plataforma depende de `docker logs`, healthchecks pontuais e o dashboard do Supabase. Não há:

- visão unificada de latência e erros por rota/serviço;
- correlação de logs entre microserviços;
- traces de fluxos críticos (Prova Final → certificado → PDF → Storage);
- alertas proativos quando um serviço cai ou a taxa de 5xx sobe.

**Objetivo:** operar e debugar a Coast Academy em dev/demo com o mesmo padrão que se espera em produção, sem SaaS obrigatório no MVP (LGTM self-hosted no Compose).

---

## 2. Escopo

### In scope

| Área | Detalhe |
|------|---------|
| **Métricas** | Prometheus + scrape Traefik e microserviços |
| **Logs** | Loki + coleta de stdout JSON (Pino / Nest Logger) |
| **Traces** | Tempo + OpenTelemetry nos NestJS |
| **Visualização** | Grafana com dashboard “Coast Academy Overview” |
| **Erros app** | Sentry (web + certificate-service como piloto) |
| **Uptime** | Uptime Kuma com pings em URLs críticas |
| **Compose** | Profile `obs` documentado e script de subida |

### Out of scope (fase futura)

- Datadog / Grafana Cloud (mencionar como alternativa, não implementar agora).
- Métricas de negócio em Prometheus sem passar pela spec de instrumentação (fase 3).
- APM no browser além de Sentry.
- Observabilidade do Supabase gerenciado (usar Studio nativo).

---

## 3. Requisitos funcionais

### RF-01 — Stack observabilidade via Docker

**Como** operador local  
**Quero** subir métricas, logs e traces com um comando  
**Para** não instalar ferramentas no host.

**Critérios de aceite:**

- [ ] `docker compose --profile obs up -d` sobe Grafana, Prometheus, Loki, Tempo e Alloy (ou equivalente documentado).
- [ ] Grafana acessível em porta fixa documentada (ex.: `http://localhost:3001`).
- [ ] Serviços `obs` na rede `coast-academy-net`.
- [ ] Volumes persistentes para Prometheus/Grafana (opcional dev: bind mount em `infra/obs/data/`).

---

### RF-02 — Métricas HTTP e gateway

**Como** desenvolvedor  
**Quero** ver RPS, latência e status HTTP por serviço/rota  
**Para** detectar regressões após deploy.

**Critérios de aceite:**

- [ ] Prometheus scrape métricas do **Traefik** (porta metrics habilitada).
- [ ] Cada microserviço expõe endpoint **`GET /metrics`** (Prometheus format) ou métricas via OTEL → Prometheus.
- [ ] Dashboard Grafana com painéis: RPS, p95 latência, % 5xx, por `service` e rota principal (`/api/certificates`, `/api/assessments`, etc.).

---

### RF-03 — Logs centralizados

**Como** desenvolvedor  
**Quero** buscar logs de todos os containers num só lugar  
**Para** não fazer `docker logs` em 8 terminais.

**Critérios de aceite:**

- [ ] Logs dos containers Coast Academy aparecem no **Loki**.
- [ ] Query no Grafana Explore: `{container=~"coast-academy-.*"}` retorna linhas.
- [ ] Logs estruturados incluem campos mínimos: `service`, `level`, `msg` (evolução para `requestId` na fase 2).

---

### RF-04 — Traces distribuídos (fluxos críticos)

**Como** desenvolvedor  
**Quero** ver um trace de ponta a ponta  
**Para** entender lentidão em emissão de certificado / upload Storage.

**Critérios de aceite:**

- [ ] `OTEL_EXPORTER_OTLP_ENDPOINT` aponta para o collector (Alloy ou OTEL Collector).
- [ ] Trace visível no Tempo/Grafana para: `POST /api/certificates/issue` e `GET /api/certificates/preview-pdf`.
- [ ] Spans incluem operação de storage (upload Supabase) como child span ou log correlacionado.

---

### RF-05 — Erros de aplicação (Sentry)

**Como** produto/ops  
**Quero** ser notificado de exceções não tratadas no frontend e backend  
**Para** corrigir antes do usuário reportar.

**Critérios de aceite:**

- [ ] `VITE_SENTRY_DSN` documentado; web envia erro de teste (botão dev ou throw controlado).
- [ ] `SENTRY_DSN` no certificate-service; exceção de teste aparece no projeto Sentry.
- [ ] DSN vazio = no-op (não quebra build).

---

### RF-06 — Monitoramento de disponibilidade

**Como** operador  
**Quero** saber se o site e APIs críticas estão no ar  
**Para** alerta simples sem Grafana.

**Critérios de aceite:**

- [ ] **Uptime Kuma** no profile `obs` ou documentado como serviço opcional.
- [ ] Monitores configurados: `http://localhost/`, health Traefik, `GET /api/certificates/me` (espera 401), Supabase `http://127.0.0.1:54321`.
- [ ] UI Kuma em porta documentada.

---

### RF-07 — Alertas Grafana (MVP)

**Como** operador  
**Quero** alertas básicos  
**Para** reagir a incidentes.

**Critérios de aceite:**

- [ ] Regra: target `certificate-service` down > 2 min (via métrica `up` ou health).
- [ ] Regra: taxa HTTP 5xx > 5% por 5 min (Traefik ou app).
- [ ] Contact point: log/visual no Grafana (e-mail/Slack = opcional fase 3).

---

### RF-08 — Documentação e verificação

**Critérios de aceite:**

- [ ] `docs/specs/observability/README.md` com quick start.
- [ ] Script `infra/scripts/obs-up.sh` (ou equivalente) valida endpoints.
- [ ] `.env.example` atualizado com variáveis OTEL/Sentry.
- [ ] `verify-stack.sh` estende smoke opcional `--obs`.

---

## 4. Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| RNF-01 | Stack `obs` deve subir em máquina dev com ≥ 8 GB RAM (documentar consumo ~2–4 GB extra). |
| RNF-02 | Sem credenciais em repositório; Sentry DSN só em `.env.local`. |
| RNF-03 | Desligar profile `obs` não afeta serviços da aplicação (`dev` profile). |
| RNF-04 | Overhead OTEL < 5% latência p95 em rotas normais (validar manualmente). |
| RNF-05 | Configuração como código: YAML em `infra/obs/`, versionado no git. |

---

## 5. Arquitetura alvo

```
┌─────────────┐     ┌──────────┐     ┌─────────────────┐
│  web (React)│────►│ Traefik  │────►│ NestJS services │
└──────┬──────┘     └────┬─────┘     └────────┬────────┘
       │                 │                     │
       │ Sentry          │ metrics             │ OTLP + logs
       ▼                 ▼                     ▼
┌──────────────┐   ┌────────────┐      ┌─────────────┐
│ Sentry (SaaS)│   │ Prometheus │◄─────│ Grafana Alloy│
└──────────────┘   └─────┬──────┘      │ (collector) │
                         │              └──────┬──────┘
                    ┌────┴────┐                │
                    │ Grafana │◄── Loki ◄──────┘
                    └────┬────┘      Tempo
                         │
                    ┌────┴────┐
                    │ Uptime  │
                    │  Kuma   │
                    └─────────┘
```

**Portas sugeridas (dev):**

| Serviço | Porta host |
|---------|------------|
| Grafana | 3001 |
| Prometheus | 9090 |
| Alloy OTLP | 4317 (gRPC), 4318 (HTTP) |
| Uptime Kuma | 3002 |
| Traefik metrics | 8082 (se separado do dashboard) |

---

## 6. Métricas de negócio (fase 3 — referência)

Contadores Prometheus (prefixo `coast_academy_`):

| Métrica | Labels | Origem |
|---------|--------|--------|
| `certificate_issued_total` | — | certificate-service |
| `certificate_pdf_upload_failures_total` | `bucket` | certificate-service |
| `certificate_pdf_generation_seconds` | — | histogram |
| `assessment_attempt_submitted_total` | `passed` | assessment-service |
| `rag_query_duration_seconds` | — | rag-service |

---

## 7. Definição de pronto (DoD) global

Uma task só é **Done** quando:

1. Critérios de aceite da task marcados.
2. Config versionada em `infra/obs/`.
3. Comando de verificação documentado e executável.
4. Sem regressão: `./infra/scripts/verify-stack.sh` passa (com ou sem `--obs`).
5. PR/commit referencia `SPEC-001` e ID da task (ex. `OBS-T03`).

---

## 8. Riscos e mitigação

| Risco | Mitigação |
|-------|-----------|
| RAM insuficiente no WSL | Profile `obs` opcional; doc de recursos mínimos |
| OTEL aumenta complexidade build Nest | Pacote compartilhado `@coast-academy/otel` ou bootstrap em `main.ts` copiável |
| Traefik metrics não expostas | Habilitar em `traefik.yml` na task OBS-T02 |
| Logs não JSON | Padronizar Pino no Nest em task OBS-T05 |

---

## 9. Aprovação

| Papel | Nome | Data | OK |
|-------|------|------|-----|
| Product / Owner | | | ☐ |
| Tech lead | | | ☐ |

**Próximo artefato:** [TASKS.md](./TASKS.md) — backlog executável por task.
