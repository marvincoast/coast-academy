import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { AttemptService } from './attempt.service';

@Controller('attempts')
@UseGuards(AuthGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  /** GET /attempts — list current user's submitted attempts */
  @Get()
  listAttempts(@CurrentUser() user: CurrentUserPayload) {
    return this.attemptService.listUserAttempts(user.id);
  }

  /** POST /attempts — start (or resume) an attempt */
  @Post()
  startAttempt(@Body() body: { assessmentId: string }, @CurrentUser() user: CurrentUserPayload) {
    return this.attemptService.startAttempt(user.id, body.assessmentId);
  }

  /** GET /attempts/:id — get result of a submitted attempt */
  @Get(':id')
  getResult(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.attemptService.getAttemptResult(user.id, id);
  }

  /** POST /attempts/:id/answer — save an individual answer (auto-save) */
  @Post(':id/answer')
  saveAnswer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { questionId: string; selectedOptionId: string },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.attemptService.saveAnswer(user.id, id, body.questionId, body.selectedOptionId);
  }

  /** POST /attempts/:id/submit — submit and score */
  @Post(':id/submit')
  submit(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.attemptService.submitAttempt(user.id, id);
  }

  /** POST /attempts/:id/tab-change — record tab change (anti-cheat) */
  @Post(':id/tab-change')
  recordTabChange(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.attemptService.recordTabChange(user.id, id);
  }
}
