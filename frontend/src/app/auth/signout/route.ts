import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { NEXT_COOKIE, SESSION_COOKIE, decodeSession } from "@/lib/auth/cookie";
import { loginUrl, safeRedirect } from "@/lib/auth/redirect";
import { REFRESH_FAILED_HEADER, classifyMeResponse, clientIpFromHeaders } from "@/lib/auth/sessionState";

/**
 * Clears a session cookie the API no longer accepts, then continues to /login (keeping a safe
 * return path). requireUser() sends the browser here because server components cannot change cookies.
 *
 * The session is re-checked first and the cookie is removed only if the API still rejects it (401):
 *  - a request that raced a token refresh in another tab is sent back to its page, still signed in;
 *  - a forged link to this URL cannot sign out a user whose session is valid.
 * Deliberate sign-out is the `logout` server action (POST, revokes the session on the API).
 */
function publicUrl(request: NextRequest, path: string): URL {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return new URL(path, `${proto}://${host}`);
}

function noStore(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("redirect");
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (session) {
    const clientIp = clientIpFromHeaders((name) => request.headers.get(name));
    const refreshFailed = request.headers.get(REFRESH_FAILED_HEADER) === "1";
    const status = classifyMeResponse(await api.auth.me({ token: session.accessToken, clientIp }), refreshFailed);
    if (status === "authenticated") {
      return noStore(NextResponse.redirect(publicUrl(request, safeRedirect(returnTo) ?? "/dashboard")));
    }
    if (status === "unavailable") {
      // Cannot tell right now: keep the session and let the login page explain.
      return noStore(NextResponse.redirect(publicUrl(request, loginUrl(returnTo))));
    }
  }

  const response = NextResponse.redirect(publicUrl(request, loginUrl(returnTo)));
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(NEXT_COOKIE);
  return noStore(response);
}
