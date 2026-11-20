import React from "react";
import Link from "next/link";
import {
  LuArrowUpRight,
  LuAward,
  LuBookOpen,
  LuCircleCheck,
  LuClipboardCheck,
  LuClock,
  LuIdCard,
  LuMapPin,
  LuPhone,
  LuShield,
  LuShieldAlert,
  LuTriangleAlert,
  LuUserCheck,
} from "react-icons/lu";
import { getVolunteerDashboardContext, DUTY_LABELS } from "@/lib/volunteerDashboard";
import { ActionItems, RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Card, Notice, cn } from "@/components/ui";
import { DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { EVENT, formatDate, formatDateTime, formatTime } from "@/lib/event";

export const metadata = {
  title: "Volunteer Dashboard | Rajgir Marathon 2027",
};

function ProfileTile({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs transition-all hover:border-charcoal-300">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">{label}</p>
          {Icon ? <Icon className="h-4 w-4 text-charcoal-400" /> : null}
        </div>
        <div className="mt-1.5 font-barlow text-2xl font-bold leading-tight text-charcoal-900 break-words">
          {value}
        </div>
      </div>
      {hint ? (
        <div className="mt-2.5 text-xs text-charcoal-600 leading-normal break-words border-t border-charcoal-100 pt-2">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export default async function VolunteerDashboard() {
  const { load, data } = await getVolunteerDashboardContext("/dashboard/volunteer");

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your volunteer dashboard">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const {
    v,
    attendance,
    incidents,
    checkInOpen,
    limited,
    approved,
    rejected,
    role,
    color,
    volunteerId,
    shiftLabel,
    completed,
    hoursServed,
    activeAttendance,
    checklistDone,
    totalChecklistItems,
    todo,
    duty,
    initials,
  } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ---------- Executive Hero Card & Quick Action Hub ---------- */}
      <Card padded={false} className="overflow-hidden">
        <div className="h-2.5" style={{ backgroundColor: color }} aria-hidden />
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start sm:items-center gap-4">
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-barlow text-2xl font-bold text-white shadow-sm"
                style={{ backgroundColor: color }}
                aria-hidden
              >
                {initials || "VOL"}
              </span>
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  {approved ? (
                    <Badge tone="success">
                      <LuCircleCheck className="h-3.5 w-3.5" aria-hidden /> Approved Volunteer
                    </Badge>
                  ) : rejected ? (
                    <Badge tone="error">Not Accepted</Badge>
                  ) : (
                    <Badge tone="warning">Application Under Review</Badge>
                  )}
                  <Badge tone="brand">{role}</Badge>
                  {approved ? (
                    v.assignedStation ? (
                      <Badge tone="info">Station: {v.assignedStation}</Badge>
                    ) : (
                      <Badge tone="warning">Awaiting Deployment</Badge>
                    )
                  ) : null}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      duty === "ON_DUTY"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : duty === "ON_BREAK"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-charcoal-100 text-charcoal-700 border border-charcoal-200"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        duty === "ON_DUTY"
                          ? "bg-emerald-500 animate-pulse"
                          : duty === "ON_BREAK"
                            ? "bg-amber-500"
                            : "bg-charcoal-400"
                      )}
                    />
                    {DUTY_LABELS[duty] ?? duty}
                  </span>
                </div>
                <h1 className="font-barlow text-[28px] font-bold leading-tight text-charcoal-900 sm:text-[34px] break-words">
                  Welcome, {v.fullName}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-charcoal-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Race Day: <strong>{formatDate(EVENT.raceDate, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</strong></span>
                  <span>|</span>
                  <span>Briefing: <strong>{formatDateTime(EVENT.volunteerBriefing.at)}</strong> ({EVENT.volunteerBriefing.venue})</span>
                </p>
              </div>
            </div>

            {/* Direct Links to Dedicated Routes */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <Link
                href="/dashboard/volunteer/shift"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-btn bg-brand-red px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuClock className="h-4 w-4 shrink-0" aria-hidden />
                <span>Duty & Shift</span>
              </Link>
              <Link
                href="/dashboard/volunteer/badge"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-800 shadow-2xs transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuIdCard className="h-4 w-4 shrink-0 text-charcoal-600" aria-hidden />
                <span>Crew Badge</span>
              </Link>
              <Link
                href="/dashboard/volunteer/checklist"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-800 shadow-2xs transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuClipboardCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span>Checklist ({checklistDone}/{totalChecklistItems})</span>
              </Link>
              <Link
                href="/dashboard/volunteer/incidents"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-800 shadow-2xs transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuShieldAlert className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <span>Incidents</span>
              </Link>
              <Link
                href="/dashboard/volunteer/sop"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-charcoal-800 shadow-2xs transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
              >
                <LuBookOpen className="h-4 w-4 shrink-0 text-blue-600" aria-hidden />
                <span>Field SOPs</span>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* ---------- Top 4-KPI Metric Grid ---------- */}
      <section aria-label="Executive Metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <ProfileTile
          label="Live Duty Status"
          icon={LuClock}
          value={
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  duty === "ON_DUTY"
                    ? "bg-emerald-500 animate-pulse"
                    : duty === "ON_BREAK"
                      ? "bg-amber-500"
                      : "bg-charcoal-400"
                )}
                aria-hidden
              />
              {DUTY_LABELS[duty] ?? duty}
            </span>
          }
          hint={
            activeAttendance
              ? `Checked in at ${formatTime(activeAttendance.checkInAt)}`
              : shiftLabel ?? "Shift timing confirmed by supervisor"
          }
        />

        <ProfileTile
          label="Deployment Station"
          icon={LuMapPin}
          value={v.assignedStation ?? "Unassigned"}
          hint={
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              Sector: <strong>{v.assignedSector ?? "TBA"}</strong> | ID: {volunteerId}
            </span>
          }
        />

        <ProfileTile
          label="Station Supervisor"
          icon={LuUserCheck}
          value={v.supervisorName ?? "Volunteer Desk"}
          hint={
            v.supervisorPhone ? (
              <a
                href={`tel:${v.supervisorPhone}`}
                className="inline-flex items-center gap-1 text-brand-red font-semibold hover:underline"
              >
                <LuPhone className="h-3.5 w-3.5" aria-hidden /> Call {v.supervisorPhone}
              </a>
            ) : (
              "Coordinator assigned before race week"
            )
          }
        />

        <ProfileTile
          label="Service & Activity"
          icon={LuAward}
          value={`${hoursServed.toFixed(1)} hrs`}
          hint={
            <span>
              <strong>{completed.length}</strong> shift{completed.length === 1 ? "" : "s"} | <strong>{incidents.length}</strong> incident report{incidents.length === 1 ? "" : "s"}
            </span>
          }
        />
      </section>

      {/* ---------- Operations Hub & Dedicated Route Links Card ---------- */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-charcoal-200 pb-3">
          <div>
            <h2 className="font-barlow text-xl sm:text-2xl font-bold text-charcoal-900">
              Operations Hub & Dedicated Desks
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600">
              Navigate to specialized pages for shift check-ins, crew credentials, checklists, incident logs, and field SOPs.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-charcoal-500 self-start sm:self-auto">
            {EVENT.name} Field Console
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/volunteer/shift"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-surface-soft p-4 transition-all hover:border-brand-red hover:shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-brand-red">
                  <LuClock className="h-5 w-5" />
                </span>
                <Badge tone={checkInOpen ? "success" : "neutral"}>
                  {checkInOpen ? "Check-in Open" : "Opens Race Week"}
                </Badge>
              </div>
              <h3 className="font-bold text-charcoal-900 group-hover:text-brand-red transition-colors">
                Duty & Shift Attendance Desk &rarr;
              </h3>
              <p className="text-xs text-charcoal-600">
                GPS-verified check-in/out, live duty toggle (On Duty / Break), and shift duration tracking.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-red">
              Open shift desk <LuArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/dashboard/volunteer/shift"
            className="group flex flex-col justify-between rounded-card border border-red-200 bg-red-50/60 p-4 transition-all hover:border-red-400 hover:shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-200 text-red-700">
                  <LuTriangleAlert className="h-5 w-5" />
                </span>
                <Badge tone="error">Life Safety Priority</Badge>
              </div>
              <h3 className="font-bold text-charcoal-900 group-hover:text-red-700 transition-colors">
                Emergency SOS Dispatch &rarr;
              </h3>
              <p className="text-xs text-charcoal-600">
                1-tap emergency dispatch with GPS station coordinates for Ambulance, Police, and Race Control.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-red-700">
              Open emergency panel <LuArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/dashboard/volunteer/checklist"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-surface-soft p-4 transition-all hover:border-emerald-500 hover:shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <LuClipboardCheck className="h-5 w-5" />
                </span>
                <Badge tone={checklistDone > 0 ? "info" : "neutral"}>
                  {checklistDone}/{totalChecklistItems} Completed
                </Badge>
              </div>
              <h3 className="font-bold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                Station Operations Checklist &rarr;
              </h3>
              <p className="text-xs text-charcoal-600">
                Full checklist for {role} duty with live completion progress and auto-saving checklist items.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              Open checklist page <LuArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/dashboard/volunteer/incidents"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-surface-soft p-4 transition-all hover:border-amber-500 hover:shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <LuShieldAlert className="h-5 w-5" />
                </span>
                <Badge tone={incidents.length > 0 ? "warning" : "neutral"}>
                  {incidents.length} Incident{incidents.length === 1 ? "" : "s"} Logged
                </Badge>
              </div>
              <h3 className="font-bold text-charcoal-900 group-hover:text-amber-700 transition-colors">
                Incident Desk & Field Reports &rarr;
              </h3>
              <p className="text-xs text-charcoal-600">
                Submit on-course hazard reports, medical assistance logs, and view station history.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
              Open incident desk <LuArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/dashboard/volunteer/badge"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-surface-soft p-4 transition-all hover:border-blue-500 hover:shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <LuIdCard className="h-5 w-5" />
                </span>
                <Badge tone="brand">Credential QR</Badge>
              </div>
              <h3 className="font-bold text-charcoal-900 group-hover:text-blue-700 transition-colors">
                Accreditation Crew Badge & Pass &rarr;
              </h3>
              <p className="text-xs text-charcoal-600">
                Official credential lanyard badge with QR verification code plus Service Appreciation Certificate.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
              View credentials <LuArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          <Link
            href="/dashboard/volunteer/sop"
            className="group flex flex-col justify-between rounded-card border border-charcoal-200 bg-surface-soft p-4 transition-all hover:border-indigo-500 hover:shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <LuBookOpen className="h-5 w-5" />
                </span>
                <Badge tone="neutral">5 Core Protocols</Badge>
              </div>
              <h3 className="font-bold text-charcoal-900 group-hover:text-indigo-700 transition-colors">
                Field SOP Manual & Safety Protocols &rarr;
              </h3>
              <p className="text-xs text-charcoal-600">
                Hydration station layout, heat exhaustion diagnosis, lost persons, and radio codes.
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">
              Read manual <LuArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </Card>

      {limited ? (
        <Notice tone="warning" title="Some live features are temporarily unavailable">
          Your application is safe and shown below. Shift check-in, the station checklist and incident reporting will appear here once our race
          systems finish updating. In an emergency, call {EVENT.contacts.ambulance} (ambulance) or {EVENT.contacts.nationalEmergency}.
        </Notice>
      ) : null}

      {/* ---------- Action Items Roadmap ---------- */}
      <ActionItems items={todo} />

      {/* ---------- Registration Profile Details ---------- */}
      <SectionCard
        title="Volunteer Registration Profile"
        description="Official profile details submitted during onboarding. Contact the volunteer desk to request changes."
        tag={
          <Link
            href="/dashboard/volunteer/application"
            className="text-xs font-semibold text-brand-red hover:underline"
          >
            Manage Application &rarr;
          </Link>
        }
      >
        <DetailList
          rows={[
            { label: "Email Address", value: <span className="break-all">{v.email}</span> },
            { label: "Mobile Number", value: `+91 ${v.phone}` },
            { label: "Assigned Role", value: role },
            { label: "Preferred Role", value: v.rolePreference },
            { label: "Availability", value: (v.availability ?? []).join(", ") || "-" },
            { label: "Languages Spoken", value: v.languagesSpoken ?? "-" },
            { label: "T-shirt Size", value: v.tShirtSize },
            { label: "Dietary Restrictions", value: v.dietaryRestrictions ?? "None" },
            { label: "First-Aid / CPR Certified", value: v.medicalCertification ? "Yes" : "No" },
            { label: "Emergency Contact", value: `${v.emergencyContactName}, +91 ${v.emergencyContactPhone}` },
            { label: "Application Date", value: formatDate(v.submittedAt) },
          ]}
        />
      </SectionCard>

      <div className="flex items-center gap-2 rounded-card border border-charcoal-200 bg-white p-3 text-xs text-charcoal-500 shadow-2xs">
        <LuShield className="h-4 w-4 shrink-0 text-charcoal-600" aria-hidden />
        <span>Runner health and personal details accessed during race duties are strictly confidential and governed by event privacy policies.</span>
      </div>
    </div>
  );
}
