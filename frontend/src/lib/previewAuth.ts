/**
 * Preview access (stakeholder/developer entry to the real site while the
 * Coming Soon gate is active).
 *
 * The cookie is a signed, expiring token (HMAC-SHA256) so it cannot be forged
 * by hand. Uses Web Crypto only, so it works in the edge middleware and in
 * route handlers.
 *
 * Env:
 *  - PREVIEW_PASSWORD       required. If unset, preview access is disabled.
 *  - PREVIEW_COOKIE_SECRET  optional. Signing secret; defaults to PREVIEW_PASSWORD.
 */
export const PREVIEW_COOKIE = "rajgir_preview_auth";
export const PREVIEW_TTL_SECONDS = 7 * 24 * 60 * 60;

const encoder = new TextEncoder();

function password(): string {
  return process.env.PREVIEW_PASSWORD ?? "";
}

function secret(): string {
  return process.env.PREVIEW_COOKIE_SECRET || password();
}

export function isPreviewConfigured(): boolean {
  return password().length > 0;
}

async function sign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Constant-time password check. Always false when preview is not configured. */
export async function passwordMatches(input: string | null | undefined): Promise<boolean> {
  if (!isPreviewConfigured() || !input) return false;
  // Compare HMACs so both sides have equal length and timing does not leak the password.
  const [a, b] = await Promise.all([sign(`pw:${input}`), sign(`pw:${password()}`)]);
  return safeEqual(a, b);
}

export async function createPreviewToken(now: number = Date.now()): Promise<string> {
  const expires = now + PREVIEW_TTL_SECONDS * 1000;
  return `${expires}.${await sign(`session:${expires}`)}`;
}

export async function verifyPreviewToken(token: string | null | undefined): Promise<boolean> {
  if (!token || !isPreviewConfigured()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now()) return false;
  return safeEqual(signature, await sign(`session:${expires}`));
}

export function previewCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: PREVIEW_TTL_SECONDS,
    path: "/",
  };
}
