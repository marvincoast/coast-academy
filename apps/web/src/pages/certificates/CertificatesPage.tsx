import { AlertCircle, Award, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CertificateDownloadButton } from '@/components/certificates/CertificateDownloadButton.js';
import { CertificatePdfSidePanel } from '@/components/certificates/CertificatePdfSidePanel.js';
import { Spinner } from '@/components/ui/Spinner';
import { useMyCertificates } from '@/hooks/use-certificate';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function CertificatesPage(): JSX.Element {
  const { data: certs, isLoading, isError, refetch } = useMyCertificates();

  let body: JSX.Element;
  if (isLoading) {
    body = (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  } else if (isError) {
    body = (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertCircle size={32} className="text-state-error" />
        <p className="text-white/60">Erro ao carregar certificados.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-brand-gold hover:bg-white/5"
        >
          Tentar novamente
        </button>
      </div>
    );
  } else {
    body = (
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Certificados</h1>
          <p className="mt-1 text-sm text-white/50">
            Emitidos após aprovação na Prova Final. Use a aba{' '}
            <span className="text-brand-gold/80">pdf</span> à direita para baixar.
          </p>
        </div>

        {(!certs || certs.length === 0) && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/8 bg-bg-surface py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/10 text-brand-gold">
              <Award size={32} />
            </div>
            <div>
              <p className="font-medium text-white">Nenhum certificado ainda</p>
              <p className="mt-1 max-w-md text-sm text-white/40">
                Conclua o curso e seja aprovado na Prova Final. Enquanto isso, a aba{' '}
                <strong className="text-white/55">pdf</strong> (canto inferior direito) permite
                baixar uma prévia do layout.
              </p>
            </div>
            <Link
              to="/prova-final"
              className="text-sm text-brand-gold underline underline-offset-2"
            >
              Ir para a Prova Final
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {certs?.map((cert) => (
            <div
              key={cert.id}
              className="relative overflow-hidden rounded-2xl border border-brand-gold/30 bg-bg-surface p-6"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-gold to-transparent" />

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                    <Award size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{cert.fullName}</p>
                      <CheckCircle size={15} className="text-state-success" />
                    </div>
                    <p className="text-sm text-white/60">Coast Academy</p>
                    <p className="mt-1 text-xs text-white/40">
                      Emitido em {formatDate(cert.issuedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <CertificateDownloadButton
                    certificateId={cert.id}
                    verificationHash={cert.verificationHash}
                    pdfUrl={cert.pdfUrl}
                    label="Baixar PDF"
                    className="px-4 py-2 text-sm"
                  />
                  <a
                    href={`/verify/${cert.verificationHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/8 px-3 py-2 text-xs text-white/70 transition-colors hover:border-brand-gold/50 hover:text-brand-gold"
                  >
                    <ExternalLink size={13} />
                    Verificar
                  </a>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-bg-base/60 px-3 py-2">
                <p className="font-mono text-xs text-white/30 break-all">
                  Hash: {cert.verificationHash}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <CertificatePdfSidePanel />
      {body}
    </>
  );
}
