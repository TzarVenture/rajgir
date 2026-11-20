import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuUserRound, LuBadgeCheck } from "react-icons/lu";
import type { ApiRunnerRegistration } from "@/lib/api";
import { loadRunnerDashboard } from "@/lib/dashboardData";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { authContext, requireUser } from "@/lib/auth/session";
import { EVENT } from "@/lib/event";
import { Badge, Notice } from "@/components/ui";
import { RunnerProfileHub } from "@/components/dashboard/runner/RunnerProfileHub";

export const metadata = {
  title: "Profile & Account Settings | Rajgir Marathon 2027",
};

export default async function RunnerProfilePage() {
  const user = await requireUser("/dashboard/runner/profile");
  if (user.role !== "RUNNER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadRunnerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Runner" registerHref="/register/runner" />;
  if (load.kind !== "ok") {
    return (
      <Notice tone="error" title="We could not load your profile details">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const r: ApiRunnerRegistration = load.data;
  const limited = load.limited;

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
            <LuUserRound className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Runner Profile & Account Settings</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            View and edit your personal athlete details, update account password, and manage registration preferences.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{r.distance} {r.raceTitle}</Badge>
          <Badge tone="success">
            <LuBadgeCheck className="h-3.5 w-3.5" aria-hidden /> Registered Runner
          </Badge>
        </div>
      </div>

      {limited ? (
        <Notice tone="warning" title="Offline preview mode">
          Some edit capabilities are running in preview mode while backend systems synchronize. Changes will take effect once connectivity is restored.
        </Notice>
      ) : null}

      {/* Main Interactive Hub */}
      <RunnerProfileHub
        initial={{
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          phone: r.phone,
          bibName: r.bibName,
          tshirtSize: r.tshirtSize,
          city: r.city,
          state: r.state,
          pincode: r.pincode,
          country: r.country || "India",
          runningClub: r.runningClub || "",
          registrationNumber: r.registrationNumber,
          distance: r.distance,
          raceTitle: r.raceTitle,
          dateOfBirth: r.dateOfBirth,
          gender: r.gender,
        }}
        readOnly={limited}
      />
    </div>
  );
}
