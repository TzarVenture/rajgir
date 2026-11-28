import {
  api,
  type ApiAdminApplications,
  type ApiAdminOverview,
  type ApiAdminPermissionProfile,
  type ApiAdminUser,
  type ApiAuditLog,
  type ApiCmsBlock,
  type ApiEventCategoryConfig,
  type ApiIncident,
  type ApiMediaAsset,
  type ApiNotificationCampaign,
  type ApiPaymentTransaction,
  type ApiPlatformSetting,
  type ApiQuotaAppeal,
  type ApiRunnerRegistration,
  type ApiSupportTicket,
  type ApiVolunteer,
  type CallContext,
} from "@/lib/api";

/**
 * Data for one admin console section. Each section loads only what it shows (previously every
 * admin page fetched all 17 admin endpoints), and a failed load is reported instead of silently
 * rendering as an empty table.
 */
export type AdminInfluencer = Record<string, unknown> & {
  id: string;
  fullName: string;
  email: string;
  primaryPlatform: string;
  followerCount: string;
  status: string | null;
};

export interface AdminSectionData {
  overview: ApiAdminOverview;
  runners: ApiRunnerRegistration[];
  /** Total registrations in the database (the list above is capped at ADMIN_LIST_LIMIT). */
  runnersTotal: number;
  volunteers: ApiVolunteer[];
  influencers: AdminInfluencer[];
  incidents: ApiIncident[];
  appeals: ApiQuotaAppeal[];
  applications: ApiAdminApplications;
  users: ApiAdminUser[];
  events: ApiEventCategoryConfig[];
  payments: ApiPaymentTransaction[];
  media: ApiMediaAsset[];
  cms: ApiCmsBlock[];
  notifications: ApiNotificationCampaign[];
  support: ApiSupportTicket[];
  permissions: ApiAdminPermissionProfile[];
  auditLogs: ApiAuditLog[];
  settings: ApiPlatformSetting[];
}

export type AdminDataKey = keyof AdminSectionData;

export const EMPTY_OVERVIEW: ApiAdminOverview = {
  totalRunners: 0,
  kitsCollectedCount: 0,
  totalVolunteers: 0,
  totalInfluencers: 0,
  totalGroups: 0,
  openIncidentsCount: 0,
  pendingApprovalsCount: 0,
  pendingQuotaAppealsCount: 0,
  totalRevenue: 0,
  categoryBreakdown: [],
  tshirtBreakdown: [],
};

export const EMPTY_APPLICATIONS: ApiAdminApplications = { corporates: [], schools: [], sponsors: [], vendors: [], tourism: [] };

const EMPTY: AdminSectionData = {
  overview: EMPTY_OVERVIEW,
  runners: [],
  runnersTotal: 0,
  volunteers: [],
  influencers: [],
  incidents: [],
  appeals: [],
  applications: EMPTY_APPLICATIONS,
  users: [],
  events: [],
  payments: [],
  media: [],
  cms: [],
  notifications: [],
  support: [],
  permissions: [],
  auditLogs: [],
  settings: [],
};

/** Upper bound for list endpoints the console reads in one request. */
export const ADMIN_LIST_LIMIT = 500;

/** Human label per data key, used in the "could not load" notice. */
const LABELS: Record<AdminDataKey, string> = {
  overview: "summary figures",
  runners: "registrations",
  runnersTotal: "registrations",
  volunteers: "volunteers",
  influencers: "influencers",
  incidents: "incidents",
  appeals: "quota appeals",
  applications: "partner applications",
  users: "users",
  events: "race categories",
  payments: "payments",
  media: "media assets",
  cms: "content blocks",
  notifications: "notification campaigns",
  support: "support tickets",
  permissions: "admin permissions",
  auditLogs: "audit log",
  settings: "settings",
};

