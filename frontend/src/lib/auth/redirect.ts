/** Pages that must never be used as a post-login destination (avoids loops and open redirects). */
const AUTH_PAGES = new Set(["/login", "/register", "/verify-email", "/forgot-password", "/reset-password"]);

/**
 * Returns the path if it is a safe same-site destination, otherwise null.
 * Rejects absolute URLs, protocol-relative URLs (//evil.com), backslashes, control characters and auth pages.
 */
export function safeRedirect(input: string | null | undefined): string | null {
  if (!input) return null;
  const path = input.trim();

  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("\\") || /[\u0000-\u001f\u007f]/.test(path)) return null;

  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  if (AUTH_PAGES.has(pathname) || pathname.startsWith("/auth/")) return null;

  return path;
}

/** Builds /login?redirect=… for pages that require a signed-in user. */
export function loginUrl(returnTo?: string | null): string {
  const safe = safeRedirect(returnTo);
  return safe ? `/login?redirect=${encodeURIComponent(safe)}` : "/login";
}
