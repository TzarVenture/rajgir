"use server";

import { api, type CallContext } from "@/lib/api";
import { authContext, clearPendingRegistration, getPendingRegistration, saveSession } from "@/lib/auth/session";

/**
 * Group and partner registrations. Thin calls to the NestJS API: the backend identifies the user from the
 * session, enforces one registration per account, and saves the profile and role together.
 */
export interface RegisterResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

async function submit<T>(
  type: "team" | "corporate" | "school" | "sponsor" | "vendor" | "tourism",
  payload: unknown,
  call: (ctx: CallContext) => Promise<{ success: boolean; data?: T; error?: string }>
): Promise<RegisterResult<T>> {
  const pending = await getPendingRegistration();
  const ctx = await authContext();

  if (pending) {
    const res = await api.registrations.registerGroupWithAccount(type, {
      account: {
        firstName: pending.firstName,
        lastName: pending.lastName,
        email: pending.email,
        mobile: pending.mobile,
        password: pending.password,
      },
      registration: payload,
    });
    if (!res.success) {
      return { success: false, error: res.error ?? "We could not submit your registration. Please try again." };
    }
    await clearPendingRegistration();
    if (res.data?.session) {
      await saveSession(res.data.session);
    }
    return { success: true, data: res.data as T };
  }

  if (!ctx) return { success: false, error: "Please sign in to complete your registration." };

  const res = await call(ctx);
  if (!res.success) {
    return { success: false, error: res.error ?? "We could not submit your registration. Please try again." };
  }
  return { success: true, data: res.data };
}

export async function submitTeamRegistration(payload: {
  teamName: string;
  clubAffiliation?: string;
  city: string;
  estimatedMembers: number;
  notes?: string;
}) {
  return submit("team", payload, (ctx) => api.registrations.team(payload, ctx));
}

export async function submitCorporateRegistration(payload: {
  companyName: string;
  gstin?: string;
  officialEmailDomain: string;
  designation: string;
  estimatedPasses: number;
  csrFocus?: string;
  billingAddress?: string;
}) {
  return submit("corporate", payload, (ctx) => api.registrations.corporate(payload, ctx));
}

export async function submitSchoolRegistration(payload: {
  schoolName: string;
  boardAffiliation: string;
  city: string;
  teacherInCharge: string;
  teacherDesignation: string;
  estimatedStudents: number;
  parentalConsentAgreed: boolean;
}) {
  return submit("school", payload, (ctx) => api.registrations.school(payload, ctx));
}

export async function submitSponsorRegistration(payload: {
  brandName: string;
  industry: string;
  tierInterest: string;
  budgetBand: string;
  brandWebsite?: string;
  proposalDeliverables?: string;
}) {
  return submit("sponsor", payload, (ctx) => api.registrations.sponsor(payload, ctx));
}

export async function submitVendorRegistration(payload: {
  businessName: string;
  stallCategory: string;
  stallSize: string;
  fssaiNumber?: string;
  electricPowerRequired: boolean;
}) {
  return submit("vendor", payload, (ctx) => api.registrations.vendor(payload, ctx));
}

export async function submitTourismRegistration(payload: {
  businessName: string;
  serviceType: string;
  location: string;
  distanceFromStartLine?: string;
  inventoryCapacity: string;
  discountOffering?: string;
}) {
  return submit("tourism", payload, (ctx) => api.registrations.tourism(payload, ctx));
}
