import { BookOpen, Target, TrendingUp, Trophy } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { ApiError } from '@/api/client.js';
import { TapeReadingVisualization } from '@/components/market/TapeReadingVisualization.js';
import { ModuleCard } from '@/components/course/ModuleCard.js';
import { Button } from '@/components/ui/Button.js';
import { GlassCard } from '@/components/ui/GlassCard.js';
import { MarketBadge } from '@/components/ui/MarketBadge.js';
import { ProgressBar } from '@/components/ui/ProgressBar.js';
import { MOCK_TAPE_ENTRIES } from '@/lib/mock-market-data.js';
import { COAST_COURSE_ID } from '@/config/constants.js';
import { useCourse } from '@/hooks/use-course.js';
import { cn } from '@/lib/cn.js';

export default function CoursePage() {
  const { courseId = COAST_COURSE_ID } = useParams<{ courseId?: string }>();
  const { data: course, isLoading, isError, error } = useCourse(courseId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="skeleton h-44 rounded-2xl" />
        {/* Module skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    const status = error instanceof ApiError ? error.status : 0;
    const needsAuth = status === 401 || status === 403;
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4 animate-fade-up">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-state-danger/10 border border-state-danger/20">
          <Target className="h-7 w-7 text-state-danger" />
        </div>
        <h1 className="text-xl font-semibold text-white">
          {needsAuth ? 'Login necessário' : 'Erro ao carregar o curso'}
        </h1>
        <p className="text-white/50 text-sm">
          {needsAuth
            ? 'Entre na sua conta para acessar o conteúdo do curso.'
            : 'A API do curso não respondeu. Confira se a stack Docker está no ar e tente novamente.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {needsAuth ? (
            <Button variant="secondary" onClick={() => window.location.assign('/')}>
              Ir para login
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          )}
          <Link
            to="/dashboard"
            className="inline-flex h-10 items-center px-4 text-sm text-white/50 hover:text-white transition-colors"
          >
            ← Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/404" replace />;
  }

  const progressPct = course.progressPct;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-fade-up">

      {/* ── Course header ──────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(13,20,32,0.98) 0%, rgba(10,16,22,1) 100%)',
          border: '1px solid rgba(201,162,39,0.28)',
          boxShadow: '0 0 0 1px rgba(201,162,39,0.06), 0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(201,162,39,0.05)',
        }}
      >
        {/* Glows decorativos */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.22) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%)' }}
        />
        {/* Grade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,162,39,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(201,162,39,0.07) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <MarketBadge>
                  Mercado {course.market === 'BR' ? 'Brasileiro' : 'Americano'}
                </MarketBadge>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-flow-ask"
                  style={{ background: 'rgba(255,82,82,0.10)', border: '1px solid rgba(255,82,82,0.20)' }}
                >
                  Dólar Futuro (B3)
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-white leading-tight">
                {course.title}
              </h1>
              {course.subtitle && (
                <p className="text-white/50 mt-1 text-sm">{course.subtitle}</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap gap-3">
            <CourseStat
              icon={<BookOpen className="h-4 w-4" />}
              label="Aulas"
              value={`${course.totalLessons}`}
            />
            <CourseStat
              icon={<Target className="h-4 w-4" />}
              label="Concluídas"
              value={`${course.completedLessons}`}
            />
            <CourseStat
              icon={<TrendingUp className="h-4 w-4" />}
              label="Progresso"
              value={`${progressPct}%`}
              highlight={progressPct > 0}
            />
          </div>

          {/* Global progress bar */}
          <div className="mt-5">
            <ProgressBar
              value={progressPct}
              label="Progresso geral"
              showPercentage
              variant="gold"
              animate
            />
          </div>
        </div>
      </div>

      <GlassCard depth="elevated" className="p-4">
        <h2 className="section-heading mb-3">Fluxo de ordens (exemplo)</h2>
        <TapeReadingVisualization data={MOCK_TAPE_ENTRIES} maxEntries={8} variant="compact" />
      </GlassCard>

      {/* ── Modules list ───────────────────────────────────────────── */}
      <section>
        <h2 className="section-heading mb-4">Módulos do curso</h2>
        <div className="flex flex-col gap-3">
          {course.modules.map((mod, idx) => (
            <ModuleCard key={mod.id} module={mod} index={idx} />
          ))}
        </div>
      </section>

      {/* ── Final exam CTA ─────────────────────────────────────────── */}
      {progressPct === 100 && (
        <GlassCard variant="gold" depth="surface" className="p-6 text-center animate-scale-in">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-brand-gold/20 mb-4">
            <Trophy className="h-7 w-7 text-brand-gold" />
          </div>
          <p className="text-lg font-display font-bold text-brand-gold-soft mb-1">
            Parabéns! Você completou todos os módulos.
          </p>
          <p className="text-sm text-white/50 mb-5">
            Faça a Prova Final e conquiste seu certificado Coast Academy.
          </p>
          <Link
            to="/prova-final"
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display font-semibold text-sm transition-all duration-200',
              'bg-brand-gold text-bg-base hover:bg-brand-gold-soft hover:shadow-glow-gold-strong',
            )}
          >
            Iniciar Prova Final
          </Link>
        </GlassCard>
      )}
    </div>
  );
}

function CourseStat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 border transition-colors duration-150',
        highlight
          ? 'border-brand-gold/20 bg-brand-gold-muted text-brand-gold'
          : 'border-white/8 bg-bg-surface/60 text-white/60',
      )}
    >
      <span className={highlight ? 'text-brand-gold' : 'text-white/40'}>{icon}</span>
      <div>
        <p className="text-[10px] text-white/35 uppercase tracking-wide">{label}</p>
        <p className={cn('text-sm font-semibold', highlight ? 'text-brand-gold' : 'text-white/80')}>
          {value}
        </p>
      </div>
    </div>
  );
}
