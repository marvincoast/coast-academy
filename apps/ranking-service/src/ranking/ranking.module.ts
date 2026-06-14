import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

@Module({
  imports: [CommonModule],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
