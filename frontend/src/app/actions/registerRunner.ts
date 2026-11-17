"use server";

import { api } from "@/lib/api";
import { authContext } from "@/lib/auth/session";
import { runnerRegistrationSchema } from "@/lib/schemas/runnerRegistration";

export interface RegisterRunnerResult {
  success: boolean;
  registrationNumber?: string;
  qrToken?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Runner registration. Checks the form, then hands it to the NestJS API, which decides the user (from the
 * session), the price, the coupon and the age check. Amounts sent from the browser are ignored.
 */
export async function submitRunnerRegistration(rawData: unknown): Promise<RegisterRunnerResult> {
  const parsed = runnerRegistrationSchema.safeParse(rawData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Please correct the highlighted errors in the form.", fieldErrors };
  }

  const ctx = await authContext();
  if (!ctx) return { success: false, error: "Please sign in to complete your registration." };

  const data = parsed.data;
  const res = await api.runners.register(
    {
      categoryDistance: data.distance,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      tshirtSize: data.tshirtSize,
      bibName: data.bibName,
      emergencyName: data.emergencyName,
      emergencyRelation: data.emergencyRelation,
      emergencyPhone: data.emergencyPhone,
      medicalNotes: data.medicalNotes || undefined,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country || "India",
      runningClub: data.runningClub || undefined,
      selectedAddons: data.selectedAddons,
      couponCode: data.couponCode?.trim() || undefined,
      waiverAgreed: data.waiverAgreed,
    },
    ctx
  );

  if (!res.success || !res.data) {
    return { success: false, error: res.error ?? "We could not complete your registration. Please try again." };
  }

  return {
    success: true,
    registrationNumber: res.data.registrationNumber,
    qrToken: res.data.qrToken ?? undefined,
  };
}

/** Details for the confirmation page. Only the owner of the registration can read it. */
export async function getRegistrationDetails(regNo: string) {
  const ctx = await authContext();
  if (!ctx) return null;

  const res = await api.runners.get(regNo, ctx);
  if (!res.success || !res.data) return null;

  const r = res.data as Record<string, string | number | null>;
  // The confirmation page reads snake_case names.
  return {
    registration_number: String(r.registrationNumber),
    qr_code_token: String(r.qrCodeToken ?? ""),
    first_name: String(r.firstName),
    last_name: String(r.lastName),
    distance: String(r.distance),
    race_title: String(r.raceTitle),
    bib_name: String(r.bibName),
    blood_group: String(r.bloodGroup),
    tshirt_size: String(r.tshirtSize),
    net_amount: Number(r.netAmount),
    email: String(r.email),
    phone: String(r.phone),
    city: String(r.city),
    state: String(r.state),
    created_at: String(r.createdAt),
  };
}
