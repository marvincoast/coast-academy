import { useMutation } from '@tanstack/react-query';
import { AlertCircle, BookOpen, Bot, Loader2, Send, User } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/api/client';
import { tutorApi, type TutorAnswerDto } from '@/api/tutor.api';
import { cn } from '@/lib/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: TutorAnswerDto['citations'];
  error?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'O que é absorção de preço fixo no book?',
  'Como identificar exaustão compradora?',
  'Explique as zonas de variação 0,5% e 1,0%.',
  'O que é iceberg no times and trades?',
];

function CitationsPanel({ citations }: { citations: TutorAnswerDto['citations'] }) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-white/40">
        <BookOpen size={11} />
        Fontes
      </p>
      {citations.map((c) => (
        <div key={c.id} className="rounded-lg border border-white/8 bg-bg-base/50 px-3 py-2">
          <p className="text-xs font-medium text-brand-gold">
            [source:{c.id}] {c.sourceLabel}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-white/40">{c.excerpt}</p>
        </div>
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
          isUser ? 'bg-brand-gold/20 text-brand-gold' : 'bg-state-info/20 text-state-info',
        )}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-sm bg-brand-gold/10 text-white'
              : msg.error
                ? 'rounded-tl-sm bg-state-error/10 text-state-error'
                : 'rounded-tl-sm bg-bg-surface text-white/85',
          )}
        >
          {/* Render simple markdown line breaks */}
          {msg.content.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < msg.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Citations */}
        {!isUser && msg.citations && <CitationsPanel citations={msg.citations} />}
      </div>
    </div>
  );
}

export default function TutorPage(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { mutate: ask, isPending } = useMutation({
    mutationFn: (question: string) => tutorApi.ask(question),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          citations: data.citations,
        },
      ]);
    },
    onError: (err) => {
      let hint =
        'Ocorreu um erro ao processar sua pergunta. Verifique se o rag-service e o Ollama estão rodando e se o conteúdo foi indexado (ingest).';
      if (err instanceof ApiError) {
        if (err.status === 401) {
          hint = 'Sessão expirada. Faça login novamente.';
        } else if (err.status === 503) {
          try {
            const body = JSON.parse(err.message) as { message?: string };
            if (body.message) hint = body.message;
          } catch {
            hint =
              'Modelo LLM não encontrado no Ollama. Rode: docker exec coast-academy-ollama ollama pull qwen2.5:1.5b';
          }
        } else if (err.status === 404 || err.status === 502) {
          hint =
            'API do tutor indisponível. Suba a stack com ./infra/scripts/up-local.sh (perfil llm) e confira: docker ps | grep coast-academy-rag';
        } else if (import.meta.env.DEV) {
          hint = `${hint} (HTTP ${err.status})`;
        }
      }
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: hint,
          error: true,
        },
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || isPending) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    ask(q);
  }

  function handleSuggested(q: string) {
    if (isPending) return;
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    ask(q);
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-state-info/10 text-state-info">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Tutor IA — Tape Reading</h1>
            <p className="text-xs text-white/40">
              Respostas baseadas no conteúdo do curso com citações de fonte
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {messages.length === 0 ? (
          /* Empty / welcome state */
          <div className="flex flex-col items-center gap-8 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-state-info/10 text-state-info">
              <Bot size={32} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Olá! Como posso ajudar?</h2>
              <p className="mt-1 text-sm text-white/50">
                Faça perguntas sobre tape reading, fluxo do dólar BRL, book de ofertas e mais.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 rounded-xl border border-state-warning/20 bg-state-warning/5 px-4 py-3 text-left text-xs text-state-warning/80">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <p>
                O tutor <strong>não fornece sinais operacionais</strong> nem promessas de resultado.
                Apenas conteúdo didático baseado no material do curso.
              </p>
            </div>

            {/* Suggested questions */}
            <div className="w-full max-w-lg space-y-2">
              <p className="text-xs text-white/30">Sugestões</p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggested(q)}
                  className="w-full rounded-xl border border-white/8 bg-bg-surface px-4 py-3 text-left text-sm text-white/70 transition-colors hover:border-state-info/40 hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {/* Loading bubble */}
            {isPending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-state-info/20 text-state-info">
                  <Bot size={15} />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-bg-surface px-4 py-3">
                  <Loader2 size={15} className="animate-spin text-state-info" />
                  <span className="text-sm text-white/40">Analisando…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/8 bg-bg-surface px-4 py-4 md:px-8">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as FormEvent);
              }
            }}
            placeholder="Pergunte sobre tape reading, fluxo do dólar, book de ofertas…"
            rows={1}
            disabled={isPending}
            className="flex-1 resize-none rounded-xl border border-white/8 bg-bg-base px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-state-info/50 disabled:opacity-50"
            style={{ maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            aria-label="Enviar pergunta"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-state-info text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs text-white/20">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
