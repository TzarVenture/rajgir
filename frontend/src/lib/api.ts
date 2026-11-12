/**
 * Rajgir Marathon - Frontend API Client for NestJS Backend Service
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "http://localhost:4000/api/v1" : "http://127.0.0.1:4000/api/v1");

export interface ApiClientResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
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
      return { success: false, error: message, statusCode: res.status };
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

  // Users & Identity
  syncUser: (payload: { email: string; phone?: string; fullName: string; supabaseAuthId?: string }) =>
    request<any>("users/sync", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  checkUser: (email?: string, phone?: string) => {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (phone) params.append("phone", phone);
    return request<{ exists: boolean; userId?: string; email?: string; phone?: string; fullName?: string; role?: string; status?: string }>(
      `users/check?${params.toString()}`
    );
  },

  setUserRole: (userId: string, role: string) =>
    request<any>(`users/${userId}/role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    }),

  getUser: (userId: string) =>
    request<any>(`users/${encodeURIComponent(userId)}`),

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

