import { z } from 'zod';

import { TimestampSchema, UuidSchema } from './common.js';

export const CertificateSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  attemptId: UuidSchema,
  courseTitle: z.string().min(1),
  recipientName: z.string().min(1),
  issuedAt: TimestampSchema,
  pdfUrl: z.string().url(),
  verificationHash: z.string().length(64).describe('SHA-256 hex do PDF.'),
  verificationUrl: z.string().url(),
});
export type Certificate = z.infer<typeof CertificateSchema>;

export const CertificateVerificationPublicSchema = z.object({
  recipientName: z.string(),
  courseTitle: z.string(),
  issuedAt: TimestampSchema,
  verificationHash: z.string().length(64),
  valid: z.boolean(),
});
export type CertificateVerificationPublic = z.infer<typeof CertificateVerificationPublicSchema>;
