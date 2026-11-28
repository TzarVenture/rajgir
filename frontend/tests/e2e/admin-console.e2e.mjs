// End-to-end test of the admin console through the REAL Next.js production server against the mock API.
//
//   npm run build && npm run test:e2e
//
// Covers: staff-only access, every navigation entry rendering inside the console shell, each page
// loading only the data it needs, load failures being reported (not shown as empty lists), and the
// specific duplicate/broken sections that were cleaned up.
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { startMockApi } from "./mock-api.mjs";
import { adminFixtures, adminRoutes } from "./mock-admin-api.mjs";

const FRONTEND_DIR = fileURLToPath(new URL("../..", import.meta.url));
const control = { failing: new Set(), reads: [] };
const fixtures = adminFixtures();
let api;
let next;
let base;
let staff;

const NAV = [
  "dashboard", "approvals", "todays-registrations", "revenue", "check-ins", "live-race", "analytics",
  "events", "registrations", "volunteers", "media",
  "payments", "sponsors", "vendors", "hotels", "tourism", "schools", "corporates", "influencers",
  "cms", "notifications", "support", "reports",
  "users", "roles", "permissions", "audit-logs", "settings",
];

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
/** Visible text of the main content (scripts removed, tags stripped). */
const text = (html) => decode(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");

class Browser {
  constructor() {
    this.jar = new Map();
  }
  absorb(res) {
    for (const line of res.headers.getSetCookie()) {
      const [pair, ...attrs] = line.split(";").map((s) => s.trim());
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      const expired = attrs.some((a) => /^max-age=0$/i.test(a) || (/^expires=/i.test(a) && new Date(a.slice(8)) < new Date()));
      if (expired || value === "") this.jar.delete(name);
      else this.jar.set(name, value);
    }
  }
  async request(path, { method = "GET", body, headers = {} } = {}) {
    const cookie = [...this.jar].map(([k, v]) => `${k}=${v}`).join("; ");
    const res = await fetch(new URL(path, base), { method, body, redirect: "manual", headers: { ...(cookie ? { cookie } : {}), ...headers } });
    this.absorb(res);
    return res;
  }
  async visit(path, max = 10) {
    const chain = [path];
    let res = await this.request(path);
    for (let i = 0; i < max && res.status >= 300 && res.status < 400; i++) {
      const location = new URL(res.headers.get("location"), base);
      chain.push(location.pathname + location.search);
      res = await this.request(location.pathname + location.search);
    }
    return { status: res.status, html: await res.text(), chain };
  }
  async login(identifier, password) {
    const { html } = await this.visit("/login");
    const form = [...html.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/g)].find((m) => m[0].includes('name="identifier"'));
    assert.ok(form, "login form found");
    const data = new FormData();
    for (const [tag] of form[0].matchAll(/<input\b[^>]*>/g)) {
      const name = attr(tag, "name");
      if (name && attr(tag, "type") === "hidden") data.append(name, attr(tag, "value") ?? "");
    }
    data.set("identifier", identifier);
    data.set("password", password);
    const res = await this.request("/login", { method: "POST", body: data, headers: { origin: new URL(base).origin } });
    assert.ok(this.jar.has("rajgir_session"), `signed in as ${identifier}`);
    return res;
  }
}

before(async () => {
  api = await startMockApi({ routes: adminRoutes(fixtures, control) });
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
      INTERNAL_API_SECRET: "e2e-internal-secret",
      HOSTNAME: "127.0.0.1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  next.stdout.on("data", () => {});
  next.stderr.on("data", (d) => process.env.E2E_VERBOSE && process.stderr.write(d));
  await waitFor(`${base}/login`);
  staff = new Browser();
  await staff.login("staff@example.com", "correct-horse");
});

after(async () => {
  next?.kill();
  await api?.close();
});

beforeEach(() => {
  control.failing.clear();
  control.reads.length = 0;
});

describe("access", () => {
  it("anonymous visitors are sent to /login with the admin page as return path", async () => {
    const { chain } = await new Browser().visit("/admin/payments");
    assert.equal(chain[1], "/login?redirect=%2Fadmin%2Fpayments");
  });

  it("non-staff accounts never see the console", async () => {
    const sponsor = new Browser();
    await sponsor.login("sponsor@example.com", "correct-horse");
    const { chain, html } = await sponsor.visit("/admin/dashboard");
    assert.ok(!chain.at(-1).startsWith("/admin"), `ended at ${chain.at(-1)}`);
    assert.doesNotMatch(text(html), /Needs attention/);
  });

  it("/admin opens the dashboard", async () => {
    const { chain, status } = await staff.visit("/admin");
    assert.equal(status, 200);
    assert.equal(chain.at(-1), "/admin/dashboard");
  });

  it("unknown or nested admin paths are 404, not a blank console", async () => {
    assert.equal((await staff.visit("/admin/not-a-section")).status, 404);
    assert.equal((await staff.visit("/admin/payments/extra")).status, 404);
  });
});

