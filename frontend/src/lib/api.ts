/**
 * Rajgir Marathon - Frontend API Client for NestJS Backend Service
 */

/**
 * Server-side calls prefer API_URL (internal address, e.g. http://backend:4000/api/v1).
 * Falls back to NEXT_PUBLIC_API_URL, then localhost.
 */
const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "http://localhost:4000/api/v1" : "http://127.0.0.1:4000/api/v1");

export interface ApiClientResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  /** Machine-readable code from the backend, e.g. EMAIL_NOT_VERIFIED. */
  code?: string;
  statusCode?: number;
}

export type ApiRole =
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

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  /** Derived by the API from firstName + lastName (not stored). */
  fullName: string;
  email: string;
  phone: string | null;
  role: ApiRole | null;
  status: "PENDING_ONBOARDING" | "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
  emailVerified: boolean;
}

/** The signed-in user's registration, or { registered: false }. */
export type MyRegistration =
  | { registered: false }
  | {
      registered: true;
      role: ApiRole;
      status: string;
      /** Role-specific data, with the account identity (name, email, mobile) merged in by the API. */
      profile: Record<string, unknown>;
      /** Identity, stored only on the user account. */
      user?: { firstName: string; lastName: string; fullName: string; email: string; phone: string | null };
    };

export interface ApiSplit {
  label: string;
  distanceKm: number;
  /** Cumulative chip time. */
  elapsedSeconds: number;
}

export interface ApiRaceResult {
  status: "FINISHED" | "DNF" | "DNS" | "DSQ";
  gunTimeSeconds: number | null;
  netTimeSeconds: number | null;
  overallRank: number | null;
  genderRank: number | null;
  categoryRank: number | null;
  ageCategory: string | null;
  splits: ApiSplit[];
  publishedAt: string;
}

/** The signed-in runner's full registration (GET runners/me). */
export interface ApiRunnerRegistration {
  id: string;
  registrationNumber: string;
  distance: string;
  raceTitle: string;
  baseFee: number;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ageOnRaceDay: number;
  gender: string;
  bibName: string;
  bloodGroup: string;
  tshirtSize: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  medicalNotes: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string | null;
  runningClub: string | null;
  selectedAddons: { id: string; title: string; price: number }[] | null;
  grossAmount: number;
  discountAmount: number | null;
  netAmount: number;
  couponCode: string | null;
  paymentStatus: string | null;
  qrCodeToken: string | null;
  waiverAgreed: boolean;
  createdAt: string;
  updatedAt: string;
  estimatedFinishTime: string | null;
  bibNumber: string | null;
  kitCollectedAt: string | null;
  kitCollectedBy: string | null;
  medicalUpdatedAt: string | null;
  result: ApiRaceResult | null;
}

export interface ApiVolunteer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  tShirtSize: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  availability: string[] | null;
  rolePreference: string;
  languagesSpoken: string | null;
  dietaryRestrictions: string | null;
  medicalCertification: boolean | null;
  status: string | null;
  submittedAt: string;
  assignedRole: string | null;
  assignedStation: string | null;
  assignedSector: string | null;
  supervisorName: string | null;
  supervisorPhone: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  dutyStatus: "OFF_DUTY" | "ON_DUTY" | "ON_BREAK";
  dutyStatusAt: string | null;
  checklist: Record<string, string> | null;
}

export interface ApiAttendance {
  id: string;
  checkInAt: string;
  checkOutAt: string | null;
  station: string | null;
}

export interface ApiIncident {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  isSos: boolean;
  location: string;
  runnerBib: string | null;
  description: string;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  createdAt: string;
  volunteerId: string | null;
}

export interface ApiVolunteerDashboard {
  volunteer: ApiVolunteer;
  attendance: ApiAttendance[];
  incidents: ApiIncident[];
  checkInOpen: boolean;
}

export interface ApiSession {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
}

/** Options for calls made on behalf of a signed-in user / visitor. */
export interface CallContext {
  /** Session access token, sent as Authorization: Bearer. */
  token?: string;
  /** Real visitor IP so the backend can rate-limit per person, not per Next.js server. */
  clientIp?: string;
}

