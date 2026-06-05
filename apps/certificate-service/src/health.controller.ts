import { Controller, Get, NotFoundException } from '@nestjs/common';

import { isSentryTestRouteEnabled } from './sentry.js';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok'; service: string; uptime: number } {
    return {
      status: 'ok',
      service: process.env.SERVICE_NAME ?? 'certificate-service',
      uptime: process.uptime(),
    };
  }

  /** GET /health/sentry-test — OBS-T10 (direto no container, fora do prefix /api) */
  @Get('sentry-test')
  sentryTest(): never {
    if (!isSentryTestRouteEnabled()) {
      throw new NotFoundException();
    }
    throw new Error('OBS-T10 Sentry test — certificate-service');
  }
}
