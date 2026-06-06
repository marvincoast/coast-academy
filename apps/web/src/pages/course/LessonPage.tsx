import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  PlayCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button.js';
import { Spinner } from '@/components/ui/Spinner.js';
import { COAST_COURSE_ID } from '@/config/constants.js';
import { useLesson, useCompleteLesson } from '@/hooks/use-course.js';
import { cn } from '@/lib/cn.js';

export default function LessonPage() {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const { data: lesson, isLoading, isError } = useLesson(lessonId);
  const { mutate: completeLesson, isPending: isCompleting } =
    useCompleteLesson(COAST_COURSE_ID);

  const handleComplete = () => {
    if (lesson?.completed) return;
    completeLesson(lessonId, {
      onSuccess: () => {
        toast.success('Aula concluída!');
      },
      onError: () => {
        toast.error('Erro ao marcar aula como concluída. Tente novamente.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-10 w-3/4 rounded-xl" />
        <div className="skeleton aspect-video rounded-2xl" />
        <div className="skeleton h-20 rounded-xl" />
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-up">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-state-danger/10 border border-state-danger/20 mb-4">
          <PlayCircle className="h-7 w-7 text-state-danger/60" />
        </div>
        <p className="text-white/60 font-medium">Aula não encontrada.</p>
        <Link
          to="/curso"
          className="mt-4 inline-block text-brand-gold hover:text-brand-gold-soft transition-colors text-sm"
        >
          ← Voltar ao curso
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-up">
      {/* Back navigation */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className={cn(
          'flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-6',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-lg px-1',
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao curso
      </button>

      {/* Lesson header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-white/35 mb-2">
          <ContentTypeIcon type={lesson.contentType} />
          <span className="uppercase tracking-wider">{contentTypeLabel[lesson.contentType]}</span>
          {lesson.durationSeconds && (
            <>
              <span className="text-white/20">·</span>
              <Clock className="h-3 w-3" />
              <span>{formatDuration(lesson.durationSeconds)}</span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-display font-bold text-white">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-white/50 mt-2 text-sm leading-relaxed">{lesson.description}</p>
        )}
      </div>

      {/* Content area */}
      <div className="rounded-2xl border border-white/8 bg-bg-surface overflow-hidden mb-6 shadow-card">
        {lesson.contentType === 'video' && lesson.contentUrl ? (
          <VideoPlayer url={lesson.contentUrl} />
        ) : lesson.contentType === 'text' && lesson.contentMarkdown ? (
          <MarkdownContent markdown={lesson.contentMarkdown} />
        ) : (
          <PlaceholderContent type={lesson.contentType} />
        )}
      </div>

      {/* Completion CTA */}
      <div
        className={cn(
          'rounded-2xl border p-5 flex items-center justify-between gap-4 transition-all duration-300',
          lesson.completed
            ? 'border-flow-bid/25 bg-flow-bid-subtle shadow-glow-bid'
            : 'border-white/8 bg-bg-surface hover:border-white/12',
        )}
      >
        <div className="flex items-center gap-3">
          {lesson.completed ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-flow-bid/20">
              <CheckCircle2 className="h-5 w-5 text-flow-bid shrink-0" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <Circle className="h-5 w-5 text-white/25 shrink-0" />
            </div>
          )}
          <div>
            <p
              className={cn(
                'text-sm font-semibold',
                lesson.completed ? 'text-flow-bid' : 'text-white/80',
              )}
            >
              {lesson.completed ? 'Aula concluída ✓' : 'Marcar como concluída'}
            </p>
            {!lesson.completed && (
              <p className="text-xs text-white/30 mt-0.5">
                Conclua esta aula para desbloquear a próxima
              </p>
            )}
          </div>
        </div>

        {!lesson.completed && (
          <Button
            onClick={handleComplete}
            disabled={isCompleting}
            size="sm"
            className="shrink-0"
          >
            {isCompleting ? <Spinner size="sm" /> : 'Concluir aula'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Extrai o ID do vídeo YouTube de forma robusta usando a URL API.
 * Suporta formatos: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 */
function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (
      parsed.hostname === 'www.youtube.com' ||
      parsed.hostname === 'youtube.com' ||
      parsed.hostname === 'm.youtube.com'
    ) {
      if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v');
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1]?.split('/')[0] ?? null;
      }
    } else if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1).split('/')[0] ?? null;
    }

    if (!videoId) return null;

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    // Preserva parâmetros relevantes (start time, etc)
    const start = parsed.searchParams.get('t') ?? parsed.searchParams.get('start');
    if (start) embedUrl.searchParams.set('start', start.replace('s', ''));

    return embedUrl.toString();
  } catch {
    return null;
  }
}

function VideoPlayer({ url }: { url: string }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  if (embedUrl) {
    return (
      <div className="aspect-video bg-black">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Vídeo da aula"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video bg-bg-base">
      <video src={url} controls className="w-full h-full object-contain">
        <track kind="captions" />
      </video>
    </div>
  );
}

function MarkdownContent({ markdown }: { markdown: string }) {
  const lines = markdown.split('\n');

  return (
    <div className="p-6 lg:p-8 space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={i} className="text-2xl font-display font-bold text-white mt-6 mb-3 first:mt-0">
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} className="text-lg font-semibold text-brand-gold-soft mt-5 mb-2">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={i} className="text-base font-semibold text-white/80 mt-4 mb-1">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-[3px] border-brand-gold pl-4 py-1 my-3 bg-brand-gold-muted rounded-r-lg text-white/70 text-sm italic"
            >
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={i} className="text-white/70 text-sm leading-relaxed ml-4 list-disc">
              <InlineMarkdown text={line.slice(2)} />
            </li>
          );
        }
        if (line.startsWith('```')) {
          return null; // handled externally
        }
        if (line.startsWith('|')) {
          return (
            <div key={i} className="text-xs font-mono text-white/50 bg-bg-base px-3 py-1 rounded">
              {line}
            </div>
          );
        }
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        return (
          <p key={i} className="text-white/70 text-sm leading-relaxed">
            <InlineMarkdown text={line} />
          </p>
        );
      })}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function PlaceholderContent({ type }: { type: string }) {
  return (
    <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-bg-base/80 text-white/25">
      <PlayCircle className="h-12 w-12 opacity-20" />
      <p className="text-sm">
        Conteúdo do tipo{' '}
        <span className="font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded">{type}</span>{' '}
        em breve
      </p>
    </div>
  );
}

function ContentTypeIcon({ type }: { type: string }) {
  if (type === 'video') return <PlayCircle className="h-3.5 w-3.5" />;
  return <FileText className="h-3.5 w-3.5" />;
}

const contentTypeLabel: Record<string, string> = {
  text: 'Leitura',
  video: 'Vídeo',
  pdf: 'PDF',
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}
