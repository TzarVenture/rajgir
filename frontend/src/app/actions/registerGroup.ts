"use server";

import { api, type CallContext } from "@/lib/api";
import { authContext } from "@/lib/auth/session";

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
  call: (ctx: CallContext) => Promise<{ success: boolean; data?: T; error?: string }>
): Promise<RegisterResult<T>> {
  const ctx = await authContext();
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
  return submit((ctx) => api.registrations.team(payload, ctx));
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
  return submit((ctx) => api.registrations.corporate(payload, ctx));
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
  return submit((ctx) => api.registrations.school(payload, ctx));
}

export async function submitSponsorRegistration(payload: {
  brandName: string;
  industry: string;
  tierInterest: string;
  budgetBand: string;
  brandWebsite?: string;
  proposalDeliverables?: string;
}) {
  return submit((ctx) => api.registrations.sponsor(payload, ctx));
}

export async function submitVendorRegistration(payload: {
  businessName: string;
  stallCategory: string;
  stallSize: string;
  fssaiNumber?: string;
  electricPowerRequired: boolean;
}) {
  return submit((ctx) => api.registrations.vendor(payload, ctx));
}

export async function submitTourismRegistration(payload: {
  businessName: string;
  serviceType: string;
  location: string;
  distanceFromStartLine?: string;
  inventoryCapacity: string;
  discountOffering?: string;
}) {
  return submit((ctx) => api.registrations.tourism(payload, ctx));
}
