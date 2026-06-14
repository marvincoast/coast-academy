/** Basename do React Router (sem barra final). */
export function getRouterBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (base === '/') return undefined;
  return base.replace(/\/$/, '');
}

/** Caminho absoluto dentro do app (respeita GitHub Pages / subpath). */
export function appPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.BASE_URL;
  if (base === '/') return normalized;
  return `${base.replace(/\/$/, '')}${normalized}`;
}

/** URL completa (origin + base + path) — ex.: redirect do magic link. */
export function appOriginPath(path: string): string {
  if (typeof window === 'undefined') return appPath(path);
  return `${window.location.origin}${appPath(path)}`;
}
