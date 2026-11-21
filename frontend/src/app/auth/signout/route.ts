import { NextRequest, NextResponse } from "next/server";
import { NEXT_COOKIE, SESSION_COOKIE } from "@/lib/auth/cookie";
import { loginUrl } from "@/lib/auth/redirect";

/**
 * Clears a session the API no longer accepts (expired, revoked, or the account was deleted) and
 * sends the browser to /login, keeping a safe return path.
 *
 * Server components cannot change cookies while rendering, so requireUser() redirects here when
 * the API answers 401 for a session cookie that is still present. Only the local cookies are
 * removed; nothing else changes, so a forged link can at worst sign the visitor out.
 */
function publicUrl(request: NextRequest, path: string): URL {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return new URL(path, `${proto}://${host}`);
}

export function GET(request: NextRequest) {
  const target = loginUrl(request.nextUrl.searchParams.get("redirect"));
  const response = NextResponse.redirect(publicUrl(request, target));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(NEXT_COOKIE);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
