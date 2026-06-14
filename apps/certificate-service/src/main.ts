import './sentry-instrumentation.js';
import './instrumentation.js';
import 'reflect-metadata';

import { applyPinoLogger } from '@coast-academy/observability';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

import { AppModule } from './app.module.js';
import { registerCertificateMetrics } from './certificate/certificate.metrics.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  registerCertificateMetrics();
  applyPinoLogger(app);
  app.use(helmet());
  app.setGlobalPrefix('api/certificates', { exclude: ['health', 'metrics', 'verify/(.*)'] });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(
    `listening on :${port} | storage=${process.env['CERTIFICATE_STORAGE_PROVIDER'] ?? 'auto'}`,
  );
}

bootstrap().catch((err) => {
  console.error('[certificate-service] bootstrap error', err);
  process.exit(1);
});
