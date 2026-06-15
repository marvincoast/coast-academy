import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

let registry: Registry | null = null;
let httpRequestsTotal: Counter<'method' | 'route' | 'status_code'> | null = null;
let httpRequestDuration: Histogram<'method' | 'route' | 'status_code'> | null = null;

export function resolveServiceName(): string {
  return (
    process.env['OTEL_SERVICE_NAME']?.trim() ||
    process.env['SERVICE_NAME']?.trim() ||
    'unknown-service'
  );
}

export function getMetricsRegistry(): Registry {
  if (!registry) {
    const service = resolveServiceName();
    registry = new Registry();
    registry.setDefaultLabels({ service });

    collectDefaultMetrics({
      register: registry,
      prefix: 'coast_academy_',
    });

    httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total de requisições HTTP',
      labelNames: ['method', 'route', 'status_code'],
      registers: [registry],
    });

    httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duração das requisições HTTP em segundos',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [registry],
    });
  }

  return registry;
}

export function getHttpRequestsTotal(): Counter<'method' | 'route' | 'status_code'> {
  getMetricsRegistry();
  return httpRequestsTotal!;
}

export function getHttpRequestDuration(): Histogram<'method' | 'route' | 'status_code'> {
  getMetricsRegistry();
  return httpRequestDuration!;
}

/** Normaliza path para evitar cardinalidade alta (UUIDs, ids numéricos). */
export function normalizeHttpRoute(path: string, routePath?: string): string {
  if (routePath) {
    return routePath.replace(/\\/g, '/');
  }

  return path
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
    .replace(/\/\d+(?=\/|$)/g, '/:id');
}

export function isMetricsExcludedPath(path: string): boolean {
  return path === '/health' || path === '/metrics' || path.startsWith('/health/');
}
