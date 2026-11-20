import React from "react";
import { redirect } from "next/navigation";
import { authContext, requireUser } from "@/lib/auth/session";
import { loadVolunteerDashboard } from "@/lib/dashboardData";
import { EVENT, IST_OFFSET, formatDate, formatDateTime, formatTime, nowMs } from "@/lib/event";
import { qrDataUrl } from "@/lib/qr";
import { checklistFor } from "@/lib/volunteerOps";
import type { ActionItem } from "@/components/dashboard/ActionItems";
import type { CertificateData } from "@/components/dashboard/CertificateModal";

export const SECTOR_COLORS = ["#E31B23", "#1D4ED8", "#15803D", "#C78A12", "#7C3AED", "#0F766E"];

export function sectorColor(sector: string | null): string {
  if (!sector) return "#374151";
  let hash = 0;
  for (const ch of sector) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return SECTOR_COLORS[hash % SECTOR_COLORS.length];
}

export const DUTY_LABELS: Record<string, string> = {
  ON_DUTY: "On Duty",
  ON_BREAK: "On Break",
  OFF_DUTY: "Off Duty",
};

export async function getVolunteerDashboardContext(path: string) {
  const user = await requireUser(path);
  if (user.role !== "VOLUNTEER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadVolunteerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind !== "ok") {
    return { user, load, data: null };
  }

  const { volunteer: v, attendance, incidents, checkInOpen } = load.data;
  const limited = load.limited;
  const approved = (v.status ?? "").toLowerCase() === "approved" || user.status === "ACTIVE";
  const rejected = (v.status ?? "").toLowerCase() === "rejected";
  const opsEnabled = approved && !limited;
  const role = v.assignedRole ?? v.rolePreference;
  const assigned = Boolean(v.assignedStation);
  const color = sectorColor(v.assignedSector);
  const volunteerId = `VOL-${v.id.slice(0, 8).toUpperCase()}`;
  const badgeQr = await qrDataUrl(`RAJGIR-VOLUNTEER:${v.id}`);
  const shiftLabel = v.shiftStart
    ? `Shift ${formatDate(v.shiftStart, { year: undefined, weekday: "short" })}, ${formatTime(v.shiftStart)}${v.shiftEnd ? ` - ${formatTime(v.shiftEnd)}` : ""}`
    : null;

  const completed = attendance.filter((a) => a.checkOutAt);
  const hoursServed = completed.reduce((s, a) => s + (new Date(a.checkOutAt!).getTime() - new Date(a.checkInAt).getTime()) / 3_600_000, 0);
  const activeAttendance = attendance.find((a) => !a.checkOutAt);
  const eventOver = nowMs() > new Date(`${EVENT.raceDate}T23:59:59${IST_OFFSET}`).getTime();

  const certificate: CertificateData | null =
    eventOver && completed.length
      ? {
          heading: "Certificate of Appreciation",
          recipient: v.fullName,
          statement: `served as a volunteer in the ${role} team at the ${EVENT.name}, ${EVENT.city}, on ${formatDate(EVENT.raceDate)}. Thank you for keeping our runners safe and supported.`,
          highlights: [
            { label: "Hours served", value: hoursServed.toFixed(1) },
            { label: "Shifts", value: String(completed.length) },
            ...(v.assignedStation ? [{ label: "Station", value: v.assignedStation.slice(0, 18) }] : []),
          ],
          certificateId: volunteerId,
          issuedOn: formatDate(new Date()),
          signatory: "Volunteer Coordinator, Rajgir Marathon",
        }
      : null;

  const briefingAt = new Date(EVENT.volunteerBriefing.at).getTime();
  const briefingPassed = nowMs() > briefingAt + 3 * 3_600_000;
  const checklistDone = Object.keys(v.checklist ?? {}).length;
  const totalChecklistItems = checklistFor(role).reduce((sum, g) => sum + g.items.length, 0);

  const todo: ActionItem[] = [
    {
      id: "applied",
      title: "Volunteer application submitted",
      detail: `Applied ${formatDate(v.submittedAt)} for ${v.rolePreference}.`,
      state: "done",
    },
    {
      id: "approval",
      title: "Approval by the volunteer team",
      detail: approved
        ? "You are an approved volunteer crew member."
        : rejected
          ? "Your application was not accepted this time. Contact the volunteer desk if you have questions."
          : "The volunteer team reviews applications within 48 to 72 working hours. We will email and SMS you.",
      state: approved ? "done" : rejected ? "todo" : "waiting",
      action: rejected ? { label: "Contact us", href: "/contact" } : undefined,
    },
    {
      id: "assignment",
      title: "Station, sector and shift assignment",
      detail: assigned
        ? `${v.assignedStation}${v.assignedSector ? `, sector ${v.assignedSector}` : ""}${shiftLabel ? `. ${shiftLabel}` : ""}.`
        : "Your coordinator assigns your station and shift before race week.",
      state: assigned ? "done" : approved ? "waiting" : "later",
    },
    {
      id: "sop",
      title: "Read standard operating procedures",
      detail: "Hydration station layout, heat illness, radio etiquette and lost-person procedure. About 10 minutes.",
      state: briefingPassed ? "done" : "todo",
      action: { label: "Open field manual", href: "/dashboard/volunteer/sop" },
    },
    {
      id: "briefing",
      title: "Attend volunteer briefing & collect kit",
      detail: `${formatDateTime(EVENT.volunteerBriefing.at)}, ${EVENT.volunteerBriefing.venue}. Collect accreditation & T-shirt (size ${v.tShirtSize}).`,
      state: briefingPassed ? "done" : approved ? "todo" : "later",
    },
    {
      id: "checkin",
      title: "Check in at your station on race day",
      detail: attendance.length
        ? `${attendance.length} shift${attendance.length === 1 ? "" : "s"} recorded. Station checklist: ${checklistDone}/${totalChecklistItems} items ticked.`
        : "Use shift check-in on this dashboard when you arrive at your station during race week.",
      state: attendance.length ? "done" : checkInOpen && opsEnabled ? "todo" : "later",
      action: opsEnabled ? { label: "Shift check-in", href: "/dashboard/volunteer/shift" } : undefined,
    },
  ];

  const duty = v.dutyStatus ?? "OFF_DUTY";
  const initials = v.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] ?? "")
    .join("")
    .toUpperCase();

  return {
    user,
    load,
    data: {
      v,
      attendance,
      incidents,
      checkInOpen,
      limited,
      approved,
      rejected,
      opsEnabled,
      role,
      assigned,
      color,
      volunteerId,
      badgeQr,
      shiftLabel,
      completed,
      hoursServed,
      activeAttendance,
      eventOver,
      certificate,
      briefingPassed,
      checklistDone,
      totalChecklistItems,
      todo,
      duty,
      initials,
    },
  };
}
