import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { api } from "@/lib/api";
import {
  SESSION_COOKIE,
  decodeSession,
  encodeSession,
  needsRefresh,
  sessionCookieOptions,
} from "@/lib/auth/cookie";
import { REFRESH_FAILED_HEADER, clientIpFromHeaders } from "@/lib/auth/sessionState";
import { isGateActive } from "@/lib/gate";
import {
  PREVIEW_COOKIE,
  createPreviewToken,
  passwordMatches,
  previewCookieOptions,
  verifyPreviewToken,
} from "@/lib/previewAuth";

/**
 * Coming Soon gate.
 *
 * While the gate is active (COMING_SOON is anything other than "false"):
 *  - public visitors see only the Coming Soon page and Coming Soon contact page
 *  - the real site is reachable only with a valid signed preview cookie
 *    (obtained at /preview with the preview password)
 *
 * Launch: set COMING_SOON=false and restart. The real site then serves everyone.
 */

/** Static assets that must always load (Coming Soon pages need them). */
function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  );
}

/**
 * Pre-existing public exceptions kept as-is for now (volunteer / influencer
 * sign-up pages and the APIs they call). Remove this list to make the gate
 * strict ("Coming Soon + contact only").
 */
const LEGACY_PUBLIC_PREFIXES = [
  "/join",
  "/influencer",
  "/register/volunteer",
  "/register/influencer",
  "/api/forms",
  "/api/influencer",
];

function isLegacyPublic(pathname: string): boolean {
  return LEGACY_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Response for real-site requests. Keeps a signed-in user's session fresh: when the access token
 * is about to expire, exchange the refresh token through the NestJS API and update the cookie for
 * this request and the browser. Never used for the public Coming Soon pages.
 *
 * This is the only place tokens are refreshed. Pages and server actions run after it, so they
 * always see a usable access token (or no session at all).
 */
async function realSiteResponse(request: NextRequest): Promise<NextResponse> {
  // Forward a fresh header set: drops any client-supplied copy of the internal marker, and carries
  // cookie changes made via request.cookies (built lazily, after those changes).
  const forward = (refreshFailed = false) => {
    const headers = new Headers(request.headers);
    headers.delete(REFRESH_FAILED_HEADER);
    if (refreshFailed) headers.set(REFRESH_FAILED_HEADER, "1");
    return NextResponse.next({ request: { headers } });
  };

  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session || !needsRefresh(session)) return forward();

  const clientIp = clientIpFromHeaders((name) => request.headers.get(name));
  const refreshed = await api.auth.refresh(session.refreshToken, { clientIp });

  if (refreshed.success && refreshed.data) {
    const value = encodeSession(refreshed.data.session);
    request.cookies.set(SESSION_COOKIE, value);
    const response = forward();
    response.cookies.set(SESSION_COOKIE, value, sessionCookieOptions);
    return response;
  }

  // Only drop the session when the backend says it is no longer valid (not on a temporary outage).
  if (refreshed.statusCode === 401) {
    request.cookies.delete(SESSION_COOKIE);
    const response = forward();
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Refresh could not be completed right now (throttled, outage, timeout). The access token may be
  // expired, so the API will say 401 for it; tell the session layer that this 401 is NOT final.
  return forward(true);
}

export async function middleware(request: NextRequest) {
  // 0. Canonical Domain Redirection: Force all traffic from rajgir.org (and www variants) -> rajgirmarathon.com
  const host = (request.headers.get("host") || request.nextUrl.host || "").toLowerCase();
  if (host.includes("rajgir.org") || host.startsWith("www.rajgirmarathon.com")) {
    const canonicalUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      "https://rajgirmarathon.com"
    );
    return NextResponse.redirect(canonicalUrl, 301);
  }

  const { pathname } = request.nextUrl;

  // 1. Official Launch Mode (COMING_SOON=false): real site is public.
  //    Retire the preview and Coming Soon URLs so old links land on the real site.
  if (!isGateActive()) {
    if (pathname === "/preview" || pathname === "/coming-soon") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (pathname === "/coming-soon/contact") {
      return NextResponse.redirect(new URL("/contact", request.url));
    }
    if (isStaticAsset(pathname)) return NextResponse.next();
    return realSiteResponse(request);
  }

  // 2. Always allow static files and Next.js internals.
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // 3. One-click preview link (?preview_key=... or ?key=...).
  const directKey =
    request.nextUrl.searchParams.get("preview_key") ||
    request.nextUrl.searchParams.get("key");

  if (directKey && (await passwordMatches(directKey))) {
    // Authorized via secret link: strip the key from the URL and set a signed 7-day session cookie.
    const cleanUrl = new URL(pathname, request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
      if (key !== "key" && key !== "preview_key") {
        cleanUrl.searchParams.set(key, value);
      }
    });

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(PREVIEW_COOKIE, await createPreviewToken(), previewCookieOptions());
    return response;
  }

  // 4. Authorized users (developers & client) get the real site.
  if (await verifyPreviewToken(request.cookies.get(PREVIEW_COOKIE)?.value)) {
    return realSiteResponse(request);
  }

  // 5. Public / unauthorized visitors: stealth Coming Soon gating.
  if (pathname === "/") {
    // Transparently rewrite root to quarantined Coming Soon page (URL remains '/')
    return NextResponse.rewrite(new URL("/coming-soon", request.url));
  }

  if (pathname === "/contact") {
    // Transparently rewrite /contact to quarantined Coming Soon Contact page (URL remains '/contact')
    return NextResponse.rewrite(new URL("/coming-soon/contact", request.url));
  }

  // Preview login screen and its API.
  if (pathname === "/preview" || pathname === "/api/preview") {
    return NextResponse.next();
  }

  // Email links (verify email / reset password) open in the user's mail app, which has no preview
  // cookie. The handler only exchanges a one-time token with the API and redirects.
  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  // Direct visits to /coming-soon routes are allowed.
  if (pathname.startsWith("/coming-soon")) {
    return NextResponse.next();
  }

  if (isLegacyPublic(pathname)) {
    return NextResponse.next();
  }

  // Stealth: any other internal page (/admin, /login, /dashboard, /register/runner, other /api, ...)
  // redirects to home (Coming Soon), revealing nothing about internal paths.
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!_next/static|_next/image).*)",
  ],
};
