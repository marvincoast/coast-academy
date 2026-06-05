/** DTOs for assessment-service — mirror shared API contract */

export interface AssessmentSummaryDto {
  id: string;
  title: string;
  assessmentType: 'simulado' | 'prova_final';
  timeLimitSeconds: number;
  passingScore: number;    // 0-1
  questionCount: number;
  moduleId: string | null;
  courseId: string;
}

/** A question returned when starting/resuming an attempt (no is_correct) */
export interface ShuffledOptionDto {
  id: string;
  text: string;
  orderIndex: number;
}

export interface ShuffledQuestionDto {
  id: string;
  stem: string;
  imageUrl: string | null;
  orderIndex: number;  // 0-based position in this attempt
  options: ShuffledOptionDto[];
}

/** Response when starting or resuming an attempt */
export interface StartAttemptResponseDto {
  attemptId: string;
  startedAt: string;
  timeLimitSeconds: number;
  assessment: AssessmentSummaryDto;
  questions: ShuffledQuestionDto[];
  savedAnswers: Record<string, string>;  // questionId → selectedOptionId (for resume)
}

/** Response after submitting an attempt */
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
  score: number;          // 0-1
  scorePercent: number;   // 0-100
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  tabChangeCount: number;
  submittedAt: string;
  results: QuestionResultDto[];
}

/** Response for GET /attempts/:id (result view) */
export interface AttemptResultDto extends SubmitAttemptResponseDto {
  assessmentTitle: string;
  assessmentType: 'simulado' | 'prova_final';
}
