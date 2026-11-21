import type { Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppThrottlerGuard } from './throttler.guard';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { RolesGuard } from './roles.guard';

/**
 * Guards applied to every route, in this order:
 *  1. rate limit (per visitor IP)
 *  2. authentication (skipped only for @Public() routes)
 *  3. role check (only routes with @Roles(...))
 *
 * Shared by AppModule and the integration tests so both run the same chain.
 */
export const GLOBAL_GUARDS: Provider[] = [
  { provide: APP_GUARD, useClass: AppThrottlerGuard },
  { provide: APP_GUARD, useClass: SupabaseAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
];
