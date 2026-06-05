import { Controller, Get, Header, Res } from '@nestjs/common';
import type { Response } from 'express';

import { getMetricsRegistry } from './metrics.registry.js';

@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Cache-Control', 'no-store')
  async metrics(@Res() res: Response): Promise<void> {
    const reg = getMetricsRegistry();
    res.setHeader('Content-Type', reg.contentType);
    res.end(await reg.metrics());
  }
}
