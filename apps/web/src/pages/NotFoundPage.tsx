import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function NotFoundPage(): JSX.Element {
  const { t } = useTranslation('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-base px-4 text-center">
      <p className="font-mono text-7xl font-bold text-brand-gold/20">404</p>
      <p className="text-lg font-semibold text-white">{t('errors.notFound')}</p>
      <Link
        to="/dashboard"
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-brand-gold/40 hover:text-white"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
