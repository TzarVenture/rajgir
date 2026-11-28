import { dashboardPathForRole, registerPathForRole } from "@/lib/auth/roles";
import type { NavIconKey } from "./icons";
import type { DashNavItem, DashRoleKey, NavPhase, NavStatus } from "./types";

/**
 * Role dashboard navigation (PRD sections 7 and 12-17, sidebar lists from designn.md section 13).
 * Items with `existing: true` point at real page files; everything else is rendered by the shared placeholder
 * at app/(site)/dashboard/[role]/[...slug]. The same item list feeds the desktop sidebar, the mobile drawer,
 * the mobile bottom tab bar, the avatar menu and search.
 * PRD roles without a dashboard of their own: Guest (public pages only) and Media (public Media module).
 */

/** Maps the backend role to the URL key used under /dashboard/<key>/... */
export const ROLE_KEY: Record<string, DashRoleKey> = {
  RUNNER: "runner",
  VOLUNTEER: "volunteer",
  INFLUENCER: "influencer",
  TEAM_CAPTAIN: "team",
  CORPORATE_MANAGER: "corporate",
  SCHOOL_COORDINATOR: "school",
  SPONSOR: "sponsor",
  VENDOR: "vendor",
  TOURISM_PARTNER: "tourism",
};

type Row = [slug: string, label: string, icon: NavIconKey, description: string, status?: NavStatus, phase?: NavPhase];

const group =
  (role: DashRoleKey, name: string) =>
  (rows: Row[]): DashNavItem[] =>
    rows.map(([slug, label, icon, description, status = "planned", phase = "MVP"]) => ({
      href: `/dashboard/${role}/${slug}`,
      label,
      icon,
      description,
      status,
      phase,
      group: name,
    }));

const live = (href: string, label: string, icon: NavIconKey, groupName: string, status: NavStatus = "live"): DashNavItem => ({
  href,
  label,
  icon,
  group: groupName,
  status,
  existing: true,
});

function runner(): DashNavItem[] {
  const g = (n: string) => group("runner", n);
  return [
    live("/dashboard/runner", "Overview", "overview", "Overview"),
    ...g("My Race")([["registrations", "My Registrations", "registration", "All your registrations and their status."]]),
    live("/dashboard/runner/bib", "Digital Bib Pass", "bib", "My Race"),
    live("/dashboard/runner/splits", "Race Status & Results", "splits", "My Race"),
    ...g("My Race")([
      ["leaderboard", "Leaderboard", "trophy", "Overall, category and friends leaderboards."],
      ["past-events", "Past Events", "history", "Events you have run before."],
      ["photos", "Race Photos", "photos", "Photos found by your bib number."],
    ]),
    live("/dashboard/runner/invoice", "Certificates & Invoice", "invoice", "My Race", "partial"),
    ...g("Training & Health")([["calendar", "Training Calendar", "calendar", "Weekly workouts and race countdown plan."]]),
    live("/dashboard/runner/training", "Training Plan", "training", "Training & Health", "partial"),
    live("/dashboard/runner/medical", "Medical Profile", "medical", "Training & Health"),
    ...g("Training & Health")([["emergency-contacts", "Emergency Contacts", "sos", "People we call in an emergency."]]),
    ...g("Community")([
      ["events", "Events", "calendar", "Community and club events near you.", "planned", "Phase 2"],
      ["teams", "My Teams", "users", "Teams you captain or belong to.", "planned", "Phase 2"],
      ["clubs", "Running Clubs", "community", "Clubs you belong to.", "planned", "Phase 2"],
      ["friends", "Connections", "heart", "People you follow and who follow you.", "planned", "Phase 2"],
      ["community", "Community Feed", "news", "Posts and updates from runners you follow.", "planned", "Phase 2"],
      ["messages", "Messages", "messages", "Direct messages with other runners.", "planned", "Phase 2"],
      ["achievements", "Achievements & Badges", "star", "Milestones and badges earned.", "planned", "Phase 2"],
    ]),
    ...g("Orders & Rewards")([
      ["orders", "Orders", "orders", "Merchandise and add-on orders."],
      ["bookings", "Bookings", "bookings", "Hotel and transport bookings."],
      ["wallet", "Wallet", "wallet", "Credits, refunds and gift cards.", "planned", "Phase 2"],
      ["rewards", "Rewards", "gift", "Loyalty points and rewards.", "planned", "Phase 2"],
      ["wishlist", "Wishlist", "heart", "Saved products and packages.", "planned", "Phase 2"],
    ]),
    ...g("Account")([
      ["notifications", "Notifications", "bell", "Alerts about your race, payments and bookings."],
      ["downloads", "Downloads", "download", "Invoices, receipts, certificates and bib pass."],
      ["settings", "Settings", "settings", "Language, notifications and privacy."],
    ]),
    live("/dashboard/runner/profile", "My Running Profile", "profile", "Account"),
    live("/dashboard/runner/support", "Support Tickets", "help", "Account"),
  ];
}

