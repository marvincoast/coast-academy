# TASKS — SPEC-001 Observabilidade

Backlog **Spec-Driven**: implementar somente após critérios da [SPEC.md](./SPEC.md) estarem claros.  
Cada task referencia requisitos (`RF-xx`) e entrega verificável.

**Legenda status:** `⬜` todo · `🔄` in progress · `✅` done · `⏸` blocked

---

## Visão das fases


| Fase  | Objetivo                   | Tasks             | RF principal        |
| ----- | -------------------------- | ----------------- | ------------------- |
| **0** | Fundação & spec            | OBS-T00           | —                   |
| **1** | Métricas + Grafana base    | OBS-T01 … OBS-T04 | RF-01, RF-02, RF-08 |
| **2** | Logs (Loki)                | OBS-T05 … OBS-T06 | RF-03               |
| **3** | Traces (OTEL + Tempo)      | OBS-T07 … OBS-T09 | RF-04               |
| **4** | Sentry + Uptime            | OBS-T10 … OBS-T11 | RF-05, RF-06        |
| **5** | Alertas + métricas negócio | OBS-T12 … OBS-T14 | RF-07, §6 SPEC      |


---

## Fase 0 — Fundação

### OBS-T00 — Aprovar SPEC-001 e estrutura de pastas


|                |       |
| -------------- | ----- |
| **Status**     | ✅     |
| **RF**         | RF-08 |
| **Depende de** | —     |


**Entregáveis**

- SPEC.md revisada e status `Approved` com data.
- Pastas criadas: `infra/obs/{prometheus,loki,tempo,grafana,alloy}/`
- Entrada no README raiz apontando para `docs/specs/observability/`.

**Verificação**

```bash
test -f docs/specs/observability/SPEC.md && test -d infra/obs
```

---

## Fase 1 — Stack base + métricas

### OBS-T01 — Profile `obs` no Docker Compose


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-01   |
| **Depende de** | OBS-T00 |


**Entregáveis**

- Arquivo `docker-compose.obs.yml` (merge com `docker-compose.yml`).
- Serviços: `prometheus`, `grafana`, `loki`, `tempo`, `alloy`.
- Rede `coast-academy-net`; volumes nomeados.
- `infra/scripts/obs-up.sh` e `obs-down.sh`.

**Verificação**

```bash
./infra/scripts/obs-up.sh
docker compose --profile obs ps
curl -sf http://localhost:3001/api/health   # Grafana
curl -sf http://localhost:9090/-/healthy  # Prometheus
```

---

### OBS-T02 — Métricas do Traefik no Prometheus


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-02   |
| **Depende de** | OBS-T01 |


**Entregáveis**

- `infra/traefik/traefik.yml`: entrypoint `metrics` `:8082`.
- `infra/obs/prometheus/prometheus.yml`: job `traefik`.
- Porta `8082:8082` no serviço traefik (`docker-compose.yml`).

**Verificação**

```bash
curl -s http://localhost:8082/metrics | head -20   # ou porta definida
# Prometheus UI → Status → Targets → traefik UP
```

---

### OBS-T03 — Endpoint `/metrics` nos microserviços NestJS


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-02   |
| **Depende de** | OBS-T01 |


**Entregáveis**

- Pacote `@coast-academy/observability` (`prom-client` + middleware HTTP).
- Rota `GET /metrics` excluída do prefix global API (como `/health`).
- Rollout nos 6 microserviços NestJS.
- Scrape config Prometheus (`infra/obs/prometheus/prometheus.yml`).

**Verificação**

```bash
docker exec coast-academy-certificate wget -qO- http://localhost:3000/metrics | grep http_requests
```

---

### OBS-T04 — Dashboard Grafana “Coast Academy Overview”


|                |                  |
| -------------- | ---------------- |
| **Status**     | ✅                |
| **RF**         | RF-02, RF-08     |
| **Depende de** | OBS-T02, OBS-T03 |


**Entregáveis**

- Provisioning: `infra/obs/grafana/provisioning/datasources/*.yml`
- Dashboard JSON: `infra/obs/grafana/provisioning/dashboards/json/coast-academy-overview.json`
- Painéis: RPS, p95, 5xx %, `up` por job, top rotas Traefik.

