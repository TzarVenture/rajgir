"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuCheck, LuSave, LuUserRound } from "react-icons/lu";
import { updateGroupProfileAction } from "@/app/actions/groupOps";
import type { ApiGroupDashboard } from "@/lib/api";
import { AccountSecurityPanel } from "@/components/dashboard/AccountSecurityPanel";
import { Button, Field, Notice, TextInput, Textarea } from "@/components/ui";

export function GroupProfileHub({ initial }: { initial: ApiGroupDashboard }) {
  const router = useRouter();
  const p = initial.profile;

  const [firstName, setFirstName] = useState(initial.identity.firstName);
  const [lastName, setLastName] = useState(initial.identity.lastName);
  const [phone, setPhone] = useState(initial.identity.phone ?? "");
  const [organizationName, setOrganizationName] = useState(
    String(p.teamName ?? p.companyName ?? p.schoolName ?? "")
  );
  const [city, setCity] = useState(String(p.city ?? ""));
  const [notes, setNotes] = useState(String(p.notes ?? p.csrFocus ?? ""));
  const [gstin, setGstin] = useState(String(p.gstin ?? ""));
  const [billingAddress, setBillingAddress] = useState(String(p.billingAddress ?? ""));
  const [teacherInCharge, setTeacherInCharge] = useState(String(p.teacherInCharge ?? ""));
  const [teacherDesignation, setTeacherDesignation] = useState(String(p.teacherDesignation ?? ""));

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await updateGroupProfileAction({
        firstName,
        lastName,
        phone: phone || undefined,
        organizationName,
        city: city || undefined,
        notes: notes || undefined,
        gstin: initial.role === "CORPORATE_MANAGER" ? gstin : undefined,
        billingAddress: initial.role === "CORPORATE_MANAGER" ? billingAddress : undefined,
        teacherInCharge: initial.role === "SCHOOL_COORDINATOR" ? teacherInCharge : undefined,
        teacherDesignation: initial.role === "SCHOOL_COORDINATOR" ? teacherDesignation : undefined,
      });
      if (!res.success) {
        setError(res.error ?? "Failed to update profile.");
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <LuUserRound className="h-5 w-5 text-brand-red" aria-hidden />
          <h3 className="text-lg font-extrabold text-charcoal-900">Coordinator &amp; Organization Profile</h3>
        </div>

        {error && <Notice tone="error" className="mb-4">{error}</Notice>}
        {saved && (
          <Notice tone="success" className="mb-4">
            <LuCheck className="mr-1 inline h-4 w-4" /> Profile saved successfully.
          </Notice>
        )}

        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <Field htmlFor="gp-fn" label="Coordinator First Name" required>
            <TextInput id="gp-fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field htmlFor="gp-ln" label="Coordinator Last Name" required>
            <TextInput id="gp-ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
          <Field htmlFor="gp-ph" label="Coordinator Mobile">
            <TextInput id="gp-ph" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field
            htmlFor="gp-org"
            label={
              initial.role === "TEAM_CAPTAIN"
                ? "Team / Running Club Name"
                : initial.role === "CORPORATE_MANAGER"
                  ? "Company Name"
                  : "School / College Name"
            }
            required
          >
            <TextInput id="gp-org" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
          </Field>

          {initial.role !== "CORPORATE_MANAGER" && (
            <Field htmlFor="gp-city" label="City">
              <TextInput id="gp-city" value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
          )}

          {initial.role === "CORPORATE_MANAGER" && (
            <>
              <Field htmlFor="gp-gst" label="GSTIN">
                <TextInput id="gp-gst" value={gstin} onChange={(e) => setGstin(e.target.value)} />
              </Field>
              <Field htmlFor="gp-bill" label="Billing Address" className="sm:col-span-2">
                <Textarea id="gp-bill" rows={2} value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
              </Field>
            </>
          )}

          {initial.role === "SCHOOL_COORDINATOR" && (
            <>
              <Field htmlFor="gp-tic" label="Teacher In-Charge">
                <TextInput id="gp-tic" value={teacherInCharge} onChange={(e) => setTeacherInCharge(e.target.value)} />
              </Field>
              <Field htmlFor="gp-tdes" label="Teacher Designation">
                <TextInput id="gp-tdes" value={teacherDesignation} onChange={(e) => setTeacherDesignation(e.target.value)} />
              </Field>
            </>
          )}

          {initial.role !== "SCHOOL_COORDINATOR" && (
            <Field htmlFor="gp-notes" label={initial.role === "CORPORATE_MANAGER" ? "CSR Focus" : "Team Notes"} className="sm:col-span-2">
              <Textarea id="gp-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          )}

          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" variant="primary" icon={LuSave} disabled={pending}>
              {pending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </section>

      <AccountSecurityPanel email={initial.identity.email} />
    </div>
  );
}
