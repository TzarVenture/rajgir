import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass completely if COMING_SOON is set to "false" (e.g. during local development)
  const isComingSoonActive = process.env.COMING_SOON === "true";
  if (!isComingSoonActive) {
    return NextResponse.next();
  }

  // 2. Always allow static files, images, favicon, and Next.js system internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/api/preview") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // 3. Publicly accessible routes on the Coming Soon live site
  const isPublicRoute = pathname === "/" || pathname === "/contact" || pathname === "/preview";

  // 4. Check for active preview authorization cookie
  const previewAuthCookie = request.cookies.get("rajgir_preview_auth")?.value;
  const isPreviewAuthorized = previewAuthCookie === "granted";

  // If visiting an internal route (like /wip, /portal, /admin) without preview authorization, redirect to /preview
  if (!isPublicRoute && !isPreviewAuthorized) {
    const previewUrl = new URL("/preview", request.url);
    previewUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(previewUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    "/((?!_next/static|_next/image).*)",
  ],
};