/** Which data each console section needs. Keys are the slugs in ADMIN_NAV. */
export const SECTION_DATA: Record<string, AdminDataKey[]> = {
  dashboard: ["overview", "runners"],
  "todays-registrations": ["runners"],
  revenue: ["overview", "runners"],
  "check-ins": ["runners"],
  "live-race": ["incidents"],
  analytics: ["overview"],
  approvals: ["appeals", "applications"],
  events: ["events"],
  registrations: ["runners"],
  volunteers: ["volunteers"],
  media: ["media"],
  payments: ["payments"],
  sponsors: ["applications"],
  vendors: ["applications"],
  hotels: ["applications"],
  tourism: ["applications"],
  schools: ["applications", "appeals"],
  corporates: ["applications", "appeals"],
  influencers: ["influencers"],
  cms: ["cms"],
  notifications: ["notifications"],
  support: ["support"],
  reports: ["overview", "runners"],
  users: ["users"],
  roles: ["users"],
  permissions: ["permissions"],
  "audit-logs": ["auditLogs"],
  settings: ["settings"],
};

/** A loader returns the fields it fills (usually one; registrations also fill their total). */
type Loader = (ctx: CallContext) => Promise<{ ok: boolean; values?: Partial<AdminSectionData> }>;

function wrap<T>(key: AdminDataKey, promise: Promise<{ success: boolean; data?: T }>, pick: (d: T) => unknown = (d) => d) {
  return promise.then((r) =>
    r.success && r.data !== undefined ? { ok: true, values: { [key]: pick(r.data) } as Partial<AdminSectionData> } : { ok: false },
  );
}

const LOADERS: Record<Exclude<AdminDataKey, "runnersTotal">, Loader> = {
  overview: (ctx) => wrap("overview", api.admin.overview(ctx)),
  runners: (ctx) =>
    api.admin.runners(ctx, ADMIN_LIST_LIMIT).then((r) =>
      r.success && r.data ? { ok: true, values: { runners: r.data.runners, runnersTotal: r.data.total } } : { ok: false },
    ),
  volunteers: (ctx) => wrap("volunteers", api.admin.volunteers(ctx, ADMIN_LIST_LIMIT), (d) => d.volunteers),
  influencers: (ctx) => wrap("influencers", api.admin.influencers(ctx, ADMIN_LIST_LIMIT), (d) => d.influencers),
  incidents: (ctx) => wrap("incidents", api.admin.incidents(ctx)),
  appeals: (ctx) => wrap("appeals", api.admin.quotaAppeals(ctx)),
  applications: (ctx) => wrap("applications", api.admin.applications(ctx)),
  users: (ctx) => wrap("users", api.admin.users(ctx, ADMIN_LIST_LIMIT)),
  events: (ctx) => wrap("events", api.admin.events(ctx)),
  payments: (ctx) => wrap("payments", api.admin.payments(ctx, ADMIN_LIST_LIMIT)),
  media: (ctx) => wrap("media", api.admin.media(ctx)),
  cms: (ctx) => wrap("cms", api.admin.cms(ctx)),
  notifications: (ctx) => wrap("notifications", api.admin.notifications(ctx)),
  support: (ctx) => wrap("support", api.admin.support(ctx)),
  permissions: (ctx) => wrap("permissions", api.admin.permissions(ctx)),
  auditLogs: (ctx) => wrap("auditLogs", api.admin.auditLogs(ctx, ADMIN_LIST_LIMIT)),
  settings: (ctx) => wrap("settings", api.admin.settings(ctx)),
};

/** Loads the data a section needs. `failed` lists what could not be loaded, in plain words. */
export async function loadAdminSection(slug: string, ctx: CallContext): Promise<{ data: AdminSectionData; failed: string[] }> {
  const keys = SECTION_DATA[slug] ?? [];
  const results = await Promise.all(keys.map((key) => LOADERS[key as Exclude<AdminDataKey, "runnersTotal">](ctx)));
  let data: AdminSectionData = { ...EMPTY };
  const failed: string[] = [];
  keys.forEach((key, i) => {
    const r = results[i];
    if (r.ok) data = { ...data, ...r.values };
    else failed.push(LABELS[key]);
  });
  return { data, failed };
}
