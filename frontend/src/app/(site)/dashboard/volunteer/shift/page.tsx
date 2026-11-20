import React from "react";
import Link from "next/link";
import { LuPhone, LuShield, LuTriangleAlert } from "react-icons/lu";
import { getVolunteerDashboardContext } from "@/lib/volunteerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { ShiftControl } from "@/components/dashboard/volunteer/ShiftControl";
import { SosPanel } from "@/components/dashboard/volunteer/SosPanel";
import { VolunteerSubpageHeader } from "@/components/dashboard/volunteer/VolunteerSubpageHeader";
import { EVENT, formatDate, formatTime } from "@/lib/event";

export const metadata = {
  title: "Duty & Shift Attendance | Volunteer Dashboard",
};

export default async function VolunteerShiftPage() {
  const { load, data } = await getVolunteerDashboardContext("/dashboard/volunteer/shift");

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your shift dashboard">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { v, attendance, checkInOpen, opsEnabled, approved, role, color, shiftLabel, duty } = data;

  return (
    <div className="space-y-6">
      <VolunteerSubpageHeader
        title="Duty & Shift Attendance"
        description="Check in and out of your station with GPS verification, manage on-duty/break states, and dispatch life-safety emergency alerts."
        role={role}
        station={v.assignedStation}
        sector={v.assignedSector}
        sectorColor={color}
        duty={duty}
        approved={approved}
        activeHref="/dashboard/volunteer/shift"
      />

      {opsEnabled ? (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Shift Attendance Control Card */}
          <SectionCard
            title="Shift Attendance and Duty Control"
            tag={<Badge tone={checkInOpen ? "success" : "neutral"}>{checkInOpen ? "Check-in Open" : "Opens Race Week"}</Badge>}
            description="Toggle your live duty status. Records verified GPS location timestamp upon check-in and checkout."
          >
            <div className="space-y-4">
              <ShiftControl attendance={attendance} dutyStatus={v.dutyStatus} checkInOpen={checkInOpen} shiftLabel={shiftLabel} />
              
              {v.supervisorName ? (
                <div className="rounded-card border border-charcoal-200 bg-surface-soft p-3.5 text-xs text-charcoal-700 flex items-center justify-between">
                  <span>Station Lead: <strong>{v.supervisorName}</strong></span>
                  {v.supervisorPhone ? (
                    <a
                      href={`tel:${v.supervisorPhone}`}
                      className="inline-flex items-center gap-1 font-semibold text-brand-red hover:underline"
                    >
                      <LuPhone className="h-3.5 w-3.5" /> Call Lead
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </SectionCard>

          {/* Emergency SOS Dispatch Card */}
          <SectionCard
            title="Emergency SOS Dispatch"
            tag={
              <Badge tone="error">
                <LuTriangleAlert className="h-3 w-3" aria-hidden /> Life Safety
              </Badge>
            }
            description="Direct digital alert to Race Control with live station geolocation. In critical life-safety situations, always call emergency hotlines immediately."
          >
            <SosPanel
              station={v.assignedStation}
              raceControlPhone={EVENT.contacts.raceControlPhone}
              ambulance={EVENT.contacts.ambulance}
              emergency={EVENT.contacts.nationalEmergency}
            />
          </SectionCard>
        </section>
      ) : (
        <SectionCard
          title="Shift Tools Locked"
          tag={<Badge tone="neutral">Locked</Badge>}
          description="Race-day check-in and live duty status will activate once approved and race week begins."
        >
          <div className="space-y-3">
            <p className="text-sm text-charcoal-600">
              {approved
                ? "Your volunteer application is approved. Station check-in and duty tracking will open during race week."
                : "Operational shift check-in unlocks once the volunteer organizing committee reviews and accepts your application."}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Link
                href="/dashboard/volunteer/sop"
                className="inline-flex items-center gap-2 rounded-btn bg-brand-red px-4 py-2 text-xs font-semibold text-white hover:bg-brand-red-dark"
              >
                Review Field SOP Manual
              </Link>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Duty Rules Guidance */}
      <div className="flex items-center gap-2.5 rounded-card border border-charcoal-200 bg-white p-4 text-xs text-charcoal-600 shadow-2xs">
        <LuShield className="h-5 w-5 shrink-0 text-charcoal-500" />
        <span>
          <strong>Field Attendance Policy:</strong> Please ensure you check out at the end of each shift to record your hours towards your official Certificate of Appreciation. Take regular breaks as coordinated with your station supervisor.
        </span>
      </div>
    </div>
  );
}
