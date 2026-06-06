import { BookOpen, Lock, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { assessmentApi } from '@/api/assessment.api';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Spinner } from '@/components/ui/Spinner';
import { COAST_COURSE_ID } from '@/config/constants';
import { useCourse } from '@/hooks/use-course';
import { cn } from '@/lib/cn';

export default function ProvaFinalPage(): JSX.Element {
  const { t } = useTranslation('course');
  const navigate = useNavigate();
  const { data: course, isLoading: courseLoading, isError: courseError } = useCourse(COAST_COURSE_ID);

  const progressPct = course?.progressPct ?? 0;
  const courseComplete = progressPct >= 100;

  const {
    data: assessment,
    isLoading: assessmentLoading,
    isError: assessmentError,
  } = useQuery({
    queryKey: ['assessments', 'prova-final', COAST_COURSE_ID],
    queryFn: () => assessmentApi.getProvaFinal(COAST_COURSE_ID),
    enabled: courseComplete,
    retry: false,
  });

  if (courseLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <GlassCard variant="gold" depth="surface" className="mx-auto max-w-lg p-8 text-center">
        <p className="text-sm text-state-danger">{t('finalExam.loadCourseError')}</p>
        <Link
          to="/curso"
          className="mt-4 inline-block text-sm text-brand-gold underline underline-offset-2"
        >
          {t('finalExam.goToCourse')}
        </Link>
      </GlassCard>
    );
  }

  if (!courseComplete) {
    return (
      <div className="mx-auto max-w-xl space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
            <Lock className="h-8 w-8 text-white/35" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">{t('finalExam.lockedTitle')}</h1>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">{t('finalExam.lockedDescription')}</p>
        </div>

        <GlassCard depth="surface" className="p-6 space-y-4">
          <ProgressBar
            value={progressPct}
            label={t('finalExam.courseProgress')}
            showPercentage
            variant="gold"
            size="lg"
          />
          <p className="text-xs text-white/40">{t('finalExam.lockedHint')}</p>
          <Link
            to="/curso"
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
              'bg-brand-gold text-bg-base hover:bg-brand-gold-soft hover:shadow-glow-gold',
            )}
          >
            <BookOpen size={16} aria-hidden="true" />
            {t('finalExam.continueCourse')}
          </Link>
        </GlassCard>
      </div>
    );
  }

  if (assessmentLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-white/45">{t('finalExam.loading')}</p>
      </div>
    );
  }

  if (assessmentError || !assessment) {
    return (
      <GlassCard variant="gold" depth="surface" className="mx-auto max-w-lg p-8 text-center space-y-4">
        <p className="text-sm text-white/70">{t('finalExam.notConfigured')}</p>
        <p className="text-xs text-white/40 font-mono">./infra/scripts/seed-db.sh (02_questions.sql)</p>
        <Link to="/curso" className="text-sm text-brand-gold underline underline-offset-2">
          {t('finalExam.goToCourse')}
        </Link>
      </GlassCard>
    );
  }

  const hours = Math.floor(assessment.timeLimitSeconds / 3600);
  const minutes = Math.floor((assessment.timeLimitSeconds % 3600) / 60);
  const timeLabel =
    hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`;

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-scale-in">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gold/15 border border-brand-gold/25">
          <Trophy className="h-8 w-8 text-brand-gold" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-display font-bold text-brand-gold-soft">{assessment.title}</h1>
        <p className="mt-2 text-sm text-white/50">{t('finalExam.readyDescription')}</p>
      </div>

      <GlassCard variant="gold" depth="surface" className="p-6 space-y-4">
        <ul className="space-y-2 text-sm text-white/60">
          <li>
            {t('finalExam.metaQuestions', { count: assessment.questionCount })}
          </li>
          <li>{t('finalExam.metaTime', { time: timeLabel })}</li>
          <li>
            {t('finalExam.metaPassing', {
              percent: Math.round(assessment.passingScore * 100),
            })}
          </li>
        </ul>
        <button
          type="button"
          onClick={() => navigate(`/simulado/${assessment.id}`)}
          className={cn(
            'w-full rounded-xl px-4 py-3 text-sm font-display font-semibold transition-all',
            'bg-brand-gold text-bg-base hover:bg-brand-gold-soft hover:shadow-glow-gold-strong',
          )}
        >
          {t('finalExam.startButton')}
        </button>
      </GlassCard>
    </div>
  );
}
