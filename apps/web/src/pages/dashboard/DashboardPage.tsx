import {
  Award,
  BookOpen,
  Crown,
  Medal,
  MessageSquare,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge.js';
import { GlassCard } from '@/components/ui/GlassCard.js';
import { MarketBadge } from '@/components/ui/MarketBadge.js';
import { ProgressBar } from '@/components/ui/ProgressBar.js';
import { StatCard } from '@/components/ui/StatCard.js';
import { COAST_COURSE_ID, MESA_PROPRIETARIA_MIN_SCORE } from '@/config/constants.js';
import { useStaggeredAnimation } from '@/hooks/use-staggered-animation.js';
import { useAuth } from '@/hooks/use-auth.js';
import { useCourse } from '@/hooks/use-course.js';
import { useMyRanking } from '@/hooks/use-ranking.js';
import { cn } from '@/lib/cn.js';

export default function DashboardPage(): JSX.Element {
  const { t } = useTranslation('dashboard');
  const { user } = useAuth();
  const { data: course, isLoading: loadingCourse } = useCourse(COAST_COURSE_ID);
  const { data: myRanking, isLoading: loadingRanking } = useMyRanking();
  const staggerRef = useStaggeredAnimation({ selector: '[data-stagger]' });

  const displayName =
    (user?.user_metadata?.['display_name'] as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Trader';

  const progressPct = course?.progressPct ?? 0;
  const stats = myRanking?.profileStats;
  const isLoading = loadingCourse || loadingRanking;

  return (
    <div ref={staggerRef} className="mx-auto max-w-5xl space-y-8">
      <section data-stagger>
        {/* Banner de boas-vindas — com visual dramático */}
        <div
          className="relative overflow-hidden rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(13,20,32,0.95) 0%, rgba(11,16,20,0.98) 60%, rgba(15,24,12,0.95) 100%)',
            border: '1px solid rgba(201,162,39,0.25)',
            boxShadow: '0 0 0 1px rgba(201,162,39,0.08), 0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(201,162,39,0.06)',
          }}
        >
          {/* Glow dourado — canto superior direito */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.25) 0%, transparent 70%)' }}
          />
          {/* Glow verde — canto inferior esquerdo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.15) 0%, transparent 70%)' }}
          />
          {/* Grade decorativa */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(rgba(201,162,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <MarketBadge icon={<Zap size={10} aria-hidden="true" />} className="mb-3">
                Dólar Futuro B3
              </MarketBadge>
              <h1 className="text-2xl font-display font-bold text-white">
                {t('welcome.title', { name: displayName })}
              </h1>
              <p className="mt-1.5 max-w-lg text-sm text-white/50">
                {progressPct === 0
                  ? 'Comece pelo Módulo 1 e aprenda tape reading do zero.'
                  : progressPct === 100
                    ? 'Você completou todo o conteúdo! Faça a Prova Final.'
                    : `Continue de onde parou — ${progressPct}% concluído.`}
              </p>
            </div>
            <Link
              to="/curso"
              className={cn(
                'hidden shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 sm:inline-flex',
                'text-bg-base',
              )}
              style={{
                background: 'linear-gradient(135deg, #f0c040, #c9a227)',
                boxShadow: '0 0 20px rgba(201,162,39,0.35)',
              }}
            >
              {progressPct === 0 ? 'Iniciar curso' : 'Continuar →'}
            </Link>
          </div>
          <div className="relative mt-5">
            <ProgressBar
              value={progressPct}
              label="Progresso geral"
              showPercentage
              variant="gold"
              animate
            />
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard
              key={i}
              icon={<BookOpen className="h-5 w-5" />}
              label=""
              value=""
              loading
            />
          ))}
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div data-stagger>
          <StatCard
            className="animate-fade-up-1"
            icon={<BookOpen className="h-5 w-5" />}
            label="Aulas concluídas"
            value={
              stats
                ? `${stats.completedLessons}/${stats.totalLessons}`
                : `0/${course?.totalLessons ?? 0}`
            }
            subtitle={`${progressPct}% do curso`}
          />
          </div>
          <div data-stagger>
          <StatCard
            className="animate-fade-up-2"
            icon={<Award className="h-5 w-5" />}
            label="Simulados aprovados"
            value={`${stats?.simuladosPassed ?? 0}/8`}
            subtitle="módulos testados"
          />
          </div>
          <div data-stagger>
          <StatCard
            className="animate-fade-up-3"
            icon={<TrendingUp className="h-5 w-5" />}
            label="Prova Final"
            value={
              stats?.provaFinalScore !== null && stats?.provaFinalScore !== undefined
                ? `${stats.provaFinalScore}%`
                : '—'
            }
            subtitle={
              stats?.provaFinalPassed
                ? 'Aprovado ✓'
                : stats?.provaFinalScore !== null && stats?.provaFinalScore !== undefined
                  ? 'Não aprovado'
                  : 'Não realizada'
            }
            highlight={!!stats?.provaFinalPassed}
            {...(stats?.provaFinalPassed
              ? { trend: 'up' as const, trendValue: 'Aprovado' }
              : {})}
          />
          </div>
          <div data-stagger>
          <StatCard
            className="animate-fade-up-4"
            icon={<Medal className="h-5 w-5" />}
            label="Posição no ranking"
            value={myRanking?.provaFinal ? `${myRanking.provaFinal.position}º` : '—'}
            subtitle="Prova Final"
            highlight={!!myRanking?.provaFinal}
          />
          </div>
        </section>
      )}

      <section data-stagger aria-labelledby="course-overview-heading">
        <GlassCard depth="surface" hover className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id="course-overview-heading" className="font-semibold text-white">
                Coast Academy — Tape Reading BR
              </h2>
              <p className="mt-0.5 text-xs text-white/40">8 módulos · 48 aulas · Dólar Futuro B3</p>
            </div>
            <Link
              to="/curso"
              className="shrink-0 rounded-lg border border-brand-gold/30 px-4 py-2 text-sm font-medium text-brand-gold-soft transition-all duration-200 hover:border-brand-gold hover:bg-brand-gold/8"
            >
              {progressPct === 0 ? 'Iniciar' : 'Continuar'}
            </Link>
          </div>

          <ProgressBar
            value={progressPct}
            label="Progresso geral"
            showPercentage
            variant="gold"
            animate
          />

          {course && (
            <div className="mt-5 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
              {course.modules.map((mod) => (
                <Link
                  key={mod.id}
                  to="/curso"
                  title={mod.title}
                  className={cn(
                    'flex flex-col items-center rounded-lg px-1 py-2 text-center transition-all duration-150',
                    mod.isUnlocked
                      ? 'hover:scale-105 hover:bg-white/5'
                      : 'pointer-events-none opacity-30',
                  )}
                >
                  <span className="text-[10px] font-bold text-white/30">M{mod.orderIndex}</span>
                  <span
                    className={cn(
                      'mt-0.5 font-mono text-xs font-semibold tabular-nums',
                      mod.progressPct === 100
                        ? 'text-flow-bid'
                        : mod.progressPct > 0
                          ? 'text-brand-gold'
                          : 'text-white/20',
                    )}
                  >
                    {mod.progressPct}%
                  </span>
                </Link>
              ))}
            </div>
          )}

          {stats?.provaFinalPassed && (stats.provaFinalScore ?? 0) >= MESA_PROPRIETARIA_MIN_SCORE && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-brand-gold/25 bg-brand-gold-muted px-4 py-3">
              <Crown className="h-5 w-5 shrink-0 text-brand-gold" />
              <p className="text-sm text-brand-gold-soft">
                Você se qualificou para candidatura à{' '}
                <strong className="text-brand-gold">Mesa Proprietária Coast Academy!</strong>
              </p>
            </div>
          )}
        </GlassCard>
      </section>

      <section data-stagger aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="section-heading mb-4">
          Acesso rápido
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickCard
            icon={<BookOpen size={20} />}
            title={t('quickActions.continueCourse')}
            description="Tape reading e análise de fluxo"
            href="/curso"
            badge={<Badge variant="gold">Disponível</Badge>}
          />
          <QuickCard
            icon={<Medal size={20} />}
            title={t('quickActions.viewRanking')}
            description="Top traders Coast Academy"
            href="/ranking"
            badge={<Badge variant="gold">Disponível</Badge>}
          />
          <QuickCard
            icon={<Award size={20} />}
            title={t('quickActions.viewCertificates')}
            description="Certificados Coast Academy"
            href="/certificados"
            badge={<Badge variant="gold">Disponível</Badge>}
          />
          <QuickCard
            icon={<MessageSquare size={20} />}
            title={t('quickActions.askTutor')}
            description="Tutor IA de tape reading"
            href="/tutor"
            badge={<Badge variant="gold">Disponível</Badge>}
          />
        </div>
      </section>
    </div>
  );
}

function QuickCard({
  icon,
  title,
  description,
  href,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: React.ReactNode;
}) {
  return (
    <Link to={href} className="group block h-full">
      <GlassCard variant="interactive" depth="surface" hover className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold transition-all duration-200 group-hover:scale-110 group-hover:bg-brand-gold/20">
            {icon}
          </span>
          {badge}
        </div>
        <div>
          <p className="font-semibold text-white/90 transition-colors duration-150 group-hover:text-white">
            {title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/40">{description}</p>
        </div>
      </GlassCard>
    </Link>
  );
}
