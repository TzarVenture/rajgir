/**
 * Event facts shown on the participant dashboards. One place to edit dates, times and venues.
 * The API keeps the authoritative race date in backend/src/common/constants/event.ts (RACE_DATE). Keep both in sync.
 *
 * PROVISIONAL: start times, expo hours, briefing time and checkpoint layout are planning defaults until the
 * organizing committee publishes the race handbook. The dashboards label them as provisional.
 */

export const IST_OFFSET = "+05:30";

export const EVENT = {
  name: "Rajgir Marathon 2027",
  shortName: "Rajgir Marathon",
  /** Race day (IST). */
  raceDate: "2027-11-21",
  city: "Rajgir, Nalanda, Bihar",
  startFinish: "Vishwa Shanti Stupa, Ratnagiri Hills",
  expo: {
    venue: "Kund Ground, Rajgir",
    days: [
      { date: "2027-11-19", hours: "10:00 AM - 8:00 PM" },
      { date: "2027-11-20", hours: "10:00 AM - 6:00 PM" },
    ],
  },
  volunteerBriefing: { at: "2027-11-20T15:00:00+05:30", venue: "Rajgir Sports Complex" },
  /** Help lines. Race control is optional until the number is issued. */
  contacts: {
    helpEmail: process.env.NEXT_PUBLIC_CONTACT_RECIPIENT_EMAIL || "rajgirmarathon@gmail.com",
    raceControlPhone: process.env.NEXT_PUBLIC_RACE_CONTROL_PHONE || "",
    nationalEmergency: "112",
    ambulance: "108",
  },
  schedulesProvisional: true,
} as const;

/** GST shown on the registration receipt. Registration fees are GST-inclusive. */
export const TAX = {
  gstRatePercent: 18,
  /** State of the organizer's GST registration: same state = CGST + SGST, otherwise IGST. */
  organizerState: "Bihar",
  organizerLegalName: process.env.NEXT_PUBLIC_ORGANIZER_LEGAL_NAME || "Rajgir Marathon Organizing Committee",
  /** Only when a GSTIN is configured is the document a tax invoice; otherwise it is a payment receipt. */
  organizerGstin: process.env.NEXT_PUBLIC_ORGANIZER_GSTIN || "",
  sacCode: process.env.NEXT_PUBLIC_REGISTRATION_SAC_CODE || "",
} as const;

export interface CategoryOps {
  distance: string;
  /** Wave-1 gun time "HH:MM" (IST). */
  startTime: string;
  cutoffMinutes: number;
  timed: boolean;
  distanceKm: number;
  /** Timing mats (km) for split capture; the last one is the finish. */
  checkpoints: { label: string; km: number }[];
  /** Bib colour by category, as printed. */
  bibColor: string;
  bibInk: string;
  /** Length of the suggested build-up plan in weeks. */
  planWeeks: number;
  peakWeeklyKm: number;
  peakLongRunKm: number;
}

