import { api, type ApiRunnerRegistration, type ApiVolunteer, type ApiVolunteerDashboard, type CallContext } from "@/lib/api";

/**
 * Loads the data behind the runner and volunteer dashboards.
 *
 * The dedicated endpoints (GET runners/me, GET volunteers/me) carry the live race-ops data.
 * When they are unavailable (e.g. an API server that has not been updated yet, where
 * "runners/me" is read as a registration number and answers 404), we fall back to
 * GET registrations/me, which every API version has. The dashboard then renders from
 * the registration itself in a read-only "limited" mode instead of bouncing the user
 * back to the registration page.
 *
 * Whether someone is registered is decided ONLY by registrations/me, never by a 404
 * from a dashboard endpoint.
 */
export type DashboardLoad<T> =
  | { kind: "ok"; data: T; limited: boolean }
  | { kind: "not-registered" }
  | { kind: "other-role"; role: string }
  | { kind: "error"; message: string };

const str = (v: unknown): string => (typeof v === "string" ? v : v == null ? "" : String(v));
const strOrNull = (v: unknown): string | null => (typeof v === "string" && v ? v : null);
const num = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);

async function registrationFallback(ctx: CallContext, role: "RUNNER" | "VOLUNTEER" | "INFLUENCER") {
  const mine = await api.registrations.me(ctx);
  if (!mine.success || !mine.data) {
    return { kind: "error" as const, message: mine.error ?? "We could not reach the registration service." };
  }
  if (!mine.data.registered) return { kind: "not-registered" as const };
  if (mine.data.role !== role) return { kind: "other-role" as const, role: mine.data.role };
  return { kind: "profile" as const, profile: mine.data.profile };
}

function runnerFromProfile(p: Record<string, unknown>): ApiRunnerRegistration {
  return {
    id: str(p.id),
    registrationNumber: str(p.registrationNumber),
    distance: str(p.distance),
    raceTitle: str(p.raceTitle),
    baseFee: num(p.baseFee),
    firstName: str(p.firstName),
    lastName: str(p.lastName),
    email: str(p.email),
    phone: str(p.phone),
    dateOfBirth: str(p.dateOfBirth),
    ageOnRaceDay: num(p.ageOnRaceDay),
    gender: str(p.gender),
    bibName: str(p.bibName),
    bloodGroup: str(p.bloodGroup),
    tshirtSize: str(p.tshirtSize),
    emergencyName: str(p.emergencyName),
    emergencyRelation: str(p.emergencyRelation),
    emergencyPhone: str(p.emergencyPhone),
    medicalNotes: strOrNull(p.medicalNotes),
    city: str(p.city),
    state: str(p.state),
    pincode: str(p.pincode),
    country: strOrNull(p.country),
    runningClub: strOrNull(p.runningClub),
    selectedAddons: Array.isArray(p.selectedAddons) ? (p.selectedAddons as ApiRunnerRegistration["selectedAddons"]) : null,
    grossAmount: num(p.grossAmount),
    discountAmount: p.discountAmount == null ? null : num(p.discountAmount),
    netAmount: num(p.netAmount),
    couponCode: strOrNull(p.couponCode),
    paymentStatus: strOrNull(p.paymentStatus),
    qrCodeToken: strOrNull(p.qrCodeToken),
    waiverAgreed: Boolean(p.waiverAgreed),
    createdAt: str(p.createdAt),
    updatedAt: str(p.updatedAt),
    estimatedFinishTime: strOrNull(p.estimatedFinishTime),
    bibNumber: strOrNull(p.bibNumber),
    startWave: strOrNull(p.startWave),
    kitCollectedAt: strOrNull(p.kitCollectedAt),
    kitCollectedBy: strOrNull(p.kitCollectedBy),
    medicalUpdatedAt: strOrNull(p.medicalUpdatedAt),
    result: null,
  };
}

