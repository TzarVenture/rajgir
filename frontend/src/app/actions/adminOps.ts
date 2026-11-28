"use server";

import { revalidatePath } from "next/cache";
import { api, type CallContext } from "@/lib/api";
import { authContext } from "@/lib/auth/session";
import type { ActionResult } from "@/app/actions/dashboard";

/**
 * Admin console server actions. Each one forwards to the staff-only NestJS admin API (which enforces
 * roles and validation) and refreshes the admin console. All of them share one wrapper so session
 * handling, error messages and revalidation behave the same everywhere.
 */
const SIGNED_OUT = "Your session has ended. Please sign in again.";

type ApiCall<T> = (ctx: CallContext) => Promise<{ success: boolean; data?: T; error?: string }>;

async function adminCall<T>(call: ApiCall<T>, fallbackError: string): Promise<{ success: true; data: T | undefined } | { success: false; error: string }> {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };
  const res = await call(ctx);
  if (!res.success) return { success: false, error: res.error ?? fallbackError };
  // Every console page is a dynamic route under /admin; refresh them all.
  revalidatePath("/admin", "layout");
  return { success: true, data: res.data };
}

async function adminAction(call: ApiCall<unknown>, fallbackError: string): Promise<ActionResult> {
  const res = await adminCall(call, fallbackError);
  return res.success ? { success: true } : res;
}

// ---------- Registrations, bibs, kits ----------

export async function adminAllotBibAction(registrationNumber: string, bibNumber: string): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.allotBib(registrationNumber, { bibNumber }, ctx), "Could not allot bib.");
}

export async function adminAutoAllotBibsAction(payload: { distance?: string; startFrom?: number }): Promise<{
  success: boolean;
  error?: string;
  assignedCount?: number;
  assignments?: Array<{ registrationNumber: string; bibNumber: string }>;
}> {
  const res = await adminCall((ctx) => api.admin.autoAllotBibs(payload, ctx), "Could not auto-allot bibs.");
  if (!res.success) return res;
  return { success: true, assignedCount: res.data?.assignedCount ?? 0, assignments: res.data?.assignments ?? [] };
}

export async function adminBulkAllotBibsAction(items: Array<{ registrationNumber: string; bibNumber: string }>): Promise<{
  success: boolean;
  error?: string;
  updatedCount?: number;
  skippedCount?: number;
  assignments?: Array<{ registrationNumber: string; bibNumber: string }>;
  skipped?: Array<{ registrationNumber: string; reason: string }>;
}> {
  const res = await adminCall((ctx) => api.admin.bulkAllotBibs(items, ctx), "Could not bulk-allot bibs.");
  if (!res.success) return res;
  return {
    success: true,
    updatedCount: res.data?.updatedCount ?? 0,
    skippedCount: res.data?.skippedCount ?? 0,
    assignments: res.data?.assignments ?? [],
    skipped: res.data?.skipped ?? [],
  };
}

export async function adminMarkKitCollectedAction(registrationNumber: string, collectedBy = "SELF"): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.markKitCollected(registrationNumber, collectedBy, ctx), "Could not mark kit collected.");
}

export async function adminUndoKitCollectedAction(registrationNumber: string): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.undoKitCollected(registrationNumber, ctx), "Could not undo kit pickup.");
}

// ---------- Volunteers, influencers, incidents, users ----------

export async function adminApproveVolunteerAction(id: string): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.approveVolunteer(id, ctx), "Could not approve volunteer.");
}

export async function adminAssignVolunteerAction(
  id: string,
  payload: { assignedRole?: string; assignedStation?: string; assignedSector?: string; supervisorName?: string; supervisorPhone?: string },
): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.assignVolunteer(id, payload, ctx), "Could not assign volunteer.");
}

export async function adminReviewInfluencerAction(id: string, decision: "approve" | "reject"): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.reviewInfluencer(id, decision, ctx), "Could not review influencer.");
}

export async function adminUpdateIncidentAction(id: string, status: "ACKNOWLEDGED" | "RESOLVED", resolutionNote?: string): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.updateIncident(id, { status, resolutionNote }, ctx), "Could not update incident.");
}

export async function adminSetUserStatusAction(userId: string, status: "ACTIVE" | "SUSPENDED"): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.setUserStatus(userId, status, ctx), "Could not update user status.");
}

// ---------- Approvals ----------

export async function adminReviewApplicationAction(
  type: "corporate" | "school" | "sponsor" | "vendor" | "tourism",
  id: string,
  decision: "approve" | "reject",
): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.reviewApplication(type, id, decision, ctx), "Could not review application.");
}

export async function adminReviewQuotaAppealAction(
  type: "team" | "corporate" | "school",
  id: string,
  decision: "approve" | "reject",
  approvedQuota?: number,
): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.reviewQuotaAppeal(type, id, { decision, approvedQuota }, ctx), "Could not review the quota appeal.");
}

// ---------- Events, payments, content, support, platform ----------

export async function adminUpsertEventAction(payload: {
  distance: string;
  title: string;
  fee: number;
  minAge: number;
  startTime: string;
  cutoffMinutes: number;
  capacity: number;
  isTimed: boolean;
  isActive: boolean;
}): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.upsertEvent(payload, ctx), "Could not save event category.");
}

export async function adminCreatePaymentAction(payload: Record<string, unknown>): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.createPayment(payload, ctx), "Could not record payment.");
}

export async function adminUpdatePaymentStatusAction(id: string, status: "CAPTURED" | "PENDING" | "REFUNDED"): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.updatePaymentStatus(id, status, ctx), "Could not update payment status.");
}

export async function adminCreateMediaAction(payload: { title: string; category: string; url: string; caption?: string }): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.createMedia(payload, ctx), "Could not add media asset.");
}

export async function adminToggleMediaAction(id: string, isPublished: boolean): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.toggleMedia(id, isPublished, ctx), "Could not change media visibility.");
}

export async function adminUpsertCmsAction(payload: { slug: string; title: string; section: string; content: string; isPublished: boolean }): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.upsertCms(payload, ctx), "Could not save CMS block.");
}

export async function adminCreateNotificationAction(payload: { title: string; channel: string; audience: string; message: string; sendNow?: boolean }): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.createNotification(payload, ctx), "Could not create campaign.");
}

export async function adminCreateSupportAction(payload: {
  requesterName: string;
  requesterEmail: string;
  category: string;
  subject: string;
  message: string;
  priority?: string;
}): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.createSupport(payload, ctx), "Could not create ticket.");
}

export async function adminUpdateSupportAction(id: string, payload: { status: string; assignedTo?: string; resolutionNote?: string }): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.updateSupport(id, payload, ctx), "Could not update ticket.");
}

export async function adminUpdatePermissionAction(id: string, payload: Record<string, unknown>): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.updatePermissions(id, payload, ctx), "Could not update permissions.");
}

export async function adminUpsertSettingAction(payload: { key: string; value: string; category?: string; description?: string }): Promise<ActionResult> {
  return adminAction((ctx) => api.admin.upsertSetting(payload, ctx), "Could not save setting.");
}
