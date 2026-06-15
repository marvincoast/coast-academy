import { apiDelete, apiGet, apiPost } from './client';

// ─── Response types (mirror course-service DTOs) ─────────────────────────────

export interface LessonDto {
  id: string;
  title: string;
  description: string | null;
  contentType: 'text' | 'video' | 'pdf';
  contentUrl: string | null;
  contentMarkdown: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  orderIndex: number;
  completed: boolean;
  isLocked: boolean;
}

export interface ChapterDto {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: LessonDto[];
  completedCount: number;
  totalCount: number;
}

export interface ModuleDto {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  orderIndex: number;
  isUnlocked: boolean;
  chapters: ChapterDto[];
  completedLessons: number;
  totalLessons: number;
  progressPct: number;
}

export interface CourseDto {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  market: string;
  modules: ModuleDto[];
  completedLessons: number;
  totalLessons: number;
  progressPct: number;
}

export interface CourseListItemDto {
  id: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  market: string;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
}

export interface LessonProgressResult {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

// ─── API functions ────────────────────────────────────────────────────────────

export const courseApi = {
  listCourses: () => apiGet<CourseListItemDto[]>('/courses'),

  getCourse: (courseId: string) => apiGet<CourseDto>(`/courses/${courseId}`),

  getLesson: (lessonId: string) => apiGet<LessonDto>(`/courses/lessons/${lessonId}`),

  completeLesson: (lessonId: string) =>
    apiPost<LessonProgressResult>(`/progress/lessons/${lessonId}/complete`),

  uncompleteLesson: (lessonId: string) =>
    apiDelete<{ lessonId: string; completed: boolean }>(`/progress/lessons/${lessonId}/complete`),
};
