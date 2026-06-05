import { CheckCircle2, Clock, FileDown, FileText, Lock, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { LessonDto } from '../../api/course.api';
import { cn } from '../../lib/cn';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

const contentTypeIcon = {
  video: PlayCircle,
  text: FileText,
  pdf: FileDown,
} as const;

interface LessonRowProps {
  lesson: LessonDto;
}

export function LessonRow({ lesson }: LessonRowProps) {
  const Icon = contentTypeIcon[lesson.contentType] ?? FileText;

  if (lesson.isLocked) {
    return (
      <div className="flex cursor-not-allowed select-none items-center gap-3 rounded-lg bg-bg-surface/50 px-4 py-3 opacity-60">
        <Lock className="h-4 w-4 shrink-0 text-white/30" />
        <span className="flex-1 truncate text-sm text-white/40">{lesson.title}</span>
        {lesson.durationSeconds && (
          <span className="text-xs text-white/30">{formatDuration(lesson.durationSeconds)}</span>
        )}
      </div>
    );
  }

  return (
    <Link
      to={`/aula/${lesson.id}`}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-4 py-3 transition-colors',
        lesson.completed
          ? 'bg-flow-bid/10 hover:bg-flow-bid/15'
          : 'bg-bg-surface/50 hover:bg-bg-elevated',
      )}
    >
      {lesson.completed ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-flow-bid" />
      ) : (
        <Icon className="h-4 w-4 shrink-0 text-brand-gold group-hover:text-brand-gold-soft" />
      )}

      <span
        className={cn(
          'flex-1 truncate text-sm',
          lesson.completed
            ? 'text-white/40 line-through decoration-white/20'
            : 'text-white/85',
        )}
      >
        {lesson.title}
      </span>

      {lesson.durationSeconds && (
        <span className="flex shrink-0 items-center gap-1 text-xs text-white/40">
          <Clock className="h-3 w-3" />
          {formatDuration(lesson.durationSeconds)}
        </span>
      )}
    </Link>
  );
}
