import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { homePath } from "@/lib/auth/paths";
import { safeRedirect } from "@/lib/auth/redirect";
import { NEXT_COOKIE, SESSION_COOKIE, encodeSession, sessionCookieOptions } from "@/lib/auth/cookie";
import { clientIpFromHeaders } from "@/lib/auth/sessionState";

/**
 * Landing point for the links in Supabase emails (verify email, reset password).
 * Supabase email templates must link to:
 *   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup      (confirm signup)
 *   {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery    (reset password)
 *
 * The token is handed to the NestJS API; Next.js only stores the resulting session cookie.
 */
function publicUrl(request: NextRequest, path: string): URL {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  return new URL(path, `${proto}://${host}`);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type");

  // Supabase reports expired/invalid links with ?error=... in the URL.
  if (params.get("error") || params.get("error_code")) {
    return NextResponse.redirect(publicUrl(request, "/verify-email?error=link"));
  }

  if (tokenHash && type === "recovery") {
    // Do not consume the token here; the reset form submits it together with the new password.
    return NextResponse.redirect(publicUrl(request, `/reset-password?token_hash=${encodeURIComponent(tokenHash)}`));
  }

  if (tokenHash && (type === "signup" || type === "email")) {
    const clientIp = clientIpFromHeaders((name) => request.headers.get(name));
    const res = await api.auth.verifyEmail(tokenHash, type, { clientIp });
    if (!res.success || !res.data) {
      return NextResponse.redirect(publicUrl(request, "/verify-email?error=link"));
    }

    const remembered = safeRedirect(request.cookies.get(NEXT_COOKIE)?.value);
    const target = remembered ?? homePath(res.data.user);
    const response = NextResponse.redirect(publicUrl(request, target));
    response.cookies.set(SESSION_COOKIE, encodeSession(res.data.session), sessionCookieOptions);
    response.cookies.delete(NEXT_COOKIE);
    return response;
  }

  return NextResponse.redirect(publicUrl(request, "/login"));
}
