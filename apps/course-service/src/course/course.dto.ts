/** Local DTOs for course-service. Shapes match the API contract in docs/API.md */

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
