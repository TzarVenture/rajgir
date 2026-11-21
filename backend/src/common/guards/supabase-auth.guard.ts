import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService, isTransientAuthError } from '../../modules/supabase/supabase.service';
import { UsersService } from '../../modules/users/users.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { AuthContext } from '../decorators/current-user.decorator';

/**
 * The single authentication gate of the API. Registered globally (app.module.ts), so every route
 * requires a signed-in user unless it is explicitly marked @Public(). New routes are protected by
 * default; nothing has to remember to add a guard.
 *
 * Requires `Authorization: Bearer <supabase access token>`. Verifies the token with Supabase, loads
 * the matching platform user and attaches `request.auth` for @CurrentUser().
 *
 * The platform user is never created here. A valid Supabase token whose `users` row no longer
 * exists (account deleted) is rejected with 401, so a deleted account cannot be resurrected by an
 * old session cookie. Every 401 means "this session is over": the frontend clears its cookie and
 * sends the user to /login.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly users: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers['authorization'];
    const accessToken = header?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (!accessToken) {
      throw new UnauthorizedException({ code: 'AUTH_REQUIRED', message: 'Authentication required' });
    }

    const { data, error } = await this.supabase.anon.auth.getUser(accessToken);
    if (isTransientAuthError(error)) {
      // Supabase did not answer: "try again", not "your session is over".
      throw new ServiceUnavailableException({ code: 'AUTH_UNAVAILABLE', message: 'Sign-in service is temporarily unavailable.' });
    }
    if (error || !data.user) {
      throw new UnauthorizedException({ code: 'SESSION_EXPIRED', message: 'Your session has expired. Please sign in again.' });
    }

    const authUser = data.user;
    const dbUser = await this.users.findForAuthUser(authUser);
    if (!dbUser) {
      throw new UnauthorizedException({ code: 'ACCOUNT_NOT_FOUND', message: 'Account no longer exists' });
    }

    if (dbUser.status === 'SUSPENDED') {
      throw new UnauthorizedException({ code: 'ACCOUNT_SUSPENDED', message: 'This account is suspended. Please contact support.' });
    }

    const auth: AuthContext = { authUser, dbUser, accessToken };
    request.auth = auth;
    return true;
  }
}
