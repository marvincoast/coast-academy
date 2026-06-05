import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private _admin!: SupabaseClient;

  onModuleInit() {
    const url = process.env['SUPABASE_URL'];
    const serviceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

    if (!url || !serviceKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
      );
    }

    this._admin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    this.logger.log('Supabase admin client initialized');
  }

  /** Service-role client — bypasses RLS. Use for all DB operations. */
  get admin(): SupabaseClient {
    return this._admin;
  }

  /** Validate a user JWT and return the user object, or null if invalid. */
  async getUser(token: string) {
    const { data, error } = await this._admin.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user;
  }
}
