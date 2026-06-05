import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';
import { CourseService } from './course.service';

@Controller('courses')
@UseGuards(AuthGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  /** GET /courses — list all published courses with user progress */
  @Get()
  listCourses(@CurrentUser() user: CurrentUserPayload) {
    return this.courseService.listCourses(user.id);
  }

  /** GET /courses/:id — full course tree with progress and lock state */
  @Get(':id')
  getCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.courseService.getCourse(id, user.id);
  }

  /** GET /courses/lessons/:lessonId — single lesson with full content */
  @Get('lessons/:lessonId')
  getLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.courseService.getLesson(lessonId, user.id);
  }
}
