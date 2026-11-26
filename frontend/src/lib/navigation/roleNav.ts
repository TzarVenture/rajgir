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

function sponsor(): DashNavItem[] {
  const g = group("sponsor", "Sponsorship");
  const g2 = group("sponsor", "Delivery & Reports");
  const g3 = group("sponsor", "Commercial");
  return [
    live(dashboardPathForRole("SPONSOR"), "Overview", "overview", "Overview"),
    ...g([
      ["profile", "Brand Profile", "brand", "Logo, brand guidelines and contacts."],
      ["packages", "Sponsorship Packages", "package", "Choose a package and benefits."],
      ["proposal", "Partnership Enquiries", "document", "Request or review a sponsorship proposal."],
    ]),
    ...g2([
      ["deliverables", "Deliverables", "checklist", "What was agreed and what is delivered."],
      ["campaigns", "Campaigns", "media", "Activations and campaigns during the event."],
      ["coupons", "Coupons", "tag", "Offers for runners."],
      ["leads", "Lead Collection", "users", "Leads collected from your activations."],
      ["visibility", "Event Visibility", "spreadsheet", "Impressions and placement reports."],
      ["analytics", "Campaign Performance", "chart", "Reach and engagement."],
    ]),
    ...g3([
      ["payments", "Payments", "payment", "Pay for your package."],
      ["invoices", "Invoices", "invoice", "GST invoices."],
      ["documents", "Documents", "document", "Contracts and brand assets."],
      ["notifications", "Notifications", "bell", "Updates about your sponsorship."],
    ]),
  ];
}

function vendor(): DashNavItem[] {
  const g = group("vendor", "Stall");
  const g2 = group("vendor", "Business");
  return [
    live(dashboardPathForRole("VENDOR"), "Overview", "overview", "Overview"),
    ...g([
      ["verification", "Verification", "shield", "Licence and document verification."],
      ["stall-booking", "Stall Booking", "store", "Book and manage your stall."],
      ["inventory", "Inventory", "boxes", "Stock for the expo."],
    ]),
    ...g2([
      ["orders", "Orders", "orders", "Orders from runners."],
      ["sales", "Sales", "banknote", "Sales summary."],
      ["invoices", "Invoices", "invoice", "Invoices and settlements."],
      ["analytics", "Analytics", "chart", "Footfall and sales analytics."],
      ["notifications", "Notifications", "bell", "Expo notices and booking updates."],
    ]),
  ];
}

function tourism(): DashNavItem[] {
  const g = group("tourism", "Listings");
  return [
    live(dashboardPathForRole("TOURISM_PARTNER"), "Overview", "overview", "Overview"),
    ...g([
      ["listings", "My Listings", "hotel", "Hotels, transport and guide services you offer."],
      ["inventory", "Rooms & Availability", "calendar", "Rates and availability for race weekend."],
      ["bookings", "Bookings", "bookings", "Bookings made by runners."],
      ["packages", "Packages", "package", "Race-weekend packages."],
      ["payouts", "Payouts & Invoices", "payment", "Settlements from bookings."],
      ["notifications", "Notifications", "bell", "New bookings and partner notices."],
    ]),
  ];
}

function team(): DashNavItem[] {
  const g = group("team", "My Team");
  const g2 = group("team", "Activity");
  return [
    live(dashboardPathForRole("TEAM_CAPTAIN"), "Overview", "overview", "Overview"),
    ...g([
      ["members", "Members", "users", "Add and manage team members."],
      ["invitations", "Invitations", "userplus", "Invite members by email or link."],
      ["bulk-registration", "Team Registrations", "registration", "Register members together."],
      ["invoices", "Invoices", "invoice", "Group invoices."],
    ]),
    ...g2([
      ["events", "Team Activities", "calendar", "Club runs and meetups.", "planned", "Phase 2"],
      ["challenges", "Challenges", "target", "Team challenges.", "planned", "Phase 2"],
      ["leaderboard", "Performance", "trophy", "Team and member rankings."],
      ["announcements", "Announcements", "media", "Messages to all members."],
      ["settings", "Settings", "settings", "Team profile and permissions."],
    ]),
  ];
}

