"use client";

import React, { useState } from "react";
import ComingSoonHeader from "@/components/ComingSoonHeader";
import ComingSoonFooter from "@/components/ComingSoonFooter";
import {
  FaMapMarkerAlt,
  FaBullhorn,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

const PLATFORM_OPTIONS = ["Instagram", "TikTok", "YouTube", "Strava", "Blog"];

export default function InfluencerRegisterPage() {
  const [formData, setFormData] = useState({
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submissionId, setSubmissionId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register/influencer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit influencer proposal.");
      }

      setSubmissionId(result.data?.id || "");
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit proposal. Please try again.");
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
          INFLUENCER <span className="text-[#d49a37]">REGISTRATION</span>
        </h1>
      </section>

      {/* MAIN SECTION WITH FORM CARD */}
      <main className="relative z-10 w-full px-4 sm:px-6 md:px-8 pb-12 sm:pb-16 flex-1 flex justify-center">
        <div className="w-full max-w-[620px] mx-auto">
          <div className="w-full rounded-2xl border border-[#cca043]/35 bg-[#0f0c09]/95 backdrop-blur-md p-5 sm:p-6 lg:p-7 shadow-xl relative">
            {/* Form Heading */}
            <div className="text-left mb-4">
              <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#d49a37]">
                MEDIA & AMBASSADOR APPLICATION
              </span>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase tracking-tight mt-0.5 font-graduate flex items-center gap-2">
                <FaBullhorn className="text-[#d49a37] text-xl" />
                JOIN AS AN INFLUENCER
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Submit your social metrics and content deliverables. Our marketing & PR team will review your channel.
              </p>
            </div>

            {/* SUCCESS CONFIRMATION STATE */}
            {submitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-2xl mb-3 shadow-lg shadow-emerald-950/40">
                  <FaCheckCircle />
                </div>
                <h3 className="text-lg sm:text-xl font-black uppercase text-white font-graduate">
                  PROPOSAL DELIVERED!
                </h3>
                <p className="text-xs text-neutral-300 mt-2 max-w-md leading-relaxed">
                  Thank you, <strong className="text-white">{formData.fullName}</strong>! Your
                  partnership proposal has been submitted to local storage. Our media directors will reach out at <strong className="text-white">{formData.email}</strong>.
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
                  SUBMIT ANOTHER PROPOSAL
                </button>
              </div>
            ) : (
              /* FORM BODY (OMITTING ALL RUNNING BACKGROUND QUESTIONS) */
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                {/* 1. CREATOR IDENTITY */}
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        FULL LEGAL NAME <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="e.g. Priya Sen"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    {/* Stage Name / Handle */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        ONLINE HANDLE / STAGE NAME
                      </label>
                      <input
                        type="text"
                        value={formData.stageName}
                        onChange={(e) =>
                          setFormData({ ...formData, stageName: e.target.value })
                        }
                        placeholder="@yourhandle"
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
                        placeholder="creator@management.com"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        PHONE / WHATSAPP <span className="text-[#e51b24]">*</span>
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
                  </div>
                </div>

                {/* 2. BASE LOCATION */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d49a37] block mb-2">
                    BASE LOCATION
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        CITY
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="e.g. Patna, Delhi, Mumbai"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        COUNTRY <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        placeholder="Country of residence"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. SOCIAL MEDIA STATS GROUP */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#d49a37] block mb-2">
                    SOCIAL MEDIA REACH & METRICS
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Primary Platform */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        PRIMARY PLATFORM <span className="text-[#e51b24]">*</span>
                      </label>
                      <select
                        required
                        value={formData.primaryPlatform}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryPlatform: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#14100c] border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-[13px] outline-none transition-all cursor-pointer"
                      >
                        {PLATFORM_OPTIONS.map((plat) => (
                          <option key={plat} value={plat} className="bg-[#14100c] text-white">
                            {plat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Profile Link */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        PROFILE / CHANNEL URL <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={formData.profileUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, profileUrl: e.target.value })
                        }
                        placeholder="https://instagram.com/yourhandle"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    {/* Followers */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        FOLLOWER / SUBSCRIBER COUNT <span className="text-[#e51b24]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.followerCount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            followerCount: e.target.value,
                          })
                        }
                        placeholder="e.g. 50K, 250,000"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>

                    {/* Engagement Rate */}
                    <div>
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                        AVERAGE ENGAGEMENT RATE %
                      </label>
                      <input
                        type="text"
                        value={formData.engagementRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            engagementRate: e.target.value,
                          })
                        }
                        placeholder="e.g. 4.2%"
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. CONTENT NICHE */}
                <div className="pt-2 border-t border-white/10">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    TARGET AUDIENCE / CONTENT NICHE <span className="text-[#e51b24]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.targetNiche}
                    onChange={(e) =>
                      setFormData({ ...formData, targetNiche: e.target.value })
                    }
                    placeholder="e.g. Travel & Heritage, Fitness, Photography, Youth Culture"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                  />
                </div>

                {/* 5. COLLABORATION DELIVERABLES & EXPECTATIONS */}
                <div className="pt-2 border-t border-white/10">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    COLLABORATION DELIVERABLES & EXPECTATIONS <span className="text-[#e51b24]">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.collaborationDeliverables}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        collaborationDeliverables: e.target.value,
                      })
                    }
                    placeholder="Outline the content you will create (e.g. 2 Reels, 1 YouTube Vlog, 5 Stories) and what perks or compensation you expect from the marathon committee."
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all resize-none"
                  />
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

                {/* SUBMIT BUTTON (Matching Gold Gradient of INFLUENCER REGISTRATION) */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 sm:py-3 px-5 rounded-lg bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] hover:brightness-110 active:scale-[0.99] text-[#080604] font-black tracking-wider text-xs sm:text-[13px] uppercase flex items-center justify-center gap-2 shadow-md shadow-amber-950/50 transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  {isSubmitting ? (
                    <span>SUBMITTING PROPOSAL...</span>
                  ) : (
                    <>
                      <span>SUBMIT PARTNERSHIP APPLICATION</span>
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

