import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';
import { AssessmentSummaryDto } from './assessment.dto';

@Injectable()
export class AssessmentService {
  constructor(private readonly supabase: SupabaseService) {}

  async getByModule(moduleId: string): Promise<AssessmentSummaryDto> {
    const { data, error } = await this.supabase.admin
      .from('assessments')
      .select(
        'id, title, assessment_type, time_limit_seconds, passing_score, question_count, module_id, course_id',
      )
      .eq('module_id', moduleId)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      throw new NotFoundException(`No assessment found for module ${moduleId}`);
    }

    return this.mapAssessment(data);
  }

  async getProvaFinal(courseId: string): Promise<AssessmentSummaryDto> {
    const { data, error } = await this.supabase.admin
      .from('assessments')
      .select(
        'id, title, assessment_type, time_limit_seconds, passing_score, question_count, module_id, course_id',
      )
      .eq('course_id', courseId)
      .eq('assessment_type', 'prova_final')
      .eq('is_published', true)
      .single();

    if (error || !data) {
      throw new NotFoundException(`No prova final found for course ${courseId}`);
    }

    return this.mapAssessment(data);
  }

  async getById(assessmentId: string): Promise<AssessmentSummaryDto> {
    const { data, error } = await this.supabase.admin
      .from('assessments')
      .select(
        'id, title, assessment_type, time_limit_seconds, passing_score, question_count, module_id, course_id',
      )
      .eq('id', assessmentId)
      .eq('is_published', true)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Assessment ${assessmentId} not found`);
    }

    return this.mapAssessment(data);
  }

  private mapAssessment(data: {
    id: string;
    title: string;
    assessment_type: string;
    time_limit_seconds: number;
    passing_score: number;
    question_count: number;
    module_id: string | null;
    course_id: string;
  }): AssessmentSummaryDto {
    return {
      id: data.id,
      title: data.title,
      assessmentType: data.assessment_type as 'simulado' | 'prova_final',
      timeLimitSeconds: data.time_limit_seconds,
      passingScore: data.passing_score,
      questionCount: data.question_count,
      moduleId: data.module_id,
      courseId: data.course_id,
    };
  }
}
