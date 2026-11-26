"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuCheck, LuSave, LuUserRound } from "react-icons/lu";
import { updatePartnerProfileAction } from "@/app/actions/groupOps";
import type { ApiPartnerDashboard } from "@/lib/api";
import { AccountSecurityPanel } from "@/components/dashboard/AccountSecurityPanel";
import { Button, Checkbox, Field, Notice, TextInput, Textarea } from "@/components/ui";

export function PartnerProfileHub({ initial }: { initial: ApiPartnerDashboard }) {
  const router = useRouter();
  const p = initial.profile;

  const [firstName, setFirstName] = useState(initial.identity.firstName);
  const [lastName, setLastName] = useState(initial.identity.lastName);
  const [phone, setPhone] = useState(initial.identity.phone ?? "");
  const [businessName, setBusinessName] = useState(String(p.brandName ?? p.businessName ?? ""));
  const [brandWebsite, setBrandWebsite] = useState(String(p.brandWebsite ?? ""));
  const [proposalDeliverables, setProposalDeliverables] = useState(String(p.proposalDeliverables ?? ""));
  const [fssaiNumber, setFssaiNumber] = useState(String(p.fssaiNumber ?? ""));
  const [electricPowerRequired, setElectricPowerRequired] = useState(Boolean(p.electricPowerRequired));
  const [location, setLocation] = useState(String(p.location ?? ""));
  const [distanceFromStartLine, setDistanceFromStartLine] = useState(String(p.distanceFromStartLine ?? ""));
  const [inventoryCapacity, setInventoryCapacity] = useState(String(p.inventoryCapacity ?? ""));
  const [discountOffering, setDiscountOffering] = useState(String(p.discountOffering ?? ""));

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await updatePartnerProfileAction({
        firstName,
        lastName,
        phone: phone || undefined,
        businessName,
        brandWebsite: initial.role === "SPONSOR" ? brandWebsite : undefined,
        proposalDeliverables: initial.role === "SPONSOR" ? proposalDeliverables : undefined,
        fssaiNumber: initial.role === "VENDOR" ? fssaiNumber : undefined,
        electricPowerRequired: initial.role === "VENDOR" ? electricPowerRequired : undefined,
        location: initial.role === "TOURISM_PARTNER" ? location : undefined,
        distanceFromStartLine: initial.role === "TOURISM_PARTNER" ? distanceFromStartLine : undefined,
        inventoryCapacity: initial.role === "TOURISM_PARTNER" ? inventoryCapacity : undefined,
        discountOffering: initial.role === "TOURISM_PARTNER" ? discountOffering : undefined,
      });
      if (!res.success) {
        setError(res.error ?? "Failed to update partner profile.");
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
          <h3 className="text-lg font-extrabold text-charcoal-900">Partner &amp; Contact Profile</h3>
        </div>

        {error && <Notice tone="error" className="mb-4">{error}</Notice>}
        {saved && (
          <Notice tone="success" className="mb-4">
            <LuCheck className="mr-1 inline h-4 w-4" /> Profile updated successfully.
          </Notice>
        )}

        <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
          <Field htmlFor="pp-fn" label="Contact First Name" required>
            <TextInput id="pp-fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field htmlFor="pp-ln" label="Contact Last Name" required>
            <TextInput id="pp-ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
          <Field htmlFor="pp-ph" label="Contact Mobile">
            <TextInput id="pp-ph" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field htmlFor="pp-biz" label={initial.role === "SPONSOR" ? "Brand Name" : "Business / Property Name"} required>
            <TextInput id="pp-biz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          </Field>

          {initial.role === "SPONSOR" && (
            <>
              <Field htmlFor="pp-web" label="Brand Website">
                <TextInput id="pp-web" value={brandWebsite} onChange={(e) => setBrandWebsite(e.target.value)} />
              </Field>
              <Field htmlFor="pp-del" label="Deliverables & Notes" className="sm:col-span-2">
                <Textarea id="pp-del" rows={3} value={proposalDeliverables} onChange={(e) => setProposalDeliverables(e.target.value)} />
              </Field>
            </>
          )}

          {initial.role === "VENDOR" && (
            <>
              <Field htmlFor="pp-fssai" label="FSSAI Number (if food)">
                <TextInput id="pp-fssai" value={fssaiNumber} onChange={(e) => setFssaiNumber(e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Checkbox
                  id="pp-pow"
                  checked={electricPowerRequired}
                  onChange={(e) => setElectricPowerRequired(e.target.checked)}
                >
                  Electrical Power Connection Required at Expo Stall
                </Checkbox>
              </div>
            </>
          )}

          {initial.role === "TOURISM_PARTNER" && (
            <>
              <Field htmlFor="pp-loc" label="Location / Address">
                <TextInput id="pp-loc" value={location} onChange={(e) => setLocation(e.target.value)} />
              </Field>
              <Field htmlFor="pp-dist" label="Distance from Start Line">
                <TextInput id="pp-dist" value={distanceFromStartLine} onChange={(e) => setDistanceFromStartLine(e.target.value)} />
              </Field>
              <Field htmlFor="pp-cap" label="Room / Fleet Capacity">
                <TextInput id="pp-cap" value={inventoryCapacity} onChange={(e) => setInventoryCapacity(e.target.value)} />
              </Field>
              <Field htmlFor="pp-disc" label="Runner Discount Offer">
                <TextInput id="pp-disc" value={discountOffering} onChange={(e) => setDiscountOffering(e.target.value)} />
              </Field>
            </>
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
