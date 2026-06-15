import { z } from 'zod';

import { UuidSchema } from './common.js';

export const AssessmentTypeSchema = z.enum(['module_simulation', 'final_exam']);
export type AssessmentType = z.infer<typeof AssessmentTypeSchema>;

export const PASSING_SCORE_DEFAULT = 0.75 as const;

export const AssessmentSchema = z.object({
  id: UuidSchema,
  type: AssessmentTypeSchema,
  title: z.string().min(2),
  moduleId: UuidSchema.nullable(),
  questionCount: z.number().int().positive().max(100),
  passingScore: z
    .number()
    .min(0)
    .max(1)
    .default(PASSING_SCORE_DEFAULT)
    .describe('Fracao de acertos minima para aprovacao (default 0.75).'),
  timeLimitSeconds: z.number().int().positive().nullable(),
  shuffleQuestions: z.boolean().default(true),
  shuffleOptions: z.boolean().default(true),
});
export type Assessment = z.infer<typeof AssessmentSchema>;
