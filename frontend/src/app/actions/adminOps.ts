"use server";

import { revalidatePath } from "next/cache";
import { api } from "@/lib/api";
import { authContext } from "@/lib/auth/session";
import type { ActionResult } from "@/app/actions/dashboard";

const SIGNED_OUT = "Your session has ended. Please sign in again.";

export async function adminAllotBibAction(
  registrationNumber: string,
  bibNumber: string
): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.allotBib(registrationNumber, { bibNumber }, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not allot bib." };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminAutoAllotBibsAction(payload: {
  distance?: string;
  startFrom?: number;
}): Promise<{
  success: boolean;
  error?: string;
  assignedCount?: number;
  assignments?: Array<{ registrationNumber: string; bibNumber: string }>;
}> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.autoAllotBibs(payload, ctx);
  if (!res.success || !res.data) return { success: false, error: res.error ?? "Could not auto-allot bibs." };
  revalidatePath("/admin");
  return { success: true, assignedCount: res.data.assignedCount, assignments: res.data.assignments };
}

export async function adminBulkAllotBibsAction(
  items: Array<{ registrationNumber: string; bibNumber: string }>
): Promise<{
  success: boolean;
  error?: string;
  updatedCount?: number;
  skippedCount?: number;
  assignments?: Array<{ registrationNumber: string; bibNumber: string }>;
  skipped?: Array<{ registrationNumber: string; reason: string }>;
}> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.bulkAllotBibs(items, ctx);
  if (!res.success || !res.data) return { success: false, error: res.error ?? "Could not bulk-allot bibs." };
  revalidatePath("/admin");
  return {
    success: true,
    updatedCount: res.data.updatedCount,
    skippedCount: res.data.skippedCount,
    assignments: res.data.assignments,
    skipped: res.data.skipped,
  };
}

export async function adminMarkKitCollectedAction(registrationNumber: string, collectedBy = "SELF"): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.markKitCollected(registrationNumber, collectedBy, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not mark kit collected." };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminUndoKitCollectedAction(registrationNumber: string): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.undoKitCollected(registrationNumber, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not undo kit pickup." };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminApproveVolunteerAction(id: string): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.approveVolunteer(id, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not approve volunteer." };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminAssignVolunteerAction(
  id: string,
  payload: { assignedRole?: string; assignedStation?: string; assignedSector?: string; supervisorName?: string; supervisorPhone?: string }
): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.assignVolunteer(id, payload, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not assign volunteer." };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminReviewInfluencerAction(id: string, decision: "approve" | "reject"): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.reviewInfluencer(id, decision, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not review influencer." };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminUpdateIncidentAction(
  id: string,
  status: "ACKNOWLEDGED" | "RESOLVED",
  resolutionNote?: string
): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.updateIncident(id, { status, resolutionNote }, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not update incident." };
  revalidatePath("/admin");
  return { success: true };
}

export async function adminSetUserStatusAction(userId: string, status: "ACTIVE" | "SUSPENDED"): Promise<ActionResult> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.admin.setUserStatus(userId, status, ctx);
  if (!res.success) return { success: false, error: res.error ?? "Could not update user status." };
  revalidatePath("/admin");
  return { success: true };
}
