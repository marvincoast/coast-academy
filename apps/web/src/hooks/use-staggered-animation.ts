import {
  applyStaggeredAnimation,
  clearStaggeredAnimation,
  getAnimationPreference,
  monitorFrameRate,
  setAnimationPreference,
} from '@coast-academy/ui';
import { useEffect, useRef, type RefObject } from 'react';

export interface UseStaggeredAnimationOptions {
  selector?: string;
  baseDelay?: number;
  animationClass?: string;
  enabled?: boolean;
}

/**
 * Aplica animação escalonada nos filhos do container referenciado.
 */
export function useStaggeredAnimation(
  options: UseStaggeredAnimationOptions = {},
): RefObject<HTMLDivElement | null> {
  const {
    selector = '[data-stagger]',
    baseDelay = 100,
    animationClass = 'animate-fade-up',
    enabled = true,
  } = options;

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !getAnimationPreference()) return;
    const container = ref.current;
    if (!container) return;

    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
    if (elements.length === 0) return;

    applyStaggeredAnimation(elements, baseDelay, animationClass);

    return () => {
      clearStaggeredAnimation(elements, animationClass);
    };
  }, [selector, baseDelay, animationClass, enabled]);

  return ref;
}

/**
 * Monitora FPS e desativa animações não essenciais em dispositivos lentos.
 */
export function useAnimationPerformanceGuard(): void {
  useEffect(() => {
    if (!getAnimationPreference()) return;

    const stop = monitorFrameRate(() => {
      setAnimationPreference(false);
    });

    return stop;
  }, []);
}
