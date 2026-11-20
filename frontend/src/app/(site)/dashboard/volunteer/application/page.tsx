import React from "react";
import Link from "next/link";
import {
  LuArrowLeft,
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuFileText,
  LuInfo,
  LuMail,
  LuMapPin,
  LuPhone,
  LuShirt,
  LuTrash2,
  LuUser,
} from "react-icons/lu";
import { getVolunteerDashboardContext } from "@/lib/volunteerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Button, Card, Notice } from "@/components/ui";
import { DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { withdrawRegistration } from "@/app/actions/registerPeople";
import { EVENT, formatDate, formatDateTime } from "@/lib/event";

export const metadata = {
  title: "My Volunteer Application | Rajgir Marathon 2027",
};

export default async function VolunteerApplicationPage() {
  const { load, data } = await getVolunteerDashboardContext("/dashboard/volunteer/application");

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your application details">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { v, approved, rejected, role, volunteerId, shiftLabel } = data;
  const isPending = !approved && !rejected;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ---------- Clean Breadcrumbs & Header ---------- */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-xs font-semibold text-charcoal-500">
          <Link href="/dashboard/volunteer" className="flex items-center gap-1 hover:text-brand-red transition-colors">
            <LuArrowLeft className="h-3.5 w-3.5" />
            <span>Volunteer Hub</span>
          </Link>
          <span>/</span>
          <span className="text-charcoal-900">My Application</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-barlow text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
              Application Status & Details
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-charcoal-600">
              Review your submitted volunteer record, track review milestones, and manage your participation.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-xs font-bold text-charcoal-700 bg-surface-soft border border-charcoal-200 px-3 py-1.5 rounded-btn shadow-2xs">
              Ref: {volunteerId}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Primary Status Banner (Instant Understanding) ---------- */}
      {approved ? (
        <div className="rounded-feature border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <LuCircleCheck className="h-6 w-6" aria-hidden />
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-emerald-950">Application Approved</h2>
                  <Badge tone="success">Confirmed Race Crew</Badge>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                  Congratulations, <strong>{v.fullName}</strong>! You have been accepted for <strong>{role}</strong>. Your official accreditation pass and station tools are ready.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Link
                href="/dashboard/volunteer/badge"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 text-xs font-semibold text-emerald-900 bg-white border border-emerald-300 px-4 py-2 rounded-btn hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                View Crew Pass &rarr;
              </Link>
            </div>
          </div>
        </div>
      ) : rejected ? (
        <div className="rounded-feature border border-red-200 bg-red-50/70 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
              <LuCircleAlert className="h-6 w-6" aria-hidden />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-red-950">Application Closed</h2>
                <Badge tone="error">Not Accepted</Badge>
              </div>
              <p className="text-xs sm:text-sm text-red-900 leading-relaxed">
                Thank you for your interest in volunteering. We reached maximum capacity for <strong>{v.rolePreference}</strong>. You can withdraw this application below to register as a participant runner.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-feature border border-amber-200 bg-amber-50/70 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <LuClock className="h-6 w-6" aria-hidden />
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-amber-950">Application Under Review</h2>
                <Badge tone="warning">Pending Committee Decision</Badge>
              </div>
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                Thank you for applying to volunteer, <strong>{v.fullName}</strong>! The organizing committee is currently reviewing your application and shift availability for <strong>{v.rolePreference}</strong>.
              </p>
              <p className="text-xs text-amber-800 pt-1">
                Typical review turnaround: <strong>48 to 72 hours</strong>. You will receive an official notification via email and SMS once a decision is made.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Visual 3-Stage Progress Tracker ---------- */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs">
        <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-4">Application Lifecycle</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Stage 1 */}
          <div className="rounded-card border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[11px]">
                <LuCheck className="h-3 w-3" />
              </span>
              <span>1. Application Submitted</span>
            </div>
            <p className="mt-1.5 text-xs text-emerald-800">
              Completed on {formatDate(v.submittedAt)}
            </p>
          </div>

          {/* Stage 2 */}
          <div
            className={`rounded-card border p-4 ${
              approved
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                : rejected
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-amber-300 bg-amber-50 text-amber-950 ring-1 ring-amber-300/50"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-white text-[11px] ${
                  approved ? "bg-emerald-600" : rejected ? "bg-red-600" : "bg-amber-500"
                }`}
              >
                {approved ? <LuCheck className="h-3 w-3" /> : "2"}
              </span>
              <span>2. Committee Vetting</span>
            </div>
            <p className="mt-1.5 text-xs text-charcoal-600">
              {approved
                ? "Approved by Volunteer Coordination"
                : rejected
                  ? "Application concluded"
                  : "Under active review by coordinators"}
            </p>
          </div>

          {/* Stage 3 */}
          <div
            className={`rounded-card border p-4 ${
              v.assignedStation
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                : approved
                  ? "border-blue-200 bg-blue-50/50 text-blue-900"
                  : "border-charcoal-200 bg-surface-soft text-charcoal-400"
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-white text-[11px] ${
                  v.assignedStation ? "bg-emerald-600" : approved ? "bg-blue-600" : "bg-charcoal-300 text-charcoal-600"
                }`}
              >
                {v.assignedStation ? <LuCheck className="h-3 w-3" /> : "3"}
              </span>
              <span>3. Station & Shift Allotment</span>
            </div>
            <p className="mt-1.5 text-xs text-charcoal-600">
              {v.assignedStation
                ? `Station: ${v.assignedStation}`
                : approved
                  ? "Allotment scheduled prior to race week"
                  : "Awaiting committee approval"}
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Submitted Application Data Grid ---------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Assignment Preferences & Availability */}
        <SectionCard
          title="Role Preferences & Availability"
          description="The operational preferences you submitted for event day deployment."
        >
          <DetailList
            rows={[
              { label: "Preferred Duty", value: <strong>{v.rolePreference}</strong> },
              {
                label: "Allotted Official Role",
                value: approved ? (
                  <span className="font-bold text-charcoal-900">{role}</span>
                ) : (
                  <span className="text-charcoal-500">Confirmed upon approval</span>
                ),
              },
              { label: "Station Allocation", value: v.assignedStation ?? "Assigned before race week" },
              { label: "Sector Zone", value: v.assignedSector ?? "Pending assignment" },
              {
                label: "Availability Slots",
                value: (v.availability ?? []).length
                  ? (v.availability ?? []).join(", ")
                  : "Available throughout event",
              },
              { label: "Assigned Shift", value: shiftLabel ?? "Will be confirmed at volunteer briefing" },
              {
                label: "Station Lead",
                value: v.supervisorName ? (
                  <span>
                    {v.supervisorName}{" "}
                    {v.supervisorPhone ? (
                      <span className="text-charcoal-500 font-mono text-xs">(+91 {v.supervisorPhone})</span>
                    ) : null}
                  </span>
                ) : (
                  "Assigned before race week"
                ),
              },
            ]}
          />
        </SectionCard>

        {/* Card 2: Personal Details & Logistics */}
        <SectionCard
          title="Personal & Uniform Details"
          description="Your submitted contact and logistics information for crew coordination."
        >
          <DetailList
            rows={[
              { label: "Full Name", value: v.fullName },
              { label: "Registered Email", value: <span className="break-all">{v.email}</span> },
              { label: "Mobile Number", value: `+91 ${v.phone}` },
              {
                label: "Crew T-Shirt Size",
                value: (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal-900">{v.tShirtSize}</span>
                    <Badge tone="brand">Issued in Race Crew Kit</Badge>
                  </div>
                ),
              },
              { label: "Languages Spoken", value: v.languagesSpoken ?? "Hindi, English" },
              { label: "Dietary Preferences", value: v.dietaryRestrictions ?? "None specified" },
              {
                label: "First-Aid / CPR Certified",
                value: v.medicalCertification ? (
                  <Badge tone="success">Certified First Responder</Badge>
                ) : (
                  "Standard Crew"
                ),
              },
              {
                label: "Emergency Contact",
                value: `${v.emergencyContactName} (+91 ${v.emergencyContactPhone})`,
              },
            ]}
          />
        </SectionCard>
      </div>

      {/* ---------- Next Steps & Kit Handover Information ---------- */}
      <Card className="space-y-3">
        <h3 className="font-barlow text-lg font-bold text-charcoal-900 flex items-center gap-2">
          <LuShirt className="h-5 w-5 text-brand-red" />
          <span>Volunteer Kit Collection & Briefing</span>
        </h3>
        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
          Approved volunteers receive an official <strong>Rajgir Marathon Crew T-shirt (Size {v.tShirtSize})</strong>, accreditation security pass with lanyard, cap, and volunteer handbook. Kit handover takes place during the official Volunteer Briefing:
        </p>
        <div className="rounded-card border border-charcoal-200 bg-surface-soft p-3.5 text-xs text-charcoal-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Briefing Venue: <strong>{EVENT.volunteerBriefing.venue}</strong> &bull; Schedule: <strong>{formatDateTime(EVENT.volunteerBriefing.at)}</strong>
          </span>
          <Link href="/dashboard/volunteer/sop" className="text-brand-red font-semibold hover:underline shrink-0">
            Read Field SOP Manual &rarr;
          </Link>
        </div>
      </Card>

      {/* ---------- Application Actions (Update or Withdraw) ---------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Update Contact Info */}
        <SectionCard
          title="Need to Update Information?"
          description="How to request changes to your phone, uniform size, or emergency contact."
        >
          <div className="space-y-3 text-xs sm:text-sm text-charcoal-600">
            <p>
              To maintain reliable station rosters for our race operations, submitted applications cannot be edited online directly.
            </p>
            <div className="rounded-card border border-charcoal-200 bg-surface-soft p-3.5 space-y-1">
              <p className="font-bold text-charcoal-900 text-xs">Contact the Volunteer Coordination Desk:</p>
              <p className="text-xs text-charcoal-600">
                Email{" "}
                <a href={`mailto:${EVENT.contacts.helpEmail}`} className="font-semibold text-brand-red hover:underline">
                  {EVENT.contacts.helpEmail}
                </a>{" "}
                with your reference ID <strong>{volunteerId}</strong> and the correction needed.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Withdraw Application */}
        <SectionCard
          title="Cancel or Switch Roles"
          description="Withdraw this volunteer application if you wish to run the marathon or can no longer attend."
        >
          <div className="space-y-3 text-xs sm:text-sm text-charcoal-600">
            <p>
              Decided you want to participate as a <strong>Runner</strong> (42.2K, 21.1K, 10K, or 5K) instead? You can withdraw your volunteer application to clear your slot.
            </p>
            <form action={withdrawRegistration} className="pt-1">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                icon={LuTrash2}
                className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              >
                Withdraw Volunteer Application
              </Button>
              <p className="mt-2 text-[11px] text-charcoal-500">
                Withdrawing releases your volunteer slot and unlocks the registration options for other roles.
              </p>
            </form>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
