import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { AssessmentService } from './assessment.service';

@Controller('assessments')
@UseGuards(AuthGuard)
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  /** GET /assessments/module/:moduleId — get simulado for module */
  @Get('module/:moduleId')
  getByModule(@Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.assessmentService.getByModule(moduleId);
  }

  /** GET /assessments/prova-final/:courseId — get prova final for course */
  @Get('prova-final/:courseId')
  getProvaFinal(@Param('courseId', ParseUUIDPipe) courseId: string) {
    return this.assessmentService.getProvaFinal(courseId);
  }

  /** GET /assessments/:id — get assessment by ID */
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.assessmentService.getById(id);
  }
}