describe("every navigation entry", () => {
  for (const slug of NAV) {
    it(`/admin/${slug} renders inside the console with its own data only`, async () => {
      const { status, html } = await staff.visit(`/admin/${slug}`);
      assert.equal(status, 200);
      const body = text(html);
      assert.match(html, /<h1[^>]*>[^<]+<\/h1>/, "has a page heading");
      assert.match(body, /Log out/, "rendered inside the console shell");
      assert.doesNotMatch(body, /could not be loaded/i, "no load failure");
      // Previously every page fetched all 17 admin endpoints.
      assert.ok(new Set(control.reads).size <= 2, `/admin/${slug} read ${[...new Set(control.reads)].join(", ")}`);
    });
  }
});

describe("data loading", () => {
  it("payments reads only the payments ledger", async () => {
    await staff.visit("/admin/payments");
    assert.deepEqual([...new Set(control.reads)], ["/admin/payments"]);
  });

  it("a capped registrations list says so instead of looking complete", async () => {
    fixtures.runnersTotal = 1200;
    try {
      assert.match(text((await staff.visit("/admin/registrations")).html), /Showing the latest 2 of 1200 registrations/);
    } finally {
      delete fixtures.runnersTotal;
    }
    assert.doesNotMatch(text((await staff.visit("/admin/registrations")).html), /Showing the latest/);
  });

  it("a failed load is reported instead of showing an empty list", async () => {
    control.failing.add("/admin/payments");
    const { status, html } = await staff.visit("/admin/payments");
    assert.equal(status, 200);
    assert.match(text(html), /Could not load payments/);
  });
});

describe("cleaned-up sections", () => {
  it("approvals is part of the console and lists team quota appeals", async () => {
    const body = text((await staff.visit("/admin/approvals")).html);
    assert.match(body, /Patna Striders Club/, "team appeal visible (was unreachable from the console)");
    assert.match(body, /Bihar Steel Ltd/);
    assert.match(body, /Log out/);
  });

  it("schools shows school applications and school appeals, without an empty duplicate block", async () => {
    const body = text((await staff.visit("/admin/schools")).html);
    assert.match(body, /Nalanda Public School/);
    assert.doesNotMatch(body, /No applications found in database/);
    assert.doesNotMatch(body, /Patna Striders Club/, "team appeals do not leak into schools");
  });

  it("hotels and tourism are different lists", async () => {
    const hotels = text((await staff.visit("/admin/hotels")).html);
    const tourism = text((await staff.visit("/admin/tourism")).html);
    assert.match(hotels, /Rajgir Residency/);
    assert.doesNotMatch(hotels, /Gaya Cabs/);
    assert.match(tourism, /Gaya Cabs/);
    assert.doesNotMatch(tourism, /Rajgir Residency/);
  });

  it("live race shows incidents and volunteers shows volunteers (no longer the same page)", async () => {
    const live = text((await staff.visit("/admin/live-race")).html);
    const vols = text((await staff.visit("/admin/volunteers")).html);
    assert.match(live, /Runner collapsed/);
    assert.doesNotMatch(live, /Vikas Helper.*Water Stations/);
    assert.match(vols, /Vikas Helper/);
    assert.doesNotMatch(vols, /Runner collapsed/);
  });

  it("today's registrations lists only today's runners; check-ins starts on pending kits", async () => {
    const todays = text((await staff.visit("/admin/todays-registrations")).html);
    assert.match(todays, /Meera Runner/);
    assert.doesNotMatch(todays, /Arjun Runner/);
    const checkins = text((await staff.visit("/admin/check-ins")).html);
    assert.match(checkins, /Meera Runner/);
    assert.doesNotMatch(checkins, /Arjun Runner/, "collected kit hidden by the default 'Kit pending' filter");
  });

  it("users cannot suspend themselves", async () => {
    const html = (await staff.visit("/admin/users")).html;
    const ownRow = html.match(/<tr[^>]*>(?:(?!<\/tr>)[\s\S])*\(you\)(?:(?!<\/tr>)[\s\S])*<\/tr>/);
    assert.ok(ownRow, "own row marked (you)");
    assert.doesNotMatch(ownRow[0], />Suspend</);
  });

  it("pages that are records only say so", async () => {
    assert.match(text((await staff.visit("/admin/notifications")).html), /nothing is delivered/);
    assert.match(text((await staff.visit("/admin/permissions")).html), /not enforced yet/);
  });
});
