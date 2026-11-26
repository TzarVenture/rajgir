"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowRight, LuBuilding2 } from "react-icons/lu";
import { submitCorporateRegistration } from "@/app/actions/registerGroup";
import {
  AccountSummary,
  Button,
  Field,
  FormSection,
  Notice,
  Select,
  Textarea,
  TextInput,
} from "@/components/ui";
import { AppUser } from "@/lib/auth/session";


interface CorporateRegisterFormProps {
  user: AppUser;
}

export default function CorporateRegisterForm({ user }: CorporateRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    gstin: "",
    officialEmailDomain: user.email.includes("@") ? user.email.split("@")[1] : "",
    designation: "",
    estimatedPasses: 25,
    csrFocus: "Employee Health & Wellness",
    billingAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.companyName.trim()) {
      setError("Please provide your company or corporate entity name.");
      return;
    }
    if (!formData.designation.trim()) {
      setError("Please specify your professional designation (e.g. HR Director, CSR Lead).");
      return;
    }
    if (!formData.officialEmailDomain.trim()) {
      setError("Please enter your official corporate email domain.");
      return;
    }
    if (formData.estimatedPasses < 5) {
      setError("Corporate packages require a minimum delegation of 5 passes.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCorporateRegistration({
        companyName: formData.companyName.trim(),
        gstin: formData.gstin.trim() || undefined,
        officialEmailDomain: formData.officialEmailDomain.trim(),
        designation: formData.designation.trim(),
        estimatedPasses: Number(formData.estimatedPasses),
        csrFocus: formData.csrFocus.trim() || undefined,
        billingAddress: formData.billingAddress.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit corporate registration.");
      }

      // Vetted B2B track -> route to pending review confirmation
      router.push("/pending");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}

      <AccountSummary name={user.name} email={user.email} phone={user.phone} title="Corporate representative account" />

      <FormSection icon={LuBuilding2} title="Company and package details" description="Details used for bulk passes and GST invoicing.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company or organization name" htmlFor="corp-company" required>
            <TextInput
              id="corp-company"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Tata Steel / Infosys / NTPC"
            />
          </Field>
          <Field label="Official designation" htmlFor="corp-designation" required>
            <TextInput
              id="corp-designation"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. HR Director, CSR Lead"
            />
          </Field>
          <Field
            label="Corporate email domain"
            htmlFor="corp-domain"
            hint="Domain used to verify employee corporate passes."
            required
          >
            <TextInput
              id="corp-domain"
              required
              value={formData.officialEmailDomain}
              onChange={(e) => setFormData({ ...formData, officialEmailDomain: e.target.value })}
              placeholder="e.g. tatasteel.com"
            />
          </Field>
          <Field label="Estimated delegation passes" htmlFor="corp-passes" hint="Minimum 5, maximum 50 passes initially (you can appeal to Admin for 50+ later)." required>
            <TextInput
              id="corp-passes"
              type="number"
              inputMode="numeric"
              min={5}
              max={50}
              required
              value={formData.estimatedPasses}
              onChange={(e) => setFormData({ ...formData, estimatedPasses: Math.min(50, parseInt(e.target.value) || 5) })}
            />
          </Field>
          <Field label="GSTIN or tax ID (optional)" htmlFor="corp-gstin" hint="Needed for a GST invoice.">
            <TextInput
              id="corp-gstin"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
              placeholder="e.g. 10AAACT2727Q1ZB"
            />
          </Field>
          <Field label="CSR or initiative focus" htmlFor="corp-csr">
            <Select
              id="corp-csr"
              value={formData.csrFocus}
              onChange={(e) => setFormData({ ...formData, csrFocus: e.target.value })}
            >
              <option value="Employee Health & Wellness">Employee Health & Wellness</option>
              <option value="CSR Youth Fitness Support">CSR Youth Fitness Support</option>
              <option value="Brand Marathon Sponsorship">Brand Marathon Sponsorship</option>
              <option value="Environmental Awareness">Environmental Awareness</option>
            </Select>
          </Field>
        </div>
        <Field label="Official billing address (optional)" htmlFor="corp-billing">
          <Textarea
            id="corp-billing"
            rows={3}
            value={formData.billingAddress}
            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
            placeholder="Full registered company address for B2B invoice generation"
          />
        </Field>
      </FormSection>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
        {isSubmitting ? "Submitting application" : "Submit corporate delegation proposal"}
      </Button>
    </form>
  );
}
