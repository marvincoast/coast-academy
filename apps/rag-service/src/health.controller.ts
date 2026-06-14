import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: 'ok'; service: string; uptime: number } {
    return {
      status: 'ok',
      service: process.env.SERVICE_NAME ?? 'assessment-service',
      uptime: process.uptime(),
    };
  }
}
