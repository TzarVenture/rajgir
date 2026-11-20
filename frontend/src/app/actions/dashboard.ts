"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { api, type ApiIncident } from "@/lib/api";
import { authContext, endSession } from "@/lib/auth/session";

export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  data?: T;
}

const SIGNED_OUT = "Your session has ended. Please sign in again.";

function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ---------- Runner ----------

const medicalSchema = z.object({
  emergencyName: z.string().trim().min(2, "Enter the contact's name").max(64),
  emergencyRelation: z.string().trim().min(2, "Enter the relationship").max(32),
  emergencyPhone: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit mobile number"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    errorMap: () => ({ message: "Select a blood group" }),
  }),
  medicalNotes: z.string().trim().max(500, "Keep notes under 500 characters").optional(),
});

export type MedicalProfileInput = z.infer<typeof medicalSchema>;

export async function updateMedicalProfile(input: MedicalProfileInput): Promise<ActionResult> {
  const parsed = medicalSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };

  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.runners.updateMedical({ ...parsed.data, medicalNotes: parsed.data.medicalNotes || undefined }, ctx);
  if (!res.success) return { success: false, error: res.error ?? "We could not save your changes." };

  revalidatePath("/dashboard/runner");
  return { success: true };
}

const runnerProfileSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name").max(64),
  lastName: z.string().trim().min(2, "Enter your last name").max(64),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a 10-digit mobile number"),
  bibName: z.string().trim().min(1, "Enter a name for your bib").max(20),
  tshirtSize: z.enum(["XS", "S", "M", "L", "XL", "XXL"], {
    errorMap: () => ({ message: "Select a valid T-shirt size" }),
  }),
  city: z.string().trim().min(2, "Enter your city").max(64),
  state: z.string().trim().min(2, "Enter your state").max(64),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit postal code"),
  country: z.string().trim().max(32).optional(),
  runningClub: z.string().trim().max(64).optional(),
});

export type RunnerProfileInput = z.infer<typeof runnerProfileSchema>;

export async function updateRunnerProfile(input: RunnerProfileInput): Promise<ActionResult> {
  const parsed = runnerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.runners.updateProfile(parsed.data, ctx);
  if (!res.success) return { success: false, error: res.error ?? "We could not update your profile." };

  revalidatePath("/dashboard/runner");
  revalidatePath("/dashboard/runner/profile");
  revalidatePath("/dashboard/runner/bib");
  return { success: true };
}

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Use at least 8 characters").max(72, "Use at most 72 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

export async function changeAccountPassword(input: PasswordChangeInput): Promise<ActionResult> {
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check your password entries.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.auth.changePassword(
    { currentPassword: parsed.data.currentPassword || undefined, newPassword: parsed.data.newPassword },
    ctx
  );
  if (!res.success) return { success: false, error: res.error ?? "We could not update your password." };

  return { success: true };
}

export async function deleteAccountAction(confirmation: string): Promise<ActionResult> {
  if (confirmation.trim() !== "DELETE") {
    return { success: false, error: 'Please type "DELETE" exactly to confirm account deletion.' };
  }

  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT };

  const res = await api.auth.deleteAccount(ctx);
  if (!res.success) return { success: false, error: res.error ?? "We could not delete your account." };

  await endSession();
  return { success: true };
}

// ---------- Volunteer ----------

async function volunteerCall<T>(call: (ctx: NonNullable<Awaited<ReturnType<typeof authContext>>>) => Promise<{ success: boolean; error?: string; data?: T }>) {
  const ctx = await authContext();
  if (!ctx) return { success: false, error: SIGNED_OUT } as ActionResult<T>;
  const res = await call(ctx);
  if (!res.success) return { success: false, error: res.error ?? "Something went wrong. Please try again." } as ActionResult<T>;
  revalidatePath("/dashboard/volunteer");
  return { success: true, data: res.data } as ActionResult<T>;
}

const geoSchema = z
  .object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })
  .partial()
  .optional();