function volunteer(): DashNavItem[] {
  const g = (n: string) => group("volunteer", n);
  return [
    live("/dashboard/volunteer", "Overview", "overview", "Overview"),
    live("/dashboard/volunteer/application", "My Application", "registration", "Apply & Prepare"),
    ...g("Apply & Prepare")([
      ["opportunities", "Available Opportunities", "search", "Open roles and stations you can apply for."],
      ["training", "Volunteer Training", "training", "Briefings and required modules."],
    ]),
    live("/dashboard/volunteer/sop", "Field SOP Manual", "sop", "Apply & Prepare"),
    ...g("Race-day Duty")([
      ["tasks", "Assigned Duties", "checklist", "Your assigned station and tasks."],
      ["schedule", "Event Schedule", "calendar", "Briefing, shifts and reporting times."],
    ]),
    live("/dashboard/volunteer/shift", "Duty & Shift Control", "shift", "Race-day Duty"),
    live("/dashboard/volunteer/checklist", "Station Checklist", "checklist", "Race-day Duty"),
    ...g("Race-day Duty")([
      ["attendance", "Attendance", "check", "Check-in history and hours served."],
      ["chat", "Live Chat", "chat", "Team chat with your zone lead."],
    ]),
    live("/dashboard/volunteer/incidents", "Incident Desk", "incidents", "Safety"),
    ...g("Safety")([["alerts", "Emergency Alerts", "sos", "Broadcast alerts from race control."]]),
    ...g("Recognition")([
      ["certificates", "Certificates", "certificate", "Volunteer certificate after verified hours."],
      ["ratings", "Ratings & Feedback", "star", "Feedback from zone leads.", "planned", "Phase 2"],
    ]),
    live("/dashboard/volunteer/badge", "Accreditation Badge", "badge", "Account"),
    ...g("Account")([["notifications", "Notifications", "bell", "Announcements and assignment changes."]]),
    live("/dashboard/volunteer/profile", "Profile & Account", "profile", "Account"),
    live("/dashboard/volunteer/support", "Support & Helpdesk", "help", "Account"),
  ];
}

function influencer(): DashNavItem[] {
  const g = (n: string) => group("influencer", n);
  return [
    live("/dashboard/influencer", "Overview", "overview", "Overview"),
    live("/dashboard/influencer/application", "My Application", "registration", "Campaigns"),
    ...g("Campaigns")([
      ["campaigns", "Campaign Requests", "media", "Brand and organizer campaign invitations."],
      ["social-posts", "Social Posts", "link", "Track your published posts."],
    ]),
    live("/dashboard/influencer/deliverables", "Campaign Deliverables", "deliverables", "Campaigns"),
    live("/dashboard/influencer/pass", "Media Accreditation Pass", "pass", "Campaigns"),
    live("/dashboard/influencer/brand-kit", "Brand Kit & Promo Code", "brand", "Assets"),
    ...g("Assets")([["media-library", "Media Library", "photos", "Photos, videos and brand assets to use."]]),
    ...g("Performance")([
      ["referrals", "Referral Links", "link", "Your tracked links and codes."],
      ["analytics", "Analytics", "chart", "Clicks, signups and engagement."],
      ["reports", "Performance Reports", "spreadsheet", "Campaign reports for brands."],
      ["payments", "Payments", "payment", "Earnings and payouts."],
    ]),
    ...g("Account")([["notifications", "Notifications", "bell", "Campaign and payment alerts."]]),
    live("/dashboard/influencer/profile", "Profile & Account", "profile", "Account"),
    live("/dashboard/influencer/support", "PR & Media Helpdesk", "help", "Account"),
  ];
}

/*
 * Team, company, school, sponsor, vendor and tourism have real dashboards (built on main). Their entries below mirror the
 * sidebar in app/(site)/dashboard/layout.tsx so search, the account menu and the journeys only ever link to pages that exist.
 */
const team = (): DashNavItem[] => [
  live(dashboardPathForRole("TEAM_CAPTAIN"), "Overview Hub", "overview", "Overview"),
  live("/dashboard/team/roster", "Squad Roster & Add Runners", "users", "My Team"),
  live("/dashboard/team/profile", "Club Profile & Settings", "profile", "My Team"),
];

const corporate = (): DashNavItem[] => [
  live(dashboardPathForRole("CORPORATE_MANAGER"), "Overview Hub", "overview", "Overview"),
  live("/dashboard/corporate/roster", "Employee Roster & Upload", "users", "Employees"),
  live("/dashboard/corporate/billing", "GST & Billing", "invoice", "Employees"),
  live("/dashboard/corporate/profile", "Company Profile & Settings", "building", "Organisation"),
];

const school = (): DashNavItem[] => [
  live(dashboardPathForRole("SCHOOL_COORDINATOR"), "Overview Hub", "overview", "Overview"),
  live("/dashboard/school/roster", "Student Roster & Upload", "users", "Students"),
  live("/dashboard/school/compliance", "Consent & Compliance", "checklist", "Students"),
  live("/dashboard/school/profile", "School Profile & Settings", "school", "Institution"),
];

