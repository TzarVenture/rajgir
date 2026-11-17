"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowRight, LuStore } from "react-icons/lu";
import { AppUser } from "@/lib/auth/session";
import { submitVendorRegistration } from "@/app/actions/registerGroup";
import { AccountSummary, Button, Checkbox, Field, FormSection, Notice, Select, TextInput } from "@/components/ui";

interface VendorRegisterFormProps {
  user: AppUser;
}

export default function VendorRegisterForm({ user }: VendorRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    stallCategory: "Running Apparel & Shoes",
    stallSize: "Standard Expo Stall (3x3m)",
    fssaiNumber: "",
    electricPowerRequired: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.businessName.trim()) {
      setError("Please provide your business or trade name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitVendorRegistration({
        businessName: formData.businessName.trim(),
        stallCategory: formData.stallCategory.trim(),
        stallSize: formData.stallSize.trim(),
        fssaiNumber: formData.fssaiNumber.trim() || undefined,
        electricPowerRequired: formData.electricPowerRequired,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit vendor application.");
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

      <AccountSummary name={user.name} email={user.email} phone={user.phone} title="Vendor proprietor" />

      <FormSection icon={LuStore} title="Expo stall preferences" description="Tell us what you sell and the space you need.">
        <Field label="Business / store / brand name" htmlFor="vendor-business" required>
          <TextInput
            id="vendor-business"
            required
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            placeholder="e.g. Magadh Sports Wear & Nutrition"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Stall / merchandise category" htmlFor="vendor-category" required>
            <Select
              id="vendor-category"
              value={formData.stallCategory}
              onChange={(e) => setFormData({ ...formData, stallCategory: e.target.value })}
            >
              <option value="Running Apparel & Shoes">Running Apparel & Footwear</option>
              <option value="Sports Nutrition & Energy">Sports Nutrition, Hydration & Bars</option>
              <option value="Healthy Food & Refreshments">Healthy Food, Salads & Drinks</option>
              <option value="Sports Tech & Wearables">Sports Tech, GPS Watches & Audio</option>
              <option value="Bihar Handicrafts & Souvenirs">Local Heritage, Silk & Handicrafts</option>
              <option value="Physiotherapy & Recovery">Physiotherapy, Massage & Taping</option>
            </Select>
          </Field>
          <Field label="Stall footprint size" htmlFor="vendor-size" required>
            <Select
              id="vendor-size"
              value={formData.stallSize}
              onChange={(e) => setFormData({ ...formData, stallSize: e.target.value })}
            >
              <option value="Standard Expo Stall (3x3m)">Standard Expo Stall (3m x 3m)</option>
              <option value="Double Premium Stall (6x3m)">Double Premium Stall (6m x 3m)</option>
              <option value="Outdoor Food Kiosk Space">Outdoor Food Kiosk / Truck Bay</option>
            </Select>
          </Field>
        </div>

        <Field
          label="FSSAI registration / food license no."
          htmlFor="vendor-fssai"
          hint="Needed only if you are serving food or supplements."
        >
          <TextInput
            id="vendor-fssai"
            value={formData.fssaiNumber}
            onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
            placeholder="e.g. 10014022002727"
          />
        </Field>

        <div className="rounded-card bg-surface-soft p-4">
          <Checkbox
            checked={formData.electricPowerRequired}
            onChange={(e) => setFormData({ ...formData, electricPowerRequired: e.target.checked })}
          >
            Dedicated 15A electrical power connection required at stall
          </Checkbox>
        </div>
      </FormSection>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
        {isSubmitting ? "Submitting application" : "Apply for expo stall"}
      </Button>
    </form>
  );
}
