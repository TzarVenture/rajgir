import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { api, type ApiSession, type ApiUser, type CallContext } from "@/lib/api";
import { loginUrl, safeRedirect } from "@/lib/auth/redirect";
import {
  NEXT_COOKIE,
  PENDING_REG_COOKIE,
  SESSION_COOKIE,
  PendingAccount,
  decodePendingRegistration,
  decodeSession,
  encodePendingRegistration,
  encodeSession,
  sessionCookieOptions,
} from "@/lib/auth/cookie";
import { REFRESH_FAILED_HEADER, classifyMeResponse, clientIpFromHeaders, type SessionStatus } from "@/lib/auth/sessionState";

/**
 * The frontend's single authentication module (server-only).
 *
 * - The session is the httpOnly cookie (lib/auth/cookie.ts); the middleware keeps it refreshed.
 * - Who the user is comes only from the NestJS API (GET /auth/me), asked once per request.
 * - Pages use getCurrentUser() (display) or requireUser() (protected); server actions use
 *   authContext() to call the API as the user. Nothing else reads or writes auth state.
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
  isPending?: boolean;
}

export type SessionState =
  | { status: "authenticated"; user: AppUser }
  | { status: Exclude<SessionStatus, "authenticated"> };

/** Thrown when the API cannot confirm the session right now. Rendered by app/(site)/error.tsx. */
export class AuthUnavailableError extends Error {
  constructor() {
    super("The account service is temporarily unavailable.");
    this.name = "AuthUnavailableError";
  }
}

export async function getSessionTokens() {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export async function getPendingRegistration(): Promise<PendingAccount | null> {
  const store = await cookies();
  return decodePendingRegistration(store.get(PENDING_REG_COOKIE)?.value);
}

export async function savePendingRegistration(account: PendingAccount): Promise<void> {
  const store = await cookies();
  store.set(PENDING_REG_COOKIE, encodePendingRegistration(account), {
    ...sessionCookieOptions,
    maxAge: 60 * 60 * 4, // 4 hours
  });
}

export async function clearPendingRegistration(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_REG_COOKIE);
}

/** Only call from server actions or route handlers (cookies are read-only while rendering). */
export async function saveSession(session: ApiSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(session), sessionCookieOptions);
}

/** Only call from server actions or route handlers. */
export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.delete(NEXT_COOKIE);
  store.delete(PENDING_REG_COOKIE);
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

/** Visitor IP, forwarded to the backend so rate limits apply per person. */
export async function clientContext(): Promise<CallContext> {
  const h = await headers();
  return { clientIp: clientIpFromHeaders((name) => h.get(name)) };
}

/** Request context for a signed-in user's API calls (token + visitor IP), or null without a session cookie. */
export async function authContext(): Promise<CallContext | null> {
  const session = await getSessionTokens();
  if (!session) return null;
  return { ...(await clientContext()), token: session.accessToken };
}

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

/** The session state for this request. One API call per request, shared by layout and page (React cache). */
export const getSession = cache(async (): Promise<SessionState> => {
  const ctx = await authContext();
  if (!ctx) return { status: "anonymous" };

  const res = await api.auth.me(ctx);
  const refreshFailed = (await headers()).get(REFRESH_FAILED_HEADER) === "1";
  const status = classifyMeResponse(res, refreshFailed);
  if (status === "authenticated") return { status, user: toAppUser(res.data as ApiUser) };
  if (status === "unavailable") console.error(`Session check failed (${res.statusCode ?? res.code ?? "no response"}): ${res.error}`);
  return { status };
});

/** The signed-in user, or null. For display only (headers, redirects away from /login). */
export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getSession();
  return session.status === "authenticated" ? session.user : null;
}

/** Where to go when the API rejected the session cookie: clears it, then continues to /login. */
function signOutUrl(returnTo?: string | null): string {
  const safe = safeRedirect(returnTo);
  return safe ? `/auth/signout?redirect=${encodeURIComponent(safe)}` : "/auth/signout";
}

/**
 * Use on protected pages. Returns the user, or:
 *  - no session      -> /login?redirect=<returnTo>
 *  - session rejected -> /auth/signout (clears the dead cookie; server components cannot) -> /login
 *  - API unreachable -> throws AuthUnavailableError (error page with retry; the session is kept)
 */
export async function requireUser(returnTo?: string): Promise<AppUser> {
  const session = await getSession();
  switch (session.status) {
    case "authenticated":
      return session.user;
    case "rejected":
      redirect(signOutUrl(returnTo));
    case "anonymous":
      redirect(loginUrl(returnTo));
    default:
      throw new AuthUnavailableError();
  }
}

/** Ends the session on the API (revokes it) and clears the cookies. Server actions / route handlers only. */
export async function endSession(): Promise<void> {
  const tokens = await getSessionTokens();
  if (tokens) {
    const ctx = { ...(await clientContext()), token: tokens.accessToken };
    const res = await api.auth.logout(ctx);
    if (res.statusCode === 401) {
      // Access token already expired: exchange the refresh token so the session is still revoked.
      const refreshed = await api.auth.refresh(tokens.refreshToken, ctx);
      if (refreshed.success && refreshed.data) await api.auth.logout({ ...ctx, token: refreshed.data.session.accessToken });
    }
  }
  await clearSession();
}
