import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { certificateApi, saveCertificatePdfBlob } from '@/api/certificate.api.js';
import { ApiError } from '@/api/client.js';
import { cn } from '@/lib/cn.js';

interface CertificateDownloadButtonProps {
  certificateId: string;
  verificationHash: string;
  pdfUrl?: string | null;
  className?: string;
  label?: string;
}

export function CertificateDownloadButton({
  certificateId,
  verificationHash,
  pdfUrl,
  className,
  label = 'PDF',
}: CertificateDownloadButtonProps): JSX.Element {
  const [loading, setLoading] = useState(false);

  const fileName = `certificado-coast-academy-${verificationHash.slice(0, 12)}.pdf`;

  const handleDownload = async (): Promise<void> => {
    setLoading(true);
    try {
      if (pdfUrl && !pdfUrl.includes('kong:8000')) {
        const res = await fetch(pdfUrl);
        if (res.ok) {
          saveCertificatePdfBlob(await res.blob(), fileName);
          toast.success('PDF baixado');
          return;
        }
      }
      const blob = await certificateApi.downloadPdf(certificateId);
      saveCertificatePdfBlob(blob, fileName);
      toast.success('PDF baixado');
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message.slice(0, 100) : e instanceof Error ? e.message : 'erro';
      toast.error(`Download falhou: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => void handleDownload()}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-brand-gold/40 bg-brand-gold/10 px-3 py-1.5 text-xs font-semibold text-brand-gold transition-colors',
        'hover:bg-brand-gold/20 disabled:opacity-50',
        className,
      )}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
      {loading ? 'Baixando…' : label}
    </button>
  );
}
