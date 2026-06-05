import 'reflect-metadata';

import { applyPinoLogger } from '@coast-academy/observability';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  applyPinoLogger(app);
  app.use(helmet());
  app.setGlobalPrefix('api/rag', { exclude: ['health', 'metrics'] });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  app.get(Logger).log(`listening on :${port}`);
}

bootstrap().catch((err) => {
  console.error('[rag-service] bootstrap error', err);
  process.exit(1);
});
