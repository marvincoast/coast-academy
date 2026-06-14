export interface IssueCertificateDto {
  attemptId: string;
}

export interface CertificateDto {
  id: string;
  userId: string;
  courseId: string;
  fullName: string;
  issuedAt: string;
  verificationHash: string;
  pdfUrl: string | null;
  isRevoked: boolean;
}

export interface VerifyResponseDto {
  fullName: string;
  courseTitle: string;
  issuedAt: string;
  isValid: boolean;
}
