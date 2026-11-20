import React from "react";
import Link from "next/link";
import { LuBookOpen, LuClipboardCheck, LuShield } from "react-icons/lu";
import { getVolunteerDashboardContext } from "@/lib/volunteerDashboard";
import { checklistFor } from "@/lib/volunteerOps";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { OpsChecklist } from "@/components/dashboard/volunteer/OpsChecklist";
import { VolunteerSubpageHeader } from "@/components/dashboard/volunteer/VolunteerSubpageHeader";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Station Operations Checklist | Volunteer Dashboard",
};

export default async function VolunteerChecklistPage() {
  const { load, data } = await getVolunteerDashboardContext("/dashboard/volunteer/checklist");

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your checklist">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { v, approved, opsEnabled, role, color, duty, checklistDone, totalChecklistItems } = data;
  const groups = checklistFor(role);
  const percent = totalChecklistItems > 0 ? Math.round((checklistDone / totalChecklistItems) * 100) : 0;

  return (
    <div className="space-y-6">
      <VolunteerSubpageHeader
        title="Station Operations Checklist"
        description={`Interactive operational protocol for your assigned role (${role}). Ticked items save automatically to your profile.`}
        role={role}
        station={v.assignedStation}
        sector={v.assignedSector}
        sectorColor={color}
        duty={duty}
        approved={approved}
        activeHref="/dashboard/volunteer/checklist"
      />

      {/* Progress Bar Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <LuClipboardCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-charcoal-900">Task Completion Status</p>
              <p className="text-xs text-charcoal-500">{checklistDone} of {totalChecklistItems} mandatory checks completed</p>
            </div>
          </div>
          <Badge tone={percent === 100 ? "success" : percent > 0 ? "brand" : "neutral"}>
            {percent}% Completed
          </Badge>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-full bg-charcoal-100">
          <div
            className="h-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Operations Checklist Card */}
      {opsEnabled ? (
        <SectionCard
          title={`${role} Station Operations Sequence`}
          description="Follow these procedural steps sequentially. Coordinate any supply gaps with your station lead."
          tag={<Badge tone="neutral">{groups.length} Check Groups</Badge>}
        >
          <div className="space-y-6">
            <OpsChecklist groups={groups} initial={v.checklist ?? {}} />

            <div className="border-t border-charcoal-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-600">
              <span className="flex items-center gap-1.5">
                <LuShield className="h-4 w-4 text-charcoal-500" />
                Changes to checkboxes are synchronized live to Race Operations Control.
              </span>
              <Link
                href="/dashboard/volunteer/sop"
                className="inline-flex items-center gap-1 font-semibold text-brand-red hover:underline"
              >
                <LuBookOpen className="h-3.5 w-3.5" /> Read Full SOP Manual
              </Link>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Checklist Inactive"
          tag={<Badge tone="neutral">Locked</Badge>}
          description="Operational checklists become active upon committee approval."
        >
          <p className="text-sm text-charcoal-600">
            {approved
              ? "Your checklist is ready and will unlock during race week."
              : "Once your volunteer application is approved, your station checklist will activate here."}
          </p>
        </SectionCard>
      )}
    </div>
  );
}
