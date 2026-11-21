import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { clientIpOf } from '../http/client-ip';

/**
 * Rate limiting keyed by the real visitor IP.
 *
 * Every browser request reaches this API through the Next.js server, so without this all visitors
 * would share the Next.js server's bucket (one busy minute would throttle everybody, including
 * session checks). See common/http/client-ip.ts for when a forwarded IP is believed.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return clientIpOf(req);
  }
}
