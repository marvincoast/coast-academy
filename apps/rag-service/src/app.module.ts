import { Module } from '@nestjs/common';
import { ObservabilityModule } from '@coast-academy/observability';
import { HealthController } from './health.controller.js';
import { TutorModule } from './tutor/tutor.module.js';

@Module({
  imports: [ObservabilityModule, TutorModule],
  controllers: [HealthController],
})
export class AppModule {}
