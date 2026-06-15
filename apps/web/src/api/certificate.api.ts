import { apiDownloadBlob, apiGet, apiPost } from './client';

// ─── Types ─────────────────────────────────────────────────────────────────

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

// ─── API ───────────────────────────────────────────────────────────────────

export const certificateApi = {
  issue: (attemptId: string) => apiPost<CertificateDto>('/certificates/issue', { attemptId }),

  listMine: () => apiGet<CertificateDto[]>('/certificates/me'),

  verify: (hash: string) =>
    fetch(
      `${import.meta.env['VITE_API_BASE_URL'] ?? 'http://localhost/api'}/certificates/verify/${hash}`,
    ).then((r) => {
      if (!r.ok) throw new Error('Certificate not found');
      return r.json() as Promise<VerifyResponseDto>;
    }),

  downloadPdf: (certificateId: string) => apiDownloadBlob(`/certificates/${certificateId}/pdf`),

  /** Prévia PDF (dev) — não exige Prova Final nem certificado emitido */
  previewPdf: () => apiDownloadBlob('/certificates/preview-pdf'),
};

export function saveCertificatePdfBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
