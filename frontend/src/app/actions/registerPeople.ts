"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { authContext, clearPendingRegistration, getPendingRegistration, saveSession } from "@/lib/auth/session";

/** Individual registrations other than runners (volunteer, influencer) and withdrawing a pending registration. */
export interface PeopleResult {
  success: boolean;
  error?: string;
}

function pick(source: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  return out;
}

export async function submitVolunteerRegistration(form: Record<string, unknown>): Promise<PeopleResult> {
  const pending = await getPendingRegistration();
  const ctx = await authContext();
  if (!ctx && !pending) return { success: false, error: "Please sign in to complete your registration." };

  const payload = pick(form, [
    "tShirtSize",
    "emergencyContactName",
    "emergencyContactPhone",
    "availability",
    "rolePreference",
    "languagesSpoken",
    "dietaryRestrictions",
    "medicalCertification",
    "waiverAgreed",
  ]);

  let res;
  if (pending) {
    res = await api.volunteers.registerWithAccount({
      account: {
        firstName: pending.firstName,
        lastName: pending.lastName,
        email: pending.email,
        mobile: pending.mobile,
        password: pending.password,
      },
      registration: payload,
    });
    if (res.success && res.data) {
      await clearPendingRegistration();
      if (res.data.session) await saveSession(res.data.session);
    }
  } else if (ctx) {
    res = await api.volunteers.register(payload, ctx);
  } else {
    return { success: false, error: "Please sign in to complete your registration." };
  }

  if (!res.success) return { success: false, error: res.error ?? "We could not submit your application." };
  return { success: true };
}

export async function submitInfluencerRegistration(form: Record<string, unknown>): Promise<PeopleResult> {
  const pending = await getPendingRegistration();
  const ctx = await authContext();
  if (!ctx && !pending) return { success: false, error: "Please sign in to complete your registration." };

  const payload = pick(form, [
    "stageName",
    "city",
    "country",
    "primaryPlatform",
    "profileUrl",
    "followerCount",
    "engagementRate",
    "targetNiche",
    "collaborationDeliverables",
  ]);

  let res;
  if (pending) {
    res = await api.influencers.registerWithAccount({
      account: {
        firstName: pending.firstName,
        lastName: pending.lastName,
        email: pending.email,
        mobile: pending.mobile,
        password: pending.password,
      },
      registration: payload,
    });
    if (res.success && res.data) {
      await clearPendingRegistration();
      if (res.data.session) await saveSession(res.data.session);
    }
  } else if (ctx) {
    res = await api.influencers.register(payload, ctx);
  } else {
    return { success: false, error: "Please sign in to complete your registration." };
  }

  if (!res.success) return { success: false, error: res.error ?? "We could not submit your proposal." };
  return { success: true };
}

/** Withdraw a registration that is still pending review so the person can register as something else. */
export async function withdrawRegistration(): Promise<void> {
  const ctx = await authContext();
  if (!ctx) redirect("/login");

  await api.registrations.withdraw(ctx);
  revalidatePath("/", "layout");
  redirect("/register");
}
