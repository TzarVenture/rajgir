import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuCircleCheck, LuIdCard, LuPackage } from "react-icons/lu";
import type { ApiRunnerRegistration } from "@/lib/api";
import { loadRunnerDashboard } from "@/lib/dashboardData";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { authContext, requireUser } from "@/lib/auth/session";
import { raceCategories } from "@/lib/schemas/runnerRegistration";
import {
  EVENT,
  categoryOps,
  formatClock,
  formatDate,
  formatDateTime,
} from "@/lib/event";
import { qrDataUrl, runnerQrPayload } from "@/lib/qr";
import { Badge, Notice } from "@/components/ui";
import { DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { BibFlipCard } from "@/components/dashboard/runner/BibFlipCard";
import { PrintSectionButton } from "@/components/dashboard/PrintSectionButton";

export const metadata = {
  title: "Digital Bib Pass & Kit Pickup | Rajgir Marathon 2027",
};

export default async function RunnerBibPage() {
  const user = await requireUser("/dashboard/runner/bib");
  if (user.role !== "RUNNER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadRunnerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Runner" registerHref="/register/runner" />;
  if (load.kind !== "ok") {
    return (
      <Notice tone="error" title="We could not load your bib pass">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const r: ApiRunnerRegistration = load.data;
  const ops = categoryOps(r.distance);
  const category = raceCategories.find((c) => c.distance === r.distance);
  const fullName = `${r.firstName} ${r.lastName}`.trim();
  const startLabel = formatClock(ops.startTime);
  const qr = await qrDataUrl(runnerQrPayload(r.registrationNumber, r.qrCodeToken));
  const addons = Array.isArray(r.selectedAddons) ? r.selectedAddons : [];
  const hasHoodie = addons.some((a) => a.id === "hoodie");

  const kitItems = [
    r.bibNumber ? `Race bib #${r.bibNumber}${ops.timed ? " with RFID timing chip" : ""}` : `Race bib${ops.timed ? " with RFID timing chip" : ""}`,
    `${category?.inclusions.find((i) => /tee|jersey|t-shirt/i.test(i)) ?? "Event T-shirt"} (size ${r.tshirtSize})`,
    ...(hasHoodie ? ["Finisher hoodie (add-on)"] : []),
    "Safety pins, official route map and race-day guide",
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-charcoal-200 pb-5">
        <div>
          <Link
            href="/dashboard/runner"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-brand-red transition-colors mb-2"
          >
            <LuArrowLeft className="h-3.5 w-3.5" aria-hidden />
            <span>Back to Overview Hub</span>
          </Link>
          <h1 className="font-barlow text-2xl sm:text-3xl font-bold text-charcoal-900 flex items-center gap-2.5">
            <LuIdCard className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Digital Bib Pass & Kit Pickup</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Interactive 3D digital race pass with verified QR code, bib allotment telemetry, and expo kit collection instructions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <PrintSectionButton targetId="bib-card-container" title={`Race Pass ${r.registrationNumber}`} label="Print Bib Pass" />
        </div>
      </div>

      {/* Main Grid: Digital Bib Card & Kit Pickup Guide */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: 3D Flip Bib Pass */}
        <SectionCard
          title="Digital Interactive BIB Pass"
          description="Click 'Flip Pass' to inspect front and back view with verified QR token for expo kit collection."
          tag={<Badge tone="brand">{r.distance} {r.raceTitle}</Badge>}
        >
          <div id="bib-card-container" className="pt-2">
            <BibFlipCard
              data={{
                eventName: EVENT.name,
                registrationNumber: r.registrationNumber,
                bibNumber: r.bibNumber,
                bibName: r.bibName,
                distance: r.distance,
                raceTitle: r.raceTitle,
                startWave: r.startWave,
                startLabel,
                timed: ops.timed,
                color: ops.bibColor,
                ink: ops.bibInk,
                qrDataUrl: qr,
                fullName,
                bloodGroup: r.bloodGroup,
                emergencyName: r.emergencyName,
                emergencyRelation: r.emergencyRelation,
                emergencyPhone: r.emergencyPhone,
                hasMedicalNotes: Boolean(r.medicalNotes),
              }}
            />
          </div>
        </SectionCard>

        {/* Right: Kit & Bib Pickup Guide */}
        <SectionCard
          title="Kit & Bib Pickup Guide"
          tag={
            r.kitCollectedAt ? (
              <Badge tone="success">
                <LuCircleCheck className="h-3 w-3" aria-hidden /> Collected
              </Badge>
            ) : (
              <Badge tone="warning">Pickup Pending</Badge>
            )
          }
        >
          <div className="space-y-4 text-sm text-charcoal-700">
            {r.kitCollectedAt ? (
              <Notice tone="success" title="Kit collected">
                Collected {formatDateTime(r.kitCollectedAt)}
                {r.kitCollectedBy && r.kitCollectedBy !== "SELF" ? ` by ${r.kitCollectedBy} (authorised proxy)` : ""}.
              </Notice>
            ) : (
              <Notice tone="info" title="Mandatory In-Person Pickup">
                Collect your race kit at the Marathon Expo before race day. <strong>There is strictly no kit distribution on race morning.</strong>
              </Notice>
            )}

            <DetailList
              rows={[
                { label: "Expo Venue", value: EVENT.expo.venue },
                ...EVENT.expo.days.map((d) => ({
                  label: formatDate(d.date, { weekday: "short", day: "numeric", month: "short" }),
                  value: d.hours,
                })),
                {
                  label: "Bib Allotment",
                  value: r.bibNumber ? (
                    <span className="font-mono font-bold text-brand-red">#{r.bibNumber}</span>
                  ) : (
                    "Assigned before expo opens"
                  ),
                },
                {
                  label: "Start Wave",
                  value: r.startWave ?? (ops.timed ? "To be announced" : "Open Fun Run"),
                },
              ]}
            />

            <div>
              <p className="mb-2 font-semibold text-charcoal-900">Mandatory Documents to Bring</p>
              <ul className="list-disc space-y-1.5 pl-5 text-charcoal-600">
                <li>This Digital Bib Pass with QR code (on your phone screen or printed copy)</li>
                <li>Original Government Photo ID (Aadhaar, Passport, Driving Licence, or Voter ID)</li>
                <li>
                  <span className="font-medium text-charcoal-800">Collecting on behalf of another runner:</span> Signed authorisation letter, copy of their photo ID, and your original photo ID.
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-2 font-semibold text-charcoal-900">Your Race Kit Contains</p>
              <ul className="space-y-1.5">
                {kitItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-charcoal-700">
                    <LuPackage className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
