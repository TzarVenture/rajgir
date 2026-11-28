import type { NavIconKey } from "./icons";
import type { DashNavItem, NavPhase, NavStatus } from "./types";

type Row = [slug: string, label: string, icon: NavIconKey, description: string, status?: NavStatus, phase?: NavPhase];

const group =
  (name: string) =>
  (rows: Row[]): DashNavItem[] =>
    rows.map(([slug, label, icon, description, status = "live", phase = "MVP"]) => ({
      href: `/admin/${slug}`,
      label,
      icon,
      description,
      status,
      phase,
      group: name,
    }));

export const ADMIN_NAV: DashNavItem[] = [
  ...group("Overview")([
    ["dashboard", "Dashboard", "overview", "Key figures and everything that needs attention today."],
    ["approvals", "Approvals", "check", "Group and partner applications and 50+ runner quota appeals waiting for a decision."],
    ["todays-registrations", "Today's Registrations", "registration", "Registrations received today with category and payment status."],
    ["revenue", "Revenue", "banknote", "Revenue by category, add-on and channel."],
    ["check-ins", "Check-ins", "check", "Kit collection and race-day check-ins."],
    ["live-race", "Live Race", "radio", "Live race control: timing, incidents and alerts."],
    ["analytics", "Analytics", "chart", "Registration breakdown, sizing and conversion summary."],
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
    ["reports", "Reports", "spreadsheet", "On-demand Excel reports and exports."],
  ]),
  ...group("Platform")([
    ["users", "Users", "users", "All accounts across roles; suspend, approve and review."],
    ["roles", "Roles", "shield", "Role breakdown across the marathon platform."],
    ["permissions", "Permissions", "key", "Permission matrix per admin profile."],
    ["audit-logs", "Audit Logs", "scroll", "Who changed what and when."],
    ["settings", "Settings", "settings", "Event settings, quotas and feature flags."],
  ]),
];

export function findAdminNavItem(href: string): DashNavItem | undefined {
  return ADMIN_NAV.find((i) => i.href === href);
}
