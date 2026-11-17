"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowRight, LuHotel } from "react-icons/lu";
import { AppUser } from "@/lib/auth/session";
import { submitTourismRegistration } from "@/app/actions/registerGroup";
import { AccountSummary, Button, Field, FormSection, Notice, Select, TextInput } from "@/components/ui";

interface TourismRegisterFormProps {
  user: AppUser;
}

export default function TourismRegisterForm({ user }: TourismRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessName: "",
    serviceType: "Hotel / Resort",
    location: "",
    distanceFromStartLine: "Under 2 KM",
    inventoryCapacity: "30 Deluxe Rooms",
    discountOffering: "15% Discount on accommodation + 5:00 AM runner breakfast",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.businessName.trim()) {
      setError("Please provide your hotel, resort, or tourism business name.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Please provide the address or landmark in Rajgir.");
      return;
    }
    if (!formData.inventoryCapacity.trim()) {
      setError("Please specify your inventory or passenger capacity.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitTourismRegistration({
        businessName: formData.businessName.trim(),
        serviceType: formData.serviceType.trim(),
        location: formData.location.trim(),
        distanceFromStartLine: formData.distanceFromStartLine.trim() || undefined,
        inventoryCapacity: formData.inventoryCapacity.trim(),
        discountOffering: formData.discountOffering.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit tourism partnership application.");
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

      <AccountSummary name={user.name} email={user.email} phone={user.phone} title="Hospitality partner" />

      <FormSection icon={LuHotel} title="Hospitality and service listing" description="Tell runners and visitors what you offer in Rajgir.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Hotel / business name" htmlFor="tourism-business" required>
            <TextInput
              id="tourism-business"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Rajgir Residency / Nalanda Heritage Resort"
            />
          </Field>
          <Field label="Hospitality / service type" htmlFor="tourism-type" required>
            <Select
              id="tourism-type"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
            >
              <option value="Hotel / Resort">Hotel / Star Resort</option>
              <option value="Homestay / Guest House">Heritage Homestay / Guest House</option>
              <option value="Transport & Shuttle Fleet">Travel Fleet & Marathon Shuttles</option>
              <option value="Heritage Guided Tours">Vishwa Shanti Stupa & Nalanda Tour Guide</option>
              <option value="Kund Wellness & Thermal Spa">Hot Springs / Kund Wellness Spa</option>
            </Select>
          </Field>
          <Field label="Location in Rajgir" htmlFor="tourism-location" required>
            <TextInput
              id="tourism-location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Near Brahmakund / Kund Market Road, Rajgir"
            />
          </Field>
          <Field label="Distance to start line (approx.)" htmlFor="tourism-distance">
            <TextInput
              id="tourism-distance"
              value={formData.distanceFromStartLine}
              onChange={(e) => setFormData({ ...formData, distanceFromStartLine: e.target.value })}
              placeholder="e.g. 1.2 KM / 5 mins walk"
            />
          </Field>
        </div>

        <Field label="Available room / vehicle capacity" htmlFor="tourism-capacity" required>
          <TextInput
            id="tourism-capacity"
            required
            value={formData.inventoryCapacity}
            onChange={(e) => setFormData({ ...formData, inventoryCapacity: e.target.value })}
            placeholder="e.g. 40 AC Deluxe Rooms, 8 Family Suites"
          />
        </Field>

        <Field
          label="Special discount or offer for registered runners"
          htmlFor="tourism-discount"
          hint="Offers will be featured on the official Rajgir Marathon runner guide and tourism portal."
        >
          <TextInput
            id="tourism-discount"
            value={formData.discountOffering}
            onChange={(e) => setFormData({ ...formData, discountOffering: e.target.value })}
            placeholder="e.g. 15% discount for verified bib holders + early 5 AM breakfast"
          />
        </Field>
      </FormSection>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
        {isSubmitting ? "Submitting listing" : "Apply for tourism partnership"}
      </Button>
    </form>
  );
}
