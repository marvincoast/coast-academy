import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

import { assessmentApi } from '../../api/assessment.api';
import type {
  QuestionResultDto,
  StartAttemptResponseDto,
  SubmitAttemptResponseDto,
} from '../../api/assessment.api';
import { certificateApi, saveCertificatePdfBlob } from '../../api/certificate.api';
import { ApiError } from '../../api/client';
import { Spinner } from '../../components/ui/Spinner';
import { useIssueCertificate } from '../../hooks/use-certificate';
import { cn } from '../../lib/cn';

const MAX_TAB_CHANGES = 3;

// ─── Main component ───────────────────────────────────────────────────────────

export function SimuladoPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<'loading' | 'quiz' | 'submitting' | 'result'>('loading');
  const [attempt, setAttempt] = useState<StartAttemptResponseDto | null>(null);
  const [result, setResult] = useState<SubmitAttemptResponseDto | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabChanges, setTabChanges] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptIdRef = useRef<string | null>(null);

  // ── Load/start attempt ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!assessmentId) return;

    assessmentApi
      .startAttempt(assessmentId)
      .then((data) => {
        setAttempt(data);
        setAnswers(data.savedAnswers);
        attemptIdRef.current = data.attemptId;

        // Calculate remaining time
        const elapsed = (Date.now() - new Date(data.startedAt).getTime()) / 1000;
        const remaining = Math.max(0, data.timeLimitSeconds - Math.floor(elapsed));
        setTimeLeft(remaining);
        setPhase('quiz');
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          toast.error('Simulado não encontrado. Conclua o módulo ou rode o seed de questões.');
        } else {
          toast.error('Erro ao carregar o simulado. Tente novamente.');
        }
        navigate('/simulados', { replace: true });
      });
  }, [assessmentId, navigate]);

  // ── Timer countdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'quiz') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          void handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Tab change detection (anti-cheat) ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'quiz') return;

    const handleVisibilityChange = () => {
      if (document.hidden && attemptIdRef.current) {
        setTabChanges((n) => n + 1);
        toast('⚠️ Você saiu da aba! Isso foi registrado.', { icon: '⚠️', duration: 4000 });
        void assessmentApi.recordTabChange(attemptIdRef.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [phase]);

  // ── Select answer ─────────────────────────────────────────────────────────
  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    // Auto-save in background
    if (attemptIdRef.current) {
      void assessmentApi.saveAnswer(attemptIdRef.current, questionId, optionId);
    }
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (forced = false) => {
      if (!attemptIdRef.current) return;
      if (phase === 'submitting' || phase === 'result') return;

      if (!forced) {
        const total = attempt?.questions.length ?? 0;
        const answered = Object.keys(answers).length;
        if (answered < total) {
          const confirm = window.confirm(
            `Você respondeu ${answered} de ${total} questões. Deseja enviar mesmo assim?`,
          );
          if (!confirm) return;
        }
      }

      setPhase('submitting');
      clearInterval(timerRef.current!);

      try {
        const res = await assessmentApi.submitAttempt(attemptIdRef.current);
        if (
          res.passed &&
          (import.meta.env.DEV || import.meta.env.VITE_DEV_LOCAL_LINKS === 'true')
        ) {
          sessionStorage.setItem('coast-academy-dev-last-attempt-id', res.attemptId);
        }
        setResult(res);
        setPhase('result');
      } catch {
        toast.error('Erro ao enviar. Tente novamente.');
        setPhase('quiz');
      }
    },
    [phase, attempt, answers],
  );

  // ── Auto-submit após exceder limite de trocas de aba ─────────────────────
  useEffect(() => {
    if (phase !== 'quiz' || tabChanges <= MAX_TAB_CHANGES) return;

    toast.error(
      `Limite de ${MAX_TAB_CHANGES} trocas de aba excedido. O simulado será finalizado automaticamente.`,
      { duration: 5000 },
    );
    void handleSubmit(true);
  }, [tabChanges, phase, handleSubmit]);

  // ─── Render phases ────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-gray-400">Preparando o simulado…</p>
        </div>
      </div>
    );
  }

  if (phase === 'submitting') {
    return (
      <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-gray-400">Calculando resultado…</p>
        </div>
      </div>
    );
  }

  if (phase === 'result' && result) {
    return (
      <ResultScreen
        result={result}
        title={attempt?.assessment.title ?? 'Simulado'}
        {...(attempt?.assessment.assessmentType
          ? { assessmentType: attempt.assessment.assessmentType }
          : {})}
        onBack={() => navigate(-1)}
        onRetry={() => {
          setPhase('loading');
          setAttempt(null);
          setResult(null);
          setAnswers({});
          setCurrentIdx(0);
          attemptIdRef.current = null;
          // Re-trigger effect
          if (assessmentId) {
            assessmentApi
              .startAttempt(assessmentId)
              .then((data) => {
                setAttempt(data);
                setAnswers(data.savedAnswers);
                attemptIdRef.current = data.attemptId;
                const elapsed = (Date.now() - new Date(data.startedAt).getTime()) / 1000;
                setTimeLeft(Math.max(0, data.timeLimitSeconds - Math.floor(elapsed)));
                setPhase('quiz');
              })
              .catch(() => navigate(-1));
          }
        }}
      />
    );
  }

  if (!attempt) return null;

  const questions = attempt.questions;
  const current = questions[currentIdx]!;
  const total = questions.length;
  const answered = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
        <div className="min-w-0">
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
            {attempt.assessment.title}
          </p>
          <p className="text-sm text-gray-400 mt-0.5">
            {answered}/{total} respondidas
          </p>
        </div>

        <div className="flex items-center gap-4">
          {tabChanges > 0 && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg',
                tabChanges > MAX_TAB_CHANGES
                  ? 'text-red-300 bg-red-950/70'
                  : tabChanges >= MAX_TAB_CHANGES
                    ? 'text-amber-300 bg-amber-950/50'
                    : 'text-red-400 bg-red-950/50',
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              {tabChanges}/{MAX_TAB_CHANGES} trocas de aba
            </div>
          )}
          <Timer seconds={timeLeft} total={attempt.timeLimitSeconds} />
        </div>
      </header>

      {/* Question navigator */}
      <div className="flex gap-1.5 px-6 py-3 overflow-x-auto border-b border-gray-800 shrink-0">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setCurrentIdx(idx)}
            className={cn(
              'w-8 h-8 rounded-lg text-xs font-bold shrink-0 transition-colors',
              idx === currentIdx
                ? 'bg-amber-500 text-black'
                : answers[q.id]
                  ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700'
                  : 'bg-gray-800 text-gray-500 hover:bg-gray-700',
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question body */}
      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
            Questão {currentIdx + 1} de {total}
          </span>
          <p className="mt-3 text-lg text-white leading-relaxed font-medium">{current.stem}</p>
          {current.imageUrl && (
            <img
              src={current.imageUrl}
              alt="Ilustração da questão"
              className="mt-4 rounded-xl max-h-64 object-contain border border-gray-800"
            />
          )}
        </div>

        <div className="flex flex-col gap-3">
          {current.options.map((option) => {
            const selected = answers[current.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(current.id, option.id)}
                className={cn(
                  'w-full text-left px-5 py-4 rounded-xl border transition-all duration-150',
                  selected
                    ? 'border-amber-500 bg-amber-950/40 text-white shadow-[0_0_0_1px_rgba(245,158,11,0.3)]'
                    : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-600 hover:bg-gray-800',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      selected ? 'border-amber-500 bg-amber-500' : 'border-gray-600',
                    )}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-black" />}
                  </span>
                  <span className="text-sm leading-relaxed">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer navigation */}
      <footer className="flex items-center justify-between px-6 py-4 border-t border-gray-800 shrink-0">
        <button
          type="button"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        {currentIdx < total - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleSubmit(false)}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
          >
            Finalizar simulado
          </button>
        )}
      </footer>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultScreen({
  result,
  title,
  assessmentType,
  onBack,
}: {
  result: SubmitAttemptResponseDto;
  title: string;
  assessmentType?: 'simulado' | 'prova_final';
  onBack: () => void;
  onRetry?: () => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const navigate = useNavigate();
  const issueCertificate = useIssueCertificate();
  const isProvaFinal = assessmentType === 'prova_final';

  const handleIssueAndDownloadPdf = async (): Promise<void> => {
    try {
      const cert = await issueCertificate.mutateAsync(result.attemptId);
      toast.success('Certificado emitido!');
      const blob = await certificateApi.downloadPdf(cert.id);
      saveCertificatePdfBlob(
        blob,
        `certificado-coast-academy-${cert.verificationHash.slice(0, 12)}.pdf`,
      );
      navigate('/certificados');
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message.slice(0, 120)
          : 'Não foi possível emitir o certificado. Tente novamente em /certificados.';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Score card */}
        <div
          className={cn(
            'rounded-3xl border p-8 text-center mb-8',
            result.passed
              ? 'border-emerald-500/40 bg-emerald-950/20'
              : 'border-red-500/30 bg-red-950/10',
          )}
        >
          {result.passed ? (
            <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto mb-4" />
          ) : (
            <XCircle className="h-14 w-14 text-red-400 mx-auto mb-4" />
          )}

          <h1 className="text-3xl font-bold text-white mb-1">{result.scorePercent}%</h1>
          <p
            className={cn(
              'text-lg font-semibold mb-2',
              result.passed ? 'text-emerald-400' : 'text-red-400',
            )}
          >
            {result.passed ? 'Aprovado!' : 'Não aprovado'}
          </p>
          <p className="text-sm text-gray-400">
            {result.correctAnswers} de {result.totalQuestions} questões corretas
            {' · '}
            Aprovação: {Math.round(result.passingScore * 100)}%
          </p>

          {result.tabChangeCount > 0 && (
            <p className="mt-3 text-xs text-red-400 flex items-center justify-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              {result.tabChangeCount} troca{result.tabChangeCount > 1 ? 's' : ''} de aba registrada
              {result.tabChangeCount > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Title */}
        <p className="text-center text-sm text-gray-500 mb-6">{title}</p>

        {result.passed && isProvaFinal && (
          <div className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-950/25 p-5">
            <div className="flex items-start gap-3">
              <Award className="h-8 w-8 shrink-0 text-amber-400" aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-3">
                <div>
                  <p className="font-semibold text-amber-200">
                    Parabéns! Você pode emitir seu certificado
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Gera o PDF oficial, salva no Appwrite (S3cert) e aparece em Meus Certificados.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={issueCertificate.isPending}
                  onClick={() => void handleIssueAndDownloadPdf()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:opacity-60"
                >
                  {issueCertificate.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                  )}
                  {issueCertificate.isPending ? 'Gerando PDF…' : 'Emitir e baixar certificado PDF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button
            type="button"
            onClick={() => setShowReview((v) => !v)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            {showReview ? 'Ocultar' : 'Ver'} gabarito
          </button>
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800 text-sm font-medium transition-colors"
          >
            Voltar ao curso
          </button>
        </div>

        {/* Review / gabarito */}
        {showReview && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-gray-200">Gabarito comentado</h2>
            {result.results.map((r, i) => (
              <QuestionReview key={r.questionId} result={r} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionReview({ result, index }: { result: QuestionResultDto; index: number }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        result.isCorrect
          ? 'border-emerald-800/60 bg-emerald-950/20'
          : 'border-red-800/40 bg-red-950/10',
      )}
    >
      <div className="flex items-start gap-3">
        {result.isCorrect ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">Questão {index + 1}</p>
          <p className="text-sm text-gray-200 leading-relaxed">{result.stem}</p>
          {result.explanation && (
            <div className="mt-2 text-xs text-gray-400 border-l-2 border-amber-500/40 pl-3 leading-relaxed">
              {result.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function Timer({ seconds, total }: { seconds: number; total: number }) {
  const pct = total > 0 ? seconds / total : 0;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const isWarning = pct < 0.2;
  const isCritical = pct < 0.1;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg',
        isCritical
          ? 'bg-red-950/50 text-red-400 animate-pulse'
          : isWarning
            ? 'bg-amber-950/50 text-amber-400'
            : 'bg-gray-800 text-gray-300',
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span className="text-sm font-mono font-bold tabular-nums">
        {m}:{s.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
