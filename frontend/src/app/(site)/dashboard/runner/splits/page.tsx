import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuTimer, LuFlag } from "react-icons/lu";
import type { ApiRunnerRegistration } from "@/lib/api";
import { loadRunnerDashboard } from "@/lib/dashboardData";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { authContext, requireUser } from "@/lib/auth/session";
import { raceCategories } from "@/lib/schemas/runnerRegistration";
import {
  EVENT,
  ageCategory,
  ageOnRaceDay,
  categoryOps,
  formatClock,
  formatCutoff,
  formatDate,
  formatDuration,
  formatPace,
  startDateTime,
} from "@/lib/event";
import { hhmmToSeconds, addMinutes } from "@/lib/runnerDashboardHelpers";
import { Badge, Notice } from "@/components/ui";
import { DetailList, SectionCard } from "@/components/dashboard/DashboardParts";
import { RaceCountdown } from "@/components/dashboard/runner/RaceCountdown";
import { SplitsMatrix } from "@/components/dashboard/runner/SplitsMatrix";

export const metadata = {
  title: "Race Day & Checkpoint Splits | Rajgir Marathon 2027",
};

export default async function RunnerSplitsPage() {
  const user = await requireUser("/dashboard/runner/splits");
  if (user.role !== "RUNNER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadRunnerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Runner" registerHref="/register/runner" />;
  if (load.kind !== "ok") {
    return (
      <Notice tone="error" title="We could not load your race data">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const r: ApiRunnerRegistration = load.data;
  const ops = categoryOps(r.distance);
  const category = raceCategories.find((c) => c.distance === r.distance);
  const age = ageOnRaceDay(r.dateOfBirth);
  const ageGroup = r.result?.ageCategory ?? ageCategory(r.gender, age, r.distance);
  const startIso = startDateTime(r.distance);
  const startLabel = formatClock(ops.startTime);
  const targetSeconds = ops.timed ? hhmmToSeconds(r.estimatedFinishTime) : null;

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
            <LuTimer className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Race Day & Checkpoint Splits</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Live gun countdown, timing parameters, course elevation specifications, and RFID split timing matrix.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{r.distance} {r.raceTitle}</Badge>
          <Badge tone={ops.timed ? "info" : "neutral"}>{ops.timed ? "RFID Chip Timed" : "Open Fun Run"}</Badge>
        </div>
      </div>

      {/* Countdown & Course Specifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Live Race Countdown"
          description={`Official gun time for the ${r.distance} ${r.raceTitle}`}
          tag={<Badge tone="brand">{formatDate(EVENT.raceDate)}</Badge>}
        >
          <RaceCountdown
            startIso={startIso}
            cutoffMinutes={ops.cutoffMinutes}
            startLabel={startLabel}
            dateLabel={formatDate(EVENT.raceDate, { weekday: "long" })}
          />
        </SectionCard>

        <SectionCard
          title="Course & Timing Specifications"
          tag={<Badge tone={ops.timed ? "info" : "neutral"}>{category?.badge ?? (ops.timed ? "Timed" : "Non-timed")}</Badge>}
        >
          <DetailList
            rows={[
              { label: "Category", value: `${r.distance} ${r.raceTitle}` },
              {
                label: "Timing Tech",
                value: ops.timed
                  ? `RFID timing mat at ${ops.checkpoints.map((c) => c.label).join(", ")}`
                  : "Open fun run (mass finish, non-timed)",
              },
              { label: "Age Category", value: ageGroup },
              {
                label: "Gun Time / Cut-off",
                value: `${startLabel} (Course Cut-off: ${formatCutoff(ops.cutoffMinutes)} - ${formatClock(
                  addMinutes(ops.startTime, ops.cutoffMinutes)
                )})`,
              },
              {
                label: "Target Finish Pace",
                value: targetSeconds
                  ? `${formatDuration(targetSeconds)} (${formatPace(targetSeconds, ops.distanceKm)})`
                  : ops.timed
                  ? "Pace band based on course limit"
                  : "Participatory pace",
              },
              { label: "Elevation & Route", value: category?.elevation ?? "Historic Rajgir circuit" },
              { label: "Start / Finish Line", value: EVENT.startFinish },
            ]}
          />
        </SectionCard>
      </div>

      {/* RFID Splits Matrix */}
      <SectionCard
        title="Race Day & Checkpoint Splits Matrix"
        description="Detailed checkpoint split times with cumulative timing and pace per kilometer at each RFID timing mat."
        tag={
          r.result ? (
            <Badge tone="success">Official Result Published</Badge>
          ) : (
            <Badge tone="neutral">Target Pace Band</Badge>
          )
        }
      >
        <SplitsMatrix ops={ops} result={r.result} targetSeconds={targetSeconds} />
      </SectionCard>
    </div>
  );
}
