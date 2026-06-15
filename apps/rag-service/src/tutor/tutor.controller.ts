import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard.js';
import { CurrentUser } from '../common/current-user.decorator.js';
import { TutorService } from './tutor.service.js';
import { IngestionService } from './ingestion.service.js';
import type { AskQuestionDto } from './tutor.dto.js';

interface CurrentUserPayload {
  userId: string;
  userEmail: string;
}

@Controller()
export class TutorController {
  constructor(
    private readonly tutorService: TutorService,
    private readonly ingestionService: IngestionService,
  ) {}

  /** POST /api/rag/ask — authenticated student asks a question */
  @Post('ask')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  ask(@CurrentUser() user: CurrentUserPayload, @Body() dto: AskQuestionDto) {
    return this.tutorService.ask(user.userId, dto.question);
  }

  /**
   * POST /api/rag/ingest — re-index all lessons.
   * Protected by INGEST_SECRET header (called by CI or admin script, not the frontend).
   */
  @Post('ingest')
  @HttpCode(HttpStatus.OK)
  async ingest(@Body() body: { secret?: string }) {
    const expected = process.env['INGEST_SECRET'];
    if (expected && body.secret !== expected) {
      throw new ForbiddenException('Invalid ingest secret');
    }
    return this.ingestionService.ingestAll();
  }
}
