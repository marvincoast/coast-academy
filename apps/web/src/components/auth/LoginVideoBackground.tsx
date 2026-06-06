import { useEffect, useRef, useState } from 'react';

import backgroundVideo from '../../../../../packages/background.mp4?url';

import { cn } from '@/lib/cn.js';

interface LoginVideoBackgroundProps {
  className?: string;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent): void => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

export function LoginVideoBackground({ className }: LoginVideoBackgroundProps): JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    const onReady = (): void => setVideoReady(true);
    const onError = (): void => setVideoReady(false);

    video.addEventListener('canplay', onReady);
    video.addEventListener('error', onError);
    void video.play().catch(() => undefined);

    return () => {
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('error', onError);
    };
  }, [prefersReducedMotion]);

  return (
    <div className={cn('absolute inset-0 overflow-hidden bg-bg-base', className)} aria-hidden="true">
      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
            videoReady ? 'opacity-100' : 'opacity-0',
          )}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src={backgroundVideo}
        />
      )}

      {/* Overlay escuro para legibilidade do formulário */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,15,20,0.40) 0%, rgba(11,15,20,0.55) 45%, rgba(11,15,20,0.68) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(201,162,39,0.10) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
