import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import type { ChapterDto, CourseDto, CourseListItemDto, LessonDto, ModuleDto } from './course.dto';
import { SupabaseService } from '../common/supabase.service';

// ─── Raw DB row shapes ────────────────────────────────────────────────────────

interface RawLesson {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  content_type: 'text' | 'video' | 'pdf';
  content_url: string | null;
  content_markdown: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  order_index: number;
}

interface RawChapter {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: RawLesson[];
}

interface RawModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  order_index: number;
  chapters: RawChapter[];
}

interface RawCourse {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_url: string | null;
  market: string;
  modules: RawModule[];
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async listCourses(userId: string): Promise<CourseListItemDto[]> {
    const { data: courses, error } = await this.supabase.admin
      .from('courses')
      .select('id, title, subtitle, cover_url, market')
      .eq('is_published', true)
      .order('created_at');

    if (error) {
      this.logger.error('listCourses error', error);
      throw error;
    }

    const completedMap = await this.fetchCompletedLessonsPerCourse(
      userId,
      (courses ?? []).map((c: { id: string }) => c.id),
    );

    const totalMap = await this.fetchTotalLessonsPerCourse(
      (courses ?? []).map((c: { id: string }) => c.id),
    );

    return (courses ?? []).map(
      (c: {
        id: string;
        title: string;
        subtitle: string | null;
        cover_url: string | null;
        market: string;
      }) => {
        const total = totalMap[c.id] ?? 0;
        const completed = completedMap[c.id] ?? 0;
        return {
          id: c.id,
          title: c.title,
          subtitle: c.subtitle,
          coverUrl: c.cover_url,
          market: c.market,
          totalLessons: total,
          completedLessons: completed,
          progressPct: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
      },
    );
  }

  async getCourse(courseId: string, userId: string): Promise<CourseDto> {
    const { data: course, error } = await this.supabase.admin
      .from('courses')
      .select(
        `
        id, title, subtitle, description, cover_url, market,
        modules (
          id, title, description, cover_url, order_index,
          chapters (
            id, title, description, order_index,
            lessons (
              id, title, description, content_type,
              content_url, content_markdown, thumbnail_url,
              duration_seconds, order_index
            )
          )
        )
      `,
      )
      .eq('id', courseId)
      .eq('is_published', true)
      .single();

    if (error || !course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    // Fetch completed lessons for this user in this course
    const allLessonIds = this.extractAllLessonIds(course as unknown as RawCourse);
    const completedSet = await this.fetchCompletedSet(userId, allLessonIds);

    return this.mapCourse(course as unknown as RawCourse, completedSet);
  }

  async getLesson(lessonId: string, userId: string): Promise<LessonDto> {
    const { data: lesson, error } = await this.supabase.admin
      .from('lessons')
      .select(
        `
        id, title, description, content_type, content_url,
        content_markdown, thumbnail_url, duration_seconds,
        order_index, chapter_id,
        chapters!inner (
          module_id,
          modules!inner ( course_id )
        )
      `,
      )
      .eq('id', lessonId)
      .eq('is_published', true)
      .single();

    if (error || !lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }

    const completedSet = await this.fetchCompletedSet(userId, [lessonId]);
    const completed = completedSet.has(lessonId);

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description ?? null,
      contentType: lesson.content_type as 'text' | 'video' | 'pdf',
      contentUrl: lesson.content_url ?? null,
      contentMarkdown: lesson.content_markdown ?? null,
      thumbnailUrl: lesson.thumbnail_url ?? null,
      durationSeconds: lesson.duration_seconds ?? null,
      orderIndex: lesson.order_index,
      completed,
      isLocked: false, // individual lesson fetch — access is already authorized
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private extractAllLessonIds(course: RawCourse): string[] {
    return course.modules.flatMap((m) => m.chapters.flatMap((c) => c.lessons.map((l) => l.id)));
  }

  private async fetchCompletedSet(userId: string, lessonIds: string[]): Promise<Set<string>> {
    if (lessonIds.length === 0) return new Set();

    const { data } = await this.supabase.admin
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds);

    return new Set((data ?? []).map((r: { lesson_id: string }) => r.lesson_id));
  }

  private async fetchCompletedLessonsPerCourse(
    userId: string,
    courseIds: string[],
  ): Promise<Record<string, number>> {
    if (courseIds.length === 0) return {};

    const { data } = await this.supabase.admin
      .from('lesson_progress')
      .select(
        `
        lesson_id,
        lessons!inner (
          chapter_id,
          chapters!inner (
            module_id,
            modules!inner ( course_id )
          )
        )
      `,
      )
      .eq('user_id', userId);

    interface LessonProgressRow {
      lesson_id: string;
      lessons: {
        chapter_id: string;
        chapters: {
          module_id: string;
          modules: { course_id: string };
        };
      };
    }

    const result: Record<string, number> = {};
    for (const row of data ?? []) {
      const courseId = (row as unknown as LessonProgressRow).lessons?.chapters?.modules?.course_id;
      if (courseId && courseIds.includes(courseId)) {
        result[courseId] = (result[courseId] ?? 0) + 1;
      }
    }
    return result;
  }

  private async fetchTotalLessonsPerCourse(courseIds: string[]): Promise<Record<string, number>> {
    if (courseIds.length === 0) return {};

    const counts = await Promise.all(
      courseIds.map(async (courseId) => {
        const { count } = await this.supabase.admin
          .from('lessons')
          .select(
            `
            chapters!inner (
              modules!inner ( course_id )
            )
          `,
            { count: 'exact', head: true },
          )
          .eq('is_published', true)
          .eq('chapters.modules.course_id', courseId);

        return [courseId, count ?? 0] as const;
      }),
    );

    return Object.fromEntries(counts);
  }

  private mapCourse(raw: RawCourse, completedSet: Set<string>): CourseDto {
    const sortedModules = [...(raw.modules ?? [])].sort((a, b) => a.order_index - b.order_index);

    let totalLessons = 0;
    let completedLessons = 0;

    const modules: ModuleDto[] = sortedModules.map((m, moduleIdx) => {
      // A module is unlocked if it's the first one, or the previous module is fully complete
      const isUnlocked =
        moduleIdx === 0 || this.isModuleComplete(sortedModules[moduleIdx - 1]!, completedSet);

      const sortedChapters = [...(m.chapters ?? [])].sort((a, b) => a.order_index - b.order_index);

      let modTotal = 0;
      let modCompleted = 0;

      const chapters: ChapterDto[] = sortedChapters.map((ch) => {
        const sortedLessons = [...(ch.lessons ?? [])].sort((a, b) => a.order_index - b.order_index);

        const lessons: LessonDto[] = sortedLessons.map((l, lessonIdx) => {
          const completed = completedSet.has(l.id);
          const isLocked =
            !isUnlocked || (lessonIdx > 0 && !completedSet.has(sortedLessons[lessonIdx - 1]!.id));

          if (completed) modCompleted++;
          modTotal++;

          return {
            id: l.id,
            title: l.title,
            description: l.description ?? null,
            contentType: l.content_type,
            contentUrl: l.content_url ?? null,
            contentMarkdown: l.content_markdown ?? null,
            thumbnailUrl: l.thumbnail_url ?? null,
            durationSeconds: l.duration_seconds ?? null,
            orderIndex: l.order_index,
            completed,
            isLocked,
          };
        });

        const chCompleted = lessons.filter((l) => l.completed).length;

        return {
          id: ch.id,
          title: ch.title,
          description: ch.description ?? null,
          orderIndex: ch.order_index,
          lessons,
          completedCount: chCompleted,
          totalCount: lessons.length,
        };
      });

      totalLessons += modTotal;
      completedLessons += modCompleted;

      return {
        id: m.id,
        title: m.title,
        description: m.description ?? null,
        coverUrl: m.cover_url ?? null,
        orderIndex: m.order_index,
        isUnlocked,
        chapters,
        completedLessons: modCompleted,
        totalLessons: modTotal,
        progressPct: modTotal === 0 ? 0 : Math.round((modCompleted / modTotal) * 100),
      };
    });

    return {
      id: raw.id,
      title: raw.title,
      subtitle: raw.subtitle ?? null,
      description: raw.description ?? null,
      coverUrl: raw.cover_url ?? null,
      market: raw.market,
      modules,
      completedLessons,
      totalLessons,
      progressPct: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    };
  }

  private isModuleComplete(mod: RawModule, completedSet: Set<string>): boolean {
    return mod.chapters.every((ch) => ch.lessons.every((l) => completedSet.has(l.id)));
  }
}
