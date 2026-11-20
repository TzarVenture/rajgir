/**
 * Single source of truth for account types and roles in the UI.
 * Role values match the backend `Role` enum (backend/prisma/schema.prisma).
 * Used by the role picker, redirects, dashboards and the pending page.
 */
export type RoleValue =
  | "RUNNER"
  | "VOLUNTEER"
  | "INFLUENCER"
  | "TEAM_CAPTAIN"
  | "CORPORATE_MANAGER"
  | "SCHOOL_COORDINATOR"
  | "SPONSOR"
  | "VENDOR"
  | "TOURISM_PARTNER"
  | "ORGANIZER"
  | "SUPER_ADMIN";

export type AccountTypeId = "individual" | "group" | "partner";

export interface RoleOption {
  value: RoleValue;
  /** Short name shown on cards and dashboards. */
  title: string;
  /** What the person will do on the platform. */
  description: string;
  /** Icon key resolved in the client component (keeps this file server/client neutral). */
  icon: "runner" | "volunteer" | "influencer" | "team" | "corporate" | "school" | "sponsor" | "vendor" | "tourism";
  /** instant = active right after the registration form; review = organizers approve first. */
  approval: "instant" | "review";
  registerPath: string;
}

export interface AccountType {
  id: AccountTypeId;
  title: string;
  description: string;
  roles: RoleOption[];
}

export const ACCOUNT_TYPES: AccountType[] = [
  {
    id: "individual",
    title: "Individual",
    description: "I'm taking part on my own: running, volunteering or creating content.",
    roles: [
      {
        value: "RUNNER",
        title: "Runner",
        description: "Run the 42.2K, 21.1K, 10K, 5K or 3K and get your bib and QR pass.",
        icon: "runner",
        approval: "instant",
        registerPath: "/register/runner",
      },
      {
        value: "VOLUNTEER",
        title: "Volunteer",
        description: "Join the race-day crew: hydration, marshalling and runner support.",
        icon: "volunteer",
        approval: "review",
        registerPath: "/register/volunteer",
      },
      {
        value: "INFLUENCER",
        title: "Influencer / Creator",
        description: "Fitness creators and vloggers who want to cover and promote the race.",
        icon: "influencer",
        approval: "review",
        registerPath: "/register/influencer",
      },
    ],
  },
  {
    id: "group",
    title: "Group or Organization",
    description: "I'm registering a team, company or school.",
    roles: [
      {
        value: "TEAM_CAPTAIN",
        title: "Team / Running Club",
        description: "Lead a running club or community group and register your members together.",
        icon: "team",
        approval: "instant",
        registerPath: "/register/team",
      },
      {
        value: "CORPORATE_MANAGER",
        title: "Company",
        description: "HR and CSR teams registering employees in bulk with GST invoicing.",
        icon: "corporate",
        approval: "review",
        registerPath: "/register/corporate",
      },
      {
        value: "SCHOOL_COORDINATOR",
        title: "School / College",
        description: "Teachers and directors registering a student contingent.",
        icon: "school",
        approval: "review",
        registerPath: "/register/school",
      },
    ],
  },
  {
    id: "partner",
    title: "Business Partner",
    description: "I'm a brand, exhibitor or local business working with the event.",
    roles: [
      {
        value: "SPONSOR",
        title: "Sponsor",
        description: "Title, hydration, recovery or apparel partnerships with the marathon.",
        icon: "sponsor",
        approval: "review",
        registerPath: "/register/sponsor",
      },
      {
        value: "VENDOR",
        title: "Expo / Food Stall",
        description: "Book a stall to sell running gear, nutrition or local food.",
        icon: "vendor",
        approval: "review",
        registerPath: "/register/vendor",
      },
      {
        value: "TOURISM_PARTNER",
        title: "Hotel & Tourism",
        description: "Hotels, transport and heritage guides serving visiting runners.",
        icon: "tourism",
        approval: "review",
        registerPath: "/register/tourism",
      },
    ],
  },
];

const ALL_OPTIONS: RoleOption[] = ACCOUNT_TYPES.flatMap((type) => type.roles);

const STAFF_LABELS: Record<string, string> = {
  ORGANIZER: "Race Organizer",
  SUPER_ADMIN: "Super Administrator",
};

export function isSelfSignupRole(value: string | null | undefined): value is RoleValue {
  return ALL_OPTIONS.some((option) => option.value === value);
}

export function getRoleOption(value: string | null | undefined): RoleOption | undefined {
  return ALL_OPTIONS.find((option) => option.value === value);
}

export function getAccountTypeForRole(value: string | null | undefined): AccountType | undefined {
  return ACCOUNT_TYPES.find((type) => type.roles.some((role) => role.value === value));
}

export function roleLabel(value: string | null | undefined): string {
  if (!value) return "Participant";
  return (
    getRoleOption(value)?.title ??
    STAFF_LABELS[value] ??
    value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function registerPathForRole(value: string | null | undefined): string {
  return getRoleOption(value)?.registerPath ?? "/onboarding/intent";
}

/** Dashboard area for an active user. */
export function dashboardPathForRole(value: string | null | undefined): string {
  if (value === "RUNNER") return "/dashboard/runner";
  if (value === "VOLUNTEER") return "/dashboard/volunteer";
  if (value === "INFLUENCER") return "/dashboard/influencer";
  switch (getAccountTypeForRole(value)?.id) {
    case "individual":
      return "/dashboard/individual";
    case "group":
      return "/dashboard/group";
    case "partner":
      return "/dashboard/partner";
    default:
      return value === "ORGANIZER" || value === "SUPER_ADMIN" ? "/admin" : "/dashboard/individual";
  }
}

/** "Runner", "Volunteer", ... when a path such as /register/runner is a registration page, else null. */
export function registrationTitleForPath(path: string | null | undefined): string | null {
  if (!path) return null;
  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return ALL_OPTIONS.find((option) => option.registerPath === pathname)?.title ?? null;
}
