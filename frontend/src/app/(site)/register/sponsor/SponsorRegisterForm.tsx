"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowRight, LuAward } from "react-icons/lu";
import { AppUser } from "@/lib/auth/session";
import { submitSponsorRegistration } from "@/app/actions/registerGroup";
import { AccountSummary, Button, Field, FormSection, Notice, Select, Textarea, TextInput } from "@/components/ui";

interface SponsorRegisterFormProps {
  user: AppUser;
}

export default function SponsorRegisterForm({ user }: SponsorRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    brandName: "",
    industry: "Sports & Nutrition",
    tierInterest: "Hydration & Energy Partner",
    budgetBand: "₹5 Lakhs - ₹15 Lakhs",
    brandWebsite: "",
    proposalDeliverables: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.brandName.trim()) {
      setError("Please provide the Brand or Organization Name.");
      return;
    }
    if (!formData.industry.trim()) {
      setError("Please specify your industry domain.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSponsorRegistration({
        brandName: formData.brandName.trim(),
        industry: formData.industry.trim(),
        tierInterest: formData.tierInterest.trim(),
        budgetBand: formData.budgetBand.trim(),
        brandWebsite: formData.brandWebsite.trim() || undefined,
        proposalDeliverables: formData.proposalDeliverables.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit sponsorship proposal.");
      }

      router.push("/pending");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}

      <AccountSummary name={user.name} email={user.email} phone={user.phone} title="Brand partnership liaison" />

      <FormSection icon={LuAward} title="Brand proposal and tier interest" description="Share your brand and the kind of partnership you are looking for.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Brand / corporation name" htmlFor="sponsor-brand" required>
            <TextInput
              id="sponsor-brand"
              required
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              placeholder="e.g. Amrit Mineral Waters / Fast&Up"
            />
          </Field>
          <Field label="Industry domain" htmlFor="sponsor-industry" required>
            <Select
              id="sponsor-industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            >
              <option value="Sports & Nutrition">Sports, Energy & Nutrition</option>
              <option value="Beverages & Water">Beverages & Water</option>
              <option value="Footwear & Apparel">Footwear & Apparel</option>
              <option value="Banking & Financial Services">Banking & Financial Services</option>
              <option value="Automobile & Mobility">Automobile & Mobility</option>
              <option value="Healthcare & Diagnostics">Healthcare & Diagnostics</option>
              <option value="Technology & Telecommunications">Technology & Telecommunications</option>
              <option value="Hospitality & Tourism">Hospitality & Tourism</option>
            </Select>
          </Field>
          <Field label="Preferred sponsorship category" htmlFor="sponsor-tier" required>
            <Select
              id="sponsor-tier"
              value={formData.tierInterest}
              onChange={(e) => setFormData({ ...formData, tierInterest: e.target.value })}
            >
              <option value="Title / Presenting Sponsor">Title / Presenting Sponsor</option>
              <option value="Powered By Partner">Powered By Partner</option>
              <option value="Hydration & Energy Partner">Official Hydration & Energy Partner</option>
              <option value="Recovery Zone Partner">Recovery Zone Partner</option>
              <option value="Official Timing Partner">Official Timing & Technology Partner</option>
              <option value="Running Kit / Apparel Partner">Official Kit / Apparel Partner</option>
              <option value="Medical & Safety Partner">Medical & Safety Partner</option>
              <option value="Associate / Supporting Sponsor">Associate / Supporting Sponsor</option>
            </Select>
          </Field>
          <Field label="Indicative budget band" htmlFor="sponsor-budget" required>
            <Select
              id="sponsor-budget"
              value={formData.budgetBand}
              onChange={(e) => setFormData({ ...formData, budgetBand: e.target.value })}
            >
              <option value="₹2 Lakhs - ₹5 Lakhs">₹2 Lakhs - ₹5 Lakhs</option>
              <option value="₹5 Lakhs - ₹15 Lakhs">₹5 Lakhs - ₹15 Lakhs</option>
              <option value="₹15 Lakhs - ₹35 Lakhs">₹15 Lakhs - ₹35 Lakhs</option>
              <option value="₹35 Lakhs - ₹75 Lakhs">₹35 Lakhs - ₹75 Lakhs</option>
              <option value="₹75 Lakhs+ (Title Tier)">₹75 Lakhs+ (Title Tier)</option>
            </Select>
          </Field>
        </div>

        <Field label="Brand website / portfolio URL (optional)" htmlFor="sponsor-website">
          <TextInput
            id="sponsor-website"
            type="url"
            value={formData.brandWebsite}
            onChange={(e) => setFormData({ ...formData, brandWebsite: e.target.value })}
            placeholder="https://yourbrand.com"
          />
        </Field>

        <Field label="Specific deliverables or activation ideas (optional)" htmlFor="sponsor-deliverables">
          <Textarea
            id="sponsor-deliverables"
            rows={3}
            value={formData.proposalDeliverables}
            onChange={(e) => setFormData({ ...formData, proposalDeliverables: e.target.value })}
            placeholder="Describe your brand activation goals (e.g. sampling at the finish line, branding on bibs, experiential recovery booth)."
          />
        </Field>
      </FormSection>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
        {isSubmitting ? "Submitting proposal" : "Submit sponsorship proposal"}
      </Button>
    </form>
  );
}
