"use client";

import React, { useState } from "react";
import ComingSoonHeader from "@/components/ComingSoonHeader";
import ComingSoonFooter from "@/components/ComingSoonFooter";
import {
  FaMapMarkerAlt,
  FaHandsHelping,
  FaCheckCircle,
  FaArrowRight,
  FaSpinner,
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

export default function VolunteerRegisterPage() {
  const [formData, setFormData] = useState({
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionId, setSubmissionId] = useState("");

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
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit volunteer registration.");
      }

      setSubmissionId(result.data?.id || "");
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmitError("");
    setSubmissionId("");
    setFormData({
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
  };

  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className="relative min-h-screen w-full bg-[#080604] text-white flex flex-col overflow-x-hidden selection:bg-[#991b1b] selection:text-white"
    >
      {/* HEADER COMPONENT */}
      <ComingSoonHeader isAbsolute={false} />

      {/* BACKGROUND AMBIENT GLOWS (Matching CONTACT US) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#d49a37]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-80 right-0 w-[450px] h-[450px] bg-[#991b1b]/8 rounded-full blur-[150px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative z-10 w-full pt-6 sm:pt-9 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#cca043]/40 bg-[#cca043]/10 text-[#d49a37] text-[10.5px] sm:text-[11px] font-black tracking-[0.18em] uppercase mb-2 shadow-sm">
          <FaMapMarkerAlt className="text-[10px]" />
          <span>RAJGIR, BIHAR, INDIA | 2027</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight font-graduate">
          VOLUNTEER <span className="text-[#d49a37]">REGISTRATION</span>
        </h1>
      </section>

      {/* MAIN SECTION WITH FORM CARD */}
      <main className="relative z-10 w-full px-4 sm:px-6 md:px-8 pb-12 sm:pb-16 flex-1 flex justify-center">
        <div className="w-full max-w-[620px] mx-auto">
          <div className="w-full rounded-2xl border border-[#cca043]/35 bg-[#0f0c09]/95 backdrop-blur-md p-5 sm:p-6 lg:p-7 shadow-xl relative">
            {/* Form Heading */}
            <div className="text-left mb-4">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#d49a37]">
                ON-GROUND CREW APPLICATION
              </span>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase tracking-tight mt-0.5 font-graduate flex items-center gap-2">
                <FaHandsHelping className="text-[#d49a37] text-xl" />
                BECOME A VOLUNTEER
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Fill out the required credentials below to be assigned to your preferred race division.
              </p>
            </div>

            {/* SUCCESS CONFIRMATION STATE */}
            {submitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-2xl mb-3 shadow-lg shadow-emerald-950/40">
                  <FaCheckCircle />
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase text-white font-graduate">
                  APPLICATION RECEIVED!
                </h3>
                <p className="text-xs text-neutral-300 mt-2 max-w-md leading-relaxed">
                  Thank you, <strong className="text-white">{formData.fullName}</strong>! Your
                  volunteer application for the <strong className="text-[#d49a37]">{formData.rolePreference}</strong> team
                  has been recorded in local storage.
                </p>
                {submissionId && (
                  <p className="text-[11px] font-mono mt-2 text-[#d49a37] bg-white/[0.04] px-3 py-1 rounded-md border border-white/10">
                    ID: {submissionId}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-5 px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  SUBMIT ANOTHER RESPONSE
                </button>
              </div>
            ) : (
              /* FORM BODY */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                {/* 1. PERSONAL DETAILS */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        FULL NAME <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="e.g. Amit Kumar"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        EMAIL ADDRESS <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="volunteer@example.com"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        PHONE NUMBER <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                          })
                        }
                        placeholder="10-digit mobile number"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    {/* T-Shirt Size */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        T-SHIRT SIZE <span className="text-[#e51b24]">*</span>
                      </label>
                      <select
                        required
                        value={formData.tShirtSize}
                        onChange={(e) =>
                          setFormData({ ...formData, tShirtSize: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#14100c] border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-[13px] outline-none transition-all cursor-pointer"
                      >
                        {TSHIRT_SIZES.map((size) => (
                          <option key={size} value={size} className="bg-[#14100c] text-white">
                            Size {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 2. EMERGENCY CONTACT GROUP */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d49a37] block mb-2">
                    EMERGENCY CONTACT
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        CONTACT PERSON NAME <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.emergencyContactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContactName: e.target.value,
                          })
                        }
                        placeholder="Emergency contact name"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        CONTACT PHONE NUMBER <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.emergencyContactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContactPhone: e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
                        }
                        placeholder="Emergency contact phone"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. AVAILABILITY CHECKLIST */}
                <div className="pt-2 border-t border-white/10">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                    AVAILABILITY CHECKLIST <span className="text-[#e51b24]">*</span>
                    <span className="text-neutral-500 lowercase font-normal ml-2">
                      (choose all that apply)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABILITY_SLOTS.map((slot) => {
                      const isSelected = formData.availability.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleAvailabilityToggle(slot)}
                          className={`py-2 px-2.5 rounded-lg border flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                            isSelected
                              ? "bg-[#cca043]/20 border-[#cca043] text-white shadow-sm shadow-amber-950/40"
                              : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:border-white/25 hover:bg-white/[0.04]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-[#b91c1c] focus:ring-[#cca043] accent-[#b91c1c] cursor-pointer"
                          />
                          <span className="text-xs font-bold">{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. ROLE PREFERENCE */}
                <div className="pt-2 border-t border-white/10">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    ROLE PREFERENCE <span className="text-[#e51b24]">*</span>
                  </label>
                  <select
                    required
                    value={formData.rolePreference}
                    onChange={(e) =>
                      setFormData({ ...formData, rolePreference: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#14100c] border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-[13px] outline-none transition-all cursor-pointer"
                  >
                    {VOLUNTEER_ROLES.map((role) => (
                      <option key={role} value={role} className="bg-[#14100c] text-white">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. ADDITIONAL CONTEXT */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d49a37] block mb-2">
                    ADDITIONAL CONTEXT
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        LANGUAGES SPOKEN
                      </label>
                      <input
                        type="text"
                        value={formData.languagesSpoken}
                        onChange={(e) =>
                          setFormData({ ...formData, languagesSpoken: e.target.value })
                        }
                        placeholder="e.g. Hindi, English, Magahi"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        DIETARY RESTRICTIONS / ALLERGIES
                      </label>
                      <input
                        type="text"
                        value={formData.dietaryRestrictions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dietaryRestrictions: e.target.value,
                          })
                        }
                        placeholder="e.g. Vegetarian, Nut allergy"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. CERTIFICATIONS & WAIVER */}
                <div className="pt-2 border-t border-white/10 space-y-2.5">
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.medicalCertification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          medicalCertification: e.target.checked,
                        })
                      }
                      className="w-4 h-4 rounded text-[#b91c1c] focus:ring-[#cca043] accent-[#b91c1c] cursor-pointer mt-0.5"
                    />
                    <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">
                      I hold a valid Medical / First Aid / CPR certification.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      required
                      checked={formData.waiverAgreed}
                      onChange={(e) =>
                        setFormData({ ...formData, waiverAgreed: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#b91c1c] focus:ring-[#cca043] accent-[#b91c1c] cursor-pointer mt-0.5"
                    />
                    <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">
                      I agree to the volunteer liability waiver and terms of the Rajgir Marathon. <span className="text-[#e51b24]">*</span>
                    </span>
                  </label>
                </div>

                {/* ERROR NOTIFICATION */}
                {submitError && (
                  <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center justify-between animate-fadeIn">
                    <span>{submitError}</span>
                    <button
                      type="button"
                      onClick={() => setSubmitError("")}
                      className="text-neutral-400 hover:text-white text-base leading-none font-bold ml-2 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-5 rounded-lg bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] hover:brightness-110 active:scale-[0.99] text-[#080604] font-black tracking-wider text-xs sm:text-[13px] uppercase flex items-center justify-center gap-2 shadow-md shadow-amber-950/50 transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  {isSubmitting ? (
                    <span>SUBMITTING REGISTRATION...</span>
                  ) : (
                    <>
                      <span>SUBMIT VOLUNTEER REGISTRATION</span>
                      <FaArrowRight className="text-xs" />
                    </>
                  )}
                </button>

                <p className="text-[10.5px] text-neutral-400 text-center mt-0.5">
                  * All fields marked with an asterisk are required. We respect your privacy.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER COMPONENT */}
      <ComingSoonFooter />
    </div>
  );
}

