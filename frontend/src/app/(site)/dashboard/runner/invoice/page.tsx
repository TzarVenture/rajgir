import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuReceipt, LuAward, LuBadgeCheck } from "react-icons/lu";
import type { ApiRunnerRegistration } from "@/lib/api";
import { loadRunnerDashboard } from "@/lib/dashboardData";
import { RegistrationMissing } from "@/components/dashboard/ActionItems";
import { authContext, requireUser } from "@/lib/auth/session";
import {
  EVENT,
  TAX,
  ageCategory,
  ageOnRaceDay,
  categoryOps,
  formatDate,
  formatINR,
  nowMs,
  startDateTime,
} from "@/lib/event";
import { gstBreakdown, computeCertificate } from "@/lib/runnerDashboardHelpers";
import { Badge, Notice } from "@/components/ui";
import { SectionCard } from "@/components/dashboard/DashboardParts";
import { CertificateModal } from "@/components/dashboard/CertificateModal";
import { PrintSectionButton } from "@/components/dashboard/PrintSectionButton";

export const metadata = {
  title: "Registration Invoice & Finisher Certificate | Rajgir Marathon 2027",
};

export default async function RunnerInvoicePage() {
  const user = await requireUser("/dashboard/runner/invoice");
  if (user.role !== "RUNNER") redirect("/dashboard");

  const ctx = await authContext();
  const load = ctx
    ? await loadRunnerDashboard(ctx)
    : ({ kind: "error", message: "Your session has expired. Please sign in again." } as const);

  if (load.kind === "not-registered") return <RegistrationMissing roleLabel="Runner" registerHref="/register/runner" />;
  if (load.kind !== "ok") {
    return (
      <Notice tone="error" title="We could not load your invoice details">
        {load.kind === "error" ? load.message : "This account holds a different registration."} If this keeps happening, contact{" "}
        {EVENT.contacts.helpEmail}.
      </Notice>
    );
  }

  const r: ApiRunnerRegistration = load.data;
  const ops = categoryOps(r.distance);
  const fullName = `${r.firstName} ${r.lastName}`.trim();
  const age = ageOnRaceDay(r.dateOfBirth);
  const ageGroup = r.result?.ageCategory ?? ageCategory(r.gender, age, r.distance);
  const startIso = startDateTime(r.distance);
  const raceOver = nowMs() > new Date(startIso).getTime() + ops.cutoffMinutes * 60_000;

  const addons = Array.isArray(r.selectedAddons) ? r.selectedAddons : [];
  const discount = r.discountAmount ?? 0;
  const gst = gstBreakdown(r.netAmount, r.state);
  const isTaxInvoice = Boolean(TAX.organizerGstin);

  const { certificate, lockedReason } = computeCertificate(r, fullName, ageGroup, ops, raceOver);

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
            <LuReceipt className="h-7 w-7 text-brand-red" aria-hidden />
            <span>Registration Invoice & Finisher Certificate</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600">
            Official GST tax invoice receipt, fee breakdown, and verified finisher certificate of accomplishment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <PrintSectionButton targetId="runner-invoice-card" title={`Invoice ${r.registrationNumber}`} label="Print Tax Invoice" />
        </div>
      </div>

      {/* Main Grid: GST Invoice & Finisher Certificate */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: GST Invoice Breakdown */}
        <SectionCard
          title={isTaxInvoice ? "Registration & GST Tax Invoice" : "Official Payment Receipt"}
          tag={
            <Badge tone="success">
              <LuBadgeCheck className="h-3.5 w-3.5" aria-hidden /> Payment Confirmed
            </Badge>
          }
        >
          <div id="runner-invoice-card" className="space-y-4 text-sm">
            <div className="flex flex-wrap justify-between gap-3 border-b border-charcoal-200 pb-3">
              <div>
                <p className="font-bold text-charcoal-900">{TAX.organizerLegalName}</p>
                <p className="text-xs text-charcoal-500">
                  {EVENT.city}, Bihar
                  {isTaxInvoice ? ` | GSTIN ${TAX.organizerGstin}` : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-charcoal-500">{isTaxInvoice ? "Invoice no." : "Receipt no."}</p>
                <p className="font-mono font-bold text-charcoal-900">{r.registrationNumber}</p>
                <p className="text-xs text-charcoal-500">{formatDate(r.createdAt)}</p>
              </div>
            </div>

            <p className="text-xs text-charcoal-600">
              Billed to: <strong className="text-charcoal-900">{fullName}</strong> ({r.city}, {r.state} {r.pincode}) | Place of supply: <strong>{r.state}</strong>
            </p>

            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-charcoal-200 text-xs text-charcoal-500">
                <tr>
                  <th className="py-2 font-semibold">Item Description{TAX.sacCode ? ` (SAC ${TAX.sacCode})` : ""}</th>
                  <th className="py-2 text-right font-semibold">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-200">
                <tr>
                  <td className="py-2 font-medium">Race entry: {r.distance} {r.raceTitle}</td>
                  <td className="py-2 text-right tabular-nums">{formatINR(r.baseFee)}</td>
                </tr>
                {addons.map((a) => (
                  <tr key={a.id}>
                    <td className="py-2">{a.title}</td>
                    <td className="py-2 text-right tabular-nums">{formatINR(a.price)}</td>
                  </tr>
                ))}
                {discount > 0 ? (
                  <tr>
                    <td className="py-2 text-emerald-700 font-medium">Discount{r.couponCode ? ` (${r.couponCode})` : ""}</td>
                    <td className="py-2 text-right tabular-nums text-emerald-700 font-semibold">-{formatINR(discount)}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            <dl className="space-y-1.5 rounded-card border border-charcoal-200 bg-surface-soft p-3 text-xs sm:text-sm">
              <div className="flex justify-between">
                <dt className="text-charcoal-600">Taxable value</dt>
                <dd className="tabular-nums font-semibold">{formatINR(gst.taxable, 2)}</dd>
              </div>
              {gst.lines.map((l) => (
                <div key={l.label} className="flex justify-between">
                  <dt className="text-charcoal-600">{l.label}</dt>
                  <dd className="tabular-nums">{formatINR(l.amount, 2)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-charcoal-200 pt-1.5 text-base font-bold text-charcoal-900">
                <dt>Total (incl. GST)</dt>
                <dd className="tabular-nums">{formatINR(r.netAmount, 2)}</dd>
              </div>
            </dl>

            <p className="flex items-center gap-1.5 text-xs text-charcoal-500">
              <LuReceipt className="h-4 w-4 shrink-0 text-charcoal-500" aria-hidden />
              <span>
                Status: {String(r.paymentStatus ?? "confirmed").toLowerCase()}. Prices include GST at {TAX.gstRatePercent}%.
                {isTaxInvoice ? "" : " An official GST tax invoice will be issued once the organizer's GSTIN is updated on the portal."}
              </span>
            </p>
          </div>
        </SectionCard>

        {/* Right: Finisher / Participation Certificate */}
        <SectionCard
          title={ops.timed ? "Verified Finisher Certificate" : "Participation Certificate"}
          description="Official electronic certificate verifiable via QR security hash."
          tag={certificate ? <Badge tone="success">Ready to Download</Badge> : <Badge tone="neutral">Locked</Badge>}
        >
          <div className="space-y-4">
            <div className="rounded-card border border-charcoal-200 bg-surface-soft p-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-red-light text-brand-red-dark">
                <LuAward className="h-8 w-8" aria-hidden />
              </div>
              <h3 className="mt-3 font-barlow text-lg font-bold text-charcoal-900">
                {ops.timed ? "Official Timed Finisher Certificate" : "Official Participation Certificate"}
              </h3>
              <p className="mt-1 text-xs text-charcoal-600">
                {certificate
                  ? "Your official certificate has been issued and is ready for high-resolution print or export."
                  : lockedReason}
              </p>
            </div>

            <CertificateModal
              certificate={certificate}
              lockedReason={lockedReason}
              buttonLabel="View & Print Official Certificate"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
