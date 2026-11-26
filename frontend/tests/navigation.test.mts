import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { FOOTER_GROUPS, PUBLIC_NAV, findPublicNode, flattenPublic } from "@/lib/navigation/publicNav";
import { ADMIN_QUICK_ACTIONS, ALL_ROLE_KEYS, QUICK_ACTIONS, ROLE_KEY, findRoleNavItem, roleNavItems } from "@/lib/navigation/roleNav";
import { ADMIN_NAV } from "@/lib/navigation/adminNav";
import { AUDIENCES } from "@/lib/navigation/audiences";
import { JOURNEYS, allJourneySteps } from "@/lib/navigation/journeys";
import { journeyProgress, audienceForRole } from "@/lib/navigation/journeyProgress";
import { MEGA_MENUS, UTILITY_LINKS } from "@/lib/navigation/megaMenu";
import { POPULAR_SEARCHES, buildSearchIndex, searchEntries } from "@/lib/navigation/search";
import { NAV_ICONS } from "@/lib/navigation/icons";
import { hrefOf, needsPlaceholder } from "@/lib/navigation/types";

// ---- discover the routes that real page files provide (route groups removed, [param] = wildcard) ----
const APP = fileURLToPath(new URL("../src/app/", import.meta.url));

function pageRoutes(dir: string, segments: string[] = []): string[][] {
  const out: string[][] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const isGroup = name.startsWith("(") && name.endsWith(")");
      out.push(...pageRoutes(full, isGroup ? segments : [...segments, name]));
    } else if (name === "page.tsx") {
      out.push(segments);
    }
  }
  return out;
}
const ROUTES = pageRoutes(APP);
const hasCatchAll = (route: string[]) => route.some((s) => s.startsWith("[..."));

/** A page file that serves exactly this path (catch-all placeholders excluded). */
function staticMatch(path: string): boolean {
  const parts = path.split("/").filter(Boolean);
  return ROUTES.some((route) => !hasCatchAll(route) && route.length === parts.length && route.every((seg, i) => seg.startsWith("[") || seg === parts[i]));
}

/** Any page file or catch-all that could answer the path (used for the placeholder routes themselves). */
function anyMatch(path: string): boolean {
  const parts = path.split("/").filter(Boolean);
  return ROUTES.some((route) => {
    for (let i = 0; i < route.length; i++) {
      const seg = route[i];
      if (seg.startsWith("[...")) return parts.length > i;
      if (parts[i] === undefined) return false;
      if (!(seg.startsWith("[") || seg === parts[i])) return false;
    }
    return route.length === parts.length;
  });
}

const baseOf = (href: string) => href.split("#")[0].split("?")[0] || "/";

function publicOk(href: string): boolean {
  const base = baseOf(href);
  if (staticMatch(base)) return true;
  const node = findPublicNode(base);
  return Boolean(node && needsPlaceholder(node) && anyMatch(base));
}

function dashboardOk(href: string): boolean {
  const base = baseOf(href);
  if (staticMatch(base)) return true;
  if (ADMIN_NAV.some((i) => i.href === base && !i.existing)) return anyMatch(base);
  return ALL_ROLE_KEYS.some((key) => Boolean(findRoleNavItem(key, base)) && anyMatch(base));
}

function routable(href: string): boolean {
  const base = baseOf(href);
  return base.startsWith("/dashboard") || base.startsWith("/admin") ? dashboardOk(base) : publicOk(base);
}

const dupes = (items: string[]) => items.filter((v, i) => items.indexOf(v) !== i);

