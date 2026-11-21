import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { api, type ApiSession, type ApiUser, type CallContext } from "@/lib/api";
import { loginUrl, safeRedirect } from "@/lib/auth/redirect";
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
  firstName: string;
  lastName: string;
  /** Display name: first + last name. */
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

/**
 * The signed-in user, plus whether the API rejected the session cookie (401: expired, revoked, or
 * the account no longer exists). One backend call per request (cached).
 */
const loadCurrentUser = cache(async (): Promise<{ user: AppUser | null; sessionRejected: boolean }> => {
  const session = await getSessionTokens();
  if (!session) return { user: null, sessionRejected: false };

  const res = await api.auth.me({ token: session.accessToken });
  if (!res.success || !res.data) {
    // Only a 401 means the session is dead; a network error or 5xx must not sign anyone out.
    return { user: null, sessionRejected: res.statusCode === 401 };
  }
  return { user: toAppUser(res.data), sessionRejected: false };
});

function toAppUser(user: ApiUser): AppUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone ?? undefined,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    name: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" "),
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
  };
}

/** The signed-in user, or null. */
export async function getCurrentUser(): Promise<AppUser | null> {
  return (await loadCurrentUser()).user;
}

/**
 * Use on protected pages: redirects to /login and returns here after sign-in.
 * If the API rejected the session (e.g. the account was deleted), the cookie is cleared first via
 * /auth/signout (server components cannot change cookies), so the dead session is not sent again.
 */
export async function requireUser(returnTo?: string): Promise<AppUser> {
  const { user, sessionRejected } = await loadCurrentUser();
  if (user) return user;
  if (sessionRejected) {
    const safe = safeRedirect(returnTo);
    redirect(safe ? `/auth/signout?redirect=${encodeURIComponent(safe)}` : "/auth/signout");
  }
  redirect(loginUrl(returnTo));
}

export async function endSession(): Promise<void> {
  const ctx = await authContext();
  if (ctx) await api.auth.logout(ctx);
  await clearSession();
}
