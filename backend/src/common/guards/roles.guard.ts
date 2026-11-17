import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
/** Restrict a route to the given platform roles. Use together with SupabaseAuthGuard. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const role = context.switchToHttp().getRequest().auth?.dbUser?.role as Role | null | undefined;
    if (!role || !required.includes(role)) throw new ForbiddenException('You do not have access to this resource.');
    return true;
  }
}
