import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cookieSecure, decodeSession, encodeSession, needsRefresh } from "@/lib/auth/cookie";
import { loginUrl, safeRedirect } from "@/lib/auth/redirect";
import { classifyMeResponse, clientIpFromHeaders } from "@/lib/auth/sessionState";
import { homePath } from "@/lib/auth/paths";

describe("session cookie encoding", () => {
  it("round-trips tokens", () => {
    const session = { accessToken: "eyJ.a-b_c", refreshToken: "r1", expiresAt: 1_900_000_000 };
    assert.deepEqual(decodeSession(encodeSession(session)), session);
  });

  it("produces a cookie-safe value (base64url, no padding)", () => {
    const value = encodeSession({ accessToken: "a".repeat(100), refreshToken: "b?/+", expiresAt: 1 });
    assert.match(value, /^[A-Za-z0-9_-]+$/);
  });

  it("rejects missing, tampered and incomplete values instead of throwing", () => {
    assert.equal(decodeSession(undefined), null);
    assert.equal(decodeSession(""), null);
    assert.equal(decodeSession("not-base64-json!!"), null);
    assert.equal(decodeSession(btoa(JSON.stringify({ a: "x", r: "y" }))), null);
    assert.equal(decodeSession(btoa(JSON.stringify({ a: "", r: "y", e: 1 }))), null);
  });

  it("refreshes slightly before expiry", () => {
    const now = 1_000_000;
    assert.equal(needsRefresh({ accessToken: "a", refreshToken: "r", expiresAt: now + 3600 }, 60, now), false);
    assert.equal(needsRefresh({ accessToken: "a", refreshToken: "r", expiresAt: now + 30 }, 60, now), true);
    assert.equal(needsRefresh({ accessToken: "a", refreshToken: "r", expiresAt: now - 1 }, 60, now), true);
  });

  it("marks cookies Secure in production unless explicitly overridden", () => {
    assert.equal(cookieSecure({ NODE_ENV: "production" }), true);
    assert.equal(cookieSecure({ NODE_ENV: "development" }), false);
    assert.equal(cookieSecure({ NODE_ENV: "production", COOKIE_SECURE: "false" }), false);
    assert.equal(cookieSecure({ NODE_ENV: "development", COOKIE_SECURE: "true" }), true);
  });
});

describe("session classification", () => {
  it("a 401 after a failed (transient) refresh is not final", () => {
    assert.equal(classifyMeResponse({ success: false, statusCode: 401 }, true), "unavailable");
  });

  it("only a 401 ends a session; any other failure is 'unavailable'", () => {
    assert.equal(classifyMeResponse({ success: true, data: { id: "u" }, statusCode: 200 }), "authenticated");
    assert.equal(classifyMeResponse({ success: false, statusCode: 401 }), "rejected");
    for (const statusCode of [429, 500, 502, 503, undefined]) {
      assert.equal(classifyMeResponse({ success: false, statusCode }), "unavailable", `status ${statusCode}`);
    }
  });
});

describe("visitor IP", () => {
  const from = (headers: Record<string, string>, preferred?: string) => clientIpFromHeaders((name) => headers[name], preferred);

  it("ignores a client-supplied X-Real-IP by default", () => {
    assert.equal(from({ "x-real-ip": "6.6.6.6", "x-forwarded-for": "203.0.113.9" }), "203.0.113.9");
  });

  it("uses a configured proxy header (e.g. Cloudflare) when present", () => {
    assert.equal(from({ "cf-connecting-ip": "203.0.113.5", "x-forwarded-for": "9.9.9.9" }, "CF-Connecting-IP"), "203.0.113.5");
    assert.equal(from({ "x-forwarded-for": "9.9.9.9" }, "cf-connecting-ip"), "9.9.9.9");
  });

  it("uses the last X-Forwarded-For hop, never the client-supplied first one", () => {
    assert.equal(from({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }), "203.0.113.9");
  });

  it("is undefined without proxy headers", () => {
    assert.equal(from({}), undefined);
  });
});

describe("redirect safety", () => {
  it("allows same-site paths", () => {
    assert.equal(safeRedirect("/dashboard/runner?tab=bib"), "/dashboard/runner?tab=bib");
  });

  it("blocks open redirects and auth-page loops", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)", "/login", "/signup?x=1", "/auth/signout", "/\u0000x"]) {
      assert.equal(safeRedirect(bad), null, bad);
    }
  });

  it("builds login URLs that only carry safe return paths", () => {
    assert.equal(loginUrl("/dashboard"), "/login?redirect=%2Fdashboard");
    assert.equal(loginUrl("//evil.com"), "/login");
  });
});

describe("post-login destination", () => {
  const user = (role: string | null, status: string, emailVerified = true) => ({ role, status, emailVerified });

  it("routes each account state to one place", () => {
    assert.equal(homePath(user(null, "PENDING_ONBOARDING", false)), "/verify-email");
    assert.equal(homePath(user(null, "PENDING_ONBOARDING")), "/register");
    assert.equal(homePath(user("RUNNER", "ACTIVE")), "/dashboard");
    assert.equal(homePath(user("VOLUNTEER", "PENDING_APPROVAL")), "/dashboard");
    assert.equal(homePath(user("SPONSOR", "PENDING_APPROVAL")), "/pending");
    assert.equal(homePath(user("RUNNER", "PENDING_ONBOARDING")), "/register/runner");
  });
});
