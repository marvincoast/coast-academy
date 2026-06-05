import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { SupabaseService } from './supabase.service.js';

export interface AuthenticatedRequest extends Request {
  userId: string;
  userEmail: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('Missing authorization token');

    const user = await this.supabase.getUser(token);
    if (!user) throw new UnauthorizedException('Invalid or expired token');

    request.userId = user.id;
    request.userEmail = user.email ?? '';
    return true;
  }

  private extractToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    return auth.slice(7);
  }
}