**Verificação**

- Abrir Grafana → dashboard importado automaticamente → dados ao gerar tráfego (`curl` loop em `/api/courses`).

---

## Fase 2 — Logs

### OBS-T05 — Padronizar logs estruturados (NestJS)


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-03   |
| **Depende de** | OBS-T00 |


**Entregáveis**

- `nestjs-pino` via `@coast-academy/observability` + `applyPinoLogger()` em todos os `main.ts`.
- Campos JSON: `service`, `level`, `time`, `msg`, `requestId` (HTTP).
- `LOG_LEVEL` respeitado via `.env.local`.

**Verificação**

```bash
# Rebuild com Pino (obrigatorio apos mudancas em @coast-academy/observability)
./infra/scripts/rebuild-all-services.sh --no-cache

# Validacao automatizada OBS-T05
chmod +x infra/scripts/verify-obs-t05.sh
./infra/scripts/verify-obs-t05.sh coast-academy-certificate

# Manual
docker logs coast-academy-certificate --tail 5 2>&1 | jq .
curl -s -o /dev/null -w "%{http_code}\n" http://localhost/api/certificates/me
docker logs coast-academy-certificate --tail 3 2>&1 | jq '{service,level,time,msg,requestId}'
```

---

### OBS-T06 — Loki + Alloy (coleta logs Docker)


|                |                  |
| -------------- | ---------------- |
| **Status**     | ✅                |
| **RF**         | RF-03            |
| **Depende de** | OBS-T01, OBS-T05 |


**Entregáveis**

- `infra/obs/alloy/config.alloy`: docker discovery → `loki.process` (JSON Pino) → Loki.
- Datasource Loki no Grafana provisioning (`coast-loki`).
- Painel de logs + variável `container` no dashboard Overview.

**Verificação**

```bash
./infra/scripts/obs-up.sh
./infra/scripts/verify-obs-t06.sh coast-academy-certificate
# Grafana Explore → {container="coast-academy-certificate"} | json
```

---

## Fase 3 — Traces

### OBS-T07 — OpenTelemetry Collector / Alloy pipelines


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-04   |
| **Depende de** | OBS-T01 |


**Entregáveis**

- Alloy recebe OTLP gRPC `:4317` e HTTP `:4318`.
- `otelcol.processor.batch` → traces **Tempo**; métricas → **Prometheus** (`remote_write`).
- `.env.example` + `docker-compose.yml`: `OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4318`.

**Verificação**

```bash
./infra/scripts/obs-up.sh
chmod +x infra/scripts/verify-obs-t07.sh
./infra/scripts/verify-obs-t07.sh
# (smoke OTLP via infra/scripts/otel-smoke/ + node:22)
# Grafana → Explore → Tempo
```

---

### OBS-T08 — Instrumentação OTEL nos microserviços (piloto)


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-04   |
| **Depende de** | OBS-T07 |


**Entregáveis**

- `initOpenTelemetry()` + auto-instrumentations HTTP em `@coast-academy/observability`.
- `apps/certificate-service/src/instrumentation.ts` (load antes do Nest).
- Span manual `storage.upload` em `certificate-pdf-storage.service.ts`.

**Verificação**

```bash
./infra/scripts/coast-academy-compose.sh build --no-cache certificate-service
./infra/scripts/coast-academy-compose.sh up -d --force-recreate certificate-service
./infra/scripts/verify-obs-t08.sh
# storage.upload completo:
AUTH_TOKEN=<jwt> ./infra/scripts/verify-obs-t08.sh
```

---

### OBS-T09 — Propagação de trace (Traefik → Nest)


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-04   |
| **Depende de** | OBS-T08 |


**Entregáveis**

- `infra/traefik/traefik.yml`: `tracing.otlp.http` → Alloy (`traefik-gateway`).
- `OTEL_PROPAGATORS=tracecontext,baggage` no serviço Traefik.
- `W3CTraceContextPropagator` em `@coast-academy/observability` (Nest continua trace do gateway).
- CORS: headers `traceparent` / `tracestate` em `dynamic.yml`.

