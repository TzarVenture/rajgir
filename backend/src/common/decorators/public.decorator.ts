import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opts a route (or a whole controller) out of the global SupabaseAuthGuard.
 * Use only for endpoints that must work without a session: health, sign-in, sign-up, password
 * reset and email verification.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
