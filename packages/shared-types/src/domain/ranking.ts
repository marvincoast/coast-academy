import { z } from 'zod';

import { UuidSchema } from './common.js';

export const RankingSeasonSchema = z
  .string()
  .regex(/^\d{4}-(Q[1-4]|M(0[1-9]|1[0-2]))$/u, 'Use YYYY-Q1..Q4 ou YYYY-M01..M12.');
export type RankingSeason = z.infer<typeof RankingSeasonSchema>;

export const RankingEntrySchema = z.object({
  rank: z.number().int().positive(),
  displayName: z.string().min(1),
  score: z.number().min(0).max(1),
  durationSeconds: z.number().int().nonnegative(),
  season: RankingSeasonSchema,
  prizeEligible: z.boolean().default(false),
});
export type RankingEntry = z.infer<typeof RankingEntrySchema>;

export const RankingQuerySchema = z.object({
  season: RankingSeasonSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
});
export type RankingQuery = z.infer<typeof RankingQuerySchema>;

export const MyRankingSchema = z.object({
  season: RankingSeasonSchema,
  rank: z.number().int().positive().nullable(),
  score: z.number().min(0).max(1).nullable(),
  totalParticipants: z.number().int().nonnegative(),
  userId: UuidSchema,
});
export type MyRanking = z.infer<typeof MyRankingSchema>;
