export interface SendCertificateEmailDto {
  to: string;
  fullName: string;
  courseTitle: string;
  verificationHash: string;
  issuedAt: string;
}

export interface SendWelcomeEmailDto {
  to: string;
  fullName: string;
}

export interface EmailResultDto {
  success: boolean;
  messageId?: string;
  error?: string;
}
