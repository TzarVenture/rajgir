import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../modules/supabase/supabase.service';
import { UsersService } from '../../modules/users/users.service';
import type { AuthContext } from '../decorators/current-user.decorator';

/**
 * Requires `Authorization: Bearer <supabase access token>`.
 * Verifies the token with Supabase, loads the matching platform user and attaches `request.auth`
 * for the @CurrentUser() decorator.
 *
 * The platform user is never created here. A valid Supabase token whose `users` row no longer
 * exists (account deleted) is rejected with 401, so a deleted account cannot be resurrected by an
 * old session cookie. The frontend clears its session on this 401 and sends the user to /login.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const header: string | undefined = request.headers['authorization'];
    const accessToken = header?.match(/^Bearer\s+(.+)$/i)?.[1];

    if (!accessToken) {
      throw new UnauthorizedException('Authentication required');
    }

    const { data, error } = await this.supabase.anon.auth.getUser(accessToken);
    if (error || !data.user) {
      throw new UnauthorizedException('Your session has expired. Please sign in again.');
    }

    const authUser = data.user;
    const dbUser = await this.users.findForAuthUser(authUser);
    if (!dbUser) {
      throw new UnauthorizedException({ code: 'ACCOUNT_NOT_FOUND', message: 'Account no longer exists' });
    }

    if (dbUser.status === 'SUSPENDED') {
      throw new UnauthorizedException('This account is suspended. Please contact support.');
    }

    const auth: AuthContext = { authUser, dbUser, accessToken };
    request.auth = auth;
    return true;
  }
}