const sponsor = (): DashNavItem[] => [
  live(dashboardPathForRole("SPONSOR"), "Overview Hub", "overview", "Overview"),
  live("/dashboard/sponsor/deliverables", "Brand Deliverables & Passes", "brand", "Sponsorship"),
  live("/dashboard/sponsor/profile", "Brand Profile & Settings", "profile", "Sponsorship"),
];

const vendor = (): DashNavItem[] => [
  live(dashboardPathForRole("VENDOR"), "Overview Hub", "overview", "Overview"),
  live("/dashboard/vendor/stall", "Stall & Compliance", "store", "Stall"),
  live("/dashboard/vendor/profile", "Business Profile & Settings", "profile", "Stall"),
];

const tourism = (): DashNavItem[] => [
  live(dashboardPathForRole("TOURISM_PARTNER"), "Overview Hub", "overview", "Overview"),
  live("/dashboard/tourism/offers", "Listing & Runner Offers", "hotel", "Listings"),
  live("/dashboard/tourism/profile", "Partner Profile & Settings", "profile", "Listings"),
];

const BUILDERS: Record<DashRoleKey, () => DashNavItem[]> = { runner, volunteer, influencer, sponsor, vendor, tourism, team, corporate, school };

/** Full sidebar for a role: its modules plus common footer entries. */
export function roleNavItems(roleKey: DashRoleKey, role?: string | null): DashNavItem[] {
  const items = BUILDERS[roleKey]();
  const hasSupport = items.some((i) => i.label.toLowerCase().includes("support") || i.label.toLowerCase().includes("helpdesk"));
  const tail: DashNavItem[] = [];
  if (role && !["RUNNER", "VOLUNTEER", "INFLUENCER"].includes(role)) {
    tail.push({ href: registerPathForRole(role), label: "My registration", icon: "registration", group: "Account", status: "live", existing: true });
  }
  if (!hasSupport) tail.push({ href: "/contact", label: "Contact and help", icon: "help", group: "Account", status: "live", existing: true });
  tail.push({ href: "/", label: "Marathon Home", icon: "home", group: "Account", status: "live", existing: true });
  return [...items, ...tail];
}

export function findRoleNavItem(roleKey: DashRoleKey, href: string): DashNavItem | undefined {
  return BUILDERS[roleKey]().find((i) => i.href === href);
}

export const ALL_ROLE_KEYS = Object.keys(BUILDERS) as DashRoleKey[];

/** A shortcut shown in the mobile bottom tab bar or the avatar menu. */
export interface Shortcut {
  label: string;
  icon: NavIconKey;
  href: string;
}

const sc = (label: string, icon: NavIconKey, href: string): Shortcut => ({ label, icon, href });

/** "Manage" group in the avatar menu: the few things each role does most. Every href also appears in the role's items. */
export const QUICK_ACTIONS: Record<DashRoleKey, Shortcut[]> = {
  runner: [sc("My registration", "registration", "/dashboard/runner/registrations"), sc("Digital bib pass", "bib", "/dashboard/runner/bib"), sc("Race results", "splits", "/dashboard/runner/splits"), sc("Training plan", "training", "/dashboard/runner/training")],
  volunteer: [sc("My application", "registration", "/dashboard/volunteer/application"), sc("Shift control", "shift", "/dashboard/volunteer/shift"), sc("Incident desk", "incidents", "/dashboard/volunteer/incidents")],
  influencer: [sc("My application", "registration", "/dashboard/influencer/application"), sc("Media pass", "pass", "/dashboard/influencer/pass"), sc("Deliverables", "deliverables", "/dashboard/influencer/deliverables")],
  team: [sc("Squad roster", "users", "/dashboard/team/roster"), sc("Club profile", "profile", "/dashboard/team/profile")],
  corporate: [sc("Employee roster", "users", "/dashboard/corporate/roster"), sc("GST & billing", "invoice", "/dashboard/corporate/billing"), sc("Company profile", "building", "/dashboard/corporate/profile")],
  school: [sc("Student roster", "users", "/dashboard/school/roster"), sc("Consent & compliance", "checklist", "/dashboard/school/compliance"), sc("School profile", "school", "/dashboard/school/profile")],
  sponsor: [sc("Brand deliverables", "brand", "/dashboard/sponsor/deliverables"), sc("Brand profile", "profile", "/dashboard/sponsor/profile")],
  vendor: [sc("Stall & compliance", "store", "/dashboard/vendor/stall"), sc("Business profile", "profile", "/dashboard/vendor/profile")],
  tourism: [sc("Listing & offers", "hotel", "/dashboard/tourism/offers"), sc("Partner profile", "profile", "/dashboard/tourism/profile")],
};

export const ADMIN_QUICK_ACTIONS: Shortcut[] = [
  sc("Dashboard", "overview", "/admin/dashboard"),
  sc("Registrations", "registration", "/admin/registrations"),
  sc("Volunteers", "heart", "/admin/volunteers"),
  sc("Payments", "payment", "/admin/payments"),
];
