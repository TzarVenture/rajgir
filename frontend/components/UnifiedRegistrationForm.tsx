"use client";

import React, { useState } from "react";
import {
  FaHandsHelping,
  FaBullhorn,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaGlobe,
  FaLink,
  FaUsers,
  FaChartLine,
  FaShieldAlt,
  FaMedal,
} from "react-icons/fa";

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-[#140f0c] p-1.5 rounded-2xl border border-white/10 flex w-full max-w-md shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setActiveTab("volunteer");
              setFeedback(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${
              activeTab === "volunteer"
                ? "bg-[#e51b24] text-white shadow-lg shadow-red-900/40"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FaHandsHelping className="text-base" />
            <span>Volunteer Crew</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("influencer");
              setFeedback(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${
              activeTab === "influencer"
                ? "bg-[#e51b24] text-white shadow-lg shadow-red-900/40"
                : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FaBullhorn className="text-base" />
            <span>Influencer & Media</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mb-8 p-5 rounded-xl border flex items-start gap-4 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/40 border-red-500/40 text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <FaCheckCircle className="text-2xl text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <FaExclamationCircle className="text-2xl text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="font-bold text-base mb-1">
              {feedback.type === "success"
                ? "Application Stored Successfully"
                : "Submission Failed"}
            </h4>
            <p className="text-sm opacity-90">{feedback.message}</p>
            {feedback.subId && (
              <p className="text-xs font-mono mt-2 text-emerald-400/80">
                Reference ID: {feedback.subId} (Saved to server simulated storage)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-[#120e0a]/90 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        {activeTab === "volunteer" ? (
          /* ======================================================== */
          /* VOLUNTEER REGISTRATION FORM                              */
          /* ======================================================== */
          <form onSubmit={handleVolunteerSubmit} className="space-y-8">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <FaHandsHelping className="text-[#e51b24]" />
                Volunteer Application
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                Be the backbone of the historic Rajgir Marathon. Provide on-ground support across race zones.
              </p>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#e51b24]">
                1. Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Full Name <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="text"
                      required
                      value={volunteer.fullName}
                      onChange={(e) =>
                        setVolunteer({ ...volunteer, fullName: e.target.value })
                      }
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Email Address <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="email"
                      required
                      value={volunteer.email}
                      onChange={(e) =>
                        setVolunteer({ ...volunteer, email: e.target.value })
                      }
                      placeholder="e.g. rahul@example.com"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Phone Number <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="tel"
                      required
                      value={volunteer.phone}
                      onChange={(e) =>
                        setVolunteer({ ...volunteer, phone: e.target.value })
                      }
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    T-Shirt Size <span className="text-[#e51b24]">*</span>
                  </label>
                  <select
                    required
                    value={volunteer.tShirtSize}
                    onChange={(e) =>
                      setVolunteer({ ...volunteer, tShirtSize: e.target.value })
                    }
                    className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white outline-none transition-all cursor-pointer"
                  >
                    {TSHIRT_OPTIONS.map((size) => (
                      <option key={size} value={size} className="bg-[#1b1510] text-white">
                        Size {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact Group */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#e51b24]">
                2. Emergency Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Emergency Contact Name <span className="text-[#e51b24]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={volunteer.emergencyContactName}
                    onChange={(e) =>
                      setVolunteer({
                        ...volunteer,
                        emergencyContactName: e.target.value,
                      })
                    }
                    placeholder="Name of family member or guardian"
                    className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Emergency Contact Phone <span className="text-[#e51b24]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={volunteer.emergencyContactPhone}
                    onChange={(e) =>
                      setVolunteer({
                        ...volunteer,
                        emergencyContactPhone: e.target.value,
                      })
                    }
                    placeholder="Emergency contact phone number"
                    className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Availability Checklist */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                3. Availability Checklist <span className="text-[#e51b24]">*</span>
                <span className="text-neutral-500 font-normal lowercase ml-2">
                  (select all slots you can commit to)
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVAILABILITY_OPTIONS.map((slot) => {
                  const isChecked = volunteer.availability.includes(slot);
                  return (
                    <label
                      key={slot}
                      onClick={() => handleAvailabilityToggle(slot)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-red-950/20 border-[#e51b24] text-white"
                          : "bg-[#1b1510] border-white/10 text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled by wrapper div
                        className="w-4 h-4 rounded text-[#e51b24] focus:ring-[#e51b24] bg-neutral-900 border-white/20"
                      />
                      <span className="text-xs font-medium">{slot}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Role Preference */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                4. Preferred Volunteer Duty <span className="text-[#e51b24]">*</span>
              </label>
              <select
                required
                value={volunteer.rolePreference}
                onChange={(e) =>
                  setVolunteer({ ...volunteer, rolePreference: e.target.value })
                }
                className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white outline-none transition-all cursor-pointer"
              >
                {ROLE_PREFERENCES.map((role) => (
                  <option key={role} value={role} className="bg-[#1b1510] text-white">
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Additional Context */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#e51b24]">
                5. Additional Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    value={volunteer.languagesSpoken}
                    onChange={(e) =>
                      setVolunteer({ ...volunteer, languagesSpoken: e.target.value })
                    }
                    placeholder="e.g. Hindi, English, Magahi, Bhojpuri"
                    className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Dietary Restrictions / Allergies
                  </label>
                  <input
                    type="text"
                    value={volunteer.dietaryRestrictions}
                    onChange={(e) =>
                      setVolunteer({
                        ...volunteer,
                        dietaryRestrictions: e.target.value,
                      })
                    }
                    placeholder="e.g. Vegetarian, Jain, Peanut Allergy"
                    className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Certifications & Waiver */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={volunteer.medicalCertification}
                  onChange={(e) =>
                    setVolunteer({
                      ...volunteer,
                      medicalCertification: e.target.checked,
                    })
                  }
                  className="mt-1 w-4 h-4 rounded text-[#e51b24] focus:ring-[#e51b24] bg-neutral-900 border-white/20"
                />
                <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">
                  I hold a valid Medical / First Aid / CPR certification.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  required
                  checked={volunteer.waiverAgreed}
                  onChange={(e) =>
                    setVolunteer({ ...volunteer, waiverAgreed: e.target.checked })
                  }
                  className="mt-1 w-4 h-4 rounded text-[#e51b24] focus:ring-[#e51b24] bg-neutral-900 border-white/20"
                />
                <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">
                  I agree to the volunteer liability waiver and understand the terms and safety guidelines of the Rajgir Marathon. <span className="text-[#e51b24]">*</span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] hover:brightness-110 active:scale-[0.99] text-[#080604] font-black uppercase tracking-wider text-sm rounded-xl shadow-xl shadow-amber-950/50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Submitting Volunteer Application...</span>
                </>
              ) : (
                <>
                  <FaHandsHelping className="text-lg" />
                  <span>Submit Volunteer Registration</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* ======================================================== */
          /* INFLUENCER / AMBASSADOR FORM                             */
          /* (OMITS ALL RUNNING BACKGROUND QUESTIONS)                 */
          /* ======================================================== */
          <form onSubmit={handleInfluencerSubmit} className="space-y-8">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <FaBullhorn className="text-[#e51b24]" />
                Influencer & Ambassador Application
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                Collaborate with the Rajgir Marathon. Showcase the race, ancient heritage sites, and Bihar’s historic culture to your audience.
              </p>
            </div>

            {/* Identity */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#e51b24]">
                1. Creator Identity & Contacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Full Legal Name <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="text"
                      required
                      value={influencer.fullName}
                      onChange={(e) =>
                        setInfluencer({ ...influencer, fullName: e.target.value })
                      }
                      placeholder="e.g. Priya Sen"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Stage / Online Handle Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-neutral-500 text-sm font-bold">@</span>
                    <input
                      type="text"
                      value={influencer.stageName}
                      onChange={(e) =>
                        setInfluencer({ ...influencer, stageName: e.target.value })
                      }
                      placeholder="e.g. priyatravels"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Email Address <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="email"
                      required
                      value={influencer.email}
                      onChange={(e) =>
                        setInfluencer({ ...influencer, email: e.target.value })
                      }
                      placeholder="creator@agency.com"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Phone / WhatsApp Number <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="tel"
                      required
                      value={influencer.phone}
                      onChange={(e) =>
                        setInfluencer({ ...influencer, phone: e.target.value })
                      }
                      placeholder="Contact number"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#e51b24]">
                2. Base Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={influencer.city}
                    onChange={(e) =>
                      setInfluencer({ ...influencer, city: e.target.value })
                    }
                    placeholder="e.g. Patna, Delhi, Mumbai"
                    className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Country <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaGlobe className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="text"
                      required
                      value={influencer.country}
                      onChange={(e) =>
                        setInfluencer({ ...influencer, country: e.target.value })
                      }
                      placeholder="Country of residence"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Stats Group */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#e51b24]">
                3. Social Media Reach & Metrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Primary Platform <span className="text-[#e51b24]">*</span>
                  </label>
                  <select
                    required
                    value={influencer.primaryPlatform}
                    onChange={(e) =>
                      setInfluencer({
                        ...influencer,
                        primaryPlatform: e.target.value,
                      })
                    }
                    className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white outline-none transition-all cursor-pointer"
                  >
                    {PLATFORM_OPTIONS.map((plat) => (
                      <option key={plat} value={plat} className="bg-[#1b1510] text-white">
                        {plat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Profile / Channel URL <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaLink className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="url"
                      required
                      value={influencer.profileUrl}
                      onChange={(e) =>
                        setInfluencer({ ...influencer, profileUrl: e.target.value })
                      }
                      placeholder="https://instagram.com/yourhandle"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Follower / Subscriber Count <span className="text-[#e51b24]">*</span>
                  </label>
                  <div className="relative">
                    <FaUsers className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="text"
                      required
                      value={influencer.followerCount}
                      onChange={(e) =>
                        setInfluencer({
                          ...influencer,
                          followerCount: e.target.value,
                        })
                      }
                      placeholder="e.g. 50K, 250,000"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
                    Average Engagement Rate %
                  </label>
                  <div className="relative">
                    <FaChartLine className="absolute left-3.5 top-3.5 text-neutral-500 text-sm" />
                    <input
                      type="text"
                      value={influencer.engagementRate}
                      onChange={(e) =>
                        setInfluencer({
                          ...influencer,
                          engagementRate: e.target.value,
                        })
                      }
                      placeholder="e.g. 4.5%"
                      className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Target Niche */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                4. Target Audience / Content Niche <span className="text-[#e51b24]">*</span>
              </label>
              <input
                type="text"
                required
                value={influencer.targetNiche}
                onChange={(e) =>
                  setInfluencer({ ...influencer, targetNiche: e.target.value })
                }
                placeholder="e.g. Travel, Fitness & Wellness, Heritage & Culture, Youth Lifestyle"
                className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl py-3 px-4 text-sm text-white placeholder-neutral-600 outline-none transition-all"
              />
            </div>

            {/* Partnership Details */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                5. Collaboration Deliverables & Expectations <span className="text-[#e51b24]">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={influencer.collaborationDeliverables}
                onChange={(e) =>
                  setInfluencer({
                    ...influencer,
                    collaborationDeliverables: e.target.value,
                  })
                }
                placeholder="Describe what content you intend to produce (e.g. 2 Reels, 1 YouTube Vlog, daily stories) and what you expect from the marathon organization (e.g. VIP media passes, travel accommodation, sponsorship compensation)."
                className="w-full bg-[#1b1510] border border-white/10 focus:border-[#e51b24] focus:ring-1 focus:ring-[#e51b24] rounded-xl p-4 text-sm text-white placeholder-neutral-600 outline-none transition-all resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] hover:brightness-110 active:scale-[0.99] text-[#080604] font-black uppercase tracking-wider text-sm rounded-xl shadow-xl shadow-amber-950/50 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-lg" />
                  <span>Submitting Influencer Application...</span>
                </>
              ) : (
                <>
                  <FaBullhorn className="text-lg" />
                  <span>Submit Partnership Application</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

