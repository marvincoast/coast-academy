import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationService } from './notification.service.js';
import type { SendCertificateEmailDto, SendWelcomeEmailDto } from './notification.dto.js';

/**
 * Internal controller — called by other services (certificate-service, etc.).
 * Not exposed publicly via Traefik (only internal Docker network).
 */
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('certificate')
  @HttpCode(HttpStatus.OK)
  sendCertificate(@Body() dto: SendCertificateEmailDto) {
    return this.notificationService.sendCertificateEmail(dto);
  }

  @Post('welcome')
  @HttpCode(HttpStatus.OK)
  sendWelcome(@Body() dto: SendWelcomeEmailDto) {
    return this.notificationService.sendWelcomeEmail(dto);
  }
}
