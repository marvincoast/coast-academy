import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service.js';
import { AuthGuard } from './auth.guard.js';

@Module({
  providers: [SupabaseService, AuthGuard],
  exports: [SupabaseService, AuthGuard],
})
export class CommonModule {}
