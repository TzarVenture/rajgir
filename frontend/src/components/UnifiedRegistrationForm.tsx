"use client";

import React, { useState } from "react";
import {
  LuArrowRight,
  LuCalendar,
  LuCircleCheck,
  LuClipboardList,
  LuGlobe,
  LuHandHeart,
  LuMegaphone,
  LuMessageSquare,
  LuPhone,
  LuUser,
  LuUsers,
} from "react-icons/lu";
import { Button, Checkbox, ChoiceCard, ChoiceChip, Field, FormSection, Notice, Select, Textarea, TextInput } from "@/components/ui";

type TabType = "volunteer" | "influencer";

interface VolunteerState {
  fullName: string;
  email: string;
  phone: string;
  tShirtSize: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  availability: string[];
  rolePreference: string;
  languagesSpoken: string;
  dietaryRestrictions: string;
  medicalCertification: boolean;
  waiverAgreed: boolean;
}

interface InfluencerState {
  fullName: string;
  stageName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  primaryPlatform: string;
  profileUrl: string;
  followerCount: string;
  engagementRate: string;
  targetNiche: string;
  collaborationDeliverables: string;
}

const AVAILABILITY_OPTIONS = [
  "Pre-Race Setup",
  "Race Day Morning",
  "Race Day Afternoon",
  "Post-Race Teardown",
];

const TSHIRT_OPTIONS = ["S", "M", "L", "XL", "XXL"];

const ROLE_PREFERENCES = [
  "Water Stations",
  "Course Marshals",
  "Baggage Drop",
  "Medal Distribution",
  "Information Desk",
];

const PLATFORM_OPTIONS = ["Instagram", "TikTok", "YouTube", "Strava", "Blog"];

