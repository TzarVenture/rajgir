import React from "react";
import { LuAward, LuCheck, LuIdCard, LuPrinter, LuQrCode, LuShieldCheck } from "react-icons/lu";
import { getVolunteerDashboardContext } from "@/lib/volunteerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Card, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { CertificateModal } from "@/components/dashboard/CertificateModal";
import { VolunteerSubpageHeader } from "@/components/dashboard/volunteer/VolunteerSubpageHeader";
import { EVENT, formatDate } from "@/lib/event";

export const metadata = {
  title: "Accreditation Crew Pass & Certificate | Volunteer Dashboard",
};

export default async function VolunteerBadgePage() {
  const { load, data } = await getVolunteerDashboardContext("/dashboard/volunteer/badge");

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your credentials">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { v, approved, role, color, volunteerId, badgeQr, shiftLabel, duty, certificate, hoursServed, completed } = data;

  return (
    <div className="space-y-6">
      <VolunteerSubpageHeader
        title="Accreditation Crew Pass & Certificate"
        description="Your verified field security pass with credential QR code, station assignments, and official service certificate."
        role={role}
        station={v.assignedStation}
        sector={v.assignedSector}
        sectorColor={color}
        duty={duty}
        approved={approved}
        activeHref="/dashboard/volunteer/badge"
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Accreditation Crew Pass */}
        <div
          aria-label="Volunteer accreditation badge"
          className="flex flex-col justify-between overflow-hidden rounded-feature border border-charcoal-200 bg-white shadow-[0_8px_24px_rgba(17,24,39,0.08)]"
        >
          <div>
            {/* Lanyard Top Accent */}
            <div className="px-6 py-4 text-white flex items-center justify-between" style={{ backgroundColor: color }}>
              <div>
                <p className="font-barlow text-xs font-bold uppercase tracking-wider opacity-90">{EVENT.name}</p>
                <p className="font-barlow text-2xl font-bold uppercase leading-tight">Official Crew Pass</p>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-mono font-bold tracking-widest text-white backdrop-blur-xs">
                {volunteerId}
              </span>
            </div>

            {/* Credential Details & QR */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6">
              {approved ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={badgeQr}
                  alt={`Accreditation QR for ${volunteerId}`}
                  className="h-32 w-32 shrink-0 rounded-xl border border-charcoal-200 p-1.5 shadow-xs"
                />
              ) : (
                <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-xl border border-dashed border-charcoal-300 p-3 text-center text-xs font-semibold text-charcoal-500">
                  <LuQrCode className="h-6 w-6 text-charcoal-400 mb-1" />
                  <span>QR issued upon approval</span>
                </div>
              )}

              <div className="min-w-0 space-y-1.5 text-center sm:text-left">
                <p className="text-xl sm:text-2xl font-bold text-charcoal-900">{v.fullName}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Badge tone="brand">{role}</Badge>
                  {approved ? (
                    <Badge tone="success">
                      <LuShieldCheck className="h-3 w-3" /> Verified Crew
                    </Badge>
                  ) : (
                    <Badge tone="warning">Pending Review</Badge>
                  )}
                </div>
                <p className="font-mono text-xs text-charcoal-500 pt-1">ID: {volunteerId}</p>
                <p className="text-xs text-charcoal-600">Shift: {shiftLabel ?? "Assigned before race week"}</p>
                <p className="text-xs text-charcoal-600">T-Shirt Size: {v.tShirtSize} | Kit at Briefing</p>
              </div>
            </div>
          </div>

          {/* Sector & Station Footer */}
          <div className="grid grid-cols-2 border-t border-charcoal-200 text-center bg-charcoal-50/60">
            <div className="border-r border-charcoal-200 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">Sector Designation</p>
              <p className="font-barlow text-2xl font-bold" style={{ color }}>
                {v.assignedSector ?? "Pending"}
              </p>
            </div>
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">Assigned Station</p>
              <p className="truncate font-barlow text-xl font-bold text-charcoal-900">{v.assignedStation ?? "TBA"}</p>
            </div>
          </div>
        </div>

        {/* Certificate Section Card */}
        <SectionCard
          title="Service Certificate of Appreciation"
          tag={certificate ? <Badge tone="success">Available to Download</Badge> : <Badge tone="neutral">Locked</Badge>}
          description="Official certificate acknowledging your hours served and volunteer contribution to Rajgir Marathon."
        >
          <div className="space-y-4">
            <div className="rounded-card border border-charcoal-200 bg-surface-soft p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-charcoal-700">
                <span>Completed Shifts:</span>
                <span className="font-bold">{completed.length} shift(s)</span>
              </div>
              <div className="flex items-center justify-between text-xs text-charcoal-700">
                <span>Total Service Hours:</span>
                <span className="font-bold">{hoursServed.toFixed(1)} hrs</span>
              </div>
              <div className="flex items-center justify-between text-xs text-charcoal-700">
                <span>Certificate Status:</span>
                <span className="font-semibold text-brand-red">{certificate ? "Ready for Download" : "Unlocks After Race"}</span>
              </div>
            </div>

            <p className="text-sm text-charcoal-600">
              {certificate
                ? "Your official service certificate has been issued! You can view, download as PDF, and print it below."
                : `Certificates are generated after race day (${formatDate(EVENT.raceDate)}) once your duty hours are verified by race timing and attendance logs.`}
            </p>

            <CertificateModal
              certificate={certificate}
              buttonLabel="View Official Certificate"
              lockedReason={`Your certificate unlocks after race day (${formatDate(EVENT.raceDate)}) once at least one shift is checked in and out on this dashboard.`}
            />
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
