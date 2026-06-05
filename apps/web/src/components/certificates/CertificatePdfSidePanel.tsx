import { Download, EyeOff, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import { certificateApi, saveCertificatePdfBlob } from '@/api/certificate.api.js';
import { CertificateDownloadButton } from '@/components/certificates/CertificateDownloadButton.js';
import { CertificatePreviewCard } from '@/components/certificates/CertificatePreviewCard.js';
import { FELIX_COURSE_ID } from '@/config/constants.js';
import { useCourse } from '@/hooks/use-course.js';
import { useMyCertificates } from '@/hooks/use-certificate.js';
import { cn } from '@/lib/cn.js';

const STORAGE_KEY = 'coast-academy-cert-pdf-panel-hidden';

/**
 * Aba discreta à direita (certificados) — prévia e download de PDF, com hide.
 */
export function CertificatePdfSidePanel(): JSX.Element | null {
  const { data: certs } = useMyCertificates();
  const { data: course } = useCourse(FELIX_COURSE_ID);

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === '1',
  );
  const [previewLoading, setPreviewLoading] = useState(false);

  const primaryCert = certs?.[0];
  const preview = useMemo(() => {
    if (primaryCert) {
      return {
        fullName: primaryCert.fullName,
        courseTitle: course?.title ?? 'Coast Academy',
        issuedAt: primaryCert.issuedAt,
        verificationHash: primaryCert.verificationHash,
      };
    }
    return {
      fullName: 'Trader',
      courseTitle: course?.title ?? 'Coast Academy',
      issuedAt: new Date().toISOString(),
      verificationHash: 'preview-local',
    };
  }, [primaryCert, course?.title]);

  if (hidden) {
    return null;
  }

  const hidePanel = (): void => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setHidden(true);
  };

  const handlePreviewPdf = async (): Promise<void> => {
    setPreviewLoading(true);
    try {
      const blob = await certificateApi.previewPdf();
      saveCertificatePdfBlob(blob, 'certificado-coast-academy-preview.pdf');
      toast.success('PDF baixado (confira o bucket S3cert no Supabase Studio)');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'erro';
      toast.error(`Falha: ${msg.slice(0, 60)}`);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div
      className="fixed bottom-3 right-0 z-[199] flex items-end justify-end pointer-events-none"
      aria-hidden={!open}
    >
      <div className="pointer-events-auto flex items-end">
        {open ? (
          <div
            className={cn(
              'mr-0 w-[min(100vw-2rem,320px)] rounded-l-lg border border-r-0 border-white/10',
              'bg-bg-elevated/98 backdrop-blur-md shadow-2xl',
              'animate-scale-in origin-bottom-right max-h-[min(80vh,520px)] flex flex-col',
            )}
            role="dialog"
            aria-label="Certificado PDF"
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/8 px-2.5 py-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-gold/70">
                <FileText size={10} aria-hidden="true" />
                pdf
              </span>
              <button
                type="button"
                onClick={hidePanel}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] text-white/35 transition-colors hover:bg-white/5 hover:text-white/55"
                title="Ocultar até recarregar a página"
              >
                <EyeOff size={10} aria-hidden="true" />
                hide
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
              {primaryCert ? (
                <CertificateDownloadButton
                  certificateId={primaryCert.id}
                  verificationHash={primaryCert.verificationHash}
                  pdfUrl={primaryCert.pdfUrl}
                  label="Baixar certificado (PDF)"
                  className="w-full justify-center py-2 text-xs"
                />
              ) : (
                <button
                  type="button"
                  disabled={previewLoading}
                  onClick={() => void handlePreviewPdf()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold py-2 text-[11px] font-semibold text-bg-base hover:bg-brand-gold-soft disabled:opacity-50"
                >
                  <Download size={14} aria-hidden="true" />
                  {previewLoading ? 'Gerando…' : 'Baixar prévia PDF'}
                </button>
              )}

              <CertificatePreviewCard
                fullName={preview.fullName}
                courseTitle={preview.courseTitle}
                issuedAt={preview.issuedAt}
                verificationHash={preview.verificationHash}
                className="!aspect-auto min-h-[200px]"
              />

              {primaryCert && (
                <a
                  href={`/verify/${primaryCert.verificationHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-[10px] text-brand-gold underline"
                >
                  Abrir página de verificação
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full border-t border-white/8 py-1 text-[9px] text-white/25 hover:text-white/45"
            >
              fechar
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex h-9 w-5 flex-col items-center justify-center gap-0 rounded-l-md',
            'border border-r-0 border-brand-gold/25 bg-bg-elevated/90',
            'text-brand-gold backdrop-blur-sm shadow-lg',
            'transition-all hover:w-6 hover:border-brand-gold/50',
            open && 'rounded-l-none border-r-0',
          )}
          aria-expanded={open}
          aria-label={open ? 'Fechar painel PDF' : 'Abrir painel PDF do certificado'}
          title="Certificado PDF"
        >
          <span className="sr-only">PDF certificado</span>
          <FileText size={10} aria-hidden="true" />
          <span aria-hidden="true" className="text-[6px] font-bold uppercase">
            pdf
          </span>
        </button>
      </div>
    </div>
  );
}