/**
 * Shared secret proving to the API that a call comes from this Next.js server, so it may vouch for
 * the visitor's IP (rate limits per visitor). Server-only: never NEXT_PUBLIC_, never in the browser.
 */
function internalSecret(): string | undefined {
  return typeof window === "undefined" ? process.env.INTERNAL_API_SECRET || undefined : undefined;
}

function contextHeaders(ctx?: CallContext): Record<string, string> {
  const headers: Record<string, string> = {};
  if (ctx?.token) headers.Authorization = `Bearer ${ctx.token}`;
  if (ctx?.clientIp) {
    headers["x-forwarded-for"] = ctx.clientIp;
    const secret = internalSecret();
    if (secret) {
      headers["x-internal-secret"] = secret;
      headers["x-client-ip"] = ctx.clientIp;
    }
  }
  return headers;
}

/** No API call may hang a page render or a server action indefinitely. */
const REQUEST_TIMEOUT_MS = 15_000;

/** statusCode is undefined when the API could not be reached at all (network error / timeout). */
export const NETWORK_ERROR_MESSAGE = "We could not reach the server. Please try again in a moment.";

function post<T>(endpoint: string, body: unknown, ctx?: CallContext) {
  return send<T>("POST", endpoint, body, ctx);
}

function send<T>(method: "POST" | "PATCH" | "PUT", endpoint: string, body: unknown, ctx?: CallContext) {
  return request<T>(endpoint, {
    method,
    headers: contextHeaders(ctx),
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
}

function get<T>(endpoint: string, ctx: CallContext) {
  return request<T>(endpoint, { headers: contextHeaders(ctx), cache: "no-store" });
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiClientResponse<T>> {
  try {
    const url = `${BACKEND_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const message =
        (Array.isArray(body?.message) ? body?.message.join(", ") : body?.message) ||
        body?.error ||
        `Request failed with status ${res.status}`;
      return {
        success: false,
        error: message,
        code: typeof body?.code === "string" ? body.code : undefined,
        statusCode: res.status,
      };
    }

    return { success: true, data: body as T, statusCode: res.status };
  } catch (err: unknown) {
    console.error(`API ${endpoint} unreachable:`, err instanceof Error ? err.message : err);
    return { success: false, error: NETWORK_ERROR_MESSAGE, code: "NETWORK_ERROR" };
  }
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; service: string }>("health"),

  // Authentication & identity (all logic lives in NestJS)
  auth: {
    /** Public settings, e.g. whether email verification is currently required. */
    config: (ctx?: CallContext) =>
      request<{ requireEmailVerification: boolean }>("auth/config", { headers: contextHeaders(ctx), cache: "no-store" }),

    checkAvailability: (payload: { email: string; mobile: string }) =>
      post<{ available: boolean }>("auth/check-availability", payload),

    signup: (
      payload: { firstName: string; lastName: string; email: string; mobile: string; password: string },
      ctx?: CallContext
    ) =>
      post<{
        needsVerification: boolean;
        email: string;
        session: ApiSession | null;
        user: ApiUser;
      }>("auth/signup", payload, ctx),

    adminSetup: (
      payload: {
        firstName: string;
        lastName: string;
        email: string;
        mobile: string;
        password: string;
        setupKey: string;
      },
      ctx?: CallContext
    ) =>
      post<{
        needsVerification: boolean;
        email: string;
        session: ApiSession | null;
        user: ApiUser;
      }>("auth/admin-setup", payload, ctx),

    login: (payload: { identifier: string; password: string }, ctx?: CallContext) =>
      post<{ session: ApiSession; user: ApiUser }>("auth/login", payload, ctx),

    refresh: (refreshToken: string, ctx?: CallContext) =>
      post<{ session: ApiSession }>("auth/refresh", { refreshToken }, ctx),

    logout: (ctx: CallContext) => post<{ success: boolean }>("auth/logout", {}, ctx),

    resendVerification: (email: string, ctx?: CallContext) =>
      post<{ success: boolean }>("auth/resend-verification", { email }, ctx),

    verifyEmail: (tokenHash: string, type: "signup" | "email", ctx?: CallContext) =>
      post<{ session: ApiSession; user: ApiUser }>("auth/verify-email", { tokenHash, type }, ctx),

    forgotPassword: (email: string, ctx?: CallContext) =>
      post<{ success: boolean }>("auth/forgot-password", { email }, ctx),

    resetPassword: (payload: { tokenHash: string; password: string }, ctx?: CallContext) =>
      post<{ success: boolean }>("auth/reset-password", payload, ctx),

    changePassword: (payload: { currentPassword: string; newPassword: string }, ctx: CallContext) =>
      post<{ success: boolean }>("auth/change-password", payload, ctx),

    deleteAccount: (ctx: CallContext) =>
      request<{ success: boolean }>("auth/account", {
        method: "DELETE",
        headers: contextHeaders(ctx),
        cache: "no-store",
      }),

    me: (ctx: CallContext) =>
      request<ApiUser>("auth/me", { headers: contextHeaders(ctx), cache: "no-store" }),
  },

  /** Registrations. Every call needs the signed-in user (token); the backend decides who the user is. */
  registrations: {
    /** The signed-in user's registration, if any. */
    me: (ctx: CallContext) =>
      request<MyRegistration>("registrations/me", { headers: contextHeaders(ctx), cache: "no-store" }),

    /** Withdraw a registration that is still pending review. */
    withdraw: (ctx: CallContext) =>
      request<{ success: boolean }>("registrations/me", {
        method: "DELETE",
        headers: contextHeaders(ctx),
        cache: "no-store",
      }),

    team: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; profile: unknown; teamJoinCode: string }>("registrations/team", payload, ctx),
    corporate: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; profile: unknown }>("registrations/corporate", payload, ctx),
    school: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; profile: unknown }>("registrations/school", payload, ctx),
    sponsor: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; profile: unknown }>("registrations/sponsor", payload, ctx),
    vendor: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; profile: unknown }>("registrations/vendor", payload, ctx),
    tourism: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; profile: unknown }>("registrations/tourism", payload, ctx),

    registerGroupWithAccount: (
      type: "team" | "corporate" | "school" | "sponsor" | "vendor" | "tourism",
      payload: { account: unknown; registration: unknown }
    ) =>
      post<{ success: boolean; profile: unknown; teamJoinCode?: string; session?: ApiSession }>(
        `registrations/${type}/register-with-account`,
        payload
      ),
  },

  runners: {
    registerWithAccount: (payload: { account: unknown; registration: unknown }) =>
      post<{
        success: boolean;
        registrationNumber: string;
        runnerName: string;
        bibName: string;
        distance: string;
        raceTitle: string;
        email: string;
        paymentStatus: string | null;
        qrToken: string | null;
        session?: ApiSession;
      }>("runners/register-with-account", payload),

    register: (payload: unknown, ctx: CallContext) =>
      post<{
        success: boolean;
        registrationNumber: string;
        runnerName: string;
        bibName: string;
        distance: string;
        raceTitle: string;
        email: string;
        paymentStatus: string | null;
        qrToken: string | null;
      }>("runners/register", payload, ctx),

    /** Owner or staff only. */
    get: (registrationNumber: string, ctx: CallContext) =>
      request<Record<string, unknown>>(`runners/${encodeURIComponent(registrationNumber)}`, {
        headers: contextHeaders(ctx),
        cache: "no-store",
      }),

    /** The signed-in runner's registration, bib, kit status and result. */
    me: (ctx: CallContext) => get<ApiRunnerRegistration>("runners/me", ctx),

    updateMedical: (
      payload: {
        emergencyName: string;
        emergencyRelation: string;
        emergencyPhone: string;
        bloodGroup: string;
        medicalNotes?: string;
      },
      ctx: CallContext
    ) => send<ApiRunnerRegistration>("PATCH", "runners/me/medical", payload, ctx),

    updateProfile: (
      payload: {
        firstName: string;
        lastName: string;
        phone: string;
        bibName: string;
        tshirtSize: string;
        city: string;
        state: string;
        pincode: string;
        country?: string;
        runningClub?: string;
      },
      ctx: CallContext
    ) => send<ApiRunnerRegistration>("PATCH", "runners/me/profile", payload, ctx),
  },

  volunteers: {
    registerWithAccount: (payload: { account: unknown; registration: unknown }) =>
      post<{ success: boolean; id: string; fullName: string; status: string; session?: ApiSession }>(
        "volunteers/register-with-account",
        payload
      ),

    register: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; id: string; fullName: string; status: string }>("volunteers/register", payload, ctx),

    me: (ctx: CallContext) => get<ApiVolunteerDashboard>("volunteers/me", ctx),
    checkIn: (geo: { latitude?: number; longitude?: number }, ctx: CallContext) =>
      post<ApiAttendance>("volunteers/me/check-in", geo, ctx),
    checkOut: (ctx: CallContext) => post<ApiAttendance>("volunteers/me/check-out", {}, ctx),
    setStatus: (status: "ON_DUTY" | "ON_BREAK", ctx: CallContext) =>
      send<ApiVolunteer>("PATCH", "volunteers/me/status", { status }, ctx),
    setChecklistItem: (itemId: string, done: boolean, ctx: CallContext) =>
      send<{ checklist: Record<string, string> }>("PATCH", "volunteers/me/checklist", { itemId, done }, ctx),
    incidents: (ctx: CallContext) => get<ApiIncident[]>("volunteers/me/incidents", ctx),
    reportIncident: (
      payload: {
        type: string;
        severity: string;
        isSos?: boolean;
        location?: string;
        runnerBib?: string;
        description: string;
        latitude?: number;
        longitude?: number;
      },
      ctx: CallContext
    ) => post<ApiIncident>("volunteers/me/incidents", payload, ctx),
  },

  influencers: {
    registerWithAccount: (payload: { account: unknown; registration: unknown }) =>
      post<{ success: boolean; id: string; fullName: string; status: string; session?: ApiSession }>(
        "influencers/register-with-account",
        payload
      ),

    register: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; id: string; fullName: string; status: string }>("influencers/register", payload, ctx),
  },

  groups: {
    dashboard: (ctx: CallContext) => get<ApiGroupDashboard>("groups/dashboard", ctx),
    addRunner: (payload: ApiManagedRunnerInput, ctx: CallContext) =>
      post<{ success: boolean; count: number; runners: ApiManagedRunner[] }>("groups/runners", payload, ctx),
    bulkAddRunners: (runners: ApiManagedRunnerInput[], ctx: CallContext) =>
      post<{ success: boolean; count: number; runners: ApiManagedRunner[] }>("groups/runners/bulk", { runners }, ctx),
    submitQuotaAppeal: (payload: { requestedQuota: number; reason: string }, ctx: CallContext) =>
      post<{ success: boolean; appealStatus: string; appealRequestedQuota: number }>("groups/quota-appeal", payload, ctx),
    updateProfile: (payload: Record<string, unknown>, ctx: CallContext) =>
      send<{ success: boolean }>("PATCH", "groups/profile", payload, ctx),
  },

  partners: {
    dashboard: (ctx: CallContext) => get<ApiPartnerDashboard>("partners/dashboard", ctx),
    updateProfile: (payload: Record<string, unknown>, ctx: CallContext) =>
      send<{ success: boolean }>("PATCH", "partners/profile", payload, ctx),
  },

  admin: {
    overview: (ctx: CallContext) =>
      get<ApiAdminOverview>("admin/overview", ctx),
    users: (ctx: CallContext, limit = 100) =>
      get<ApiAdminUser[]>("admin/users?limit=" + limit, ctx),
    setUserStatus: (userId: string, status: "ACTIVE" | "SUSPENDED", ctx: CallContext) =>
      send<{ id: string; status: string }>("PATCH", `admin/users/${userId}/status`, { status }, ctx),
    runners: (ctx: CallContext, limit = 200) =>
      get<{ total: number; count: number; runners: ApiRunnerRegistration[] }>(`runners?limit=${limit}`, ctx),
    allotBib: (registrationNumber: string, payload: { bibNumber: string }, ctx: CallContext) =>
      send<ApiRunnerRegistration>("PATCH", `runners/${encodeURIComponent(registrationNumber)}/bib`, payload, ctx),
    autoAllotBibs: (payload: { distance?: string; startFrom?: number }, ctx: CallContext) =>
      post<{ assignedCount: number; assignments: Array<{ registrationNumber: string; bibNumber: string }> }>(
        "runners/bibs/auto-allot",
        payload,
        ctx
      ),
    bulkAllotBibs: (
      items: Array<{ registrationNumber: string; bibNumber: string }>,
      ctx: CallContext
    ) =>
      post<{
        updatedCount: number;
        skippedCount: number;
        assignments: Array<{ registrationNumber: string; bibNumber: string }>;
        skipped: Array<{ registrationNumber: string; reason: string }>;
      }>("runners/bibs/bulk-allot", { items }, ctx),
    markKitCollected: (registrationNumber: string, collectedBy: string, ctx: CallContext) =>
      post<ApiRunnerRegistration>(`runners/${encodeURIComponent(registrationNumber)}/kit-collected`, { collectedBy }, ctx),
    undoKitCollected: (registrationNumber: string, ctx: CallContext) =>
      request<ApiRunnerRegistration>(`runners/${encodeURIComponent(registrationNumber)}/kit-collected`, {
        method: "DELETE",
        headers: contextHeaders(ctx),
        cache: "no-store",
      }),
    volunteers: (ctx: CallContext, limit = 200) =>
      get<{ total: number; count: number; volunteers: ApiVolunteer[] }>(`volunteers?limit=${limit}`, ctx),
    approveVolunteer: (id: string, ctx: CallContext) =>
      post<ApiVolunteer>(`volunteers/${id}/approve`, {}, ctx),
    assignVolunteer: (
      id: string,
      payload: { assignedRole?: string; assignedStation?: string; assignedSector?: string; supervisorName?: string; supervisorPhone?: string },
      ctx: CallContext
    ) => send<ApiVolunteer>("PATCH", `volunteers/${id}/assignment`, payload, ctx),
    influencers: (ctx: CallContext, limit = 200) =>
      get<{ total: number; count: number; influencers: Array<Record<string, unknown> & { id: string; fullName: string; email: string; primaryPlatform: string; followerCount: string; status: string | null }> }>(`influencers?limit=${limit}`, ctx),
    reviewInfluencer: (id: string, decision: "approve" | "reject", ctx: CallContext) =>
      post(`admin/influencers/${id}/review`, { decision }, ctx),
    incidents: (ctx: CallContext) => get<Array<ApiIncident & { volunteer?: { assignedStation: string | null; user?: { firstName: string; lastName: string; phone: string | null } } }>>("incidents", ctx),
    updateIncident: (id: string, payload: { status: "ACKNOWLEDGED" | "RESOLVED"; resolutionNote?: string }, ctx: CallContext) =>
      send<ApiIncident>("PATCH", `incidents/${id}`, payload, ctx),
    quotaAppeals: (ctx: CallContext) => get<ApiQuotaAppeal[]>("admin/quota-appeals", ctx),
    reviewQuotaAppeal: (
      type: "team" | "corporate" | "school",
      id: string,
      payload: { decision: "approve" | "reject"; approvedQuota?: number },
      ctx: CallContext
    ) => post(`admin/quota-appeals/${type}/${id}/review`, payload, ctx),
    applications: (ctx: CallContext) => get<ApiAdminApplications>("admin/applications", ctx),
    reviewApplication: (
      type: "corporate" | "school" | "sponsor" | "vendor" | "tourism",
      id: string,
      decision: "approve" | "reject",
      ctx: CallContext
    ) => post(`admin/applications/${type}/${id}/review`, { decision }, ctx),
    events: (ctx: CallContext) => get<ApiEventCategoryConfig[]>("admin/events", ctx),
    upsertEvent: (payload: Omit<ApiEventCategoryConfig, "id">, ctx: CallContext) =>
      post<ApiEventCategoryConfig>("admin/events", payload, ctx),
    payments: (ctx: CallContext, limit = 100) => get<ApiPaymentTransaction[]>(`admin/payments?limit=${limit}`, ctx),
    createPayment: (payload: Record<string, unknown>, ctx: CallContext) =>
      post<ApiPaymentTransaction>("admin/payments", payload, ctx),
    updatePaymentStatus: (id: string, status: "CAPTURED" | "PENDING" | "REFUNDED", ctx: CallContext) =>
      send<ApiPaymentTransaction>("PATCH", `admin/payments/${id}/status`, { status }, ctx),
    media: (ctx: CallContext) => get<ApiMediaAsset[]>("admin/media", ctx),
    createMedia: (payload: { title: string; category: string; url: string; caption?: string }, ctx: CallContext) =>
      post<ApiMediaAsset>("admin/media", payload, ctx),
    toggleMedia: (id: string, isPublished: boolean, ctx: CallContext) =>
      send<ApiMediaAsset>("PATCH", `admin/media/${id}`, { isPublished }, ctx),
    cms: (ctx: CallContext) => get<ApiCmsBlock[]>("admin/cms", ctx),
    upsertCms: (payload: { slug: string; title: string; section: string; content: string; isPublished: boolean }, ctx: CallContext) =>
      post<ApiCmsBlock>("admin/cms", payload, ctx),
    notifications: (ctx: CallContext) => get<ApiNotificationCampaign[]>("admin/notifications", ctx),
    createNotification: (payload: { title: string; channel: string; audience: string; message: string; sendNow?: boolean }, ctx: CallContext) =>
      post<ApiNotificationCampaign>("admin/notifications", payload, ctx),
    support: (ctx: CallContext) => get<ApiSupportTicket[]>("admin/support", ctx),
    createSupport: (payload: { requesterName: string; requesterEmail: string; category: string; subject: string; message: string; priority?: string }, ctx: CallContext) =>
      post<ApiSupportTicket>("admin/support", payload, ctx),
    updateSupport: (id: string, payload: { status: string; assignedTo?: string; resolutionNote?: string }, ctx: CallContext) =>
      send<ApiSupportTicket>("PATCH", `admin/support/${id}`, payload, ctx),
    permissions: (ctx: CallContext) => get<ApiAdminPermissionProfile[]>("admin/permissions", ctx),
    updatePermissions: (id: string, payload: Record<string, unknown>, ctx: CallContext) =>
      send<ApiAdminPermissionProfile>("PATCH", `admin/permissions/${id}`, payload, ctx),
    auditLogs: (ctx: CallContext, limit = 100) => get<ApiAuditLog[]>(`admin/audit-logs?limit=${limit}`, ctx),
    settings: (ctx: CallContext) => get<ApiPlatformSetting[]>("admin/settings", ctx),
    upsertSetting: (payload: { key: string; value: string; category?: string; description?: string }, ctx: CallContext) =>
      post<ApiPlatformSetting>("admin/settings", payload, ctx),
  },
};

export interface ApiEventCategoryConfig {
  id: string;
  distance: string;
  title: string;
  fee: number;
  minAge: number;
  startTime: string;
  cutoffMinutes: number;
  capacity: number;
  isTimed: boolean;
  isActive: boolean;
}

export interface ApiPaymentTransaction {
  id: string;
  registrationNumber: string | null;
  payerName: string;
  payerEmail: string;
  distance: string | null;
  amount: number;
  gstAmount: number;
  method: string;
  referenceCode: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface ApiMediaAsset {
  id: string;
  title: string;
  category: string;
  url: string;
  caption: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface ApiCmsBlock {
  id: string;
  slug: string;
  title: string;
  section: string;
  content: string;
  isPublished: boolean;
  updatedByEmail: string | null;
  updatedAt: string;
}

export interface ApiNotificationCampaign {
  id: string;
  title: string;
  channel: string;
  audience: string;
  message: string;
  recipientCount: number;
  status: string;
  createdByEmail: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface ApiSupportTicket {
  id: string;
  ticketNumber: string;
  requesterName: string;
  requesterEmail: string;
  category: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  resolutionNote: string | null;
  createdAt: string;
}

export interface ApiAdminPermissionProfile {
  id: string;
  userId: string;
  designation: string;
  department: string | null;
  isActive: boolean;
  canManageRunners: boolean;
  canAllotBibs: boolean;
  canManageVolunteers: boolean;
  canManageInfluencers: boolean;
  canManageGroups: boolean;
  canManagePartners: boolean;
  canManageIncidents: boolean;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null; role: string | null; status: string };
}

export interface ApiAuditLog {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  createdAt: string;
}

export interface ApiPlatformSetting {
  key: string;
  value: string;
  category: string;
  description: string | null;
  updatedAt: string;
}

export interface ApiAdminOverview {
  totalRunners: number;
  kitsCollectedCount: number;
  totalVolunteers: number;
  totalInfluencers: number;
  totalGroups: number;
  openIncidentsCount: number;
  pendingApprovalsCount: number;
  pendingQuotaAppealsCount: number;
  totalRevenue: number;
  categoryBreakdown: { distance: string; count: number }[];
  tshirtBreakdown: { size: string; count: number }[];
}

export interface ApiAdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  role: ApiRole | null;
  status: "PENDING_ONBOARDING" | "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
  registrationSource: "SELF_REGISTERED" | "SCHOOL_REGISTERED" | "CORPORATE_REGISTERED" | "TEAM_REGISTERED";
  createdAt: string;
}

export interface ApiManagedRunnerInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  categoryDistance: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  tshirtSize: string;
  bibName?: string;
  emergencyName: string;
  emergencyRelation?: string;
  emergencyPhone: string;
  medicalNotes?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface ApiManagedRunner {
  userId: string;
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  registrationSource: "SELF_REGISTERED" | "SCHOOL_REGISTERED" | "CORPORATE_REGISTERED" | "TEAM_REGISTERED";
  registrationNumber: string;
  distance: string;
  raceTitle: string;
  dateOfBirth: string;
  ageOnRaceDay: number;
  gender: string;
  bibName: string;
  bibNumber: string | null;
  bloodGroup: string;
  tshirtSize: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  paymentStatus: string | null;
  qrCodeToken: string | null;
  createdAt: string;
}

export interface ApiGroupDashboard {
  role: "TEAM_CAPTAIN" | "CORPORATE_MANAGER" | "SCHOOL_COORDINATOR";
  identity: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  profile: Record<string, unknown>;
  quota: {
    used: number;
    maxRunnerQuota: number;
    remaining: number;
    appealStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
    appealRequestedQuota: number | null;
    appealReason: string | null;
  };
  runners: ApiManagedRunner[];
}

export interface ApiPartnerDashboard {
  role: "SPONSOR" | "VENDOR" | "TOURISM_PARTNER";
  accountStatus: string;
  identity: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string | null;
  };
  profile: Record<string, unknown>;
}

export interface ApiQuotaAppeal {
  type: "team" | "corporate" | "school";
  id: string;
  organizationName: string;
  contact: { firstName: string; lastName: string; fullName: string; email: string; phone: string | null };
  currentQuota: number;
  requestedQuota: number | null;
  reason: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string | null;
}

export interface ApiAdminApplications {
  corporates: Array<Record<string, unknown> & { id: string; status: string; contact: { fullName: string; email: string; phone: string | null } }>;
  schools: Array<Record<string, unknown> & { id: string; status: string; contact: { fullName: string; email: string; phone: string | null } }>;
  sponsors: Array<Record<string, unknown> & { id: string; status: string; contact: { fullName: string; email: string; phone: string | null } }>;
  vendors: Array<Record<string, unknown> & { id: string; status: string; contact: { fullName: string; email: string; phone: string | null } }>;
  tourism: Array<Record<string, unknown> & { id: string; status: string; contact: { fullName: string; email: string; phone: string | null } }>;
}
