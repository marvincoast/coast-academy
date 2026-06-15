import { ChevronDown, Lock, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { ModuleDto } from '../../api/course.api';
import { cn } from '../../lib/cn';

import { ChapterAccordion } from './ChapterAccordion';
import { ProgressRing } from './ProgressRing';

interface ModuleCardProps {
  module: ModuleDto;
  index: number;
}

export function ModuleCard({ module, index }: ModuleCardProps) {
  const [open, setOpen] = useState(index === 0 && module.isUnlocked);
  const isLocked = !module.isUnlocked;

  const firstIncompleteChapterIndex = module.chapters.findIndex(
    (ch) => ch.completedCount < ch.totalCount,
  );

  const isCompleted = !isLocked && module.progressPct === 100;
  const isInProgress = !isLocked && module.progressPct > 0 && module.progressPct < 100;

  return (
    <div
      className="rounded-2xl transition-all duration-200"
      style={
        isLocked
          ? {
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(11,15,20,0.4)',
              opacity: 0.6,
            }
          : isCompleted
            ? {
                border: '1px solid rgba(0,200,83,0.22)',
                background:
                  'linear-gradient(135deg, rgba(14,22,18,0.95) 0%, rgba(11,16,20,0.98) 100%)',
                boxShadow: '0 0 0 1px rgba(0,200,83,0.06), 0 4px 20px rgba(0,0,0,0.3)',
              }
            : {
                border: '1px solid rgba(201,162,39,0.18)',
                background:
                  'linear-gradient(135deg, rgba(15,21,30,0.95) 0%, rgba(11,16,20,0.98) 100%)',
                boxShadow: isInProgress
                  ? '0 0 0 1px rgba(201,162,39,0.08), 0 4px 20px rgba(0,0,0,0.3)'
                  : '0 1px 3px rgba(0,0,0,0.2)',
              }
      }
    >
      <button
        type="button"
        onClick={() => !isLocked && setOpen((v) => !v)}
        disabled={isLocked}
        className={cn(
          'flex w-full items-center gap-4 rounded-2xl p-5 text-left transition-colors',
          !isLocked && 'hover:bg-white/3',
          isLocked && 'cursor-not-allowed',
        )}
        aria-expanded={!isLocked && open}
      >
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          )}
          style={
            isLocked
              ? {
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(11,15,20,0.6)',
                  color: 'rgba(255,255,255,0.25)',
                }
              : isCompleted
                ? {
                    border: '1px solid rgba(0,200,83,0.40)',
                    background: 'rgba(0,200,83,0.12)',
                    color: '#00c853',
                    boxShadow: '0 0 12px rgba(0,200,83,0.20)',
                  }
                : {
                    border: '1px solid rgba(201,162,39,0.40)',
                    background: 'rgba(201,162,39,0.10)',
                    color: '#c9a227',
                    boxShadow: isInProgress ? '0 0 12px rgba(201,162,39,0.20)' : 'none',
                  }
          }
        >
          {isLocked ? <Lock className="h-4 w-4" /> : index + 1}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="mb-0.5 text-xs font-semibold uppercase tracking-widest"
            style={{
              color: isLocked
                ? 'rgba(255,255,255,0.22)'
                : isCompleted
                  ? 'rgba(0,200,83,0.7)'
                  : 'rgba(201,162,39,0.65)',
            }}
          >
            Módulo {index + 1}
          </p>
          <h3
            className={cn(
              'truncate text-base font-semibold',
              isLocked ? 'text-white/28' : 'text-white',
            )}
          >
            {module.title}
          </h3>
          {!isLocked && (
            <p className="mt-0.5 text-xs text-white/40">
              {module.completedLessons} de {module.totalLessons} aulas concluídas
            </p>
          )}
          {isLocked && (
            <p className="mt-0.5 text-xs text-white/28">
              Complete o módulo anterior para desbloquear
            </p>
          )}
        </div>

        {!isLocked && (
          <ProgressRing pct={module.progressPct} size={52} stroke={4} className="shrink-0" />
        )}

        {!isLocked && (
          <ChevronDown
            className={cn(
              'h-5 w-5 shrink-0 text-white/40 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        )}
      </button>

      {!isLocked && open && (
        <div className="flex flex-col gap-3 px-5 pb-5">
          {module.description && (
            <p className="border-l-2 border-brand-gold/40 pl-3 text-sm leading-relaxed text-white/50">
              {module.description}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {module.chapters.map((chapter, chIdx) => (
              <ChapterAccordion
                key={chapter.id}
                chapter={chapter}
                defaultOpen={chIdx === firstIncompleteChapterIndex}
              />
            ))}
          </div>

          {module.progressPct === 100 && (
            <div className="mt-3 border-t border-white/8 pt-3">
              <Link
                to="/simulados"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-2.5 text-sm font-semibold text-brand-gold transition-colors hover:border-brand-gold/60 hover:bg-brand-gold/20"
              >
                <Trophy className="h-4 w-4" />
                Fazer Simulado do Módulo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
