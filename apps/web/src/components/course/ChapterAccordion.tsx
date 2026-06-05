import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import type { ChapterDto } from '../../api/course.api';
import { cn } from '../../lib/cn';

import { LessonRow } from './LessonRow';

interface ChapterAccordionProps {
  chapter: ChapterDto;
  defaultOpen?: boolean;
}

export function ChapterAccordion({ chapter, defaultOpen = false }: ChapterAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const allDone = chapter.completedCount === chapter.totalCount && chapter.totalCount > 0;

  return (
    <div className="overflow-hidden rounded-xl border border-white/8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between px-4 py-3 text-left transition-colors',
          open ? 'bg-bg-elevated' : 'bg-bg-surface hover:bg-bg-elevated/70',
        )}
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="truncate text-sm font-medium text-white/85">{chapter.title}</span>
        </div>

        <div className="ml-4 flex shrink-0 items-center gap-3">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              allDone ? 'bg-flow-bid/10 text-flow-bid' : 'bg-white/5 text-white/40',
            )}
          >
            {chapter.completedCount}/{chapter.totalCount}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-white/40 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-1.5 bg-bg-base/80 p-3">
          {chapter.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
