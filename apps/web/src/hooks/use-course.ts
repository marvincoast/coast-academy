import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { courseApi } from '../api/course.api';

export const courseKeys = {
  all: ['courses'] as const,
  list: () => [...courseKeys.all, 'list'] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
  lesson: (id: string) => [...courseKeys.all, 'lesson', id] as const,
};

export function useCourseList() {
  return useQuery({
    queryKey: courseKeys.list(),
    queryFn: courseApi.listCourses,
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => courseApi.getCourse(courseId),
    enabled: Boolean(courseId),
  });
}

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: courseKeys.lesson(lessonId),
    queryFn: () => courseApi.getLesson(lessonId),
    enabled: Boolean(lessonId),
  });
}

export function useCompleteLesson(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessonId: string) => courseApi.completeLesson(lessonId),
    onSuccess: (_data, lessonId) => {
      // Invalidate both the course tree and the lesson query
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      void queryClient.invalidateQueries({ queryKey: courseKeys.lesson(lessonId) });
    },
  });
}
