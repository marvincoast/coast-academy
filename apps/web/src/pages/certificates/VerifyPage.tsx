import { Award, CheckCircle, Loader2, Shield, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { useVerifyCertificate } from '@/hooks/use-certificate';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function VerifyPage(): JSX.Element {
  const { hash } = useParams<{ hash: string }>();
  const { data, isLoading, isError } = useVerifyCertificate(hash);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-gold/40 bg-brand-gold/10 text-brand-gold">
          <span className="text-xl font-bold">FE</span>
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-white/60">Coast Academy</p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/8 bg-bg-surface p-8 shadow-card">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Loader2 size={40} className="animate-spin text-brand-gold" />
            <p className="text-white/60">Verificando certificado…</p>
          </div>
        )}

        {/* Error / not found */}
        {isError && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-state-error/10 text-state-error">
              <XCircle size={36} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Certificado não encontrado</h1>
              <p className="mt-2 text-sm text-white/50">
                O hash informado não corresponde a nenhum certificado válido.
              </p>
            </div>
            <p className="rounded-lg bg-bg-base px-3 py-2 font-mono text-xs text-white/60 break-all">
              {hash}
            </p>
          </div>
        )}

        {/* Success */}
        {data && (
          <div className="flex flex-col items-center gap-6 text-center">
            {data.isValid ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-state-success/10 text-state-success">
                <CheckCircle size={36} />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-state-error/10 text-state-error">
                <XCircle size={36} />
              </div>
            )}

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-white/60">
                {data.isValid ? 'Certificado Autêntico' : 'Certificado Revogado'}
              </p>
              <h1 className="text-xl font-bold text-white">{data.fullName}</h1>
              <p className="mt-1 text-white/60">{data.courseTitle}</p>
              <p className="mt-3 text-sm text-white/60">Emitido em {formatDate(data.issuedAt)}</p>
            </div>

            {data.isValid && (
              <div className="flex items-center gap-2 rounded-full border border-state-success/30 bg-state-success/10 px-4 py-2 text-sm font-medium text-state-success">
                <Shield size={15} />
                Verificado e Autêntico
              </div>
            )}

            <div className="w-full rounded-lg bg-bg-base px-3 py-2">
              <p className="font-mono text-xs text-white/60 break-all">Hash: {hash}</p>
            </div>
          </div>
        )}

        {/* Award decoration */}
        {!isLoading && (
          <div className="mt-6 flex justify-center">
            <Award size={20} className="text-white/10" />
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-white/50">
        <Link to="/" className="text-white/60 underline hover:text-white/80">
          Coast Academy
        </Link>{' '}
        — Tape Reading &amp; Análise de Fluxo
      </p>
    </div>
  );
}
