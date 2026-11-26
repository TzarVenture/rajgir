import type { NavIconKey } from "./icons";

/** live = a real page exists, partial = prototype / static content only, planned = placeholder page. */
export type NavStatus = "live" | "partial" | "planned";
export type NavPhase = "MVP" | "Phase 2" | "Phase 3";

/** Public site navigation node (PRD section 3 and the modules behind it). */
export interface NavNode {
  /** Route this entry lives at, e.g. "/tourism/hotels". */
  path: string;
  title: string;
  description: string;
  status: NavStatus;
  phase?: NavPhase;
  icon?: NavIconKey;
  /** PRD bullet points this module is expected to cover (shown on the placeholder page). */
  features?: string[];
  /** Link target when the feature is served by a page that lives elsewhere (e.g. "/register/runner"). */
  href?: string;
  /** A real page file already exists at `path`; no placeholder route is generated for it. */
  existing?: boolean;
  children?: NavNode[];
}

export type DashRoleKey =
  | "runner"
  | "volunteer"
  | "influencer"
  | "team"
  | "corporate"
  | "school"
  | "sponsor"
  | "vendor"
  | "tourism";

/** One entry in a role dashboard / admin sidebar. */
export interface DashNavItem {
  href: string;
  label: string;
  icon: NavIconKey;
  /** Sidebar section heading. */
  group?: string;
  description?: string;
  status: NavStatus;
  phase?: NavPhase;
  features?: string[];
  /** A real page file already exists at `href`; no placeholder route is generated for it. */
  existing?: boolean;
}

/** What the shared ModulePage placeholder renders. */
export interface ModuleView {
  title: string;
  description: string;
  status: NavStatus;
  phase?: NavPhase;
  icon?: NavIconKey;
  features?: string[];
  links?: { title: string; href: string; description?: string; status: NavStatus }[];
}

export const hrefOf = (n: { href?: string; path: string }): string => n.href ?? n.path;

/** True when the entry needs a generated placeholder page. */
export const needsPlaceholder = (n: NavNode): boolean => !n.href && !n.existing;
