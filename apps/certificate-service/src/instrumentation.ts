/**
 * OTEL deve carregar antes de Nest/HTTP (OBS-T08).
 * Importar como primeira linha de main.ts.
 */
import { initOpenTelemetry } from '@coast-academy/observability';

initOpenTelemetry();
