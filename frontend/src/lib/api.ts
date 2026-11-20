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
  email: string;
  phone: string | null;
  fullName: string;
  role: ApiRole | null;
  status: "PENDING_ONBOARDING" | "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED";
  emailVerified: boolean;
}

/** The signed-in user's registration, or { registered: false }. */
export type MyRegistration =
  | { registered: false }
  | { registered: true; role: ApiRole; status: string; profile: Record<string, unknown> };

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
  startWave: string | null;
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

function contextHeaders(ctx?: CallContext): Record<string, string> {
  const headers: Record<string, string> = {};
  if (ctx?.token) headers.Authorization = `Bearer ${ctx.token}`;
  if (ctx?.clientIp) headers["x-forwarded-for"] = ctx.clientIp;
  return headers;
}

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
    const errorMsg = err instanceof Error ? err.message : "Network error reaching backend API";
    return { success: false, error: errorMsg };
  }
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; service: string }>("health"),

  // Authentication & identity (all logic lives in NestJS)
  auth: {
    /** Public settings, e.g. whether email verification is currently required. */
    config: () =>
      request<{ requireEmailVerification: boolean }>("auth/config", { cache: "no-store" }),

    signup: (
      payload: { name: string; email: string; mobile: string; password: string },
      ctx?: CallContext
    ) =>
      post<{
        needsVerification: boolean;
        email: string;
        session: ApiSession | null;
        user: ApiUser;
      }>("auth/signup", payload, ctx),

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

    changePassword: (payload: { currentPassword?: string; newPassword: string }, ctx: CallContext) =>
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
  },

  runners: {
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
    register: (payload: unknown, ctx: CallContext) =>
      post<{ success: boolean; id: string; fullName: string; status: string }>("influencers/register", payload, ctx),
  },
};
