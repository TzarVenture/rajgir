"use client";

import React, { useState } from "react";
import { LuArrowRight, LuCalendar, LuCircleCheck, LuHandHeart, LuMessageSquare, LuPhone } from "react-icons/lu";
import { submitVolunteerRegistration } from "@/app/actions/registerPeople";
import {
  AccountSummary,
  Button,
  Card,
  Checkbox,
  ChoiceChip,
  Field,
  FormSection,
  LinkButton,
  Notice,
  Select,
  TextInput,
} from "@/components/ui";
import { AppUser } from "@/lib/auth/session";

const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];

const AVAILABILITY_SLOTS = ["Pre-Race Setup", "Race Day Morning", "Race Day Afternoon", "Post-Race Teardown"];

const VOLUNTEER_ROLES = ["Water Stations", "Course Marshals", "Baggage Drop", "Medal Distribution", "Information Desk"];

interface VolunteerRegisterFormProps {
  user: AppUser;
}

export default function VolunteerRegisterForm({ user }: VolunteerRegisterFormProps) {
  const [formData, setFormData] = useState({
    fullName: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    tShirtSize: "M",
    emergencyContactName: "",
    emergencyContactPhone: "",
    availability: ["Race Day Morning"],
    rolePreference: "Water Stations",
    languagesSpoken: "Hindi, English",
    dietaryRestrictions: "",
    medicalCertification: false,
    waiverAgreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleAvailabilityToggle = (slot: string) => {
    setFormData((prev) => {
      const exists = prev.availability.includes(slot);
      return {
        ...prev,
        availability: exists ? prev.availability.filter((s) => s !== slot) : [...prev.availability, slot],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (formData.availability.length === 0) {
      setSubmitError("Please select at least one availability slot.");
      return;
    }

    if (!formData.waiverAgreed) {
      setSubmitError("You must agree to the volunteer liability waiver.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitVolunteerRegistration({
        ...formData,
        fullName: user.name,
        email: user.email,
        phone: formData.phone || user.phone,
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to submit volunteer registration.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="text-center" padded={false}>
        <div className="p-6 sm:p-10">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
            <LuCircleCheck className="h-8 w-8" aria-hidden />
          </span>
          <h2 className="font-barlow text-[32px] font-bold uppercase leading-none text-charcoal-900">Thank you, volunteer!</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-charcoal-600">
            Your application for Rajgir Marathon 2027 has been received. The organizing committee reviews volunteer roles based on
            preference and deployment needs.
          </p>

          <dl className="mx-auto mt-6 max-w-md space-y-2.5 rounded-card bg-surface-soft p-4 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-500">Applicant</dt>
              <dd className="font-semibold text-charcoal-900">{user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-500">Preferred role</dt>
              <dd className="font-semibold text-charcoal-900">{formData.rolePreference}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-500">Status</dt>
              <dd className="font-semibold text-[#92400E]">Waiting for review</dd>
            </div>
          </dl>

          <div className="mt-6 flex justify-center">
            <LinkButton href="/pending" iconRight={LuArrowRight}>
              View application status
            </LinkButton>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError ? <Notice tone="error">{submitError}</Notice> : null}

      <AccountSummary name={user.name} email={user.email} title="Volunteer account" hidePhone />

      <FormSection icon={LuPhone} title="Contact and emergency" description="Who we can reach, and who to call if something happens.">
        <Field label="Mobile number" htmlFor="vol-phone" required>
          <TextInput
            id="vol-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="10-digit mobile number"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Emergency contact name" htmlFor="vol-emergency-name" required>
            <TextInput
              id="vol-emergency-name"
              required
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              placeholder="e.g. Ramesh Sharma"
            />
          </Field>
          <Field label="Emergency contact phone" htmlFor="vol-emergency-phone" required>
            <TextInput
              id="vol-emergency-phone"
              type="tel"
              inputMode="tel"
              required
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              placeholder="10-digit mobile number"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection icon={LuHandHeart} title="Your role" description="Tell us where you would like to help.">
        <Field label="Role preference" htmlFor="vol-role" required>
          <Select
            id="vol-role"
            value={formData.rolePreference}
            onChange={(e) => setFormData({ ...formData, rolePreference: e.target.value })}
          >
            {VOLUNTEER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-charcoal-800">
            Official T-shirt size <span aria-hidden className="text-brand-red">*</span>
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="T-shirt size">
            {TSHIRT_SIZES.map((sz) => (
              <ChoiceChip key={sz} selected={formData.tShirtSize === sz} onClick={() => setFormData({ ...formData, tShirtSize: sz })} className="min-w-[56px]">
                {sz}
              </ChoiceChip>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection icon={LuCalendar} title="Availability" description="Choose every slot you can cover.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Availability slots">
          {AVAILABILITY_SLOTS.map((slot) => (
            <ChoiceChip
              key={slot}
              selected={formData.availability.includes(slot)}
              onClick={() => handleAvailabilityToggle(slot)}
              className="justify-between"
            >
              <span>{slot}</span>
              {formData.availability.includes(slot) ? <LuCircleCheck className="h-4 w-4" aria-label="Selected" /> : null}
            </ChoiceChip>
          ))}
        </div>
      </FormSection>

      <FormSection icon={LuMessageSquare} title="A little more about you">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Languages spoken" htmlFor="vol-languages">
            <TextInput
              id="vol-languages"
              value={formData.languagesSpoken}
              onChange={(e) => setFormData({ ...formData, languagesSpoken: e.target.value })}
              placeholder="e.g. Hindi, English, Magahi"
            />
          </Field>
          <Field label="Dietary restrictions" htmlFor="vol-diet">
            <TextInput
              id="vol-diet"
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              placeholder="e.g. Vegetarian / Jain"
            />
          </Field>
        </div>

        <div className="space-y-3 pt-1">
          <Checkbox
            checked={formData.medicalCertification}
            onChange={(e) => setFormData({ ...formData, medicalCertification: e.target.checked })}
          >
            I have basic first-aid / CPR training or a medical certification
          </Checkbox>
          <Checkbox
            required
            checked={formData.waiverAgreed}
            onChange={(e) => setFormData({ ...formData, waiverAgreed: e.target.checked })}
          >
            I agree to the volunteer liability waiver and code of conduct for the Rajgir Marathon.
          </Checkbox>
        </div>
      </FormSection>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
        {isSubmitting ? "Submitting application" : "Submit volunteer application"}
      </Button>
    </form>
  );
}