export const CATEGORY_OPS: CategoryOps[] = [
  {
    distance: "42.2 KM",
    startTime: "05:00",
    cutoffMinutes: 360,
    timed: true,
    distanceKm: 42.195,
    checkpoints: [
      { label: "5K", km: 5 },
      { label: "10K", km: 10 },
      { label: "15K", km: 15 },
      { label: "Half", km: 21.0975 },
      { label: "25K", km: 25 },
      { label: "30K", km: 30 },
      { label: "35K", km: 35 },
      { label: "40K", km: 40 },
      { label: "Finish", km: 42.195 },
    ],
    bibColor: "#E31B23",
    bibInk: "#FFFFFF",
    planWeeks: 16,
    peakWeeklyKm: 60,
    peakLongRunKm: 32,
  },
  {
    distance: "21.1 KM",
    startTime: "06:00",
    cutoffMinutes: 210,
    timed: true,
    distanceKm: 21.0975,
    checkpoints: [
      { label: "5K", km: 5 },
      { label: "10K", km: 10 },
      { label: "15K", km: 15 },
      { label: "Finish", km: 21.0975 },
    ],
    bibColor: "#1D4ED8",
    bibInk: "#FFFFFF",
    planWeeks: 12,
    peakWeeklyKm: 40,
    peakLongRunKm: 18,
  },
  {
    distance: "10 KM",
    startTime: "06:45",
    cutoffMinutes: 100,
    timed: true,
    distanceKm: 10,
    checkpoints: [
      { label: "5K", km: 5 },
      { label: "Finish", km: 10 },
    ],
    bibColor: "#15803D",
    bibInk: "#FFFFFF",
    planWeeks: 8,
    peakWeeklyKm: 30,
    peakLongRunKm: 12,
  },
  {
    distance: "5 KM",
    startTime: "07:30",
    cutoffMinutes: 60,
    timed: false,
    distanceKm: 5,
    checkpoints: [],
    bibColor: "#F5A623",
    bibInk: "#111827",
    planWeeks: 6,
    peakWeeklyKm: 20,
    peakLongRunKm: 7,
  },
  {
    distance: "3 KM",
    startTime: "08:00",
    cutoffMinutes: 45,
    timed: false,
    distanceKm: 3,
    checkpoints: [],
    bibColor: "#7C3AED",
    bibInk: "#FFFFFF",
    planWeeks: 4,
    peakWeeklyKm: 12,
    peakLongRunKm: 4,
  },
];

export function categoryOps(distance: string): CategoryOps {
  return CATEGORY_OPS.find((c) => c.distance === distance) ?? CATEGORY_OPS[1];
}

/** Gun time for a category as an ISO string with the IST offset. */
export function startDateTime(distance: string): string {
  return `${EVENT.raceDate}T${categoryOps(distance).startTime}:00${IST_OFFSET}`;
}

/** Age on race day. Same rule as the API (whole years on the race date). */
export function ageOnRaceDay(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;
  if (Number.isNaN(dob.getTime())) return 0;
  const [y, m, d] = EVENT.raceDate.split("-").map(Number);
  let age = y - dob.getUTCFullYear();
  const monthDiff = m - 1 - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && d < dob.getUTCDate())) age--;
  return Math.max(0, age);
}

/** Age group used for category prizes and rankings (timed races). */
export function ageCategory(gender: string, age: number, distance: string): string {
  const prefix = gender === "Female" ? "Women" : gender === "Male" ? "Men" : "Open";
  if (!categoryOps(distance).timed) return "Open (non-competitive)";
  let band: string;
  if (age < 18) band = "Junior U18";
  else if (age < 35) band = "Open 18-34";
  else if (age < 45) band = "Veterans 35-44";
  else if (age < 55) band = "Veterans 45-54";
  else if (age < 65) band = "Seniors 55-64";
  else band = "Seniors 65+";
  return `${prefix} ${band}`;
}

/** Current time in ms. Server components call this once per request. */
export function nowMs(): number {
  return Date.now();
}

// ---------- Formatting ----------

const IST = "Asia/Kolkata";

export function formatDate(value: string | Date, opts: Intl.DateTimeFormatOptions = {}): string {
  const date = typeof value === "string" ? new Date(value.length === 10 ? `${value}T00:00:00${IST_OFFSET}` : value) : value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST, ...opts });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: IST,
  });
}

export function formatTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST });
}

/** "6:00 AM" from "06:00". */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** 3725 -> "1:02:05". */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (totalSeconds == null || !Number.isFinite(totalSeconds)) return "-";
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

/** Pace per km "5:32 /km". */
export function formatPace(seconds: number, km: number): string {
  if (!km || seconds <= 0) return "-";
  const perKm = Math.round(seconds / km);
  return `${Math.floor(perKm / 60)}:${String(perKm % 60).padStart(2, "0")} /km`;
}

export function formatCutoff(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function formatINR(amount: number, fractionDigits = 0): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
}
