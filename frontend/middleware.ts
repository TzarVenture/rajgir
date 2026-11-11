import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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

  // 1. Bypass completely if COMING_SOON is set to "false" (Official Launch Mode)
  const isComingSoonActive = process.env.COMING_SOON === "true";
  if (!isComingSoonActive) {
    return NextResponse.next();
  }

  // 2. Always allow static files, images, favicon, Next.js system internals, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  const expectedPassword = process.env.PREVIEW_PASSWORD || "rajgir@preview2027";

  // 3. Check for Direct Secret Key in URL (?preview_key=... or ?key=...)
  const directKey =
    request.nextUrl.searchParams.get("preview_key") ||
    request.nextUrl.searchParams.get("key");

  if (directKey && directKey === expectedPassword) {
    // Authorized via secret link: Strip secret key from URL and set 7-day session cookie
    const cleanUrl = new URL(pathname, request.url);
    request.nextUrl.searchParams.forEach((value, key) => {
      if (key !== "key" && key !== "preview_key") {
        cleanUrl.searchParams.set(key, value);
      }
    });

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set("rajgir_preview_auth", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    return response;
  }

  // 4. Check for active preview authorization cookie
  const previewAuthCookie = request.cookies.get("rajgir_preview_auth")?.value;
  const isPreviewAuthorized = previewAuthCookie === "granted";

  // 5. Authorized Users (Developers & Client)
  if (isPreviewAuthorized) {
    // If authorized user visits /coming-soon directly, allow it
    if (pathname.startsWith("/coming-soon")) {
      return NextResponse.next();
    }
    // Otherwise serve the real root production site
    return NextResponse.next();
  }

  // 6. Public / Unauthorized Visitors (Stealth Coming Soon Gating)
  if (pathname === "/") {
    // Transparently rewrite root to quarantined Coming Soon page (URL remains '/')
    return NextResponse.rewrite(new URL("/coming-soon", request.url));
  }

  if (pathname === "/contact") {
    // Transparently rewrite /contact to quarantined Coming Soon Contact page (URL remains '/contact')
    return NextResponse.rewrite(new URL("/coming-soon/contact", request.url));
  }

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/join" ||
    pathname.startsWith("/join/") ||
    pathname === "/influencer" ||
    pathname.startsWith("/influencer/") ||
    pathname.startsWith("/register/volunteer") ||
    pathname.startsWith("/register/influencer")
  ) {
    // Allow access to Admin Dashboard, Volunteer, and Influencer forms
    return NextResponse.next();
  }

  if (pathname === "/preview") {
    // Allow access to preview login screen
    return NextResponse.next();
  }

  if (pathname.startsWith("/coming-soon")) {
    // Direct visits to /coming-soon routes are allowed
    return NextResponse.next();
  }

  // Stealth: Any attempt to access internal real pages (/about, /register/runner, etc.)
  // redirects directly to home (Coming Soon), revealing nothing about internal paths.
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
