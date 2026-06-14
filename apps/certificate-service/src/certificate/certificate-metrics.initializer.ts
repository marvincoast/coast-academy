import { Injectable, OnModuleInit } from '@nestjs/common';

import { registerCertificateMetrics } from './certificate.metrics.js';

@Injectable()
export class CertificateMetricsInitializer implements OnModuleInit {
  onModuleInit(): void {
    registerCertificateMetrics();
  }
}
