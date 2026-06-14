import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module.js';
import { CertificateService } from './certificate.service.js';
import { CertificateController } from './certificate.controller.js';
import { CertificatePdfStorageService } from './certificate-pdf-storage.service.js';
import { CertificateMetricsInitializer } from './certificate-metrics.initializer.js';

@Module({
  imports: [CommonModule],
  providers: [CertificateMetricsInitializer, CertificatePdfStorageService, CertificateService],
  controllers: [CertificateController],
})
export class CertificateModule {}
