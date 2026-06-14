import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [CommonModule],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