describe("public navigation registry", () => {
  const nodes = flattenPublic();

  it("has unique paths and every path starts with /", () => {
    assert.deepEqual(dupes(nodes.map((n) => n.path)), []);
    for (const n of nodes) assert.ok(n.path.startsWith("/"), n.path);
  });

  it("covers every PRD section 3 entry", () => {
    for (const p of ["/", "/about", "/race-categories", "/register", "/training", "/community", "/tourism", "/expo", "/sponsors", "/volunteer", "/media", "/results", "/blog", "/support", "/login"]) {
      assert.ok(findPublicNode(p), `missing ${p}`);
    }
  });

  it("every entry resolves to a real page or a generated placeholder", () => {
    for (const n of PUBLIC_NAV.length ? nodes : []) {
      const target = hrefOf(n);
      if (needsPlaceholder(n)) assert.ok(anyMatch(n.path), `placeholder route missing for ${n.path}`);
      else assert.ok(publicOk(target) || staticMatch(baseOf(target)), `${n.path} points at ${target} but no page file serves it`);
    }
  });

  it("uses known icons", () => {
    for (const n of nodes) if (n.icon) assert.ok(n.icon in NAV_ICONS, `${n.path}: unknown icon ${n.icon}`);
  });

  it("footer links all resolve", () => {
    assert.equal(FOOTER_GROUPS.length, 5);
    for (const g of FOOTER_GROUPS) for (const l of g.links) assert.ok(routable(l.href), `footer: ${l.title} -> ${l.href} does not resolve`);
  });

  it("utility links resolve", () => {
    for (const l of UTILITY_LINKS) assert.ok(routable(l.href), `${l.title} -> ${l.href}`);
  });
});

describe("mega menus", () => {
  it("cover the journey stages in order", () => {
    assert.deepEqual(MEGA_MENUS.map((m) => m.id), ["race", "participate", "train", "trip", "experience", "partners", "results"]);
  });

  for (const menu of MEGA_MENUS) {
    it(`${menu.label}: links resolve, icons exist, featured card resolves`, () => {
      assert.ok(menu.icon in NAV_ICONS);
      assert.ok(menu.audiences || menu.columns.length > 0, "needs columns or the audience grid");
      for (const col of menu.columns) {
        for (const l of col.links) {
          assert.ok(l.icon in NAV_ICONS, `${l.title}: unknown icon ${l.icon}`);
          assert.ok(routable(l.href), `${menu.label} > ${l.title} -> ${l.href} does not resolve`);
        }
      }
      assert.ok(routable(menu.featured.href), `featured ${menu.featured.href}`);
    });
  }
});

describe("audiences and journeys", () => {
  it("has a journey for every audience", () => {
    for (const a of AUDIENCES) {
      assert.ok(JOURNEYS[a.id], `no journey for ${a.id}`);
      assert.equal(JOURNEYS[a.id].audience, a.id);
      assert.ok(JOURNEYS[a.id].steps.length >= 5, `${a.id} journey is too short`);
    }
    assert.deepEqual(dupes(AUDIENCES.map((a) => a.id)), []);
  });

  it("every journey step and audience link resolves", () => {
    for (const { audience, step } of allJourneySteps()) {
      assert.ok(step.icon in NAV_ICONS, `${audience}: unknown icon ${step.icon}`);
      assert.ok(routable(step.href), `${audience} > ${step.title} -> ${step.href} does not resolve`);
    }
    for (const a of AUDIENCES) {
      assert.ok(a.icon in NAV_ICONS);
      assert.ok(routable(a.startHref), `${a.id} start ${a.startHref}`);
      for (const l of a.links) assert.ok(routable(l.href), `${a.id} link ${l.title} -> ${l.href}`);
      assert.ok(findPublicNode(`/how-it-works/${a.id}`), `/how-it-works/${a.id} missing from the registry`);
    }
  });

  it("every self-signup role maps to an audience and a journey", () => {
    for (const role of Object.keys(ROLE_KEY)) {
      const aud = audienceForRole(role);
      assert.ok(aud && JOURNEYS[aud], role);
    }
  });

  it("journey progress follows the account state", () => {
    const j = JOURNEYS.runner;
    assert.equal(journeyProgress(j, null).done, 0);
    assert.equal(journeyProgress(j, { role: null, status: "PENDING_ONBOARDING" }).done, 2);
    const registered = journeyProgress(j, { role: "RUNNER", status: "ACTIVE" });
    assert.equal(registered.done, 6);
    assert.equal(registered.currentIndex, 6);
    const v = journeyProgress(JOURNEYS.volunteer, { role: "VOLUNTEER", status: "PENDING_APPROVAL" });
    assert.equal(v.done, 3);
    assert.equal(JOURNEYS.volunteer.steps[v.currentIndex].title, "Wait for approval");
  });
});

