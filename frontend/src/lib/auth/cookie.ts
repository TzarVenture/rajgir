import type { ApiSession } from "@/lib/api";

/**
 * Session cookie helpers shared by the Edge middleware and server code
 * (no `next/headers` import here so it runs in both).
 *
 * The cookie holds the session tokens issued by the NestJS API. It is httpOnly:
 * browser JavaScript can never read it.
 */
export const SESSION_COOKIE = "rajgir_session";
/** Where to send the user after email verification (set at sign-up, read by /auth/callback). */
export const NEXT_COOKIE = "rajgir_next";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  return atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
}

export function encodeSession(session: ApiSession): string {
  return toBase64Url(
    JSON.stringify({ a: session.accessToken, r: session.refreshToken, e: session.expiresAt })
  );
}

export function decodeSession(raw: string | undefined | null): StoredSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(raw));
    if (typeof parsed.a !== "string" || typeof parsed.r !== "string" || typeof parsed.e !== "number") {
      return null;
    }
    return { accessToken: parsed.a, refreshToken: parsed.r, expiresAt: parsed.e };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

/** True when the access token is expired or about to expire. */
export function needsRefresh(session: StoredSession, skewSeconds = 60): boolean {
  return session.expiresAt - skewSeconds <= Math.floor(Date.now() / 1000);
}
