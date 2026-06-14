import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';

import { resolveServiceName } from './metrics.registry.js';

let sdk: NodeSDK | null = null;

function resolveOtlpTracesUrl(): string | null {
  if (process.env['OTEL_TRACES_EXPORTER']?.trim().toLowerCase() === 'none') {
    return null;
  }
  const endpoint = process.env['OTEL_EXPORTER_OTLP_ENDPOINT']?.trim();
  if (!endpoint) return null;
  if (endpoint.endsWith('/v1/traces')) return endpoint;
  return `${endpoint.replace(/\/$/, '')}/v1/traces`;
}

/** Inicializa OTEL Node SDK (HTTP auto-instrumentation + export OTLP). Chamar antes do Nest bootstrap. */
export function initOpenTelemetry(): void {
  if (sdk) return;

  const tracesUrl = resolveOtlpTracesUrl();
  if (!tracesUrl) return;

  try {
    const serviceName = resolveServiceName();

    sdk = new NodeSDK({
      resource: new Resource({
        'service.name': serviceName,
      }),
      traceExporter: new OTLPTraceExporter({ url: tracesUrl }),
      textMapPropagator: new W3CTraceContextPropagator(),
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new NestInstrumentation(),
      ],
    });

    sdk.start();

    const shutdown = (): void => {
      void sdk?.shutdown();
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  } catch (err) {
    console.error(
      '[observability] OTEL init failed — app continua sem traces:',
      err instanceof Error ? err.message : err,
    );
  }
}