describe("role dashboard navigation", () => {
  it("maps every self-signup role to a dashboard key", () => {
    for (const role of ["RUNNER", "VOLUNTEER", "INFLUENCER", "TEAM_CAPTAIN", "CORPORATE_MANAGER", "SCHOOL_COORDINATOR", "SPONSOR", "VENDOR", "TOURISM_PARTNER"]) {
      assert.ok(ROLE_KEY[role], role);
    }
  });

  for (const key of ALL_ROLE_KEYS) {
    it(`${key}: unique hrefs, valid icons, routable pages and quick actions inside the sidebar`, () => {
      const role = Object.keys(ROLE_KEY).find((r) => ROLE_KEY[r] === key);
      const items = roleNavItems(key, role);
      assert.ok(items.length >= 4, "sidebar should list the role's modules");
      assert.deepEqual(dupes(items.map((i) => i.href)), []);
      for (const i of items) {
        assert.ok(i.icon in NAV_ICONS, `${i.href}: unknown icon ${i.icon}`);
        assert.ok(routable(i.href), `${i.href} has no page file or placeholder route`);
        if (!i.existing) assert.ok(i.href.startsWith(`/dashboard/${key}/`), `${i.href} placeholder must live under /dashboard/${key}/`);
        if (i.existing) assert.ok(staticMatch(baseOf(i.href)), `${i.href} is marked as an existing page but has no page file`);
      }
      const hrefs = new Set(items.map((i) => i.href));
      for (const q of QUICK_ACTIONS[key]) assert.ok(hrefs.has(q.href), `quick action ${q.href} is not in the ${key} sidebar`);
    });
  }
});

describe("admin navigation", () => {
  it("has unique hrefs, valid icons and routable pages", () => {
    assert.deepEqual(dupes(ADMIN_NAV.map((i) => i.href)), []);
    for (const i of ADMIN_NAV) {
      assert.ok(i.icon in NAV_ICONS, i.href);
      assert.ok(routable(i.href), `${i.href} has no page file or placeholder route`);
    }
  });

  it("quick actions point into the admin sidebar", () => {
    const hrefs = new Set(ADMIN_NAV.map((i) => i.href));
    for (const t of ADMIN_QUICK_ACTIONS) assert.ok(hrefs.has(t.href), t.href);
  });

  it("includes every PRD section 22 module", () => {
    const labels = ADMIN_NAV.map((i) => i.label.toLowerCase());
    for (const m of ["dashboard", "cms", "users", "roles", "permissions", "events", "registrations", "payments", "sponsors", "vendors", "hotels", "tourism", "schools", "corporates", "influencers", "volunteers", "media", "notifications", "reports", "audit logs", "settings"]) {
      assert.ok(labels.some((l) => l.includes(m)), `admin nav is missing ${m}`);
    }
  });
});

describe("search", () => {
  const guest = buildSearchIndex(null);
  const runner = buildSearchIndex("RUNNER");

  it("finds pages, journeys and the user's own dashboard screens", () => {
    assert.ok(searchEntries(guest, "hotel").some((e) => e.href.includes("tourism")));
    assert.ok(searchEntries(guest, "volunteer").some((e) => e.href === "/register/volunteer"));
    assert.ok(searchEntries(guest, "how it works runner").some((e) => e.href === "/how-it-works/runner"));
    assert.ok(searchEntries(runner, "bib").some((e) => e.group === "My dashboard" && e.href === "/dashboard/runner/bib"));
    assert.ok(!searchEntries(guest, "bib").some((e) => e.group === "My dashboard"), "guests must not get dashboard results");
  });

  it("ranks exact and prefix title matches first and ignores empty input", () => {
    assert.equal(searchEntries(guest, "results")[0].title.toLowerCase().startsWith("results"), true);
    assert.deepEqual(searchEntries(guest, "   "), []);
    assert.deepEqual(searchEntries(guest, "zzzzqqqq"), []);
  });

  it("popular shortcuts resolve", () => {
    for (const p of POPULAR_SEARCHES) assert.ok(p.icon in NAV_ICONS && routable(p.href), `${p.title} -> ${p.href}`);
  });
});
