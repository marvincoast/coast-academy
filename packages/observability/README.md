# @coast-academy/observability

Métricas Prometheus para microserviços NestJS (SPEC-001 / OBS-T03).

## Build local

Antes de `nest build` em um microserviço, compile este pacote:

```bash
pnpm --filter @coast-academy/observability run build
```

No Docker, o `Dockerfile.service` faz isso automaticamente.

## Uso

```typescript
import { applyPinoLogger, ObservabilityModule } from '@coast-academy/observability';

@Module({
  imports: [ObservabilityModule, /* ... */],
})
export class AppModule {}
```

```typescript
const app = await NestFactory.create(AppModule, { bufferLogs: true });
applyPinoLogger(app);
app.setGlobalPrefix('api', { exclude: ['health', 'metrics'] });
```

## Logs (OBS-T05)

- JSON no stdout (`service`, `level`, `time`, `msg`)
- `requestId` em requisições HTTP (header `x-request-id` ou UUID)
- `LOG_LEVEL` no `.env.local` (`debug`, `info`, `warn`, `error`)
- `/health` e `/metrics` sem access log automático

## Endpoint

- `GET /metrics` — formato Prometheus
- Métricas: `http_requests_total`, `http_request_duration_seconds`, `coast_academy_*` (default)

Label `service` vem de `OTEL_SERVICE_NAME` ou `SERVICE_NAME`.

## Traces OTLP (OBS-T07 / OBS-T08)

**Collector (OBS-T07):** Alloy → Tempo. Variáveis no Docker:

- `OTEL_EXPORTER_OTLP_ENDPOINT=http://alloy:4318`
- `OTEL_TRACES_EXPORTER=otlp`

**SDK (OBS-T08+):** no microserviço piloto:

```typescript
// instrumentation.ts — primeira import de main.ts
import { initOpenTelemetry } from '@coast-academy/observability';
initOpenTelemetry();
```

Spans manuais:

```typescript
import { withSpan } from '@coast-academy/observability';

await withSpan('my-service', 'storage.upload', async (span) => {
  span.setAttribute('key', 'value');
  // ...
});
```

```bash
./infra/scripts/verify-obs-t07.sh
./infra/scripts/verify-obs-t08.sh
```