function corporate(): DashNavItem[] {
  const g = group("corporate", "Organisation");
  const g2 = group("corporate", "Participation");
  const g3 = group("corporate", "Reports & Billing");
  return [
    live(dashboardPathForRole("CORPORATE_MANAGER"), "Overview", "overview", "Overview"),
    ...g([
      ["profile", "Organization Profile", "building", "Company, GSTIN and contacts."],
      ["settings", "Settings", "settings", "Users and permissions."],
    ]),
    ...g2([
      ["employees", "Employee Upload", "download", "Upload employee lists (CSV)."],
      ["bulk-registration", "Employee Registrations", "registration", "Register employees in one go."],
      ["teams", "Corporate Teams", "users", "Departments and teams."],
      ["challenges", "Challenges", "target", "Internal challenges.", "planned", "Phase 2"],
      ["event-participation", "Event Participation", "calendar", "Race-day roster and bib status."],
      ["certificates", "Employee Certificates", "certificate", "Certificates for finishers."],
    ]),
    ...g3([
      ["reports", "Participation Reports", "spreadsheet", "Participation and spend reports."],
      ["csr", "CSR", "heart", "CSR contribution and reporting."],
      ["leaderboard", "Company Leaderboard", "trophy", "Employee and department rankings."],
      ["invoices", "Billing", "invoice", "GST invoices."],
    ]),
  ];
}

function school(): DashNavItem[] {
  const g = group("school", "Institution");
  const g2 = group("school", "Students");
  return [
    live(dashboardPathForRole("SCHOOL_COORDINATOR"), "Overview", "overview", "Overview"),
    ...g([
      ["profile", "Institution Profile", "school", "School details and coordinators."],
      ["faculty", "Faculty & Coordinators", "users", "Teachers allowed to manage students."],
      ["permissions", "Permissions", "key", "Guardian consent and authorised actions."],
    ]),
    ...g2([
      ["students", "Student Registrations", "download", "Upload student lists (CSV)."],
      ["teachers", "Teacher Dashboard", "checklist", "Class-wise roster, consent and payment status."],
      ["teams", "Teams", "users", "House and class teams."],
      ["schedule", "Event Schedules", "calendar", "Reporting times and Kids Run slots."],
      ["certificates", "Certificates", "certificate", "Student certificates."],
      ["leaderboard", "School Leaderboard", "trophy", "Class and house rankings."],
      ["reports", "Reports", "spreadsheet", "Participation reports."],
    ]),
  ];
}

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

/**
 * Four bottom tabs per role; the fifth tab ("Menu") is added by the bar and opens the full sidebar drawer.
 * Every href must also appear in the role's sidebar items (checked by tests/navigation.test.mts).
 */
export const BOTTOM_TABS: Record<DashRoleKey, Shortcut[]> = {
  runner: [sc("Home", "overview", "/dashboard/runner"), sc("Bib", "bib", "/dashboard/runner/bib"), sc("Results", "splits", "/dashboard/runner/splits"), sc("Alerts", "bell", "/dashboard/runner/notifications")],
  volunteer: [sc("Home", "overview", "/dashboard/volunteer"), sc("Shift", "shift", "/dashboard/volunteer/shift"), sc("Incidents", "incidents", "/dashboard/volunteer/incidents"), sc("Alerts", "bell", "/dashboard/volunteer/notifications")],
  influencer: [sc("Home", "overview", "/dashboard/influencer"), sc("Pass", "pass", "/dashboard/influencer/pass"), sc("Tasks", "deliverables", "/dashboard/influencer/deliverables"), sc("Alerts", "bell", "/dashboard/influencer/notifications")],
  team: [sc("Home", "overview", "/dashboard/group"), sc("Members", "users", "/dashboard/team/members"), sc("Register", "registration", "/dashboard/team/bulk-registration"), sc("Ranks", "trophy", "/dashboard/team/leaderboard")],
  corporate: [sc("Home", "overview", "/dashboard/group"), sc("Employees", "download", "/dashboard/corporate/employees"), sc("Register", "registration", "/dashboard/corporate/bulk-registration"), sc("Reports", "spreadsheet", "/dashboard/corporate/reports")],
  school: [sc("Home", "overview", "/dashboard/group"), sc("Students", "download", "/dashboard/school/students"), sc("Roster", "checklist", "/dashboard/school/teachers"), sc("Reports", "spreadsheet", "/dashboard/school/reports")],
  sponsor: [sc("Home", "overview", "/dashboard/partner"), sc("Packages", "package", "/dashboard/sponsor/packages"), sc("Campaigns", "media", "/dashboard/sponsor/campaigns"), sc("Alerts", "bell", "/dashboard/sponsor/notifications")],
  vendor: [sc("Home", "overview", "/dashboard/partner"), sc("Stall", "store", "/dashboard/vendor/stall-booking"), sc("Orders", "orders", "/dashboard/vendor/orders"), sc("Alerts", "bell", "/dashboard/vendor/notifications")],
  tourism: [sc("Home", "overview", "/dashboard/partner"), sc("Listings", "hotel", "/dashboard/tourism/listings"), sc("Bookings", "bookings", "/dashboard/tourism/bookings"), sc("Alerts", "bell", "/dashboard/tourism/notifications")],
};

