import type { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

/** Ativa Pino como logger do Nest (após NestFactory.create). */
export function applyPinoLogger(app: INestApplication): void {
  app.useLogger(app.get(Logger));
}
