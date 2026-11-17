import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { api, type ApiSession, type CallContext } from "@/lib/api";
import { loginUrl } from "@/lib/auth/redirect";
import {
  NEXT_COOKIE,
  SESSION_COOKIE,
  decodeSession,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/auth/cookie";

/**
 * Server-side session helpers.
 * Next.js only stores the tokens in an httpOnly cookie and passes them to the
 * NestJS API; all identity logic lives in the backend.
 */
export interface AppUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role?: string | null;
  status: "PENDING_ONBOARDING" | "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | string;
  emailVerified: boolean;
}

export async function getSessionTokens() {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

/** Only call from server actions or route handlers (cookies are read-only while rendering). */
export async function saveSession(session: ApiSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), sessionCookieOptions);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Remember where to send the user once their email is verified (stays in this browser only). */
export async function rememberNext(path: string | null): Promise<void> {
  const store = await cookies();
  if (!path) {
    store.delete(NEXT_COOKIE);
    return;
  }
  store.set(NEXT_COOKIE, path, { ...sessionCookieOptions, maxAge: 60 * 60 * 24 });
}

export async function takeNext(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(NEXT_COOKIE)?.value ?? null;
  if (value) store.delete(NEXT_COOKIE);
  return value;
}

/** Visitor IP, forwarded to the backend so rate limits apply per person. */
export async function clientContext(): Promise<CallContext> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return { clientIp: forwarded || h.get("x-real-ip") || undefined };
}

/** Request context for a signed-in user's calls (token + visitor IP). */
export async function authContext(): Promise<CallContext | null> {
  const session = await getSessionTokens();
  if (!session) return null;
  return { ...(await clientContext()), token: session.accessToken };
}

/** The signed-in user, or null. One backend call per request (cached). */
export const getCurrentUser = cache(async (): Promise<AppUser | null> => {
  const session = await getSessionTokens();
  if (!session) return null;

  const res = await api.auth.me({ token: session.accessToken });
  if (!res.success || !res.data) return null;

  const user = res.data;
  return {
    id: user.id,
    email: user.email,
    phone: user.phone ?? undefined,
    name: user.fullName,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
  };
});

/** Use on protected pages: redirects to /login and returns here after sign-in. */
export async function requireUser(returnTo?: string): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect(loginUrl(returnTo));
  return user;
}

export async function endSession(): Promise<void> {
  const ctx = await authContext();
  if (ctx) await api.auth.logout(ctx);
  await clearSession();
}
