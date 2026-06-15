import { apiGet, apiPost } from './client';

// ─── Response types ────────────────────────────────────────────────────────────

export interface AssessmentSummaryDto {
  id: string;
  title: string;
  assessmentType: 'simulado' | 'prova_final';
  timeLimitSeconds: number;
  passingScore: number;
  questionCount: number;
  moduleId: string | null;
  courseId: string;
}

export interface ShuffledOptionDto {
  id: string;
  text: string;
  orderIndex: number;
}

export interface ShuffledQuestionDto {
  id: string;
  stem: string;
  imageUrl: string | null;
  orderIndex: number;
  options: ShuffledOptionDto[];
}

export interface StartAttemptResponseDto {
  attemptId: string;
  startedAt: string;
  timeLimitSeconds: number;
  assessment: AssessmentSummaryDto;
  questions: ShuffledQuestionDto[];
  savedAnswers: Record<string, string>;
}

export interface QuestionResultDto {
  questionId: string;
  stem: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string | null;
}

export interface SubmitAttemptResponseDto {
  attemptId: string;
  score: number;
  scorePercent: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  tabChangeCount: number;
  submittedAt: string;
  results: QuestionResultDto[];
}

// ─── API functions ─────────────────────────────────────────────────────────────

export const assessmentApi = {
  getByModule: (moduleId: string) =>
    apiGet<AssessmentSummaryDto>(`/assessments/module/${moduleId}`),

  getProvaFinal: (courseId: string) =>
    apiGet<AssessmentSummaryDto>(`/assessments/prova-final/${courseId}`),

  startAttempt: (assessmentId: string) =>
    apiPost<StartAttemptResponseDto>('/attempts', { assessmentId }),

  saveAnswer: (attemptId: string, questionId: string, selectedOptionId: string) =>
    apiPost<{ saved: boolean }>(`/attempts/${attemptId}/answer`, {
      questionId,
      selectedOptionId,
    }),

  submitAttempt: (attemptId: string) =>
    apiPost<SubmitAttemptResponseDto>(`/attempts/${attemptId}/submit`),

  recordTabChange: (attemptId: string) => apiPost<void>(`/attempts/${attemptId}/tab-change`),
};
