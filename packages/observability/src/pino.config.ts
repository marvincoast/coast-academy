import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Params } from 'nestjs-pino';

import { resolveServiceName } from './metrics.registry.js';

const SKIP_LOG_PATHS = new Set(['/health', '/metrics']);

function resolveLogLevel(): string {
  const level = process.env['LOG_LEVEL']?.trim().toLowerCase();
  if (level) return level;
  return process.env['NODE_ENV'] === 'production' ? 'info' : 'debug';
}

function readRequestId(req: IncomingMessage): string {
  const header = req.headers['x-request-id'];
  if (typeof header === 'string' && header.length > 0) return header;
  if (Array.isArray(header) && header[0]) return header[0];
  return randomUUID();
}

/** Configuração nestjs-pino (JSON) — SPEC-001 / OBS-T05 */
export function buildPinoParams(): Params {
  const service = resolveServiceName();

  return {
    pinoHttp: {
      level: resolveLogLevel(),
      base: { service },
      messageKey: 'msg',
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
      formatters: {
        level: (label) => ({ level: label }),
      },
      genReqId: readRequestId,
      customProps: () => ({ service }),
      customAttributeKeys: {
        reqId: 'requestId',
      },
      serializers: {
        req: (req: IncomingMessage & { id?: string; method?: string; url?: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: { statusCode?: number }) => ({
          statusCode: res.statusCode,
        }),
      },
      autoLogging: {
        ignore: (req) => {
          const url = req.url ?? '';
          const path = url.split('?')[0] ?? url;
          return SKIP_LOG_PATHS.has(path);
        },
      },
    },
  };
}
