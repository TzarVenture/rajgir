import type { ApiSession } from "@/lib/api";

/**
 * Session cookie format, shared by the middleware and server code. No `next/headers` or Node-only
 * APIs here (only btoa/atob), so it runs in every runtime the middleware may use.
 *
 * The session lives in exactly one place: this httpOnly cookie, holding the tokens issued by the
 * NestJS API. Browser JavaScript can never read it, and nothing else stores auth state.
 */
export const SESSION_COOKIE = "rajgir_session";
/** Where to send the user after email verification (set at sign-up, read by /auth/callback). */
export const NEXT_COOKIE = "rajgir_next";
/** Staged registration cookie before final registration step is submitted (no DB user yet). */
export const PENDING_REG_COOKIE = "rajgir_pending_reg";

export interface PendingAccount {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  redirect?: string;
  createdAt: number;
}

export function encodePendingRegistration(account: PendingAccount): string {
  return Buffer.from(JSON.stringify(account), "utf-8").toString("base64url");
}

export function decodePendingRegistration(raw: string | undefined | null): PendingAccount | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(raw, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    if (
      typeof parsed.firstName !== "string" ||
      typeof parsed.lastName !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.mobile !== "string" ||
      typeof parsed.password !== "string"
    ) {
      return null;
    }
    // Expire staged registration after 4 hours
    if (typeof parsed.createdAt === "number" && Date.now() - parsed.createdAt > 4 * 60 * 60 * 1000) {
      return null;
    }
    return parsed as PendingAccount;
  } catch {
    return null;
  }
}

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
}

// Tokens are JWT / opaque ASCII strings, so plain btoa/atob is safe here.
function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
}

export function encodeSession(session: ApiSession): string {
  return toBase64Url(JSON.stringify({ a: session.accessToken, r: session.refreshToken, e: session.expiresAt }));
}

export function decodeSession(raw: string | undefined | null): StoredSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(raw));
    if (typeof parsed.a !== "string" || typeof parsed.r !== "string" || typeof parsed.e !== "number") {
      return null;
    }
    if (!parsed.a || !parsed.r) return null;
    return { accessToken: parsed.a, refreshToken: parsed.r, expiresAt: parsed.e };
  } catch {
    return null;
  }
}

/**
 * Secure (HTTPS-only) cookies in production. COOKIE_SECURE=false is the explicit escape hatch for
 * running a production build over plain http on a machine other than localhost (browsers already
 * accept Secure cookies on http://localhost).
 */
export function cookieSecure(env: { NODE_ENV?: string; COOKIE_SECURE?: string } = process.env): boolean {
  const override = env.COOKIE_SECURE?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;
  return env.NODE_ENV === "production";
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: cookieSecure(),
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/** True when the access token is expired or about to expire. */
export function needsRefresh(session: StoredSession, skewSeconds = 60, nowSeconds = Math.floor(Date.now() / 1000)): boolean {
  return session.expiresAt - skewSeconds <= nowSeconds;
}
