import { z } from 'zod';

import { UuidSchema } from './common.js';
import { MarketSchema } from './market.js';

export const UserRoleSchema = z.enum(['student', 'instructor', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const ProfileSchema = z.object({
  id: UuidSchema,
  fullName: z.string().min(1).max(120),
  displayName: z.string().min(1).max(40),
  email: z.string().email(),
  role: UserRoleSchema.default('student'),
  marketPreference: MarketSchema.default('BR'),
  acceptsLeaderboard: z.boolean().default(true),
  acceptsMarketingEmails: z.boolean().default(false),
});
export type Profile = z.infer<typeof ProfileSchema>;

export const UpdateProfileRequestSchema = ProfileSchema.pick({
  fullName: true,
  displayName: true,
  marketPreference: true,
  acceptsLeaderboard: true,
  acceptsMarketingEmails: true,
}).partial();
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;
