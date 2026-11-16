import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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
  "/api/register/volunteer",
  "/api/register/influencer",
];

function isLegacyPublic(pathname: string): boolean {
  return LEGACY_PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
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
    return NextResponse.next();
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
    return NextResponse.next();
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
