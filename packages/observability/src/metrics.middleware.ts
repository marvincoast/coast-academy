import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import {
  getHttpRequestDuration,
  getHttpRequestsTotal,
  isMetricsExcludedPath,
  normalizeHttpRoute,
} from './metrics.registry.js';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.path;

    if (isMetricsExcludedPath(path)) {
      next();
      return;
    }

    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const expressRoute = req.route as { path?: string } | undefined;
      const route = normalizeHttpRoute(path, expressRoute?.path);
      const labels = {
        method: req.method,
        route,
        status_code: String(res.statusCode),
      };

      getHttpRequestsTotal().inc(labels);
      const seconds = Number(process.hrtime.bigint() - start) / 1e9;
      getHttpRequestDuration().observe(labels, seconds);
    });

    next();
  }
}