export async function volunteerCheckIn(geo?: { latitude?: number; longitude?: number }): Promise<ActionResult<unknown>> {
  const parsed = geoSchema.safeParse(geo);
  return volunteerCall((ctx) => api.volunteers.checkIn(parsed.success ? (parsed.data ?? {}) : {}, ctx));
}

export async function volunteerCheckOut(): Promise<ActionResult<unknown>> {
  return volunteerCall((ctx) => api.volunteers.checkOut(ctx));
}

export async function setVolunteerDutyStatus(status: "ON_DUTY" | "ON_BREAK"): Promise<ActionResult<unknown>> {
  if (status !== "ON_DUTY" && status !== "ON_BREAK") return { success: false, error: "Unknown status." };
  return volunteerCall((ctx) => api.volunteers.setStatus(status, ctx));
}

export async function setChecklistItem(itemId: string, done: boolean): Promise<ActionResult<unknown>> {
  if (!/^[a-z0-9-]{1,48}$/.test(itemId)) return { success: false, error: "Unknown checklist item." };
  return volunteerCall((ctx) => api.volunteers.setChecklistItem(itemId, Boolean(done), ctx));
}

const incidentSchema = z.object({
  type: z.enum(["MEDICAL", "SECURITY", "LOST_PERSON", "COURSE_HAZARD", "HYDRATION", "CROWD", "OTHER"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  isSos: z.boolean().optional(),
  location: z.string().trim().max(128).optional(),
  runnerBib: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]{0,16}$/, "Bib may contain letters, digits and dashes")
    .optional(),
  description: z.string().trim().min(3, "Describe what happened").max(1000),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export type IncidentInput = z.infer<typeof incidentSchema>;

export async function reportIncident(input: IncidentInput): Promise<ActionResult<ApiIncident>> {
  const parsed = incidentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  const data = { ...parsed.data, runnerBib: parsed.data.runnerBib || undefined, location: parsed.data.location || undefined };
  return volunteerCall((ctx) => api.volunteers.reportIncident(data, ctx));
}

// ---------- Support & Helpdesk ----------

const supportTicketSchema = z.object({
  topic: z.enum([
    "BIB_EXPO",
    "CATEGORY_CHANGE",
    "MEDICAL_UPDATE",
    "BILLING_GST",
    "RACE_DAY_LOGISTICS",
    "SHIFT_ALLOCATION",
    "KIT_UNIFORM",
    "MEALS_TRANSPORT",
    "CERTIFICATE_ATTENDANCE",
    "INCIDENT_ESCALATION",
    "PRESS_PASS",
    "DRONE_EQUIPMENT",
    "DELIVERABLES_CONTENT",
    "PROMO_AFFILIATE",
    "ATHLETE_INTERVIEWS",
    "OTHER",
  ], {
    errorMap: () => ({ message: "Select an inquiry topic" }),
  }),
  priority: z.enum(["NORMAL", "URGENT"]).default("NORMAL"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(100),
  message: z.string().trim().min(10, "Describe your question in at least 10 characters").max(1500),
  registrationNumber: z.string().trim().optional(),
  athleteName: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
});

export type SupportTicketInput = z.infer<typeof supportTicketSchema>;

export interface SupportTicketResponse {
  ticketId: string;
  submittedAt: string;
  expectedResolution: string;
}

export async function submitSupportTicket(input: SupportTicketInput): Promise<ActionResult<SupportTicketResponse>> {
  const parsed = supportTicketSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  const ticketId = `TICK-2027-${Math.floor(100000 + Math.random() * 900000)}`;
  const submittedAt = new Date().toISOString();
  const isUrgent = parsed.data.priority === "URGENT";
  const expectedResolution = isUrgent ? "Within 2 - 4 hours (Priority Race Operations)" : "Within 24 hours (Helpdesk SLA)";

  const webhookUrl = process.env.SUPPORT_WEBHOOK_URL || process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          source: "Dashboard Helpdesk",
          ...parsed.data,
          submittedAt,
        }),
      }).catch(() => undefined);
    } catch {
      // Non-blocking best-effort
    }
  }

  return {
    success: true,
    data: {
      ticketId,
      submittedAt,
      expectedResolution,
    },
  };
}
