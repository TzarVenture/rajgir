import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuShieldAlert, LuHeartPulse, LuPhoneCall, LuAmbulance } from "react-icons/lu";
import type { ApiRunnerRegistration } from "@/lib/api";
import { loadRunnerDashboard } from "@/lib/dashboardData";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { authContext, requireUser } from "@/lib/auth/session";
import { EVENT, formatDateTime } from "@/lib/event";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { MedicalProfile } from "@/components/dashboard/runner/MedicalProfile";

export const metadata = {
  title: "Medical & Emergency Profile | Rajgir Marathon 2027",
};

export default async function RunnerMedicalPage() {
  const user = await requireUser("/dashboard/runner/medical");
  if (user.role !== "RUNNER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadRunnerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Runner" registerHref="/register/runner" />;
  if (load.kind !== "ok") {
    return (
      <Notice tone="error" title="We could not load your medical profile">
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
            <LuShieldAlert className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Medical & Emergency Safety Profile</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Vital athletic safety profile utilized by race-day medics, on-course ambulance dispatchers, and triage stations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">
            <LuHeartPulse className="h-3 w-3" aria-hidden /> On-Course Medical Desk
          </Badge>
        </div>
      </div>

      {limited ? (
        <Notice tone="warning" title="Read-only mode active">
          Editing your medical details is temporarily paused while race servers synchronize. For urgent changes, contact {EVENT.contacts.helpEmail}.
        </Notice>
      ) : null}

      {/* Medical Safety Advisory */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-start gap-3 rounded-card border border-brand-red/20 bg-brand-red/5 p-4">
          <LuHeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" aria-hidden />
          <div className="text-xs">
            <p className="font-semibold text-charcoal-900">Blood Group Accuracy</p>
            <p className="mt-0.5 text-charcoal-600">
              Crucial for emergency blood bank matching during acute trauma or severe dehydration.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-card border border-blue-200 bg-blue-50/50 p-4">
          <LuPhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden />
          <div className="text-xs">
            <p className="font-semibold text-charcoal-900">Reachable Contact</p>
            <p className="mt-0.5 text-charcoal-600">
              Provide a guardian, spouse, or friend who will be answering calls throughout race morning.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-card border border-emerald-200 bg-emerald-50/50 p-4">
          <LuAmbulance className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
          <div className="text-xs">
            <p className="font-semibold text-charcoal-900">Medical Notes & Allergies</p>
            <p className="mt-0.5 text-charcoal-600">
              Note any medications (e.g., insulin, inhaler), cardiac history, or known drug allergies.
            </p>
          </div>
        </div>
      </div>

      {/* In-Place Editable Medical Profile Form */}
      <SectionCard
        title="Editable Medical & Emergency Information"
        description="Verify and edit your safety details in real-time. Any updates update your digital bib pass QR and the paramedic dispatch registry immediately."
        tag={
          r.medicalUpdatedAt ? (
            <Badge tone="success">Verified {formatDateTime(r.medicalUpdatedAt)}</Badge>
          ) : (
            <Badge tone="warning">Action Recommended</Badge>
          )
        }
      >
        <MedicalProfile
          initial={{
            emergencyName: r.emergencyName,
            emergencyRelation: r.emergencyRelation,
            emergencyPhone: r.emergencyPhone,
            bloodGroup: r.bloodGroup as "A+",
            medicalNotes: r.medicalNotes ?? "",
          }}
          updatedAtLabel={r.medicalUpdatedAt ? formatDateTime(r.medicalUpdatedAt) : null}
          readOnly={limited}
        />
      </SectionCard>
    </div>
  );
}
