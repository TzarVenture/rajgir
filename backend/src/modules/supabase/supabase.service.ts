import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, isAuthRetryableFetchError, SupabaseClient } from '@supabase/supabase-js';

/**
 * True when Supabase could not answer (network failure, timeout, 5xx), as opposed to answering
 * "this token/credential is invalid". Callers must not end a user's session over a transient error.
 */
export function isTransientAuthError(error: unknown): boolean {
  if (!error) return false;
  if (isAuthRetryableFetchError(error)) return true;
  const status = (error as { status?: number }).status;
  // 429: Supabase rate-limits per IP, and every call comes from this one server, so a busy minute
  // must read as "try again", never as "session over" / "wrong password".
  return typeof status === 'number' && (status === 0 || status === 429 || status >= 500);
}

const CLIENT_OPTIONS = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
};

/**
 * Stateless Supabase clients for the backend. Nothing is persisted in memory,
 * so a single shared instance is safe across concurrent users.
 *  - `anon`  : user-level auth flows (sign in/up, refresh, reset email, verify)
 *  - `admin` : service-role, only for best-effort housekeeping (e.g. removing an orphaned auth user).
 *              The core login flow does NOT depend on it. Never exposed to the browser.
 */
@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly url: string;
  private readonly anonKey: string;
  readonly anon: SupabaseClient;
  readonly admin: SupabaseClient;

  constructor(config: ConfigService) {
    this.url = config.get<string>('SUPABASE_URL') ?? 'http://invalid.local';
    this.anonKey = config.get<string>('SUPABASE_ANON_KEY') ?? 'missing';
    const serviceKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? 'missing';

    if (this.url.includes('invalid.local') || this.anonKey === 'missing') {
      this.logger.error('SUPABASE_URL and SUPABASE_ANON_KEY must be set for authentication to work.');
    }
    if (serviceKey === this.anonKey) {
      this.logger.warn('SUPABASE_SERVICE_ROLE_KEY is the same as SUPABASE_ANON_KEY; admin operations will fail.');
    }

    this.anon = createClient(this.url, this.anonKey, CLIENT_OPTIONS);
    this.admin = createClient(this.url, serviceKey, CLIENT_OPTIONS);
  }

  /** Client acting as one signed-in user (for updating their own password etc.). */
  userClient(accessToken: string): SupabaseClient {
    return createClient(this.url, this.anonKey, {
      ...CLIENT_OPTIONS,
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }

  /**
   * Revoke sessions for the user behind an access token.
   * 'local' = this session only, 'others' = every other device, 'global' = every device.
   */
  async revokeSession(accessToken: string, scope: 'local' | 'others' | 'global' = 'local'): Promise<boolean> {
    try {
      const res = await fetch(`${this.url}/auth/v1/logout?scope=${scope}`, {
        method: 'POST',
        headers: { apikey: this.anonKey, Authorization: `Bearer ${accessToken}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