**Limitação**

- Request **direto** ao container (`:3000`) não passa pelo Traefik — o trace começa só no Nest.
- Sem stack obs (Alloy), Traefik ainda roteia; export OTLP falha em log até `obs-up.sh`.

**Verificação**

```bash
./infra/scripts/coast-academy-compose.sh up -d --force-recreate traefik
./infra/scripts/verify-obs-t09.sh
```

---

## Fase 4 — Erros e uptime

### OBS-T10 — Sentry (web + certificate-service)


|                |       |
| -------------- | ----- |
| **Status**     | ✅     |
| **RF**         | RF-05 |
| **Depende de** | —     |


**Entregáveis**

- [x] `apps/web`: init Sentry se `VITE_SENTRY_DSN` definido.
- [x] `certificate-service`: `@sentry/nestjs` + filtro global.
- [x] Rota dev / `SENTRY_TEST=true` para erro de teste.

**Verificação**

```bash
./infra/scripts/verify-obs-t10.sh
```

---

### OBS-T11 — Uptime Kuma


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-06   |
| **Depende de** | OBS-T01 |


**Entregáveis**

- [x] Serviço `uptime-kuma` no profile `obs`, porta `3002` (`docker-compose.obs.yml`).
- [x] `infra/obs/uptime-kuma/monitors.json` + `README.md` (seed manual / import v1).

**Verificação**

```bash
./infra/scripts/obs-up.sh
./infra/scripts/verify-obs-t11.sh
# UI http://localhost:3002 → criar monitores (primeira visita) → green
```

---

## Fase 5 — Alertas e métricas de negócio

### OBS-T12 — Regras de alerta Grafana


|                |         |
| -------------- | ------- |
| **Status**     | ✅       |
| **RF**         | RF-07   |
| **Depende de** | OBS-T04 |


**Entregáveis**

- [x] `infra/obs/grafana/provisioning/alerting/rules.yml`
- [x] `contact-points.yml` (visual) + `policies.yml`; Slack comentado em `contact-points.yml`
- [x] Alertas: `up{job="certificate-service"} < 1` (2m); 5xx Traefik + app > 5% (5m).

**Verificação**

```bash
./infra/scripts/coast-academy-compose.sh -f docker-compose.yml -f docker-compose.obs.yml --profile obs up -d --force-recreate grafana
./infra/scripts/verify-obs-t12.sh
```

---

### OBS-T13 — Métricas de certificado (negócio)


|                |                  |
| -------------- | ---------------- |
| **Status**     | ✅                |
| **RF**         | §6 SPEC          |
| **Depende de** | OBS-T03, OBS-T08 |


**Entregáveis**

- [x] `apps/certificate-service/src/certificate/certificate.metrics.ts`
- [x] Contadores/histogram: `certificate_issued_total`, `certificate_pdf_upload_failures_total{bucket}`, `certificate_pdf_generation_seconds`
- [x] Painéis no dashboard Overview (seção Certificados)

**Verificação**

```bash
./infra/scripts/coast-academy-compose.sh build certificate-service
./infra/scripts/coast-academy-compose.sh up -d --force-recreate certificate-service
./infra/scripts/verify-obs-t13.sh
# Com JWT: AUTH_TOKEN=<jwt> ./infra/scripts/verify-obs-t13.sh
# Emissão: AUTH_TOKEN=<jwt> CERT_VERIFY_ATTEMPT_ID=<uuid> ./infra/scripts/verify-obs-t13.sh
```

---

### OBS-T14 — Smoke `verify-stack.sh --obs`


|                |                           |
| -------------- | ------------------------- |
| **Status**     | ✅                         |
| **RF**         | RF-08                     |
| **Depende de** | OBS-T01, OBS-T04, OBS-T06 |


**Entregáveis**

- [x] Flag `--obs` em `infra/scripts/verify-stack.sh`
- [x] Checa Grafana, Prometheus, Loki ready, pelo menos 1 target UP

**Verificação**

```bash
./infra/scripts/obs-up.sh
./infra/scripts/verify-stack.sh --obs
```

