// End-to-end test of the authentication lifecycle through the REAL Next.js production server
// (middleware, server actions, cookies, redirects, error boundary) against a mock of the NestJS API.
//
//   npm run build && npm run test:e2e
//
// Nothing real is touched: the mock API runs in-process and Next.js is started on a free port.
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { startMockApi } from "./mock-api.mjs";

const FRONTEND_DIR = fileURLToPath(new URL("../..", import.meta.url));
const SECRET = "e2e-internal-secret";
let api;
let next;
let base;

function freePort() {
  return new Promise((resolve) => {
    const srv = createServer();
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function waitFor(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Next.js did not start at ${url}`);
}

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? decode(m[1]) : undefined;
};

/** A minimal browser: cookie jar, manual redirects, form posts the way a no-JS browser sends them. */
class Browser {
  constructor(ip = "203.0.113.10") {
    this.ip = ip;
    this.jar = new Map();
  }

  cookie(name) {
    return this.jar.get(name);
  }

  absorb(res) {
    for (const line of res.headers.getSetCookie()) {
      const [pair, ...attrs] = line.split(";").map((s) => s.trim());
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      const expired = attrs.some((a) => /^max-age=0$/i.test(a) || (/^expires=/i.test(a) && new Date(a.slice(8)) < new Date()));
      if (expired || value === "") this.jar.delete(name);
      else this.jar.set(name, { value, attrs: attrs.map((a) => a.toLowerCase()) });
    }
  }

  async request(path, { method = "GET", body, headers = {} } = {}) {
    const cookie = [...this.jar].map(([k, v]) => `${k}=${v.value}`).join("; ");
    const res = await fetch(new URL(path, base), {
      method,
      body,
      redirect: "manual",
      headers: { "x-forwarded-for": this.ip, ...(cookie ? { cookie } : {}), ...headers },
    });
    this.absorb(res);
    return res;
  }

  /** GET and follow redirects; returns the final response, its HTML and the list of locations visited. */
  async visit(path, max = 10) {
    const chain = [path];
    let res = await this.request(path);
    for (let i = 0; i < max && res.status >= 300 && res.status < 400; i++) {
      const location = new URL(res.headers.get("location"), base);
      chain.push(location.pathname + location.search);
      res = await this.request(location.pathname + location.search);
    }
    return { res, status: res.status, html: await res.text(), chain };
  }

  /** Submit the <form> on `pagePath` that contains `marker`, as a browser without JavaScript would. */
  async submitForm(pagePath, marker, fields, { origin } = {}) {
    const { html } = await this.visit(pagePath);
    const form = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)].find((m) => m[0].includes(marker));
    assert.ok(form, `form containing ${marker} not found on ${pagePath}`);
    const data = new FormData();
    for (const [tag] of form[0].matchAll(/<input\b[^>]*>/g)) {
      const name = attr(tag, "name");
      if (name && attr(tag, "type") === "hidden") data.append(name, attr(tag, "value") ?? "");
    }
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    return this.request(pagePath, { method: "POST", body: data, headers: { origin: origin ?? new URL(base).origin } });
  }

  async login(identifier, password, from = "/login") {
    return this.submitForm(from, 'name="identifier"', { identifier, password });
  }
}

const control = (patch) => fetch(`http://127.0.0.1:${api.port}/__control`, { method: "POST", body: JSON.stringify(patch) });
const revoke = (token) => fetch(`http://127.0.0.1:${api.port}/__revoke`, { method: "POST", body: JSON.stringify({ token }) });
const sessionToken = (browser) => {
  const raw = browser.cookie("rajgir_session")?.value;
  if (!raw) return null;
  const json = JSON.parse(atob(raw.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (raw.length % 4)) % 4)));
  return { accessToken: json.a, refreshToken: json.r, expiresAt: json.e };
};

before(async () => {
  api = await startMockApi();
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: FRONTEND_DIR,
    env: {
      ...process.env,
      NODE_ENV: "production",
      COMING_SOON: "false",
      API_URL: `http://127.0.0.1:${api.port}/api/v1`,
      NEXT_PUBLIC_API_URL: `http://127.0.0.1:${api.port}/api/v1`,
      INTERNAL_API_SECRET: SECRET,
      HOSTNAME: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  next.stdout.on("data", () => {});
  next.stderr.on("data", (d) => process.env.E2E_VERBOSE && process.stderr.write(d));
  await waitFor(`${base}/login`);
});

after(async () => {
  next?.kill();
  await api?.close();
});

beforeEach(async () => {
  await control({ mode: "up", accessTtl: 3600 });
  api.state.log.length = 0;
});

describe("login", () => {
  it("anonymous access to a protected page goes to /login with a return path", async () => {
    const { chain } = await new Browser().visit("/dashboard");
    assert.equal(chain[1], "/login?redirect=%2Fdashboard");
  });

  it("wrong password shows the API's error and sets no session cookie", async () => {
    const browser = new Browser();
    const res = await browser.login("sponsor@example.com", "wrong");
    assert.equal(res.status, 200);
    assert.match(await res.text(), /Incorrect email\/mobile or password\./);
    assert.equal(browser.cookie("rajgir_session"), undefined);
  });

  it("correct credentials set one httpOnly SameSite=Lax session cookie and land on the user's home", async () => {
    const browser = new Browser("198.51.100.77");
    const res = await browser.login("sponsor@example.com", "correct-horse");
    assert.equal(res.status, 303);
    assert.equal(res.headers.get("location"), "/pending");
    const cookie = browser.cookie("rajgir_session");
    assert.ok(cookie, "session cookie set");
    assert.ok(cookie.attrs.includes("httponly"));
    assert.ok(cookie.attrs.includes("samesite=lax"));
    assert.ok(cookie.attrs.includes("path=/"));

    const loginCall = api.state.log.find((c) => c.path === "/auth/login");
    assert.equal(loginCall.clientIp, "198.51.100.77", "visitor IP forwarded for per-visitor rate limits");
    assert.equal(loginCall.secret, SECRET);
  });

  it("login honours a safe ?redirect= and ignores an unsafe one", async () => {
    const safe = new Browser();
    const r1 = await safe.login("staff@example.com", "correct-horse", "/login?redirect=%2Fadmin");
    assert.equal(r1.headers.get("location"), "/admin");

    const unsafe = new Browser();
    const r2 = await unsafe.login("staff@example.com", "correct-horse", "/login?redirect=https%3A%2F%2Fevil.com");
    assert.equal(r2.headers.get("location"), "/dashboard");
  });

  it("unverified email is sent to /verify-email without a session", async () => {
    const browser = new Browser();
    const res = await browser.login("unverified@example.com", "correct-horse");
    assert.equal(res.status, 303);
    assert.match(res.headers.get("location"), /^\/verify-email\?from=login&email=unverified%40example\.com/);
    assert.equal(browser.cookie("rajgir_session"), undefined);
  });

  it("a signed-in user visiting /login is sent to their home", async () => {
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    const { chain } = await browser.visit("/login");
    assert.equal(chain.at(-1), "/pending");
  });
});

describe("existing session", () => {
  it("login -> protected page -> refresh -> direct navigation all stay signed in", async () => {
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    for (const path of ["/pending", "/pending", "/dashboard"]) {
      const { status, html, chain } = await browser.visit(path);
      assert.equal(status, 200, path);
      assert.equal(chain.at(-1), "/pending");
      assert.match(html, /Asha Verma/);
    }
  });

  it("a second tab (same cookie) sees the same session", async () => {
    const tab1 = new Browser();
    await tab1.login("sponsor@example.com", "correct-horse");
    const tab2 = new Browser();
    tab2.jar = tab1.jar;
    const { status, html } = await tab2.visit("/pending");
    assert.equal(status, 200);
    assert.match(html, /Asha Verma/);
  });

  it("an expiring access token is refreshed by the middleware and the page uses the new one", async () => {
    await control({ accessTtl: 30 }); // inside the 60 s refresh window
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    const before = sessionToken(browser);
    await control({ accessTtl: 3600 });

    const { status, html } = await browser.visit("/pending");
    assert.equal(status, 200);
    assert.match(html, /Asha Verma/);
    const afterRefresh = sessionToken(browser);
    assert.notEqual(afterRefresh.accessToken, before.accessToken, "cookie updated with rotated tokens");
    assert.ok(afterRefresh.expiresAt > before.expiresAt);
    const me = api.state.log.filter((c) => c.path === "/auth/me").at(-1);
    assert.equal(me.token, afterRefresh.accessToken, "the page called the API with the refreshed token");
  });

  it("many simultaneous requests with an expiring token all succeed (no refresh race logout)", async () => {
    await control({ accessTtl: 30 });
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    await control({ accessTtl: 3600 });
    const jarSnapshot = new Map(browser.jar);

    const tabs = Array.from({ length: 6 }, () => {
      const b = new Browser();
      b.jar = new Map(jarSnapshot);
      return b.visit("/pending");
    });
    const results = await Promise.all(tabs);
    assert.deepEqual(results.map((r) => r.status), Array(6).fill(200));
    for (const r of results) assert.equal(r.chain.at(-1), "/pending");
  });

  it("an expired refresh token ends the session cleanly (cookie cleared, back to login)", async () => {
    await control({ accessTtl: 30 });
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    await fetch(`http://127.0.0.1:${api.port}/__expire-refresh`, { method: "POST" });
    const { chain } = await browser.visit("/pending");
    assert.equal(chain.at(-1), "/login?redirect=%2Fpending");
    assert.equal(browser.cookie("rajgir_session"), undefined);
  });
});

describe("API trouble never logs the user out", () => {
  for (const mode of ["down", "throttled"]) {
    it(`API ${mode}: protected page shows a retryable error, session cookie kept, works again afterwards`, async () => {
      const browser = new Browser();
      await browser.login("sponsor@example.com", "correct-horse");
      const cookieBefore = browser.cookie("rajgir_session").value;

      await control({ mode });
      const during = await browser.visit("/pending");
      assert.equal(during.chain.length, 1, "no redirect to signout/login");
      // SSR errors are served as Next's error document; app/(site)/error.tsx renders it in the browser.
      assert.equal(during.status, 500);
      assert.match(during.html, /__next_error__/);
      assert.equal(browser.cookie("rajgir_session")?.value, cookieBefore, "cookie untouched");

      await control({ mode: "up" });
      const afterwards = await browser.visit("/pending");
      assert.equal(afterwards.status, 200);
      assert.match(afterwards.html, /Asha Verma/);
    });
  }
});

describe("expired token + refresh that cannot complete", () => {
  it("throttled refresh with an already-expired access token keeps the user signed in", async () => {
    await control({ accessTtl: -5 }); // token is already expired when issued
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    const cookieBefore = browser.cookie("rajgir_session").value;
    await control({ accessTtl: 3600, mode: "refresh-throttled" });

    const during = await browser.visit("/pending");
    assert.equal(during.chain.length, 1, "no redirect to signout/login");
    assert.equal(during.status, 500);
    assert.equal(browser.cookie("rajgir_session")?.value, cookieBefore, "cookie untouched");

    const signout = await browser.visit("/auth/signout?redirect=%2Fpending");
    assert.ok(browser.cookie("rajgir_session"), "even the signout route keeps a session it cannot judge");

    await control({ mode: "up" });
    const afterwards = await browser.visit("/pending");
    assert.equal(afterwards.status, 200);
    assert.match(afterwards.html, /Asha Verma/);
  });

  it("a client cannot pre-set the internal refresh-failed marker to dodge a real logout", async () => {
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    await revoke(sessionToken(browser).accessToken);
    const res = await browser.request("/pending", { headers: { "x-rajgir-refresh-failed": "1" } });
    assert.equal(res.status, 307);
    assert.ok(res.headers.get("location").startsWith("/auth/signout"), res.headers.get("location"));
  });
});

describe("rejected sessions", () => {
  it("a session revoked on the server is cleared and the user returns to login with their path", async () => {
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    await revoke(sessionToken(browser).accessToken);
    const { chain } = await browser.visit("/pending");
    assert.deepEqual(chain.slice(1), ["/auth/signout?redirect=%2Fpending", "/login?redirect=%2Fpending"]);
    assert.equal(browser.cookie("rajgir_session"), undefined);
  });

  it("/auth/signout does NOT clear a session that is still valid (no forced logout via link)", async () => {
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    const { chain } = await browser.visit("/auth/signout?redirect=%2Fpending");
    assert.equal(chain.at(-1), "/pending");
    assert.ok(browser.cookie("rajgir_session"), "still signed in");
  });
});

describe("logout", () => {
  it("logout revokes the session on the API, clears the cookie, and refresh stays logged out", async () => {
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    const token = sessionToken(browser).accessToken;

    const res = await browser.submitForm("/pending", "Sign out", {});
    assert.equal(res.status, 303);
    assert.equal(res.headers.get("location"), "/login");
    assert.equal(browser.cookie("rajgir_session"), undefined);
    assert.ok(api.state.log.some((c) => c.path === "/auth/logout" && c.token === token), "API logout called with the session token");

    const { chain } = await browser.visit("/pending");
    assert.equal(chain.at(-1), "/login?redirect=%2Fpending");
  });

  it("a stolen copy of the logged-out cookie no longer works", async () => {
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    const stolen = new Map(browser.jar);
    await browser.submitForm("/pending", "Sign out", {});
    const attacker = new Browser();
    attacker.jar = stolen;
    const { chain } = await attacker.visit("/pending");
    assert.equal(chain.at(-1), "/login?redirect=%2Fpending");
  });

  it("a cross-site logout POST is refused (server action origin check)", async () => {
    const browser = new Browser();
    await browser.login("sponsor@example.com", "correct-horse");
    const res = await browser.submitForm("/pending", "Sign out", {}, { origin: "https://evil.example" });
    assert.notEqual(res.status, 303);
    assert.ok(browser.cookie("rajgir_session"), "session survives");
    assert.equal((await browser.visit("/pending")).status, 200);
  });
});

describe("authorization in the UI", () => {
  it("/admin: anonymous -> login, non-staff -> their home, staff -> allowed", async () => {
    assert.equal((await new Browser().visit("/admin")).chain[1], "/login?redirect=%2Fadmin");

    const member = new Browser();
    await member.login("sponsor@example.com", "correct-horse");
    assert.equal((await member.visit("/admin")).chain.at(-1), "/pending");

    const staff = new Browser();
    await staff.login("staff@example.com", "correct-horse");
    const { status, chain } = await staff.visit("/admin");
    assert.equal(status, 200);
    // /admin opens the console dashboard.
    assert.equal(chain.at(-1), "/admin/dashboard");
  });

  it("registration pages send anonymous visitors to sign-up and back", async () => {
    const { chain } = await new Browser().visit("/register/runner");
    assert.equal(chain[1], "/signup?redirect=%2Fregister%2Frunner");
  });
});

describe("sign-up", () => {
  it("creates the account through the API (one path), keeps names intact and asks for email verification", async () => {
    const browser = new Browser();
    const res = await browser.submitForm("/signup", 'name="firstName"', {
      firstName: "  Prakash  ",
      lastName: "Suresh   Kumar",
      email: "Prakash@Example.com",
      mobile: "+91 98765 00000",
      password: "long-enough-pw",
      confirm: "long-enough-pw",
    });
    assert.equal(res.status, 303);
    assert.equal(res.headers.get("location"), "/verify-email?email=prakash%40example.com");
    const signup = api.state.signups.at(-1);
    assert.deepEqual(
      { firstName: signup.firstName, lastName: signup.lastName, email: signup.email, mobile: signup.mobile },
      { firstName: "Prakash", lastName: "Suresh Kumar", email: "prakash@example.com", mobile: "9876500000" },
    );
    assert.equal(browser.cookie("rajgir_pending_reg"), undefined, "no staged password cookie");
    assert.equal(browser.cookie("rajgir_session"), undefined, "no session before verification");
  });
});
