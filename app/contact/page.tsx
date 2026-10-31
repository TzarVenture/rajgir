"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ComingSoonHeader from "@/components/ComingSoonHeader";
import ComingSoonFooter from "@/components/ComingSoonFooter";
import {
  FaMapMarkerAlt,
  FaRunning,
  FaHandsHelping,
  FaBriefcase,
  FaCommentDots,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";

const roleOptions = [
  { id: "runner", label: "Runner", icon: FaRunning },
  { id: "volunteer", label: "Volunteer", icon: FaHandsHelping },
  { id: "sponsor", label: "Sponsor / Partner", icon: FaBriefcase },
  { id: "general", label: "General Enquiry", icon: FaCommentDots },
];

const roleHeadings: Record<string, string> = {
  runner: "BECOME A RUNNER",
  volunteer: "BECOME A VOLUNTEER",
  sponsor: "BECOME A SPONSOR",
  general: "GENERAL ENQUIRY",
};

const getValidRole = (tab?: string | null) => {
  const tabMap: Record<string, string> = {
    runner: "runner",
    run: "runner",
    volunteer: "volunteer",
    sponsor: "sponsor",
    sponsors: "sponsor",
    general: "general",
    "race-info": "general",
    raceinfo: "general",
    enquiry: "general",
  };
  return tab && tabMap[tab] ? tabMap[tab] : "runner";
};

const getValidDistance = (dist?: string | null) => {
  const validDistances = ["42.2 KM", "21.1 KM", "10 KM", "5 KM", "3 KM"];
  if (!dist) return "21.1 KM";
  const match = validDistances.find((d) =>
    d.toLowerCase().startsWith(dist.toLowerCase())
  );
  return match || "21.1 KM";
};

function ContactFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeRole, setActiveRole] = useState(() =>
    getValidRole(searchParams.get("tab")?.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    profession: "",
    organization: "",
    designation: "",
    budget: "",
    preferredDistance: getValidDistance(
      searchParams.get("dist") || searchParams.get("distance")
    ),
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab")?.toLowerCase();
    if (tab) {
      setActiveRole(getValidRole(tab));
    }
    const distParam = searchParams.get("dist") || searchParams.get("distance");
    if (distParam) {
      setFormData((prev) => ({ ...prev, preferredDistance: getValidDistance(distParam) }));
    }
  }, [searchParams]);

  const handleRoleSelect = (roleId: string) => {
    setActiveRole(roleId);
    router.replace(`/contact?tab=${roleId}`);
  };

  const RECIPIENT_EMAIL = "rajgirmarathon@gmail.com";
  const GOOGLE_SHEET_WEBHOOK_URL =
    "https://script.google.com/macros/s/AKfycbxCdMUo3kdmjtEfdje7tmodDtbGBp_Zr-6tqZqFSAGDMYNhy51sa0d-xQ_nFunvWOOo/exec";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numeric = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: numeric }));
      if (touched.phone) {
        if (!numeric) {
          setErrors((prev) => ({ ...prev, phone: "Phone number is required." }));
        } else if (numeric.length < 10) {
          setErrors((prev) => ({ ...prev, phone: `Must be exactly 10 digits (${numeric.length}/10).` }));
        } else {
          setErrors((prev) => ({ ...prev, phone: "" }));
        }
      }
      return;
    }

    if (name === "email") {
      const cleanEmail = value.replace(/\s/g, "").slice(0, 80);
      setFormData((prev) => ({ ...prev, email: cleanEmail }));
      if (touched.email) {
        if (!cleanEmail) {
          setErrors((prev) => ({ ...prev, email: "Email address is required." }));
        } else if (!emailRegex.test(cleanEmail)) {
          setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
        } else {
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "phone") {
      if (!value) {
        setErrors((prev) => ({ ...prev, phone: "Phone number is required." }));
      } else if (value.length < 10) {
        setErrors((prev) => ({ ...prev, phone: `Must be exactly 10 digits (${value.length}/10).` }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }

    if (name === "email") {
      if (!value) {
        setErrors((prev) => ({ ...prev, email: "Email address is required." }));
      } else if (!emailRegex.test(value)) {
        setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
      } else {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    const phoneValid = formData.phone && formData.phone.length === 10;
    const emailValid = formData.email && emailRegex.test(formData.email);

    if (!phoneValid || !emailValid) {
      setTouched((prev) => ({ ...prev, phone: true, email: true }));
      setErrors({
        phone: !phoneValid
          ? formData.phone
            ? `Phone number must be exactly 10 digits (${formData.phone.length}/10).`
            : "Phone number is required."
          : "",
        email: !emailValid ? "Please enter a valid email address." : "",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const activeRoleLabel = roleOptions.find((r) => r.id === activeRole)?.label || activeRole;
      const payload: Record<string, string> = {
        "Enquiry Category": activeRoleLabel,
        "Full Name": formData.name,
        "Email Address": formData.email,
        "Phone Number": formData.phone,
      };

      if (activeRole === "runner") {
        if (formData.location) payload["Location"] = formData.location;
        if (formData.preferredDistance) payload["Preferred Distance"] = formData.preferredDistance;
      } else if (activeRole === "volunteer") {
        if (formData.location) payload["Location"] = formData.location;
        if (formData.profession) payload["Profession / Occupation"] = formData.profession;
      } else if (activeRole === "sponsor") {
        if (formData.organization) payload["Organization / Brand Name"] = formData.organization;
        if (formData.designation) payload["Designation / Role"] = formData.designation;
        if (formData.budget) payload["Budget"] = formData.budget;
      }

      payload["Message"] = formData.message;

      const emailPayload = {
        ...payload,
        _subject: `Rajgir Marathon [${activeRoleLabel}] Enquiry: ${formData.name}`,
        _template: "table",
        _captcha: "false",
      };

      const sendEmail = async () => {
        try {
          const response = await fetch(`https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(emailPayload),
          });
          const data = await response.json();
          return { success: response.ok && (data.success === "true" || data.success === true) };
        } catch {
          return { success: false };
        }
      };

      const sendToGoogleSheet = async () => {
        try {
          await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(payload),
            mode: "no-cors",
          });
          return { success: true };
        } catch {
          return { success: false };
        }
      };

      const [emailRes, sheetRes] = await Promise.allSettled([sendEmail(), sendToGoogleSheet()]);
      const emailSuccess = emailRes.status === "fulfilled" && emailRes.value.success;
      const sheetSuccess = sheetRes.status === "fulfilled" && sheetRes.value.success;

      if (emailSuccess || sheetSuccess) {
        setSubmitted(true);
      } else {
        setSubmitError("Failed to submit enquiry. Please try again or email rajgirmarathon@gmail.com directly.");
      }
    } catch {
      setSubmitError("Failed to submit enquiry. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSubmitError("");
    setErrors({});
    setTouched({});
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      profession: "",
      organization: "",
      designation: "",
      budget: "",
      preferredDistance: "21.1 KM",
      message: "",
    });
  };

  return (
    <div className="w-full max-w-[620px] mx-auto">
      <div className="w-full rounded-2xl border border-[#cca043]/35 bg-[#0f0c09]/95 backdrop-blur-md p-5 sm:p-6 lg:p-7 shadow-xl relative">
        <div className="text-left mb-4">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#d49a37]">
            CONNECT WITH US
          </span>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase tracking-tight mt-0.5">
            {roleHeadings[activeRole] || "BECOME A RUNNER"}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Please select your category and fill in the required fields below.
          </p>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-2xl mb-3 shadow-lg shadow-emerald-950/40">
              <FaCheckCircle />
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase text-white">
              MESSAGE RECEIVED!
            </h3>
            <p className="text-xs text-neutral-300 mt-2 max-w-md">
              Thank you, <strong className="text-white">{formData.name}</strong>! Your enquiry regarding{" "}
              <strong className="text-[#d49a37]">
                {roleOptions.find((r) => r.id === activeRole)?.label}
              </strong>{" "}
              has been recorded. Our team will get back to you at{" "}
              <strong className="text-white">{formData.email}</strong>.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              SEND ANOTHER MESSAGE
            </button>
          </div>
        ) : (
          <>
            {/* Category selection tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`py-2 px-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#cca043]/20 border-[#cca043] text-white shadow-md shadow-[#cca043]/10"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <Icon className={`text-base mb-1 ${isSelected ? "text-[#d49a37]" : "text-neutral-400"}`} />
                    <span className="text-[11px] font-bold leading-tight">{role.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left text-xs">
              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#cca043]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@example.com"
                    className={`w-full bg-white/5 border rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none ${
                      errors.email ? "border-red-500" : "border-white/15 focus:border-[#cca043]"
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Phone Number (10 digits) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="9876543210"
                    className={`w-full bg-white/5 border rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none ${
                      errors.phone ? "border-red-500" : "border-white/15 focus:border-[#cca043]"
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-400 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {activeRole === "runner" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">Preferred Distance</label>
                    <select
                      name="preferredDistance"
                      value={formData.preferredDistance}
                      onChange={handleChange}
                      className="w-full bg-[#1b1612] border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#cca043]"
                    >
                      <option value="42.2 KM">42.2 KM (Full Marathon)</option>
                      <option value="21.1 KM">21.1 KM (Half Marathon)</option>
                      <option value="10 KM">10 KM Run</option>
                      <option value="5 KM">5 KM Run</option>
                      <option value="3 KM">3 KM Fun Run</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">City / Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Rajgir, Patna, Delhi"
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#cca043]"
                    />
                  </div>
                </div>
              )}

              {activeRole === "volunteer" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">Profession / Occupation</label>
                    <input
                      type="text"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      placeholder="Student / Working Professional"
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#cca043]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">Current City</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Rajgir, Nalanda"
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#cca043]"
                    />
                  </div>
                </div>
              )}

              {activeRole === "sponsor" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">Brand / Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="Company Name"
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#cca043]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g. Marketing Head"
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#cca043]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-300 mb-1">Budget / Tier</label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="e.g. Title / Hydration / Expo"
                      className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#cca043]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-300 mb-1">Message / Notes</label>
                <textarea
                  name="message"
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#cca043] resize-none"
                />
              </div>

              {submitError && (
                <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] text-white font-extrabold tracking-widest text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-950/25 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>SUBMITTING...</span>
                ) : (
                  <>
                    <span>SUBMIT ENQUIRY</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ComingSoonContactPage() {
  return (
    <div
      style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}
      className="relative min-h-screen w-full bg-[#080604] text-white flex flex-col overflow-x-hidden selection:bg-[#991b1b] selection:text-white"
    >
      <ComingSoonHeader isAbsolute={false} />

      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#d49a37]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-80 right-0 w-[450px] h-[450px] bg-[#991b1b]/8 rounded-full blur-[150px] pointer-events-none" />

      <section className="relative z-10 w-full pt-6 sm:pt-9 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#cca043]/40 bg-[#cca043]/10 text-[#d49a37] text-[10.5px] sm:text-[11px] font-black tracking-[0.18em] uppercase mb-2 shadow-sm">
          <FaMapMarkerAlt className="text-[10px]" />
          <span>RAJGIR, BIHAR, INDIA | 2027</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight">
          CONTACT <span className="text-[#d49a37]">US</span>
        </h1>

        <p className="mt-1.5 text-neutral-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-medium">
          Have questions about the marathon, volunteer registration, or sponsorship opportunities?
          Reach out directly to our team — we are here to assist you.
        </p>
      </section>

      <main className="relative z-10 w-full px-4 sm:px-6 md:px-8 pb-12 sm:pb-16 flex-1 flex justify-center">
        <Suspense fallback={<div className="text-neutral-400 text-xs py-8">Loading form...</div>}>
          <ContactFormContent />
        </Suspense>
      </main>

      <ComingSoonFooter />
    </div>
  );
}