---

## Ordem sugerida de execução (sprints)

### Sprint 1 (semana 1) — “Ver algo no Grafana”

```
OBS-T00 → OBS-T01 → OBS-T02 → OBS-T03 → OBS-T04
```

### Sprint 2 (semana 2) — “Logs e erros”

```
OBS-T05 → OBS-T06 → OBS-T10 (paralelo T05)
```

### Sprint 3 (semana 3) — “Traces e uptime”

```
OBS-T07 → OBS-T08 → OBS-T09 → OBS-T11
```

### Sprint 4 (semana 4) — “Produção-ready”

```
OBS-T12 → OBS-T13 → OBS-T14
```

---

## Template de PR por task

```markdown
## SPEC-001 / OBS-T0X — <título>

### Spec
- Requisitos: RF-xx
- [SPEC](./docs/specs/observability/SPEC.md)

### Mudanças
- ...

### Verificação
- [ ] Comandos da task executados
- [ ] verify-stack (com/sem --obs)

### Screenshots
- Grafana / Sentry (se aplicável)
```

---

## Como trabalhar task a task (SDD)

1. **Ler** critérios de aceite da task + RF na SPEC.
2. **Desenhar** diff mínimo (arquivos em `infra/obs/`).
3. **Implementar** + commit referenciando `OBS-Txx`.
4. **Verificar** comandos da task.
5. **Atualizar** status neste arquivo (`⬜` → `✅`).
6. Só então passar para a próxima task da cadeia de dependência.

---

## Registro de progresso


| Task    | Responsável | Início     | Fim        | Notas                                                        |
| ------- | ----------- | ---------- | ---------- | ------------------------------------------------------------ |
| OBS-T00 |             | 2026-06-02 | 2026-06-02 | SPEC + infra/obs                                             |
| OBS-T01 |             | 2026-06-02 | 2026-06-02 | docker-compose.obs.yml                                       |
| OBS-T02 |             | 2026-06-02 | 2026-06-02 | Traefik :8082/metrics                                        |
| OBS-T03 |             | 2026-06-02 | 2026-06-02 | @coast-academy/observability                                 |
| OBS-T04 |             | 2026-06-02 | 2026-06-02 | Dashboard Overview                                           |
| OBS-T05 |             | 2026-06-02 | 2026-06-02 | Pino JSON nos 6 serviços                                     |
| OBS-T06 |             | 2026-06-02 | 2026-06-02 | Alloy→Loki, painel logs Overview                             |
| OBS-T07 |             | 2026-06-02 | 2026-06-02 | OTLP batch → Tempo + Prom RW                                 |
| OBS-T08 |             | 2026-06-02 | 2026-06-02 | OTEL piloto certificate-service; verify OK (10 traces Tempo) |
| OBS-T09 |             | 2026-06-02 | 2026-06-02 | Traefik OTLP + traceparent → Nest                            |
| OBS-T10 |             | 2026-06-02 | 2026-06-02 | Sentry web + certificate-service; verify HTTP 500 OK         |
| OBS-T11 |             | 2026-06-02 | 2026-06-02 | Uptime Kuma :3002 + monitors.json                            |
| OBS-T12 |             | 2026-06-02 | 2026-06-02 | Alertas Grafana provisionados (down + 5xx)                   |
| OBS-T03 |             |            |            |                                                              |
| OBS-T04 |             |            |            |                                                              |
| OBS-T05 |             |            |            |                                                              |
| OBS-T06 |             |            |            |                                                              |
| OBS-T07 |             |            |            |                                                              |
| OBS-T08 |             |            |            |                                                              |
| OBS-T09 |             |            |            |                                                              |
| OBS-T10 |             |            |            |                                                              |
| OBS-T11 |             |            |            |                                                              |
| OBS-T12 |             |            |            |                                                              |
| OBS-T13 |             | 2026-06-05 | 2026-06-05 | Métricas negócio certificate-service + painéis Grafana       |
| OBS-T14 |             | 2026-06-05 | 2026-06-05 | verify-stack.sh --obs (Grafana/Prometheus/Loki + targets)    |


