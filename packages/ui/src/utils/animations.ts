export const ANIMATION_PREF_KEY = 'felix-animations-enabled';
export const MAX_STAGGER_DELAY_MS = 1000;
export const TARGET_FPS = 60;
export const FRAME_BUDGET_MS = 1000 / TARGET_FPS;

export type StaggerOptions = {
  baseDelay?: number;
  animationClass?: string;
  maxDelay?: number;
};

/**
 * Aplica animação escalonada em elementos do DOM.
 */
export function applyStaggeredAnimation(
  elements: HTMLElement[],
  baseDelay = 100,
  animationClass = 'animate-fade-up',
  maxDelay = MAX_STAGGER_DELAY_MS,
): void {
  if (elements.length === 0) return;
  if (baseDelay <= 0) {
    throw new RangeError('baseDelay must be positive');
  }

  elements.forEach((element, index) => {
    const delay = Math.min(index * baseDelay, maxDelay);
    element.classList.add(animationClass);
    element.style.setProperty('animation-delay', `${delay}ms`);
  });
}

/**
 * Remove classes e delays de animação escalonada.
 */
export function clearStaggeredAnimation(
  elements: HTMLElement[],
  animationClass = 'animate-fade-up',
): void {
  elements.forEach((element) => {
    element.classList.remove(animationClass);
    element.style.removeProperty('animation-delay');
  });
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getAnimationPreference(): boolean {
  if (typeof window === 'undefined') return true;
  if (prefersReducedMotion()) return false;

  const stored = localStorage.getItem(ANIMATION_PREF_KEY);
  if (stored === 'false') return false;
  if (stored === 'true') return true;
  return true;
}

export function setAnimationPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ANIMATION_PREF_KEY, String(enabled));
}

/**
 * Monitora FPS via requestAnimationFrame; retorna função de cleanup.
 */
export function monitorFrameRate(
  onLowPerformance: () => void,
  sampleFrames = 30,
  thresholdMs = FRAME_BUDGET_MS * 1.5,
): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let frames = 0;
  let lastTime = performance.now();
  let rafId = 0;
  let stopped = false;

  const tick = (now: number): void => {
    if (stopped) return;
    frames += 1;
    const elapsed = now - lastTime;

    if (frames >= sampleFrames) {
      const avgFrameMs = elapsed / frames;
      if (avgFrameMs > thresholdMs) {
        onLowPerformance();
        stopped = true;
        return;
      }
      frames = 0;
      lastTime = now;
    }

    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  return () => {
    stopped = true;
    cancelAnimationFrame(rafId);
  };
}

export function applyWillChangeTransform(element: HTMLElement): void {
  element.style.willChange = 'transform';
}

export function clearWillChangeTransform(element: HTMLElement): void {
  element.style.willChange = 'auto';
}