export default function UnifiedRegistrationForm() {
  const [activeTab, setActiveTab] = useState<TabType>("volunteer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    subId?: string;
  } | null>(null);

  // Volunteer State
  const [volunteer, setVolunteer] = useState<VolunteerState>({
    fullName: "",
    email: "",
    phone: "",
    tShirtSize: "M",
    emergencyContactName: "",
    emergencyContactPhone: "",
    availability: ["Race Day Morning"],
    rolePreference: "Water Stations",
    languagesSpoken: "",
    dietaryRestrictions: "",
    medicalCertification: false,
    waiverAgreed: false,
  });

  // Influencer State (COMPLETELY OMITTING any running background questions)
  const [influencer, setInfluencer] = useState<InfluencerState>({
    fullName: "",
    stageName: "",
    email: "",
    phone: "",
    city: "",
    country: "India",
    primaryPlatform: "Instagram",
    profileUrl: "",
    followerCount: "",
    engagementRate: "",
    targetNiche: "",
    collaborationDeliverables: "",
  });

  const handleAvailabilityToggle = (option: string) => {
    setVolunteer((prev) => {
      const exists = prev.availability.includes(option);
      if (exists) {
        return {
          ...prev,
          availability: prev.availability.filter((item) => item !== option),
        };
      } else {
        return { ...prev, availability: [...prev.availability, option] };
      }
    });
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (volunteer.availability.length === 0) {
      setFeedback({
        type: "error",
        message: "Please choose at least one availability slot.",
      });
      return;
    }

    if (!volunteer.waiverAgreed) {
      setFeedback({
        type: "error",
        message: "You must accept the liability waiver and terms to volunteer.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "volunteer",
          formData: volunteer,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit volunteer form.");
      }

      setFeedback({
        type: "success",
        message:
          "Thank you! Your volunteer application has been submitted and stored in local records.",
        subId: data.data?.id,
      });

      // Reset form
      setVolunteer({
        fullName: "",
        email: "",
        phone: "",
        tShirtSize: "M",
        emergencyContactName: "",
        emergencyContactPhone: "",
        availability: ["Race Day Morning"],
        rolePreference: "Water Stations",
        languagesSpoken: "",
        dietaryRestrictions: "",
        medicalCertification: false,
        waiverAgreed: false,
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInfluencerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "influencer",
          formData: influencer,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit influencer application.");
      }

      setFeedback({
        type: "success",
        message:
          "Partnership proposal received! Our media and sponsorship team will get in touch soon.",
        subId: data.data?.id,
      });

      // Reset form
      setInfluencer({
        fullName: "",
        stageName: "",
        email: "",
        phone: "",
        city: "",
        country: "India",
        primaryPlatform: "Instagram",
        profileUrl: "",
        followerCount: "",
        engagementRate: "",
        targetNiche: "",
        collaborationDeliverables: "",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setFeedback(null);
  };

  return (
    <div className="w-full">
      {/* Path switch */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label="Choose your participation path">
        <ChoiceCard selected={activeTab === "volunteer"} onClick={() => switchTab("volunteer")}>
          <span className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
              <LuHandHeart className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-base font-bold text-charcoal-900">Volunteer crew</span>
              <span className="mt-0.5 block text-sm text-charcoal-500">On-ground support across the race zones.</span>
            </span>
          </span>
        </ChoiceCard>
        <ChoiceCard selected={activeTab === "influencer"} onClick={() => switchTab("influencer")}>
          <span className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
              <LuMegaphone className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-base font-bold text-charcoal-900">Influencer and media</span>
              <span className="mt-0.5 block text-sm text-charcoal-500">Partner with us as a creator or ambassador.</span>
            </span>
          </span>
        </ChoiceCard>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <Notice
          tone={feedback.type === "success" ? "success" : "error"}
          title={feedback.type === "success" ? "Application stored successfully" : "Submission failed"}
          className="mb-6"
        >
          <p>{feedback.message}</p>
          {feedback.subId && (
            <p className="mt-1.5 font-mono text-xs">
              Reference ID: {feedback.subId} (Saved to server simulated storage)
            </p>
          )}
        </Notice>
      )}

      {activeTab === "volunteer" ? (
        <form onSubmit={handleVolunteerSubmit} className="space-y-5">
          <p className="text-sm text-charcoal-600">
            Be the backbone of the historic Rajgir Marathon. Provide on-ground support across race zones.
          </p>

          <FormSection icon={LuUser} title="Personal details">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full name" htmlFor="join-vol-name" required>
                <TextInput
                  id="join-vol-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={volunteer.fullName}
                  onChange={(e) => setVolunteer({ ...volunteer, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </Field>
              <Field label="Email address" htmlFor="join-vol-email" required>
                <TextInput
                  id="join-vol-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={volunteer.email}
                  onChange={(e) => setVolunteer({ ...volunteer, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                />
              </Field>
              <Field label="Phone number" htmlFor="join-vol-phone" required>
                <TextInput
                  id="join-vol-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={volunteer.phone}
                  onChange={(e) => setVolunteer({ ...volunteer, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </Field>
              <Field label="T-shirt size" htmlFor="join-vol-size" required>
                <Select
                  id="join-vol-size"
                  required
                  value={volunteer.tShirtSize}
                  onChange={(e) => setVolunteer({ ...volunteer, tShirtSize: e.target.value })}
                >
                  {TSHIRT_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      Size {size}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </FormSection>

          <FormSection icon={LuPhone} title="Emergency contact" description="Who we can call if something happens.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Emergency contact name" htmlFor="join-vol-em-name" required>
                <TextInput
                  id="join-vol-em-name"
                  type="text"
                  required
                  value={volunteer.emergencyContactName}
                  onChange={(e) => setVolunteer({ ...volunteer, emergencyContactName: e.target.value })}
                  placeholder="Name of family member or guardian"
                />
              </Field>
              <Field label="Emergency contact phone" htmlFor="join-vol-em-phone" required>
                <TextInput
                  id="join-vol-em-phone"
                  type="tel"
                  required
                  value={volunteer.emergencyContactPhone}
                  onChange={(e) => setVolunteer({ ...volunteer, emergencyContactPhone: e.target.value })}
                  placeholder="Emergency contact phone number"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection icon={LuCalendar} title="Availability" description="Select all slots you can commit to.">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Availability slots">
              {AVAILABILITY_OPTIONS.map((slot) => {
                const isChecked = volunteer.availability.includes(slot);
                return (
                  <ChoiceChip
                    key={slot}
                    selected={isChecked}
                    onClick={() => handleAvailabilityToggle(slot)}
                    className="justify-between"
                  >
                    <span>{slot}</span>
                    {isChecked ? <LuCircleCheck className="h-4 w-4" aria-label="Selected" /> : null}
                  </ChoiceChip>
                );
              })}
            </div>
          </FormSection>

          <FormSection icon={LuClipboardList} title="Preferred volunteer duty">
            <Field label="Duty" htmlFor="join-vol-role" required>
              <Select
                id="join-vol-role"
                required
                value={volunteer.rolePreference}
                onChange={(e) => setVolunteer({ ...volunteer, rolePreference: e.target.value })}
              >
                {ROLE_PREFERENCES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </Field>
          </FormSection>

          <FormSection icon={LuMessageSquare} title="Additional context">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Languages spoken" htmlFor="join-vol-lang">
                <TextInput
                  id="join-vol-lang"
                  type="text"
                  value={volunteer.languagesSpoken}
                  onChange={(e) => setVolunteer({ ...volunteer, languagesSpoken: e.target.value })}
                  placeholder="e.g. Hindi, English, Magahi, Bhojpuri"
                />
              </Field>
              <Field label="Dietary restrictions / allergies" htmlFor="join-vol-diet">
                <TextInput
                  id="join-vol-diet"
                  type="text"
                  value={volunteer.dietaryRestrictions}
                  onChange={(e) => setVolunteer({ ...volunteer, dietaryRestrictions: e.target.value })}
                  placeholder="e.g. Vegetarian, Jain, Peanut Allergy"
                />
              </Field>
            </div>

            <div className="space-y-3 border-t border-charcoal-200 pt-4">
              <Checkbox
                checked={volunteer.medicalCertification}
                onChange={(e) => setVolunteer({ ...volunteer, medicalCertification: e.target.checked })}
              >
                I hold a valid Medical / First Aid / CPR certification.
              </Checkbox>
              <Checkbox
                required
                checked={volunteer.waiverAgreed}
                onChange={(e) => setVolunteer({ ...volunteer, waiverAgreed: e.target.checked })}
              >
                I agree to the volunteer liability waiver and understand the terms and safety guidelines of the Rajgir
                Marathon. <span aria-hidden className="text-brand-red">*</span>
              </Checkbox>
            </div>
          </FormSection>

          <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
            {isSubmitting ? "Submitting application" : "Submit volunteer registration"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleInfluencerSubmit} className="space-y-5">
          <p className="text-sm text-charcoal-600">
            Collaborate with the Rajgir Marathon. Showcase the race, ancient heritage sites, and Bihar’s historic culture to
            your audience.
          </p>

          <FormSection icon={LuUser} title="Creator identity and contacts">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full legal name" htmlFor="join-inf-name" required>
                <TextInput
                  id="join-inf-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={influencer.fullName}
                  onChange={(e) => setInfluencer({ ...influencer, fullName: e.target.value })}
                  placeholder="e.g. Priya Sen"
                />
              </Field>
              <Field label="Stage / online handle name" htmlFor="join-inf-stage">
                <TextInput
                  id="join-inf-stage"
                  type="text"
                  value={influencer.stageName}
                  onChange={(e) => setInfluencer({ ...influencer, stageName: e.target.value })}
                  placeholder="e.g. priyatravels"
                />
              </Field>
              <Field label="Email address" htmlFor="join-inf-email" required>
                <TextInput
                  id="join-inf-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={influencer.email}
                  onChange={(e) => setInfluencer({ ...influencer, email: e.target.value })}
                  placeholder="creator@agency.com"
                />
              </Field>
              <Field label="Phone / WhatsApp number" htmlFor="join-inf-phone" required>
                <TextInput
                  id="join-inf-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={influencer.phone}
                  onChange={(e) => setInfluencer({ ...influencer, phone: e.target.value })}
                  placeholder="Contact number"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection icon={LuGlobe} title="Base location">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="City" htmlFor="join-inf-city">
                <TextInput
                  id="join-inf-city"
                  type="text"
                  value={influencer.city}
                  onChange={(e) => setInfluencer({ ...influencer, city: e.target.value })}
                  placeholder="e.g. Patna, Delhi, Mumbai"
                />
              </Field>
              <Field label="Country" htmlFor="join-inf-country" required>
                <TextInput
                  id="join-inf-country"
                  type="text"
                  required
                  value={influencer.country}
                  onChange={(e) => setInfluencer({ ...influencer, country: e.target.value })}
                  placeholder="Country of residence"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection icon={LuUsers} title="Social media reach and metrics">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Primary platform" htmlFor="join-inf-platform" required>
                <Select
                  id="join-inf-platform"
                  required
                  value={influencer.primaryPlatform}
                  onChange={(e) => setInfluencer({ ...influencer, primaryPlatform: e.target.value })}
                >
                  {PLATFORM_OPTIONS.map((plat) => (
                    <option key={plat} value={plat}>
                      {plat}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Profile / channel URL" htmlFor="join-inf-url" required>
                <TextInput
                  id="join-inf-url"
                  type="url"
                  required
                  value={influencer.profileUrl}
                  onChange={(e) => setInfluencer({ ...influencer, profileUrl: e.target.value })}
                  placeholder="https://instagram.com/yourhandle"
                />
              </Field>
              <Field label="Follower / subscriber count" htmlFor="join-inf-followers" required>
                <TextInput
                  id="join-inf-followers"
                  type="text"
                  required
                  value={influencer.followerCount}
                  onChange={(e) => setInfluencer({ ...influencer, followerCount: e.target.value })}
                  placeholder="e.g. 50K, 250,000"
                />
              </Field>
              <Field label="Average engagement rate %" htmlFor="join-inf-engagement">
                <TextInput
                  id="join-inf-engagement"
                  type="text"
                  value={influencer.engagementRate}
                  onChange={(e) => setInfluencer({ ...influencer, engagementRate: e.target.value })}
                  placeholder="e.g. 4.5%"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection icon={LuMegaphone} title="Audience and collaboration">
            <Field label="Target audience / content niche" htmlFor="join-inf-niche" required>
              <TextInput
                id="join-inf-niche"
                type="text"
                required
                value={influencer.targetNiche}
                onChange={(e) => setInfluencer({ ...influencer, targetNiche: e.target.value })}
                placeholder="e.g. Travel, Fitness & Wellness, Heritage & Culture, Youth Lifestyle"
              />
            </Field>
            <Field label="Collaboration deliverables and expectations" htmlFor="join-inf-deliverables" required>
              <Textarea
                id="join-inf-deliverables"
                required
                rows={4}
                value={influencer.collaborationDeliverables}
                onChange={(e) => setInfluencer({ ...influencer, collaborationDeliverables: e.target.value })}
                placeholder="Describe what content you intend to produce (e.g. 2 Reels, 1 YouTube Vlog, daily stories) and what you expect from the marathon organization (e.g. VIP media passes, travel accommodation, sponsorship compensation)."
              />
            </Field>
          </FormSection>

          <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
            {isSubmitting ? "Submitting application" : "Submit partnership application"}
          </Button>
        </form>
      )}
    </div>
  );
}
