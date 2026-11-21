"use client";

import React, { useState } from "react";
import { LuArrowRight, LuCircleCheck, LuMegaphone, LuUserRound } from "react-icons/lu";
import { submitInfluencerRegistration } from "@/app/actions/registerPeople";
import {
  AccountSummary,
  Button,
  Card,
  Field,
  FormSection,
  LinkButton,
  Notice,
  Select,
  Textarea,
  TextInput,
} from "@/components/ui";
import { AppUser } from "@/lib/auth/session";

const PLATFORM_OPTIONS = ["Instagram", "YouTube", "Strava", "Facebook", "Twitter / X", "Blog / Website"];

interface InfluencerRegisterFormProps {
  user: AppUser;
}

export default function InfluencerRegisterForm({ user }: InfluencerRegisterFormProps) {
  const [formData, setFormData] = useState({
    stageName: "",
    city: "Patna",
    country: "India",
    primaryPlatform: "Instagram",
    profileUrl: "",
    followerCount: "25K+",
    engagementRate: "4.5%",
    targetNiche: "Running & Fitness",
    collaborationDeliverables: "Course preview reel, bib reveal post, race day finish line story coverage",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.profileUrl.trim()) {
      setSubmitError("Please provide your profile or channel URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Name, email and mobile are not sent: the API uses the signed-in account.
      const result = await submitInfluencerRegistration(formData);
      if (!result.success) {
        throw new Error(result.error || "Failed to submit influencer proposal.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit proposal. Please try again.");
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
          <h2 className="font-barlow text-[32px] font-bold uppercase leading-none text-charcoal-900">Proposal received</h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-charcoal-600">
            Thank you for pitching to represent the Rajgir Marathon. Our PR and media team will evaluate your channel reach and get in
            touch about official media pass accreditation.
          </p>

          <dl className="mx-auto mt-6 max-w-md space-y-2.5 rounded-card bg-surface-soft p-4 text-left text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-500">Creator</dt>
              <dd className="font-semibold text-charcoal-900">{user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-500">Platform</dt>
              <dd className="font-semibold text-charcoal-900">{formData.primaryPlatform}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-500">Status</dt>
              <dd className="font-semibold text-[#92400E]">Under media review</dd>
            </div>
          </dl>

          <div className="mt-6 flex justify-center">
            <LinkButton href="/pending" iconRight={LuArrowRight}>
              Check application status
            </LinkButton>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {submitError ? <Notice tone="error">{submitError}</Notice> : null}

      <AccountSummary name={user.name} email={user.email} phone={user.phone} title="Creator account" />

      <FormSection icon={LuUserRound} title="Contact and channel" description="How we reach you and where your audience finds you.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Creator, handle or channel name" htmlFor="inf-stage-name">
            <TextInput
              id="inf-stage-name"
              value={formData.stageName}
              onChange={(e) => setFormData({ ...formData, stageName: e.target.value })}
              placeholder="e.g. The Patna Runner"
            />
          </Field>
          <Field label="Primary platform" htmlFor="inf-platform" required>
            <Select
              id="inf-platform"
              value={formData.primaryPlatform}
              onChange={(e) => setFormData({ ...formData, primaryPlatform: e.target.value })}
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Profile or channel URL" htmlFor="inf-url" required>
            <TextInput
              id="inf-url"
              type="url"
              required
              value={formData.profileUrl}
              onChange={(e) => setFormData({ ...formData, profileUrl: e.target.value })}
              placeholder="https://instagram.com/yourhandle"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection icon={LuMegaphone} title="Audience and pitch" description="Share your reach and what you would create for the marathon.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Audience or followers" htmlFor="inf-followers" required>
            <TextInput
              id="inf-followers"
              required
              value={formData.followerCount}
              onChange={(e) => setFormData({ ...formData, followerCount: e.target.value })}
              placeholder="e.g. 50K"
            />
          </Field>
          <Field label="Avg. engagement rate" htmlFor="inf-engagement">
            <TextInput
              id="inf-engagement"
              value={formData.engagementRate}
              onChange={(e) => setFormData({ ...formData, engagementRate: e.target.value })}
              placeholder="e.g. 4.2%"
            />
          </Field>
          <Field label="Base city" htmlFor="inf-city">
            <TextInput
              id="inf-city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Patna, Ranchi"
            />
          </Field>
        </div>
        <Field label="Content niche" htmlFor="inf-niche" required>
          <TextInput
            id="inf-niche"
            required
            value={formData.targetNiche}
            onChange={(e) => setFormData({ ...formData, targetNiche: e.target.value })}
            placeholder="e.g. Running, marathon vlogs, Bihar travel"
          />
        </Field>
        <Field label="Proposed deliverables and campaign ideas" htmlFor="inf-deliverables" required>
          <Textarea
            id="inf-deliverables"
            rows={4}
            required
            value={formData.collaborationDeliverables}
            onChange={(e) => setFormData({ ...formData, collaborationDeliverables: e.target.value })}
            placeholder="e.g. 3 Instagram reels promoting registration, 1 race-day vlog, live stories from the finish line."
          />
        </Field>
      </FormSection>

      <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
        {isSubmitting ? "Submitting proposal" : "Submit collaboration pitch"}
      </Button>
    </form>
  );
}
