import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { User } from '@prisma/client';

export interface AuthContext {
  /** Verified Supabase identity (token owner). */
  authUser: SupabaseAuthUser;
  /** Platform user row (role, status). */
  dbUser: User;
  /** Raw bearer token, needed for sign-out. */
  accessToken: string;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthContext => {
  return ctx.switchToHttp().getRequest().auth as AuthContext;
});
