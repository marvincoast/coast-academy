import { useQueries } from '@tanstack/react-query';
import { Lock, Target, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { assessmentApi } from '@/api/assessment.api';
import type { ModuleDto } from '@/api/course.api';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { COAST_COURSE_ID } from '@/config/constants';
import { useCourse } from '@/hooks/use-course';
import { cn } from '@/lib/cn';

function ModuleSimuladoRow({
  module,
  index,
  assessment,
  assessmentLoading,
  assessmentMissing,
}: {
  module: ModuleDto;
  index: number;
  assessment: Awaited<ReturnType<typeof assessmentApi.getByModule>> | undefined;
  assessmentLoading: boolean;
  assessmentMissing: boolean;
}): JSX.Element {
  const { t } = useTranslation('course');
  const navigate = useNavigate();

  const lockedModule = !module.isUnlocked;
  const lockedLessons = module.isUnlocked && module.progressPct < 100;
  const ready = module.isUnlocked && module.progressPct === 100;

  const minutes = assessment ? Math.max(1, Math.round(assessment.timeLimitSeconds / 60)) : 15;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        lockedModule && 'border-white/6 bg-white/2 opacity-60',
        lockedLessons && 'border-white/8 bg-bg-surface/50',
        ready && 'border-brand-gold/20 bg-brand-gold/5',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
              lockedModule && 'bg-white/5 text-white/25',
              lockedLessons && 'bg-white/8 text-white/50',
              ready && 'bg-brand-gold/15 text-brand-gold',
            )}
          >
            {lockedModule ? <Lock size={16} /> : index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
              {t('simulations.moduleLabel', { number: index + 1 })}
            </p>
            <h3 className="font-semibold text-white truncate">{module.title}</h3>
            {assessment && ready && (
              <p className="mt-0.5 text-xs text-white/45 truncate">{assessment.title}</p>
            )}
          </div>
        </div>

        {!lockedModule && (
          <ProgressBar
            value={module.progressPct}
            className="w-28 shrink-0"
            size="sm"
            variant={module.progressPct === 100 ? 'bid' : 'gold'}
            showPercentage
          />
        )}
      </div>

      <div className="mt-3">
        {lockedModule && <p className="text-xs text-white/40">{t('simulations.lockedModule')}</p>}
        {lockedLessons && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/50">{t('simulations.lockedLessons')}</p>
            <Link
              to="/curso"
              className="text-xs font-semibold text-brand-gold hover:underline underline-offset-2"
            >
              {t('simulations.goToLessons')}
            </Link>
          </div>
        )}
        {ready && assessmentLoading && (
          <p className="text-xs text-white/40">{t('simulations.loadingAssessment')}</p>
        )}
        {ready && assessmentMissing && (
          <p className="text-xs text-state-warning">{t('simulations.missingAssessment')}</p>
        )}
        {ready && assessment && !assessmentLoading && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/45">
              {t('simulations.meta', {
                count: assessment.questionCount,
                minutes,
                percent: Math.round(assessment.passingScore * 100),
              })}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/simulado/${assessment.id}`)}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all',
                'bg-brand-gold text-bg-base hover:bg-brand-gold-soft',
              )}
            >
              <Trophy size={14} aria-hidden="true" />
              {t('startSimulation')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SimuladosPage(): JSX.Element {
  const { t } = useTranslation('course');
  const { data: course, isLoading, isError } = useCourse(COAST_COURSE_ID);

  const assessmentQueries = useQueries({
    queries:
      course?.modules.map((mod) => ({
        queryKey: ['assessments', 'module', mod.id],
        queryFn: () => assessmentApi.getByModule(mod.id),
        enabled: mod.isUnlocked && mod.progressPct === 100,
        retry: false,
      })) ?? [],
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <GlassCard depth="surface" className="mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-state-danger">{t('simulations.loadError')}</p>
        <Link to="/curso" className="mt-3 inline-block text-sm text-brand-gold underline">
          {t('finalExam.goToCourse')}
        </Link>
      </GlassCard>
    );
  }

  const passedCount = assessmentQueries.filter((q) => q.isSuccess).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-state-info/10 text-state-info">
          <Target size={24} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {t('simulations.pageTitle')}
          </h1>
          <p className="mt-1 text-sm text-white/50 leading-relaxed">
            {t('simulations.pageDescription')}
          </p>
        </div>
      </div>

      <GlassCard depth="surface" className="p-4">
        <p className="text-xs text-white/40">{t('simulations.hint')}</p>
      </GlassCard>

      <div className="space-y-3">
        {course.modules.map((mod, idx) => {
          const q = assessmentQueries[idx];
          return (
            <ModuleSimuladoRow
              key={mod.id}
              module={mod}
              index={idx}
              assessment={q?.data}
              assessmentLoading={Boolean(q?.isLoading)}
              assessmentMissing={mod.isUnlocked && mod.progressPct === 100 && q?.isError === true}
            />
          );
        })}
      </div>

      {passedCount === 0 && course.modules.every((m) => !m.isUnlocked || m.progressPct < 100) && (
        <p className="text-center text-xs text-white/35">{t('simulations.noneReady')}</p>
      )}
    </div>
  );
}
