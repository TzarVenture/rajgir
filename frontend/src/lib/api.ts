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
  return request<T>(endpoint, {
    method: "POST",
    headers: contextHeaders(ctx),
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });
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

  // Runners
  registerRunner: (payload: unknown) =>
    request<{
      success: boolean;
      registrationNumber: string;
      runnerName: string;
      bibName: string;
      distance: string;
    }>("runners/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getRunner: (registrationNumber: string) =>
    request<unknown>(`runners/${encodeURIComponent(registrationNumber)}`),

  listRunners: (limit = 50, offset = 0) =>
    request<unknown>(`runners?limit=${limit}&offset=${offset}`),

  // Volunteers
  registerVolunteer: (payload: unknown) =>
    request<{ success: boolean; id: string; fullName: string }>("volunteers/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listVolunteers: (limit = 50, offset = 0) =>
    request<unknown>(`volunteers?limit=${limit}&offset=${offset}`),

  // Influencers
  registerInfluencer: (payload: unknown) =>
    request<{ success: boolean; id: string; fullName: string }>("influencers/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listInfluencers: (limit = 50, offset = 0) =>
    request<unknown>(`influencers?limit=${limit}&offset=${offset}`),

  // Admin Overview
  getAdminOverview: () =>
    request<{
      totalRunners: number;
      totalVolunteers: number;
      totalInfluencers: number;
      totalRevenue: number;
      categoryBreakdown: Array<{ distance: string; count: number }>;
    }>("admin/overview"),

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

    me: (ctx: CallContext) =>
      request<ApiUser>("auth/me", { headers: contextHeaders(ctx), cache: "no-store" }),
  },

  users: {
    setMyRole: (role: ApiRole, ctx: CallContext) => post<ApiUser>("users/me/role", { role }, ctx),
  },

  // Group Registrations
  registerTeam: (payload: any) =>
    request<{ success: boolean; profile: any; teamJoinCode: string }>("registrations/team", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerCorporate: (payload: any) =>
    request<{ success: boolean; profile: any }>("registrations/corporate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerSchool: (payload: any) =>
    request<{ success: boolean; profile: any }>("registrations/school", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Partner Registrations
  registerSponsor: (payload: any) =>
    request<{ success: boolean; profile: any }>("registrations/sponsor", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerVendor: (payload: any) =>
    request<{ success: boolean; profile: any }>("registrations/vendor", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerTourism: (payload: any) =>
    request<{ success: boolean; profile: any }>("registrations/tourism", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

