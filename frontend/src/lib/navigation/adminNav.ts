import type { NavIconKey } from "./icons";
import type { DashNavItem, NavPhase, NavStatus } from "./types";

/**
 * Admin portal navigation (PRD section 22: dashboard widgets + admin modules).
 * Routes live at /admin/<slug> and are rendered by app/(site)/admin/(console)/[...slug] inside AdminShell.
 * The original single-page admin prototype stays at /admin ("Legacy console") until its tabs are migrated.
 */

type Row = [slug: string, label: string, icon: NavIconKey, description: string, status?: NavStatus, phase?: NavPhase];

const group =
  (name: string) =>
  (rows: Row[]): DashNavItem[] =>
    rows.map(([slug, label, icon, description, status = "planned", phase = "MVP"]) => ({
      href: `/admin/${slug}`,
      label,
      icon,
      description,
      status,
      phase,
      group: name,
    }));

export const ADMIN_NAV: DashNavItem[] = [
  { href: "/admin", label: "Legacy console (prototype)", icon: "layout", group: "Overview", status: "partial", existing: true, description: "Original single-page admin prototype." },
  ...group("Overview")([
    ["dashboard", "Dashboard", "overview", "Today's registrations, revenue, check-ins, sponsors, vendors, volunteers, payments and support at a glance."],
    ["todays-registrations", "Today's Registrations", "registration", "Registrations received today with category and payment status."],
    ["revenue", "Revenue", "banknote", "Revenue by category, add-on and channel."],
    ["check-ins", "Check-ins", "check", "Kit collection and race-day check-ins."],
    ["live-race", "Live Race", "radio", "Live race control: timing, GPS, incidents and alerts."],
    ["analytics", "Analytics", "chart", "Funnels, traffic and campaign analytics."],
  ]),
  ...group("Event Operations")([
    ["events", "Events", "flag", "Edit races, categories, fees, capacity and dates."],
    ["registrations", "Registrations", "registration", "Search, verify, edit and export registrations; allocate bibs."],
    ["volunteers", "Volunteers", "heart", "Approve volunteers, assign stations and track attendance."],
    ["media", "Media", "camera", "Media accreditation, press releases and assets."],
  ]),
  ...group("Partners & Commerce")([
    ["payments", "Payments", "payment", "Transactions, refunds, reconciliation and GST invoices."],
    ["sponsors", "Sponsors", "handshake", "Sponsor proposals, packages and deliverables."],
    ["vendors", "Vendors", "store", "Vendor verification and stall allocation."],
    ["hotels", "Hotels", "hotel", "Hotel partners, rates and availability."],
    ["tourism", "Tourism", "compass", "Packages, transport, guides and listings."],
    ["schools", "Schools", "school", "School accounts and student uploads."],
    ["corporates", "Corporates", "building", "Corporate accounts and employee registrations."],
    ["influencers", "Influencers", "camera", "Creator applications, campaigns and payouts."],
  ]),
  ...group("Content & Communication")([
    ["cms", "CMS", "document", "Pages, blocks, banners, blog, news and media library."],
    ["notifications", "Notifications", "bell", "Email, SMS, WhatsApp and push templates and campaigns."],
    ["support", "Support Tickets", "help", "Support inbox and ticket assignment."],
    ["reports", "Reports", "spreadsheet", "Scheduled and on-demand reports and exports."],
  ]),
  ...group("Platform")([
    ["users", "Users", "users", "All accounts across roles; suspend, approve and change roles."],
    ["roles", "Roles", "shield", "Role definitions for the 13 PRD roles."],
    ["permissions", "Permissions", "key", "Permission matrix per role and module."],
    ["audit-logs", "Audit Logs", "scroll", "Who changed what and when."],
    ["settings", "Settings", "settings", "Event settings, integrations, feature flags and preferences."],
  ]),
];

export function findAdminNavItem(href: string): DashNavItem | undefined {
  return ADMIN_NAV.find((i) => i.href === href);
}