/** "Manage" group in the avatar menu: the few things each role does most. */
export const QUICK_ACTIONS: Record<DashRoleKey, Shortcut[]> = {
  runner: [sc("My registration", "registration", "/dashboard/runner/registrations"), sc("Digital bib pass", "bib", "/dashboard/runner/bib"), sc("Race results", "splits", "/dashboard/runner/splits"), sc("Training plan", "training", "/dashboard/runner/training")],
  volunteer: [sc("My application", "registration", "/dashboard/volunteer/application"), sc("Shift control", "shift", "/dashboard/volunteer/shift"), sc("Incident desk", "incidents", "/dashboard/volunteer/incidents")],
  influencer: [sc("My application", "registration", "/dashboard/influencer/application"), sc("Media pass", "pass", "/dashboard/influencer/pass"), sc("Deliverables", "deliverables", "/dashboard/influencer/deliverables")],
  team: [sc("Members", "users", "/dashboard/team/members"), sc("Team registrations", "registration", "/dashboard/team/bulk-registration"), sc("Invoices", "invoice", "/dashboard/team/invoices")],
  corporate: [sc("Upload employees", "download", "/dashboard/corporate/employees"), sc("Bulk registration", "registration", "/dashboard/corporate/bulk-registration"), sc("Reports", "spreadsheet", "/dashboard/corporate/reports")],
  school: [sc("Upload students", "download", "/dashboard/school/students"), sc("Teacher dashboard", "checklist", "/dashboard/school/teachers"), sc("Reports", "spreadsheet", "/dashboard/school/reports")],
  sponsor: [sc("Packages", "package", "/dashboard/sponsor/packages"), sc("Deliverables", "checklist", "/dashboard/sponsor/deliverables"), sc("Invoices", "invoice", "/dashboard/sponsor/invoices")],
  vendor: [sc("Stall booking", "store", "/dashboard/vendor/stall-booking"), sc("Inventory", "boxes", "/dashboard/vendor/inventory"), sc("Sales", "banknote", "/dashboard/vendor/sales")],
  tourism: [sc("My listings", "hotel", "/dashboard/tourism/listings"), sc("Bookings", "bookings", "/dashboard/tourism/bookings"), sc("Payouts", "payment", "/dashboard/tourism/payouts")],
};

export const ADMIN_BOTTOM_TABS: Shortcut[] = [
  sc("Home", "overview", "/admin/dashboard"),
  sc("Registrations", "registration", "/admin/registrations"),
  sc("Live race", "radio", "/admin/live-race"),
  sc("Payments", "payment", "/admin/payments"),
];

export const ADMIN_QUICK_ACTIONS: Shortcut[] = [
  sc("Admin dashboard", "overview", "/admin/dashboard"),
  sc("Registrations", "registration", "/admin/registrations"),
  sc("Volunteers", "heart", "/admin/volunteers"),
  sc("Legacy console", "layout", "/admin"),
];
