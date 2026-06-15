import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module.js';
import { EmbeddingService } from './embedding.service.js';
import { IngestionService } from './ingestion.service.js';
import { TutorService } from './tutor.service.js';
import { TutorController } from './tutor.controller.js';

@Module({
  imports: [CommonModule],
  providers: [EmbeddingService, IngestionService, TutorService],
  controllers: [TutorController],
})
export class TutorModule {}
