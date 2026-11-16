"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppUser } from "@/lib/auth/session";
import {
  FaCheckCircle,
  FaArrowRight,
  FaSpinner,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";

const TSHIRT_SIZES = ["S", "M", "L", "XL", "XXL"];

const AVAILABILITY_SLOTS = [
  "Pre-Race Setup",
  "Race Day Morning",
  "Race Day Afternoon",
  "Post-Race Teardown",
];

const VOLUNTEER_ROLES = [
  "Water Stations",
  "Course Marshals",
  "Baggage Drop",
  "Medal Distribution",
  "Information Desk",
];

interface VolunteerRegisterFormProps {
  user: AppUser;
}

export default function VolunteerRegisterForm({ user }: VolunteerRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userId: user.id,
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
        availability: exists
          ? prev.availability.filter((s) => s !== slot)
          : [...prev.availability, slot],
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
      const response = await fetch("/api/register/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          fullName: user.name,
          email: user.email,
          phone: formData.phone || user.phone,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
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
      <div className="w-full rounded-2xl border border-emerald-500/40 bg-[#0f0c09]/95 backdrop-blur-md p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl">
          <FaCheckCircle />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 rounded-full">
          Application Received
        </span>

        <h2 className="text-2xl font-black uppercase text-white font-graduate mt-3 mb-2">
          Thank You, Volunteer!
        </h2>
        <p className="text-sm text-neutral-300 max-w-md mx-auto mb-6 leading-relaxed">
          Your volunteer application for the Rajgir Marathon 2027 has been registered. The organizing committee reviews volunteer roles based on preference and deployment needs.
        </p>

        <div className="p-4 rounded-xl bg-black/60 border border-white/10 mb-6 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-400">Applicant:</span>
            <span className="text-white font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Preferred Role:</span>
            <span className="text-[#cca043] font-semibold">{formData.rolePreference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Status:</span>
            <span className="text-amber-400 font-semibold uppercase">Pending Committee Review</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/pending"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r from-[#cca043] to-[#b3852b] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all"
          >
            <span>View Application Status</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-[#cca043]/35 bg-[#0f0c09]/95 backdrop-blur-md p-5 sm:p-6 lg:p-7 shadow-xl relative">
      <div className="text-left mb-4">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#d49a37]">
          Join the Ground Crew
        </span>
        <h2 className="text-lg sm:text-xl font-bold uppercase text-white font-graduate mt-0.5">
          Volunteer Application
        </h2>
      </div>

      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-200 text-xs">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Verified User Identity (Pre-filled & Locked) */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-[#cca043] text-xs" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                Volunteer Account Identity
              </span>
            </div>
            <span className="text-[9px] text-neutral-400 flex items-center gap-1">
              <FaLock className="text-[8px]" /> Locked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Name: </span>
              <span className="text-white font-medium">{user.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold">Email: </span>
              <span className="text-neutral-300 font-medium truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Contact Mobile */}
        <div className="text-left">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="10-digit mobile number"
            className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
          />
        </div>

        {/* Role Preference & T-Shirt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Role Preference <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.rolePreference}
              onChange={(e) => setFormData({ ...formData, rolePreference: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            >
              {VOLUNTEER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Official T-Shirt Size <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1.5">
              {TSHIRT_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFormData({ ...formData, tShirtSize: sz })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    formData.tShirtSize === sz
                      ? "border-[#cca043] bg-[#cca043] text-black shadow-md"
                      : "border-white/15 bg-white/5 text-neutral-300 hover:border-white/30"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Emergency Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              placeholder="e.g. Ramesh Sharma"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Emergency Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              placeholder="10-digit mobile"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>
        </div>

        {/* Availability Slots */}
        <div className="text-left">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
            Availability Slots <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABILITY_SLOTS.map((slot) => {
              const active = formData.availability.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleAvailabilityToggle(slot)}
                  className={`p-2.5 text-xs text-left rounded-lg border transition-all flex items-center justify-between ${
                    active
                      ? "border-[#cca043] bg-[#cca043]/15 text-[#cca043] font-semibold"
                      : "border-white/10 bg-white/5 text-neutral-400 hover:border-white/20"
                  }`}
                >
                  <span>{slot}</span>
                  {active && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Languages & Dietary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Languages Spoken
            </label>
            <input
              type="text"
              value={formData.languagesSpoken}
              onChange={(e) => setFormData({ ...formData, languagesSpoken: e.target.value })}
              placeholder="e.g. Hindi, English, Magahi"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Dietary Restrictions
            </label>
            <input
              type="text"
              value={formData.dietaryRestrictions}
              onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
              placeholder="e.g. Vegetarian / Jain"
              className="w-full px-3.5 py-2.5 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-xs focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>
        </div>

        {/* Medical Cert & Waiver */}
        <div className="space-y-2 text-left pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={formData.medicalCertification}
              onChange={(e) => setFormData({ ...formData, medicalCertification: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-gray-600 text-[#cca043] focus:ring-[#cca043]"
            />
            <span>I have basic first-aid / CPR training or medical certification</span>
          </label>

          <label className="flex items-start gap-2 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              required
              checked={formData.waiverAgreed}
              onChange={(e) => setFormData({ ...formData, waiverAgreed: e.target.checked })}
              className="mt-0.5 h-3.5 w-3.5 rounded border-gray-600 text-[#cca043] focus:ring-[#cca043]"
            />
            <span>
              I agree to the volunteer liability waiver and code of conduct for the Rajgir Marathon.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#e51b24] via-[#dc2626] to-[#b91c1c] text-white font-extrabold text-xs uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin text-sm" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <span>Submit Volunteer Application</span>
              <FaArrowRight className="text-xs" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

