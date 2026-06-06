import { Award } from 'lucide-react';

import { appOriginPath, appPath } from '@/lib/base-path.js';
import { cn } from '@/lib/cn.js';

export interface CertificatePreviewProps {
  fullName: string;
  courseTitle: string;
  issuedAt: string;
  verificationHash: string;
  issuerName?: string;
  verifyBaseUrl?: string;
  className?: string;
}

function formatIssuedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Prévia visual do certificado (layout alvo para PDF / verificação pública).
 */
export function CertificatePreviewCard({
  fullName,
  courseTitle,
  issuedAt,
  verificationHash,
  issuerName = 'Coast Academy',
  verifyBaseUrl,
  className,
}: CertificatePreviewProps): JSX.Element {
  const verifyUrl =
    verifyBaseUrl ??
    (typeof window !== 'undefined'
      ? appOriginPath(`/verify/${verificationHash}`)
      : appPath(`/verify/${verificationHash}`));

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border-2 border-brand-gold/40 bg-gradient-to-b from-bg-elevated to-bg-base p-6 text-center shadow-lg',
        'aspect-[1.414/1] max-w-full',
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand-gold to-transparent" />

      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-brand-gold/30 bg-brand-gold/10 text-brand-gold">
        <Award size={28} aria-hidden="true" />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold/80">
        Coast Academy
      </p>
      <p className="mt-1 text-xs text-white/45">Certificado de conclusão</p>

      <p className="mt-4 text-[10px] uppercase tracking-wider text-white/35">Certificamos que</p>
      <h2 className="mt-1 font-display text-xl font-bold text-white">{fullName}</h2>

      <p className="mt-3 text-xs text-white/50">concluiu com êxito o curso</p>
      <p className="mt-1 text-sm font-semibold text-brand-gold-soft">{courseTitle}</p>

      <p className="mt-4 text-xs text-white/40">Emitido em {formatIssuedDate(issuedAt)}</p>

      <div className="mt-5 flex items-end justify-center gap-4 border-t border-white/8 pt-4">
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[9px] uppercase tracking-wider text-white/30">Emitido por</p>
          <p className="text-xs font-medium text-white/55">{issuerName}</p>
          <p className="mt-2 font-mono text-[9px] text-white/25 break-all">{verificationHash.slice(0, 24)}…</p>
        </div>
        <div className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 p-1">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`}
            alt=""
            width={64}
            height={64}
            className="rounded"
          />
        </div>
      </div>

      <p className="mt-2 text-[9px] text-white/25 break-all">{verifyUrl}</p>
    </div>
  );
}
