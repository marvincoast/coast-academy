import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../common/supabase.service';

export interface LessonProgressResult {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface CourseProgressResult {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
  moduleProgress: ModuleProgressResult[];
}

export interface ModuleProgressResult {
  moduleId: string;
  moduleOrder: number;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
}

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async completeLesson(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgressResult> {
    // Verify lesson exists and is published
    const { data: lesson, error: lessonError } = await this.supabase.admin
      .from('lessons')
      .select('id')
      .eq('id', lessonId)
      .eq('is_published', true)
      .single();

    if (lessonError || !lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }

    // Upsert progress (idempotent — can be called multiple times)
    const { data, error } = await this.supabase.admin
      .from('lesson_progress')
      .upsert(
        { user_id: userId, lesson_id: lessonId },
        { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
      )
      .select('lesson_id, completed_at')
      .single();

    if (error) {
      // If it's a duplicate, fetch existing
      const { data: existing } = await this.supabase.admin
        .from('lesson_progress')
        .select('lesson_id, completed_at')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      return {
        lessonId,
        completed: true,
        completedAt: existing?.completed_at ?? null,
      };
    }

    this.logger.log(`User ${userId} completed lesson ${lessonId}`);

    return {
      lessonId,
      completed: true,
      completedAt: data?.completed_at ?? null,
    };
  }

  async uncompleteLesson(
    userId: string,
    lessonId: string,
  ): Promise<{ lessonId: string; completed: boolean }> {
    const { error } = await this.supabase.admin
      .from('lesson_progress')
      .delete()
      .eq('user_id', userId)
      .eq('lesson_id', lessonId);

    if (error) {
      throw new BadRequestException('Failed to uncomplete lesson');
    }

    return { lessonId, completed: false };
  }

  async getCourseProgress(
    userId: string,
    courseId: string,
  ): Promise<CourseProgressResult> {
    // Verify course exists
    const { data: course, error: courseError } = await this.supabase.admin
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('is_published', true)
      .single();

    if (courseError || !course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    // Fetch module progress via view (security_invoker means RLS applies for the user)
    // But we use service_role so we filter by user_id explicitly
    const { data: moduleRows } = await this.supabase.admin
      .from('module_progress_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('module_order');

    const moduleProgress: ModuleProgressResult[] = (moduleRows ?? []).map(
      (r: {
        module_id: string;
        module_order: number;
        total_lessons: number;
        completed_lessons: number;
        progress_pct: number;
      }) => ({
        moduleId: r.module_id,
        moduleOrder: r.module_order,
        totalLessons: r.total_lessons,
        completedLessons: r.completed_lessons,
        progressPct: r.progress_pct,
      }),
    );

    const totalLessons = moduleProgress.reduce(
      (acc, m) => acc + m.totalLessons,
      0,
    );
    const completedLessons = moduleProgress.reduce(
      (acc, m) => acc + m.completedLessons,
      0,
    );

    return {
      courseId,
      totalLessons,
      completedLessons,
      progressPct:
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100),
      moduleProgress,
    };
  }
}
