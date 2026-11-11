export type RoleId =
  | "guest"
  | "runner"
  | "team_captain"
  | "running_club"
  | "corporate"
  | "school"
  | "volunteer"
  | "sponsor"
  | "vendor"
  | "tourism_partner"
  | "influencer"
  | "media"
  | "organizer"
  | "super_admin";

export interface RoleField {
  name: string;
  label: string;
  type?: "text" | "tel" | "url" | "email";
}

export interface RoleWidget {
  label: string;
  value: string;
}

export interface RoleConfig {
  id: RoleId;
  label: string;
  intentLabel: string;
  /** Shown on the sign-up intent screen. Staff and guest roles are never self-selected. */
  selfSignup: boolean;
  /** Business and group accounts wait for an admin to approve them. */
  requiresApproval: boolean;
  /** Part of the launch scope. Other roles get a "coming soon" dashboard. */
  launch: boolean;
  hasDashboard: boolean;
  fields: RoleField[];
  widgets: RoleWidget[];
}

export const ROLES: RoleConfig[] = [
  {
    id: "guest",
    label: "Guest",
    intentLabel: "Browse only",
    selfSignup: false,
    requiresApproval: false,
    launch: true,
    hasDashboard: false,
    fields: [],
    widgets: [],
  },
  {
    id: "runner",
    label: "Runner",
    intentLabel: "I'm running the race",
    selfSignup: true,
    requiresApproval: false,
    launch: true,
    hasDashboard: true,
    fields: [],
    widgets: [
      { label: "Upcoming race", value: "Rajgir Marathon" },
      { label: "Registration", value: "Not registered yet" },
      { label: "Bib", value: "Allocated after payment" },
      { label: "Certificates", value: "None yet" },
    ],
  },
  {
    id: "team_captain",
    label: "Team Captain",
    intentLabel: "I'm forming a team",
    selfSignup: true,
    requiresApproval: false,
    launch: true,
    hasDashboard: true,
    fields: [{ name: "teamName", label: "Team name" }],
    widgets: [
      { label: "Team members", value: "0" },
      { label: "Join requests", value: "0" },
      { label: "Team registrations", value: "None yet" },
    ],
  },
  {
    id: "running_club",
    label: "Running Club",
    intentLabel: "I run a running club",
    selfSignup: true,
    requiresApproval: true,
    launch: false,
    hasDashboard: true,
    fields: [
      { name: "clubName", label: "Club name" },
      { name: "city", label: "City" },
    ],
    widgets: [
      { label: "Club members", value: "0" },
      { label: "Club events", value: "None yet" },
    ],
  },
  {
    id: "corporate",
    label: "Corporate",
    intentLabel: "I'm registering employees",
    selfSignup: true,
    requiresApproval: true,
    launch: false,
    hasDashboard: true,
    fields: [
      { name: "companyName", label: "Company name" },
      { name: "gstNumber", label: "GST number" },
    ],
    widgets: [
      { label: "Employees registered", value: "0" },
      { label: "Bulk payments", value: "None yet" },
    ],
  },
  {
    id: "school",
    label: "School",
    intentLabel: "I'm registering students",
    selfSignup: true,
    requiresApproval: true,
    launch: false,
    hasDashboard: true,
    fields: [
      { name: "schoolName", label: "School name" },
      { name: "city", label: "City" },
    ],
    widgets: [
      { label: "Students registered", value: "0" },
      { label: "Teacher accounts", value: "0" },
    ],
  },
  {
    id: "volunteer",
    label: "Volunteer",
    intentLabel: "I want to volunteer",
    selfSignup: true,
    requiresApproval: true,
    launch: true,
    hasDashboard: true,
    fields: [
      { name: "preferredRole", label: "Preferred volunteer role" },
      { name: "availability", label: "Availability on race day" },
    ],
    widgets: [
      { label: "Assignment", value: "Not assigned yet" },
      { label: "Schedule", value: "Available after assignment" },
      { label: "Attendance", value: "Not checked in" },
    ],
  },
  {
    id: "sponsor",
    label: "Sponsor",
    intentLabel: "I want to sponsor",
    selfSignup: true,
    requiresApproval: true,
    launch: true,
    hasDashboard: true,
    fields: [
      { name: "companyName", label: "Company name" },
      { name: "gstNumber", label: "GST number" },
    ],
    widgets: [
      { label: "Package", value: "Not selected" },
      { label: "Invoices", value: "None yet" },
      { label: "Campaign status", value: "Not started" },
    ],
  },
  {
    id: "vendor",
    label: "Vendor",
    intentLabel: "I want an expo or food stall",
    selfSignup: true,
    requiresApproval: true,
    launch: true,
    hasDashboard: true,
    fields: [
      { name: "businessName", label: "Business name" },
      { name: "stallType", label: "Stall type (expo / food)" },
    ],
    widgets: [
      { label: "Stall booking", value: "Not booked" },
      { label: "Orders", value: "0" },
    ],
  },
  {
    id: "tourism_partner",
    label: "Tourism Partner",
    intentLabel: "I offer hotels or travel",
    selfSignup: true,
    requiresApproval: true,
    launch: false,
    hasDashboard: true,
    fields: [
      { name: "businessName", label: "Business name" },
      { name: "category", label: "Category (hotel / transport / guide)" },
    ],
    widgets: [
      { label: "Listings", value: "0" },
      { label: "Bookings", value: "0" },
    ],
  },
  {
    id: "influencer",
    label: "Influencer",
    intentLabel: "I create content",
    selfSignup: true,
    requiresApproval: true,
    launch: false,
    hasDashboard: true,
    fields: [
      { name: "handle", label: "Main social handle" },
      { name: "profileUrl", label: "Profile link", type: "url" },
    ],
    widgets: [
      { label: "Campaign requests", value: "0" },
      { label: "Referral links", value: "0" },
    ],
  },
  {
    id: "media",
    label: "Media",
    intentLabel: "I'm from the press",
    selfSignup: true,
    requiresApproval: true,
    launch: false,
    hasDashboard: true,
    fields: [
      { name: "outletName", label: "Media outlet" },
      { name: "pressId", label: "Press ID or accreditation number" },
    ],
    widgets: [
      { label: "Press registration", value: "Not submitted" },
      { label: "Media kit", value: "Available after approval" },
    ],
  },
  {
    id: "organizer",
    label: "Organizer",
    intentLabel: "Event operations (staff)",
    selfSignup: false,
    requiresApproval: false,
    launch: true,
    hasDashboard: true,
    fields: [],
    widgets: [
      { label: "Today's registrations", value: "0" },
      { label: "Check-ins", value: "0" },
      { label: "Live race", value: "Not started" },
    ],
  },
  {
    id: "super_admin",
    label: "Super Admin",
    intentLabel: "Platform administration (staff)",
    selfSignup: false,
    requiresApproval: false,
    launch: true,
    hasDashboard: true,
    fields: [],
    widgets: [
      { label: "Users", value: "Mock data" },
      { label: "Roles", value: "14" },
      { label: "Audit logs", value: "Not connected" },
    ],
  },
];

export function getRole(id: string): RoleConfig | undefined {
  return ROLES.find((role) => role.id === id);
}

export function isRoleId(id: string): id is RoleId {
  return ROLES.some((role) => role.id === id);
}

export function selfSignupRoles(): RoleConfig[] {
  return ROLES.filter((role) => role.selfSignup);
}
