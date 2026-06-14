import { Module } from '@nestjs/common';
import { ObservabilityModule } from '@coast-academy/observability';
import { HealthController } from './health.controller';
import { CommonModule } from './common/common.module';
import { CourseModule } from './course/course.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [ObservabilityModule, CommonModule, CourseModule, ProgressModule],
  controllers: [HealthController],
})
export class AppModule {}
