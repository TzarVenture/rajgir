import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuFootprints, LuTrendingUp, LuCalendar, LuSparkles } from "react-icons/lu";
import type { ApiRunnerRegistration } from "@/lib/api";
import { loadRunnerDashboard } from "@/lib/dashboardData";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { authContext, requireUser } from "@/lib/auth/session";
import { EVENT } from "@/lib/event";
import { trainingPlan } from "@/lib/training";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { TrainingProgression } from "@/components/dashboard/runner/TrainingProgression";

export const metadata = {
  title: "Weekly Training Progression | Rajgir Marathon 2027",
};

export default async function RunnerTrainingPage() {
  const user = await requireUser("/dashboard/runner/training");
  if (user.role !== "RUNNER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadRunnerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Runner" registerHref="/register/runner" />;
  if (load.kind !== "ok") {
    return (
      <Notice tone="error" title="We could not load your training plan">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const r: ApiRunnerRegistration = load.data;
  const plan = trainingPlan(r.distance);
  const peakKm = Math.max(...plan.weeks.map((w) => w.weeklyKm), 0);
  const peakLongRunKm = Math.max(...plan.weeks.map((w) => w.longRunKm), 0);
  const taperWeeks = plan.weeks.filter((w) => w.phase === "Taper" || w.phase === "Race week").length;

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
            <LuFootprints className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Weekly Training Progression</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Periodized endurance build-up, weekend long run milestones, and safe taper schedule designed for the {r.distance}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{r.distance} {r.raceTitle}</Badge>
          <Badge tone="neutral">{plan.totalWeeks} Weeks Periodization</Badge>
        </div>
      </div>

      {/* Plan Telemetry Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold">Total Duration</span>
            <LuCalendar className="h-4 w-4 text-brand-red" />
          </div>
          <p className="mt-2 font-barlow text-2xl font-bold text-charcoal-900">{plan.totalWeeks} Weeks</p>
          <p className="mt-1 text-xs text-charcoal-500">Leading up to race weekend</p>
        </div>

        <div className="rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold">Peak Weekly Volume</span>
            <LuTrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-barlow text-2xl font-bold text-charcoal-900">{peakKm} km</p>
          <p className="mt-1 text-xs text-charcoal-500">Peak endurance loading</p>
        </div>

        <div className="rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold">Longest Long Run</span>
            <LuFootprints className="h-4 w-4 text-brand-red" />
          </div>
          <p className="mt-2 font-barlow text-2xl font-bold text-charcoal-900">{peakLongRunKm} km</p>
          <p className="mt-1 text-xs text-charcoal-500">Key physiological test</p>
        </div>

        <div className="rounded-card border border-charcoal-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-charcoal-500">
            <span className="text-xs font-semibold">Taper Period</span>
            <LuSparkles className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 font-barlow text-2xl font-bold text-charcoal-900">{taperWeeks} Weeks</p>
          <p className="mt-1 text-xs text-charcoal-500">Glycogen & muscle restoration</p>
        </div>
      </div>

      {/* Main Progression Chart & Week-by-Week Table */}
      <SectionCard
        title="Interactive Mileage Progression"
        description={`Suggested weekly mileage ramp calculated backwards from race morning in Rajgir.`}
        tag={<Badge tone="neutral">{plan.weeks.length} Cycles</Badge>}
      >
        <TrainingProgression plan={plan} distance={r.distance} />
      </SectionCard>
    </div>
  );
}
