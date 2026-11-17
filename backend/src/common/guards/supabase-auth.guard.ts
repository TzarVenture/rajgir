import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../../modules/supabase/supabase.service';
import { UsersService } from '../../modules/users/users.service';
import type { AuthContext } from '../decorators/current-user.decorator';

/**
 * Requires `Authorization: Bearer <supabase access token>`.
 * Verifies the token with Supabase, loads (or creates) the matching platform user,
 * and attaches `request.auth` for the @CurrentUser() decorator.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
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
    const dbUser =
      (await this.prisma.user.findFirst({
        where: { OR: [{ supabaseAuthId: authUser.id }, { email: (authUser.email ?? '').toLowerCase() }] },
      })) ?? (await this.users.createFromAuthUser(authUser));

    if (dbUser.status === 'SUSPENDED') {
      throw new UnauthorizedException('This account is suspended. Please contact support.');
    }

    const auth: AuthContext = { authUser, dbUser, accessToken };
    request.auth = auth;
    return true;
  }
}
