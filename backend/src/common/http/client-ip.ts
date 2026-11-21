import { timingSafeEqual } from 'crypto';

/**
 * Header names used by the Next.js server when it calls this API on behalf of a visitor.
 * The visitor IP is only believed when the request also carries the shared INTERNAL_API_SECRET,
 * so a client calling the public API directly cannot pick its own rate-limit bucket.
 */
export const INTERNAL_SECRET_HEADER = 'x-internal-secret';
export const CLIENT_IP_HEADER = 'x-client-ip';

type RequestLike = {
  headers?: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string };
};

function header(req: RequestLike, name: string): string | undefined {
  const value = req.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** True when the request comes from the trusted Next.js server (shared secret matches). */
export function isTrustedInternalCall(req: RequestLike, secret = process.env.INTERNAL_API_SECRET): boolean {
  if (!secret) return false;
  const provided = header(req, INTERNAL_SECRET_HEADER);
  return Boolean(provided) && secretsMatch(provided as string, secret);
}

/**
 * The IP a request should be rate-limited as.
 *  - Trusted internal call with a visitor IP: that visitor IP.
 *  - Anything else: the address Express derived (honours the `trust proxy` hop count, see main.ts).
 */
export function clientIpOf(req: RequestLike, secret = process.env.INTERNAL_API_SECRET): string {
  if (isTrustedInternalCall(req, secret)) {
    const forwarded = header(req, CLIENT_IP_HEADER)?.trim();
    if (forwarded && forwarded.length <= 64) return forwarded;
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

/** Proxies on private networks only (Docker / Traefik / the Next.js container). */
export const DEFAULT_TRUST_PROXY = 'loopback, linklocal, uniquelocal';

/**
 * Parses TRUST_PROXY for Express' `trust proxy` setting.
 * Default: trust X-Forwarded-For only when it was added by a peer on a private network, so a client
 * that reaches the API directly over the internet cannot forge its IP. Also accepts a hop count,
 * a comma-separated list of addresses/subnets, "true" (trust everything: spoofable, avoid) or "false".
 */
export function parseTrustProxy(raw: string | undefined): number | boolean | string {
  const value = (raw ?? '').trim();
  if (value === '') return DEFAULT_TRUST_PROXY;
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}
