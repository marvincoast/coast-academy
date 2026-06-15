import { getMetricsRegistry } from '@coast-academy/observability';
import { Counter, Histogram } from 'prom-client';

let certificateIssuedTotal: Counter | null = null;
let pdfUploadFailuresTotal: Counter<'bucket'> | null = null;
let pdfGenerationSeconds: Histogram | null = null;

function ensureMetrics(): void {
  if (certificateIssuedTotal) return;

  const registry = getMetricsRegistry();

  certificateIssuedTotal = new Counter({
    name: 'certificate_issued_total',
    help: 'Total de certificados emitidos',
    registers: [registry],
  });

  pdfUploadFailuresTotal = new Counter({
    name: 'certificate_pdf_upload_failures_total',
    help: 'Falhas ao enviar PDF do certificado ao storage',
    labelNames: ['bucket'],
    registers: [registry],
  });

  pdfGenerationSeconds = new Histogram({
    name: 'certificate_pdf_generation_seconds',
    help: 'Tempo de geração do PDF do certificado em segundos',
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
    registers: [registry],
  });
}

/** Registra contadores no registry Prometheus (visíveis em /metrics antes do 1º evento). */
export function registerCertificateMetrics(): void {
  ensureMetrics();
}

export function recordCertificateIssued(): void {
  ensureMetrics();
  certificateIssuedTotal!.inc();
}

export function recordPdfUploadFailure(bucket: string): void {
  ensureMetrics();
  pdfUploadFailuresTotal!.labels(bucket).inc();
}

export async function observePdfGeneration<T>(fn: () => Promise<T>): Promise<T> {
  ensureMetrics();
  const end = pdfGenerationSeconds!.startTimer();
  try {
    return await fn();
  } finally {
    end();
  }
}
