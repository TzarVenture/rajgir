"use server";

import { revalidatePath } from "next/cache";
import { api, type ApiManagedRunner, type ApiManagedRunnerInput } from "@/lib/api";
import { authContext } from "@/lib/auth/session";
import type { ActionResult } from "@/app/actions/dashboard";

const SIGNED_OUT = "Your session has ended. Please sign in again.";

function revalidateGroupPaths() {
  revalidatePath("/dashboard/team");
  revalidatePath("/dashboard/corporate");
  revalidatePath("/dashboard/school");
}

function revalidatePartnerPaths() {
  revalidatePath("/dashboard/sponsor");
  revalidatePath("/dashboard/vendor");
  revalidatePath("/dashboard/tourism");
}

export async function addManagedRunnerAction(
  input: ApiManagedRunnerInput
): Promise<ActionResult<{ count: number; runners: ApiManagedRunner[] }>> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.groups.addRunner(input, ctx);
  if (!res.success || !res.data) {
    return { success: false, error: res.error ?? "Could not add runner." };
  }

  revalidateGroupPaths();
  return { success: true, data: res.data };
}

export async function bulkAddManagedRunnersAction(
  runners: ApiManagedRunnerInput[]
): Promise<ActionResult<{ count: number; runners: ApiManagedRunner[] }>> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  if (!Array.isArray(runners) || runners.length === 0) {
    return { success: false, error: "No valid runner rows to import." };
  }

  const res = await api.groups.bulkAddRunners(runners, ctx);
  if (!res.success || !res.data) {
    return { success: false, error: res.error ?? "Bulk import failed." };
  }

  revalidateGroupPaths();
  return { success: true, data: res.data };
}

export async function submitQuotaAppealAction(input: {
  requestedQuota: number;
  reason: string;
}): Promise<ActionResult<{ appealStatus: string; appealRequestedQuota: number }>> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.groups.submitQuotaAppeal(input, ctx);
  if (!res.success || !res.data) {
    return { success: false, error: res.error ?? "Could not submit quota appeal." };
  }

  revalidateGroupPaths();
  return { success: true, data: res.data };
}

export async function updateGroupProfileAction(payload: Record<string, unknown>): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.groups.updateProfile(payload, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not save profile." };

  revalidateGroupPaths();
  return { success: true };
}

export async function updatePartnerProfileAction(payload: Record<string, unknown>): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.partners.updateProfile(payload, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not save partner profile." };

  revalidatePartnerPaths();
  return { success: true };
}

// Admin reviews of quota appeals and applications live in app/actions/adminOps.ts.