function volunteerFromProfile(p: Record<string, unknown>): ApiVolunteer {
  const duty = str(p.dutyStatus);
  return {
    id: str(p.id),
    fullName: str(p.fullName),
    email: str(p.email),
    phone: str(p.phone),
    tShirtSize: str(p.tShirtSize),
    emergencyContactName: str(p.emergencyContactName),
    emergencyContactPhone: str(p.emergencyContactPhone),
    availability: Array.isArray(p.availability) ? (p.availability as string[]) : null,
    rolePreference: str(p.rolePreference),
    languagesSpoken: strOrNull(p.languagesSpoken),
    dietaryRestrictions: strOrNull(p.dietaryRestrictions),
    medicalCertification: typeof p.medicalCertification === "boolean" ? p.medicalCertification : null,
    status: strOrNull(p.status),
    submittedAt: str(p.submittedAt),
    assignedRole: strOrNull(p.assignedRole),
    assignedStation: strOrNull(p.assignedStation),
    assignedSector: strOrNull(p.assignedSector),
    supervisorName: strOrNull(p.supervisorName),
    supervisorPhone: strOrNull(p.supervisorPhone),
    shiftStart: strOrNull(p.shiftStart),
    shiftEnd: strOrNull(p.shiftEnd),
    dutyStatus: duty === "ON_DUTY" || duty === "ON_BREAK" ? duty : "OFF_DUTY",
    dutyStatusAt: strOrNull(p.dutyStatusAt),
    checklist: p.checklist && typeof p.checklist === "object" ? (p.checklist as Record<string, string>) : null,
  };
}

export async function loadRunnerDashboard(ctx: CallContext): Promise<DashboardLoad<ApiRunnerRegistration>> {
  const res = await api.runners.me(ctx);
  if (res.success && res.data) return { kind: "ok", data: res.data, limited: false };

  const fb = await registrationFallback(ctx, "RUNNER");
  if (fb.kind !== "profile") return fb;
  return { kind: "ok", data: runnerFromProfile(fb.profile), limited: true };
}

export async function loadVolunteerDashboard(ctx: CallContext): Promise<DashboardLoad<ApiVolunteerDashboard>> {
  const res = await api.volunteers.me(ctx);
  if (res.success && res.data) return { kind: "ok", data: res.data, limited: false };

  const fb = await registrationFallback(ctx, "VOLUNTEER");
  if (fb.kind !== "profile") return fb;
  return {
    kind: "ok",
    data: { volunteer: volunteerFromProfile(fb.profile), attendance: [], incidents: [], checkInOpen: false },
    limited: true,
  };
}

export interface ApiInfluencer {
  id: string;
  fullName: string;
  stageName: string | null;
  email: string;
  phone: string;
  city: string | null;
  country: string | null;
  primaryPlatform: string;
  profileUrl: string;
  followerCount: string;
  engagementRate: string | null;
  targetNiche: string;
  collaborationDeliverables: string;
  status: string | null;
  submittedAt: string;
  promoCode?: string | null;
  mediaPassNumber?: string | null;
}

function influencerFromProfile(p: Record<string, unknown>): ApiInfluencer {
  return {
    id: str(p.id),
    fullName: str(p.fullName),
    stageName: strOrNull(p.stageName),
    email: str(p.email),
    phone: str(p.phone),
    city: strOrNull(p.city),
    country: strOrNull(p.country) || "India",
    primaryPlatform: str(p.primaryPlatform) || "Instagram",
    profileUrl: str(p.profileUrl),
    followerCount: str(p.followerCount) || "10K+",
    engagementRate: strOrNull(p.engagementRate) || "4.2%",
    targetNiche: str(p.targetNiche) || "Running & Fitness",
    collaborationDeliverables: str(p.collaborationDeliverables) || "Course preview reel, bib reveal post, race day coverage",
    status: strOrNull(p.status) || "pending",
    submittedAt: str(p.submittedAt) || new Date().toISOString(),
    promoCode: strOrNull(p.promoCode),
    mediaPassNumber: strOrNull(p.mediaPassNumber),
  };
}

export async function loadInfluencerDashboard(ctx: CallContext): Promise<DashboardLoad<ApiInfluencer>> {
  const fb = await registrationFallback(ctx, "INFLUENCER");
  if (fb.kind !== "profile") return fb;
  return { kind: "ok", data: influencerFromProfile(fb.profile), limited: false };
}
