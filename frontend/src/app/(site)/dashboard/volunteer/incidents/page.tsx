import React from "react";
import Link from "next/link";
import { LuPhone, LuShieldAlert, LuTriangleAlert } from "react-icons/lu";
import { getVolunteerDashboardContext } from "@/lib/volunteerDashboard";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { IncidentLog } from "@/components/dashboard/volunteer/IncidentLog";
import { VolunteerSubpageHeader } from "@/components/dashboard/volunteer/VolunteerSubpageHeader";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Incident Desk & Field Reports | Volunteer Dashboard",
};

export default async function VolunteerIncidentsPage() {
  const { load, data } = await getVolunteerDashboardContext("/dashboard/volunteer/incidents");

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your incident desk">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { v, approved, opsEnabled, incidents, role, color, duty } = data;
  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL" || i.isSos).length;
  const openCount = incidents.filter((i) => i.status !== "RESOLVED").length;

  return (
    <div className="space-y-6">
      <VolunteerSubpageHeader
        title="Incident Desk & Field Reports"
        description="Report and monitor on-course medical incidents, course safety hazards, runner dropouts, or lost persons."
        role={role}
        station={v.assignedStation}
        sector={v.assignedSector}
        sectorColor={color}
        duty={duty}
        approved={approved}
        activeHref="/dashboard/volunteer/incidents"
      />

      {/* Incident Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Total Station Reports</p>
          <p className="mt-1 font-barlow text-3xl font-bold text-charcoal-900">{incidents.length}</p>
          <p className="mt-1 text-xs text-charcoal-500">Recorded for station {v.assignedStation ?? "TBA"}</p>
        </div>

        <div className="rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Active / Open Reports</p>
          <p className="mt-1 font-barlow text-3xl font-bold text-amber-600">{openCount}</p>
          <p className="mt-1 text-xs text-charcoal-500">Under investigation or in transit</p>
        </div>

        <div className="rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">Critical / SOS Alerts</p>
          <p className="mt-1 font-barlow text-3xl font-bold text-red-600">{criticalCount}</p>
          <p className="mt-1 text-xs text-charcoal-500">Life-safety priority dispatches</p>
        </div>
      </div>

      {/* Incident Log Card */}
      {opsEnabled ? (
        <SectionCard
          title="Station Incident Log & Submission"
          description="Click 'Report Incident' to log an occurrence with Race Control. Incidents with runner bib numbers update medical logs automatically."
          tag={<Badge tone={incidents.length > 0 ? "warning" : "neutral"}>{incidents.length} Logged</Badge>}
        >
          <IncidentLog incidents={incidents} station={v.assignedStation} />
        </SectionCard>
      ) : (
        <SectionCard
          title="Incident Desk Inactive"
          tag={<Badge tone="neutral">Locked</Badge>}
          description="Real-time incident reporting opens upon volunteer approval and race operations rollout."
        >
          <p className="text-sm text-charcoal-600">
            {approved
              ? "Live incident reporting will activate when your shift opens during race week."
              : "Once approved, you will be able to log field reports and notify Race Control directly."}
          </p>
        </SectionCard>
      )}

      {/* Immediate Hotline Warning */}
      <div className="rounded-card border border-red-200 bg-red-50 p-4 text-xs text-red-800 space-y-1">
        <div className="flex items-center gap-2 font-bold text-sm text-red-900">
          <LuTriangleAlert className="h-4 w-4" />
          <span>Life Safety Urgent Protocol</span>
        </div>
        <p>
          Submitting a digital report does not replace an urgent emergency telephone call. For life-threatening emergencies, dial{" "}
          <strong>{EVENT.contacts.ambulance} (Ambulance)</strong> or <strong>{EVENT.contacts.raceControlPhone || "112"} (Race Control Desk)</strong> immediately.
        </p>
      </div>
    </div>
  );
}
