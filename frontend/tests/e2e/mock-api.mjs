// A small stand-in for the NestJS auth API, implementing the same contract the frontend relies on
// (status codes, error codes, token rotation). Used by the end-to-end test so the real Next.js
// server (middleware, server actions, cookies, redirects) can be exercised without Supabase or a DB.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const USERS = [
  { id: "u-sponsor", email: "sponsor@example.com", password: "correct-horse", firstName: "Asha", lastName: "Verma", phone: "9876543210", role: "SPONSOR", status: "PENDING_APPROVAL", emailVerified: true },
  { id: "u-staff", email: "staff@example.com", password: "correct-horse", firstName: "Ravi", lastName: "Staff", phone: "9876543211", role: "ORGANIZER", status: "ACTIVE", emailVerified: true },
  { id: "u-unverified", email: "unverified@example.com", password: "correct-horse", firstName: "Uma", lastName: "New", phone: "9876543212", role: null, status: "PENDING_ONBOARDING", emailVerified: false },
];

export function startMockApi() {
  const state = {
    mode: "up", // "up" | "down" (503) | "throttled" (429) on /auth/me and /auth/refresh
    accessTtl: 3600,
    sessions: new Map(), // accessToken -> { userId, refreshToken }
    refreshTokens: new Map(), // refreshToken -> { userId, rotatedTo?, rotatedAt? }
    log: [],
    signups: [],
  };

  function issue(userId) {
    const accessToken = `at-${randomUUID()}`;
    const refreshToken = `rt-${randomUUID()}`;
    const expiresAt = Math.floor(Date.now() / 1000) + state.accessTtl;
    state.sessions.set(accessToken, { userId, refreshToken, expiresAt });
    state.refreshTokens.set(refreshToken, { userId });
    return { accessToken, refreshToken, expiresAt };
  }

  const publicUser = (u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, fullName: `${u.firstName} ${u.lastName}`, email: u.email, phone: u.phone, role: u.role, status: u.status, emailVerified: u.emailVerified });

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://mock");
    const path = url.pathname.replace(/^\/api\/v1/, "");
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = raw ? JSON.parse(raw) : {};
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    const send = (status, payload) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(payload));
    };

    if (!path.startsWith("/__")) {
      state.log.push({ method: req.method, path, token, clientIp: req.headers["x-client-ip"], secret: req.headers["x-internal-secret"] });
    }

    // ---- test controls ----
    if (path === "/__control") { Object.assign(state, body); return send(200, { ok: true }); }
    if (path === "/__revoke") { state.sessions.delete(body.token); return send(200, { ok: true }); }
    if (path === "/__expire-refresh") { state.refreshTokens.clear(); return send(200, { ok: true }); }

    // ---- auth API contract ----
    if (path === "/auth/config") return send(200, { requireEmailVerification: true });

    if (path === "/auth/login" && req.method === "POST") {
      const user = USERS.find((u) => u.email === String(body.identifier).toLowerCase() || u.phone === body.identifier);
      if (!user || user.password !== body.password) return send(401, { statusCode: 401, message: "Incorrect email/mobile or password." });
      if (!user.emailVerified) return send(403, { statusCode: 403, code: "EMAIL_NOT_VERIFIED", message: "Please verify your email to continue." });
      return send(200, { session: issue(user.id), user: publicUser(user) });
    }

    if (path === "/auth/signup" && req.method === "POST") {
      state.signups.push(body);
      return send(201, { needsVerification: true, email: body.email, session: null, user: { ...publicUser(USERS[2]), email: body.email } });
    }

    if (path === "/auth/refresh" && state.mode === "refresh-throttled") return send(429, { statusCode: 429, message: "ThrottlerException: Too Many Requests" });
    if (path === "/auth/me" || path === "/auth/refresh") {
      if (state.mode === "down") return send(503, { statusCode: 503, code: "AUTH_UNAVAILABLE", message: "Sign-in service is temporarily unavailable." });
      if (state.mode === "throttled") return send(429, { statusCode: 429, message: "ThrottlerException: Too Many Requests" });
    }

    if (path === "/auth/refresh" && req.method === "POST") {
      const entry = state.refreshTokens.get(body.refreshToken);
      if (!entry) return send(401, { statusCode: 401, code: "SESSION_EXPIRED", message: "Your session has expired." });
      // Like Supabase: a refresh token reused within a short window returns the same rotated session.
      if (entry.rotatedTo && Date.now() - entry.rotatedAt < 10_000) return send(200, { session: entry.rotatedTo });
      if (entry.rotatedTo) return send(401, { statusCode: 401, code: "SESSION_EXPIRED", message: "Your session has expired." });
      for (const [at, s] of state.sessions) if (s.refreshToken === body.refreshToken) state.sessions.delete(at); // old access token dies
      const next = issue(entry.userId);
      entry.rotatedTo = next;
      entry.rotatedAt = Date.now();
      return send(200, { session: next });
    }

    // ---- everything below requires a valid session (global guard) ----
    const found = token && state.sessions.get(token);
    const session = found && found.expiresAt > Math.floor(Date.now() / 1000) ? found : null; // expired JWTs are rejected
    if (!session) return send(401, { statusCode: 401, code: token ? "SESSION_EXPIRED" : "AUTH_REQUIRED", message: "Authentication required" });
    const user = USERS.find((u) => u.id === session.userId);

    if (path === "/auth/me") return send(200, publicUser(user));
    if (path === "/auth/logout" && req.method === "POST") { state.sessions.delete(token); return send(200, { success: true }); }
    if (path === "/registrations/me") return send(200, { registered: false });

    return send(404, { statusCode: 404, message: `mock: ${req.method} ${path} not implemented` });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ port: server.address().port, state, close: () => new Promise((r) => server.close(r)) }));
  });
}
