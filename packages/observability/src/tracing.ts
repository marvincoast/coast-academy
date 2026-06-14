import { SpanStatusCode, trace, type Span, type SpanAttributes } from '@opentelemetry/api';

export function getTracer(name: string) {
  return trace.getTracer(name);
}

/** Span manual com status/exception padronizados (OBS-T08+). */
export async function withSpan<T>(
  tracerName: string,
  spanName: string,
  fn: (span: Span) => Promise<T>,
  attributes?: SpanAttributes,
): Promise<T> {
  const tracer = getTracer(tracerName);
  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      if (attributes) span.setAttributes(attributes);
      return await fn(span);
    } catch (err) {
      if (err instanceof Error) span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw err;
    }
  });
}
