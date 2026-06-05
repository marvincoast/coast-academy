/**
 * Envia um span OTLP/HTTP para o Alloy (OBS-T07 smoke test).
 */
const { trace } = require('@opentelemetry/api');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { Resource } = require('@opentelemetry/resources');
const { NodeSDK } = require('@opentelemetry/sdk-node');

const endpoint = (process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318').replace(
  /\/$/,
  '',
);
const serviceName = process.env.OTEL_SMOKE_SERVICE ?? 'obs-t07-smoke';

async function main() {
  const sdk = new NodeSDK({
    resource: new Resource({ 'service.name': serviceName }),
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
  });

  await sdk.start();

  const tracer = trace.getTracer('coast-academy-verify');
  await tracer.startActiveSpan('obs-t07-verify', async (span) => {
    span.setAttribute('coast_academy.smoke', true);
    span.end();
  });

  await sdk.shutdown();
  console.log(`OK: span enviado para ${endpoint}/v1/traces (service=${serviceName})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
