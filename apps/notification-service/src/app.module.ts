import { Module } from '@nestjs/common';
import { ObservabilityModule } from '@coast-academy/observability';
import { HealthController } from './health.controller.js';
import { NotificationModule } from './notification/notification.module.js';

@Module({
  imports: [ObservabilityModule, NotificationModule],
  controllers: [HealthController],
})
export class AppModule {}
