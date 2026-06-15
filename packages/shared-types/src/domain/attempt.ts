import { z } from 'zod';

import { TimestampSchema, UuidSchema } from './common.js';
import { PublicQuestionSchema } from './question.js';

export const StartAttemptRequestSchema = z.object({
  assessmentId: UuidSchema,
});
export type StartAttemptRequest = z.infer<typeof StartAttemptRequestSchema>;

export const StartAttemptResponseSchema = z.object({
  attemptId: UuidSchema,
  assessmentId: UuidSchema,
  startedAt: TimestampSchema,
  expiresAt: TimestampSchema.nullable(),
  questions: z.array(PublicQuestionSchema),
});
export type StartAttemptResponse = z.infer<typeof StartAttemptResponseSchema>;

export const AnswerQuestionRequestSchema = z.object({
  attemptId: UuidSchema,
  questionId: UuidSchema,
  selectedOptionId: UuidSchema,
  /**
   * Tempo gasto na questao em ms (do lado do cliente);
   * o servidor cruza com seus proprios timestamps para anti-cheat.
   */
  clientElapsedMs: z.number().int().nonnegative(),
});
export type AnswerQuestionRequest = z.infer<typeof AnswerQuestionRequestSchema>;

export const VisibilityEventSchema = z.object({
  attemptId: UuidSchema,
  kind: z.enum(['hidden', 'visible', 'fullscreen_exit']),
  at: TimestampSchema,
});
export type VisibilityEvent = z.infer<typeof VisibilityEventSchema>;

export const SubmitAttemptRequestSchema = z.object({
  attemptId: UuidSchema,
});
export type SubmitAttemptRequest = z.infer<typeof SubmitAttemptRequestSchema>;

export const AttemptResultSchema = z.object({
  attemptId: UuidSchema,
  correctCount: z.number().int().nonnegative(),
  totalCount: z.number().int().positive(),
  score: z.number().min(0).max(1),
  passed: z.boolean(),
  passingScore: z.number().min(0).max(1),
  durationSeconds: z.number().int().nonnegative(),
  /**
   * Quando passed=true em final_exam, o servico de certificado
   * publica certificateId apos a emissao assincrona.
   */
  certificateId: UuidSchema.nullable(),
});
export type AttemptResult = z.infer<typeof AttemptResultSchema>;
