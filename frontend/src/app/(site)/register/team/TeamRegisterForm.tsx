"use client";

import React, { useState } from "react";
import { LuArrowRight, LuCheck, LuCircleCheck, LuCopy, LuUsers } from "react-icons/lu";
import { submitTeamRegistration } from "@/app/actions/registerGroup";
import {
  AccountSummary,
  Button,
  Card,
  Field,
  FormSection,
  LinkButton,
  Notice,
  Textarea,
  TextInput,
} from "@/components/ui";
import { AppUser } from "@/lib/auth/session";

interface TeamRegisterFormProps {
  user: AppUser;
}

export default function TeamRegisterForm({ user }: TeamRegisterFormProps) {
  const [formData, setFormData] = useState({
    teamName: "",
    clubAffiliation: "",
    city: "",
    estimatedMembers: 10,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ teamJoinCode: string; teamName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.teamName.trim()) {
      setError("Please enter your team or club name.");
      return;
    }
    if (!formData.city.trim()) {
      setError("Please enter the city your team is based in.");
      return;
    }
    if (formData.estimatedMembers < 2) {
      setError("A team must have at least 2 members.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitTeamRegistration({
        teamName: formData.teamName.trim(),
        clubAffiliation: formData.clubAffiliation.trim() || undefined,
        city: formData.city.trim(),
        estimatedMembers: Number(formData.estimatedMembers),
        notes: formData.notes.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to register team. Please try again.");
      }

      setSuccessData({
        teamJoinCode: res.data?.teamJoinCode || "ACTIVE",
        teamName: formData.teamName,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while creating your team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (successData?.teamJoinCode) {
      navigator.clipboard.writeText(successData.teamJoinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (successData) {
    return (
      <Card className="text-center" padded={false}>
        <div className="p-6 sm:p-10">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
            <LuCircleCheck className="h-8 w-8" aria-hidden />
          </span>
          <h2 className="font-barlow text-[32px] font-bold uppercase leading-none text-charcoal-900">{successData.teamName}</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-charcoal-600">
            Congratulations, Captain. Your team is registered and active. Share your team join code with your members so they can join
            your squad.
          </p>

          <div className="mx-auto mt-6 max-w-md rounded-card bg-surface-soft p-5">
            <p className="text-sm font-semibold text-charcoal-500">Your official team code</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="font-barlow text-3xl font-bold tracking-widest text-charcoal-900">{successData.teamJoinCode}</span>
              <button
                onClick={copyCode}
                type="button"
                aria-label="Copy team code"
                title="Copy team code"
                className="inline-flex h-11 w-11 items-center justify-center rounded-btn border border-charcoal-200 bg-white text-charcoal-700 transition-colors hover:bg-surface-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
              >
                {copied ? <LuCheck className="h-5 w-5" aria-hidden /> : <LuCopy className="h-5 w-5" aria-hidden />}
              </button>
            </div>
            <p className="mt-2 min-h-[20px] text-sm font-semibold text-[#15803D]" role="status">
              {copied ? "Copied to clipboard" : ""}
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <LinkButton href="/dashboard" iconRight={LuArrowRight}>
              Enter team captain dashboard
            </LinkButton>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}

      <AccountSummary name={user.name} email={user.email} phone={user.phone} title="Team captain account" />

      <FormSection icon={LuUsers} title="Team and squad information" description="Tell us about your club or running group.">
        <Field label="Team or club name" htmlFor="team-name" required>
          <TextInput
            id="team-name"
            required
            value={formData.teamName}
            onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
            placeholder="e.g. Patna Striders Running Club"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="City or base" htmlFor="team-city" required>
            <TextInput
              id="team-city"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Patna, Nalanda, Gaya"
            />
          </Field>
          <Field label="Estimated squad size" htmlFor="team-size" hint="Minimum 2 members" required>
            <TextInput
              id="team-size"
              type="number"
              inputMode="numeric"
              min={2}
              max={500}
              required
              value={formData.estimatedMembers}
              onChange={(e) => setFormData({ ...formData, estimatedMembers: parseInt(e.target.value) || 2 })}
            />
          </Field>
        </div>
        <Field label="Club or association affiliation (optional)" htmlFor="team-affiliation">
          <TextInput
            id="team-affiliation"
            value={formData.clubAffiliation}
            onChange={(e) => setFormData({ ...formData, clubAffiliation: e.target.value })}
            placeholder="e.g. Bihar Athletics Association"
          />
        </Field>
        <Field label="Target distances or notes (optional)" htmlFor="team-notes">
          <Textarea
            id="team-notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Running 21.1K and 10K categories. Aiming for team podium."
          />
        </Field>
      </FormSection>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
        {isSubmitting ? "Registering team" : "Create team and generate join code"}
      </Button>
    </form>
  );
}
