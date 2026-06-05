import { Module } from '@nestjs/common';
import { ObservabilityModule } from '@coast-academy/observability';
import { HealthController } from './health.controller';
import { CommonModule } from './common/common.module';
import { RankingModule } from './ranking/ranking.module';

@Module({
  imports: [ObservabilityModule, CommonModule, RankingModule],
  controllers: [HealthController],
})
export class AppModule {}
