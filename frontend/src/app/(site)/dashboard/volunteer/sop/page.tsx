import React from "react";
import Link from "next/link";
import { LuBookOpen, LuLifeBuoy, LuPhone, LuShield } from "react-icons/lu";
import { getVolunteerDashboardContext } from "@/lib/volunteerDashboard";
import { SOP_SECTIONS } from "@/lib/volunteerOps";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { VolunteerSubpageHeader } from "@/components/dashboard/volunteer/VolunteerSubpageHeader";
import { EVENT } from "@/lib/event";

export const metadata = {
  title: "Field SOP Manual & Safety Protocols | Volunteer Dashboard",
};

export default async function VolunteerSopPage() {
  const { load, data } = await getVolunteerDashboardContext("/dashboard/volunteer/sop");

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Volunteer" registerHref="/register/volunteer" />;
  if (load.kind !== "ok" || !data) {
    return (
      <Notice tone="error" title="We could not load your SOP manual">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const { v, approved, role, color, duty } = data;

  return (
    <div className="space-y-6">
      <VolunteerSubpageHeader
        title="Field Standard Operating Procedures (SOP)"
        description="Comprehensive operational guidelines, heat illness diagnosis, lost person recovery, hydration setups, and radio communication etiquette."
        role={role}
        station={v.assignedStation}
        sector={v.assignedSector}
        sectorColor={color}
        duty={duty}
        approved={approved}
        activeHref="/dashboard/volunteer/sop"
      />

      {/* Overview Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs space-y-2">
        <h2 className="font-barlow text-lg font-bold text-charcoal-900">Volunteer Operations Handbook</h2>
        <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
          Every crew member is required to read through these 5 essential protocol modules before their briefing. If you have questions about specific procedures, coordinate with your Station Supervisor or reach out to the Volunteer Helpdesk.
        </p>
      </div>

      {/* SOP Modules Section */}
      <SectionCard
        title="Standard Operating Procedure Modules"
        description="Click to expand any section. Color-coded notices denote critical life-safety procedures."
        tag={<Badge tone="brand">{SOP_SECTIONS.length} Modules</Badge>}
      >
        <div className="space-y-3">
          {SOP_SECTIONS.map((s, index) => (
            <details
              key={s.id}
              id={`sop-${s.id}`}
              className="group rounded-card border border-charcoal-200 transition-colors open:bg-surface-soft open:border-charcoal-300"
              open={index === 0 ? true : undefined}
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-charcoal-100 text-[11px] font-bold text-charcoal-700">
                      {index + 1}
                    </span>
                    <span className="font-bold text-charcoal-900 text-base">{s.title}</span>
                  </div>
                  <span className="block text-xs text-charcoal-500 mt-1 pl-7">{s.summary}</span>
                </div>
                <span className="text-2xl font-bold leading-none text-charcoal-400 transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>

              <div className="space-y-4 px-5 pb-5 border-t border-charcoal-200/80 pt-4">
                {s.blocks.map((b, i) => (
                  <div
                    key={i}
                    className={
                      b.tone === "error"
                        ? "rounded-card border border-red-200 bg-red-50/80 p-4 shadow-2xs"
                        : b.tone === "warning"
                          ? "rounded-card border border-amber-200 bg-amber-50/80 p-4 shadow-2xs"
                          : "p-1"
                    }
                  >
                    {b.heading ? (
                      <p
                        className={
                          b.tone === "error"
                            ? "mb-2 text-sm font-bold text-red-900"
                            : b.tone === "warning"
                              ? "mb-2 text-sm font-bold text-amber-900"
                              : "mb-2 text-sm font-bold text-charcoal-900"
                        }
                      >
                        {b.heading}
                      </p>
                    ) : null}
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-charcoal-700">
                      {b.points.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </SectionCard>

      {/* Support desk link */}
      <div className="rounded-card border border-charcoal-200 bg-white p-4 text-xs text-charcoal-600 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <span className="flex items-center gap-2">
          <LuLifeBuoy className="h-4 w-4 text-charcoal-500" />
          Have operational questions or need special medical accommodations?
        </span>
        <Link href="/contact" className="font-semibold text-brand-red hover:underline">
          Contact Volunteer Coordination Desk &rarr;
        </Link>
      </div>
    </div>
  );
}
