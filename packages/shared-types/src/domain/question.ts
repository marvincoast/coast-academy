import { z } from 'zod';

import { UuidSchema } from './common.js';
import { MarketSchema } from './market.js';
import { QuestionTagSchema } from './question-tag.js';

export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const MediaTypeSchema = z.enum(['none', 'image', 'video']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

/**
 * Opcao publica enviada ao cliente: NUNCA inclui is_correct.
 */
export const PublicQuestionOptionSchema = z.object({
  id: UuidSchema,
  label: z.string().min(1),
  order: z.number().int().min(0).max(3),
});
export type PublicQuestionOption = z.infer<typeof PublicQuestionOptionSchema>;

/**
 * Opcao em edicao/seed: inclui is_correct (apenas server-side).
 */
export const AuthoringQuestionOptionSchema = PublicQuestionOptionSchema.extend({
  isCorrect: z.boolean(),
});
export type AuthoringQuestionOption = z.infer<typeof AuthoringQuestionOptionSchema>;

const QuestionOptionsArray = z
  .array(PublicQuestionOptionSchema)
  .length(4, 'Toda questao deve ter exatamente 4 alternativas.');

/**
 * Questao tal como entregue ao cliente durante uma tentativa.
 */
export const PublicQuestionSchema = z.object({
  id: UuidSchema,
  prompt: z.string().min(8),
  mediaType: MediaTypeSchema,
  mediaUrl: z.string().url().nullable(),
  difficulty: DifficultySchema,
  tag: QuestionTagSchema,
  market: MarketSchema,
  options: QuestionOptionsArray,
});
export type PublicQuestion = z.infer<typeof PublicQuestionSchema>;

/**
 * Questao em autoria/seed: inclui rationale e gabarito.
 */
export const AuthoringQuestionSchema = PublicQuestionSchema.extend({
  rationale: z.string().min(20, 'Justificativa minima de 20 caracteres para uso pedagogico/RAG.'),
  options: z
    .array(AuthoringQuestionOptionSchema)
    .length(4)
    .refine(
      (opts) => opts.filter((o) => o.isCorrect).length === 1,
      'Exatamente uma alternativa deve ser is_correct=true.',
    ),
});
export type AuthoringQuestion = z.infer<typeof AuthoringQuestionSchema>;
