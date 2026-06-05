import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(AuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  /** POST /progress/lessons/:lessonId/complete */
  @Post('lessons/:lessonId/complete')
  completeLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.progressService.completeLesson(user.id, lessonId);
  }

  /** DELETE /progress/lessons/:lessonId/complete */
  @Delete('lessons/:lessonId/complete')
  uncompleteLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.progressService.uncompleteLesson(user.id, lessonId);
  }

  /** GET /progress/courses/:courseId */
  @Get('courses/:courseId')
  getCourseProgress(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.progressService.getCourseProgress(user.id, courseId);
  }
}
