import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AssessmentModule } from '../assessment/assessment.module';
import { AttemptController } from './attempt.controller';
import { AttemptService } from './attempt.service';

@Module({
  imports: [CommonModule, AssessmentModule],
  controllers: [AttemptController],
  providers: [AttemptService],
})
export class AttemptModule {}
