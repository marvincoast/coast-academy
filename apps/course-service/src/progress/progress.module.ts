import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [CommonModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
