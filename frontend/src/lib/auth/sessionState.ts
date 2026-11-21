import type { ApiClientResponse } from "@/lib/api";

/**
 * Pure rules behind the session layer (no Next.js imports, so they are unit-tested directly).
 *
 * A request's session is always exactly one of:
 *  - authenticated : the API accepted the session cookie
 *  - anonymous     : there is no session cookie
 *  - rejected      : the API answered 401: the session is over (expired, revoked, account deleted
 *                    or suspended). Only this state may clear the cookie.
 *  - unavailable   : the API could not answer (network error, timeout, 429, 5xx). The session is
 *                    NOT ended; the user sees an error and can retry, instead of being logged out.
 */
export type SessionStatus = "authenticated" | "anonymous" | "rejected" | "unavailable";

/**
 * Request header the middleware sets (after stripping any client-supplied copy) when it had to
 * refresh the session but could not reach a verdict (throttled / outage). A 401 for the stale
 * access token on such a request is not final, so it must not end the session.
 */
export const REFRESH_FAILED_HEADER = "x-rajgir-refresh-failed";

export function classifyMeResponse(
  res: Pick<ApiClientResponse<unknown>, "success" | "data" | "statusCode">,
  refreshFailed = false,
): Exclude<SessionStatus, "anonymous"> {
  if (res.success && res.data) return "authenticated";
  if (res.statusCode === 401 && !refreshFailed) return "rejected";
  return "unavailable";
}

/**
 * The visitor's IP as reported by our reverse proxy, used only for per-visitor rate limits.
 *
 * Default: the LAST X-Forwarded-For entry, i.e. the address the nearest proxy (Traefik) appended;
 * earlier entries are whatever the client claimed. If the proxy instead sets a dedicated header
 * that it always overwrites (e.g. "cf-connecting-ip" behind Cloudflare), name it in CLIENT_IP_HEADER.
 * Without any proxy in front of Next.js no header can be trusted; deploy behind one.
 */
export function clientIpFromHeaders(
  get: (name: string) => string | null | undefined,
  preferredHeader: string | undefined = process.env.CLIENT_IP_HEADER,
): string | undefined {
  const header = preferredHeader?.trim().toLowerCase();
  if (header && header !== "x-forwarded-for") {
    const value = get(header)?.split(",")[0]?.trim();
    if (value) return value;
  }
  const forwarded = get("x-forwarded-for")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return forwarded?.length ? forwarded[forwarded.length - 1] : undefined;
}
