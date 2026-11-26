import { AUDIENCES } from "./audiences";
import { JOURNEYS } from "./journeys";
import { MEGA_MENUS } from "./megaMenu";
import { flattenPublic } from "./publicNav";
import { ROLE_KEY, roleNavItems } from "./roleNav";
import { hrefOf } from "./types";
import type { NavIconKey } from "./icons";
import type { NavStatus } from "./types";

/** One searchable destination. Built from the registry, so search always matches the real navigation. */
export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  group: "My dashboard" | "Guides & journeys" | "Pages";
  icon?: NavIconKey;
  status?: NavStatus;
  /** Extra words that should match (audience names, PRD terms). */
  keywords: string;
}

export function buildSearchIndex(role?: string | null): SearchEntry[] {
  const out = new Map<string, SearchEntry>();
  const add = (e: SearchEntry) => {
    const key = `${e.href}|${e.title}`;
    if (!out.has(key)) out.set(key, e);
  };

  const roleKey = role ? ROLE_KEY[role] : undefined;
  if (roleKey) {
    for (const i of roleNavItems(roleKey, role)) {
      if (i.href === "/") continue;
      add({ title: i.label, description: i.description ?? i.group ?? "", href: i.href, group: "My dashboard", icon: i.icon, status: i.status, keywords: `${i.group ?? ""} dashboard` });
    }
  }

  for (const a of AUDIENCES) {
    add({ title: `How it works: ${a.title}`, description: a.tagline, href: `/how-it-works/${a.id}`, group: "Guides & journeys", icon: a.icon, keywords: `journey steps flow ${a.prdRoles.join(" ")}` });
    add({ title: a.startLabel, description: a.tagline, href: a.startHref, group: "Guides & journeys", icon: a.icon, keywords: `register sign up join ${a.title}` });
  }
  for (const j of Object.values(JOURNEYS)) {
    for (const step of j.steps) {
      add({ title: step.title, description: step.description, href: step.href, group: "Guides & journeys", icon: step.icon, status: step.status, keywords: `${j.audience} journey` });
    }
  }

  for (const n of flattenPublic()) {
    add({ title: n.title, description: n.description, href: hrefOf(n), group: "Pages", icon: n.icon, status: n.status, keywords: (n.features ?? []).join(" ") });
  }
  for (const m of MEGA_MENUS) {
    for (const c of m.columns) {
      for (const l of c.links) add({ title: l.title, description: l.description, href: l.href, group: "Pages", icon: l.icon, status: l.status, keywords: `${m.label} ${c.title}` });
    }
  }
  return [...out.values()];
}

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/** Ranks entries: exact/prefix title match > word match in title > description/keywords. Returns at most `limit`. */
export function searchEntries(index: SearchEntry[], query: string, limit = 24): SearchEntry[] {
  const q = norm(query);
  if (!q) return [];
  const words = q.split(" ");
  const scored: { e: SearchEntry; score: number }[] = [];
  for (const e of index) {
    const title = norm(e.title);
    const rest = norm(`${e.description} ${e.keywords}`);
    let score = 0;
    if (title === q) score += 100;
    else if (title.startsWith(q)) score += 60;
    else if (title.includes(q)) score += 40;
    let allWords = true;
    for (const w of words) {
      if (title.includes(w)) score += 12;
      else if (rest.includes(w)) score += 4;
      else allWords = false;
    }
    if (!allWords && score < 40) continue;
    if (e.group === "My dashboard") score += 3;
    if (score > 0) scored.push({ e, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title)).slice(0, limit).map((s) => s.e);
}

/** Shown when the search box is empty. */
export const POPULAR_SEARCHES: { title: string; href: string; icon: NavIconKey }[] = [
  { title: "Register as a runner", href: "/register/runner", icon: "activity" },
  { title: "How it works", href: "/how-it-works", icon: "flow" },
  { title: "Race categories & fees", href: "/#categories", icon: "flag" },
  { title: "Hotels & travel", href: "/tourism", icon: "hotel" },
  { title: "Volunteer", href: "/register/volunteer", icon: "heart" },
  { title: "Training plans", href: "/training", icon: "training" },
  { title: "Results", href: "/results", icon: "trophy" },
  { title: "Support", href: "/contact", icon: "help" },
];
