import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/cn.js';

const backgroundVideo = '/videos/background.mp4';
const BACKGROUND_VOLUME = 0.4;

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
  // Começa mudo (autoplay); após play() bem-sucedido React libera o som via muted={isMuted}.
  const [isMuted, setIsMuted] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    const startPlayback = async (): Promise<void> => {
      video.volume = BACKGROUND_VOLUME;
      video.muted = true;
      setIsMuted(true);

      try {
        await video.play();
        setIsMuted(false);
        video.muted = false;
        video.volume = BACKGROUND_VOLUME;

        if (video.paused) {
          setIsMuted(true);
          video.muted = true;
          await video.play().catch(() => undefined);
        }
      } catch {
        await video.play().catch(() => undefined);
      }
    };

    const onLoadedData = (): void => {
      void startPlayback();
    };

    video.addEventListener('loadeddata', onLoadedData);
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      void startPlayback();
    }

    return () => {
      video.removeEventListener('loadeddata', onLoadedData);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        className={cn('absolute inset-0 overflow-hidden bg-bg-base', className)}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden bg-bg-base', className)}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="auto"
        src={backgroundVideo}
      >
        <track kind="captions" label="Vídeo decorativo sem fala" />
      </video>

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
