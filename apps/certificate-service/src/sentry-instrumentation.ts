/**
 * Sentry deve carregar antes de OTEL/Nest (OBS-T10).
 * Importar como primeira linha de main.ts.
 */
import { initSentry } from './sentry.js';

initSentry();
