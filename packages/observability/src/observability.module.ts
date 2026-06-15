import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { MetricsController } from './metrics.controller.js';
import { getMetricsRegistry } from './metrics.registry.js';
import { MetricsMiddleware } from './metrics.middleware.js';
import { buildPinoParams } from './pino.config.js';

@Module({
  imports: [LoggerModule.forRoot(buildPinoParams())],
  controllers: [MetricsController],
})
export class ObservabilityModule implements NestModule {
  constructor() {
    getMetricsRegistry();
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
