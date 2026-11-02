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

  const RECIPIENT_EMAIL =
    process.env.NEXT_PUBLIC_CONTACT_RECIPIENT_EMAIL || "rajgirmarathon@gmail.com";

  const GOOGLE_SHEET_WEBHOOK_URL =
    process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL ||
    "https://script.google.com/macros/s/AKfycbxCdMUo3kdmjtEfdje7tmodDtbGBp_Zr-6tqZqFSAGDMYNhy51sa0d-xQ_nFunvWOOo/exec";

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    const tab = searchParams.get("tab")?.toLowerCase();
    if (tab) {
      const valid = getValidRole(tab);
      setActiveRole(valid);
    }
    const distParam = searchParams.get("dist") || searchParams.get("distance");
    if (distParam) {
      const match = getValidDistance(distParam);
      setFormData((prev) => ({ ...prev, preferredDistance: match }));
    }
  }, [searchParams]);

  const handleRoleSelect = (roleId: string) => {
    setActiveRole(roleId);
    router.replace(`/contact?tab=${roleId}`, { scroll: false });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numeric = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: numeric }));

      if (touched.phone) {
        if (!numeric) {
          setErrors((prev) => ({ ...prev, phone: "Phone number is required." }));
        } else if (numeric.length < 10) {
          setErrors((prev) => ({
            ...prev,
            phone: `Must be exactly 10 digits (${numeric.length}/10).`,
          }));
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
          setErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address.",
          }));
        } else {
          setErrors((prev) => ({ ...prev, email: "" }));
        }
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "phone") {
      if (!value) {
        setErrors((prev) => ({ ...prev, phone: "Phone number is required." }));
      } else if (value.length < 10) {
        setErrors((prev) => ({
          ...prev,
          phone: `Must be exactly 10 digits (${value.length}/10).`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }

    if (name === "email") {
      if (!value) {
        setErrors((prev) => ({ ...prev, email: "Email address is required." }));
      } else if (!emailRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address.",
        }));
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
      const activeRoleLabel =
        roleOptions.find((r) => r.id === activeRole)?.label || activeRole;

      const payload: Record<string, string> = {
        "Enquiry Category": activeRoleLabel,
        "Full Name": formData.name,
        "Email Address": formData.email,
        "Phone Number": formData.phone,
      };

      if (activeRole === "runner") {
        if (formData.location) payload["Location"] = formData.location;
        if (formData.preferredDistance)
          payload["Preferred Distance"] = formData.preferredDistance;
      } else if (activeRole === "volunteer") {
        if (formData.location) payload["Location"] = formData.location;
        if (formData.profession)
          payload["Profession / Occupation"] = formData.profession;
      } else if (activeRole === "sponsor") {
        if (formData.organization)
          payload["Organization / Brand Name"] = formData.organization;
        if (formData.designation)
          payload["Designation / Role"] = formData.designation;
        if (formData.budget) payload["Budget"] = formData.budget;
      }

      payload["Message"] = formData.message;

      const emailPayload = {
        ...payload,
        _subject: `Rajgir Marathon [${activeRoleLabel}] Enquiry: ${formData.name}`,
        _template: "table",
        _captcha: "false",
      };

      // 1. Email Submission via FormSubmit
      const sendEmail = async () => {
        try {
          const response = await fetch(
            `https://formsubmit.co/ajax/${RECIPIENT_EMAIL}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(emailPayload),
            }
          );
          const data = await response.json();
          if (response.ok && (data.success === "true" || data.success === true)) {
            return { success: true };
          }
          return { success: false, error: data.message || "Email delivery failed" };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return { success: false, error: message };
        }
      };

      // 2. Google Sheets Live Webhook
      const sendToGoogleSheet = async () => {
        try {
          await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: "POST",
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(payload),
            mode: "no-cors",
          });
          return { success: true };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error";
          return { success: false, error: message };
        }
      };

      const [emailRes, sheetRes] = await Promise.allSettled([
        sendEmail(),
        sendToGoogleSheet(),
      ]);

      const emailSuccess =
        emailRes.status === "fulfilled" && emailRes.value.success;
      const sheetSuccess =
        sheetRes.status === "fulfilled" && sheetRes.value.success;

      if (emailSuccess || sheetSuccess) {
        setSubmitted(true);
        if (!emailSuccess && emailRes.status === "fulfilled") {
          console.warn(
            "Notice: Email notification encountered an issue, but lead was recorded in Google Sheets:",
            emailRes.value?.error
          );
        }
        if (!sheetSuccess && sheetRes.status === "fulfilled") {
          console.warn(
            "Notice: Google Sheets sync encountered an issue, but lead was emailed:",
            sheetRes.value?.error
          );
        }
      } else {
        const errorMsg =
          (emailRes.status === "fulfilled" && emailRes.value.error) ||
          (sheetRes.status === "fulfilled" && sheetRes.value.error) ||
          "Failed to submit enquiry. Please try again.";
        setSubmitError(errorMsg);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError(
        "Failed to submit enquiry. Please check your internet connection."
      );
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
    <div className="w-full max-w-[585px] mx-auto">
      <div className="w-full rounded-2xl border border-[#cca043]/35 bg-[#0f0c09]/95 backdrop-blur-md p-5 sm:p-6 lg:p-7 shadow-xl relative">
        {/* Form Heading */}
        <div className="text-left mb-4">
          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#d49a37]">
            CONNECT WITH US
          </span>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase tracking-tight mt-0.5 font-graduate">
            {roleHeadings[activeRole] || "BECOME A RUNNER"}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Please select your category and fill in the required fields below.
          </p>
        </div>

        {/* SUCCESS CONFIRMATION STATE */}
        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center text-2xl mb-3 shadow-lg shadow-emerald-950/40">
              <FaCheckCircle />
            </div>
            <h3 className="text-lg sm:text-xl font-black uppercase text-white font-graduate">
              MESSAGE RECEIVED!
            </h3>
            <p className="text-xs text-neutral-300 mt-2 max-w-md leading-relaxed">
              Thank you, <strong className="text-white">{formData.name}</strong>! Your
              enquiry regarding{" "}
              <strong className="text-[#d49a37]">
                {roleOptions.find((r) => r.id === activeRole)?.label}
              </strong>{" "}
              has been delivered. Our team will get back to you at{" "}
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
          /* FORM BODY */
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
            {/* ROLE SELECTION TABS */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1.5">
                I AM CONTACTING AS <span className="text-[#e51b24]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roleOptions.map((role) => {
                  const Icon = role.icon;
                  const isSelected = activeRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={`py-2 px-1.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#cca043]/20 border-[#cca043] text-white shadow-sm shadow-amber-950/40"
                          : "bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white hover:border-white/25 hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        className={`text-sm ${
                          isSelected ? "text-[#d49a37]" : "text-neutral-400"
                        }`}
                      />
                      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-tight text-center leading-tight">
                        {role.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ROW 1: FULL NAME & EMAIL (REQUIRED) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                  FULL NAME <span className="text-[#e51b24]">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                />
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300">
                    EMAIL ADDRESS <span className="text-[#e51b24]">*</span>
                  </label>
                  {touched.email && errors.email && (
                    <span className="text-[10px] text-red-400 font-semibold animate-fadeIn">
                      Invalid
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  maxLength={80}
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email"
                  className={`w-full px-3 py-2 rounded-lg bg-white/[0.05] border text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all ${
                    touched.email && errors.email
                      ? "border-red-500/80 bg-red-500/[0.05] focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-white/15 focus:border-[#cca043] focus:bg-white/[0.08]"
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-[10.5px] text-red-400 font-medium mt-1 animate-fadeIn">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* ROW 2: PHONE & ROLE-SPECIFIC FIELD (LOCATION OR ORGANIZATION) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Phone Number */}
              <div
                className={
                  activeRole === "general" ? "sm:col-span-2" : "sm:col-span-1"
                }
              >
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                  PHONE NUMBER <span className="text-[#e51b24]">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Phone"
                  className={`w-full px-3 py-2 rounded-lg bg-white/[0.05] border text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all ${
                    touched.phone && errors.phone
                      ? "border-red-500/80 bg-red-500/[0.05] focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-white/15 focus:border-[#cca043] focus:bg-white/[0.08]"
                  }`}
                />
                {touched.phone && errors.phone && (
                  <p className="text-[10.5px] text-red-400 font-medium mt-1 animate-fadeIn">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Location Field (Runner & Volunteer) */}
              {(activeRole === "runner" || activeRole === "volunteer") && (
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    LOCATION <span className="text-[#e51b24]">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                  />
                </div>
              )}

              {/* Sponsor Organization Name (Required) */}
              {activeRole === "sponsor" && (
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    ORGANIZATION / BRAND NAME <span className="text-[#e51b24]">*</span>
                  </label>
                  <input
                    type="text"
                    name="organization"
                    required
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Organization / Brand Name"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* VOLUNTEER PROFESSION FIELD */}
            {activeRole === "volunteer" && (
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                  PROFESSION / OCCUPATION
                </label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Profession"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                />
              </div>
            )}

            {/* SPONSOR FIELDS: DESIGNATION & BUDGET */}
            {activeRole === "sponsor" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Designation */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    DESIGNATION / ROLE
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder="Designation"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                    BUDGET
                  </label>
                  <input
                    type="text"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Budget"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* RUNNER PREFERRED DISTANCE PILLS */}
            {activeRole === "runner" && (
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                  PREFERRED DISTANCE
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {["42.2 KM", "21.1 KM", "10 KM", "5 KM", "3 KM"].map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, preferredDistance: dist }))
                      }
                      className={`px-3 py-1 rounded-md text-[11.5px] font-bold transition-all cursor-pointer ${
                        formData.preferredDistance === dist
                          ? "bg-[#b91c1c] text-white shadow-sm"
                          : "bg-white/[0.04] text-neutral-400 hover:text-white border border-white/10"
                      }`}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGE (REQUIRED) */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
                MESSAGE <span className="text-[#e51b24]">*</span>
              </label>
              <textarea
                name="message"
                required
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Message"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/15 focus:border-[#cca043] focus:bg-white/[0.08] text-white placeholder:text-neutral-500 text-xs sm:text-[13px] outline-none transition-all resize-none"
              />
            </div>

            {/* ERROR NOTIFICATION IF SUBMIT FAILS */}
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
              className="w-full py-2.5 sm:py-3 px-5 rounded-lg bg-gradient-to-r from-[#991b1b] via-[#b91c1c] to-[#dc2626] hover:brightness-115 active:scale-[0.99] text-white font-black tracking-wider text-xs sm:text-[13px] uppercase flex items-center justify-center gap-2 shadow-md shadow-red-950/40 transition-all cursor-pointer disabled:opacity-50 mt-1"
            >
              {isSubmitting ? (
                <span>SENDING MESSAGE...</span>
              ) : (
                <>
                  <span>SUBMIT ENQUIRY</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>

            <p className="text-[10.5px] text-neutral-400 text-center mt-0.5">
              * All fields marked with an asterisk are required. We respect your
              privacy.
            </p>
          </form>
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
      {/* HEADER COMPONENT */}
      <ComingSoonHeader isAbsolute={false} />

      {/* BACKGROUND AMBIENT GLOWS */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#d49a37]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-80 right-0 w-[450px] h-[450px] bg-[#991b1b]/8 rounded-full blur-[150px] pointer-events-none" />

      {/* COMPACT HERO SECTION */}
      <section className="relative z-10 w-full pt-6 sm:pt-9 pb-4 sm:pb-6 px-4 sm:px-6 text-center">
        {/* Heritage Subtitle Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#cca043]/40 bg-[#cca043]/10 text-[#d49a37] text-[10.5px] sm:text-[11px] font-black tracking-[0.18em] uppercase mb-2 shadow-sm">
          <FaMapMarkerAlt className="text-[10px]" />
          <span>RAJGIR, BIHAR, INDIA | 2027</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-tight font-graduate">
          CONTACT <span className="text-[#d49a37]">US</span>
        </h1>

        <p className="mt-1.5 text-neutral-300 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-medium">
          Have questions about the marathon, volunteer registration, or
          sponsorship opportunities? Reach out directly to our team — we are
          here to assist you.
        </p>
      </section>

      {/* COMPACT MAIN SECTION */}
      <main className="relative z-10 w-full px-4 sm:px-6 md:px-8 pb-12 sm:pb-16 flex-1 flex justify-center">
        <Suspense
          fallback={
            <div className="text-neutral-400 text-xs py-8">
              Loading form...
            </div>
          }
        >
          <ContactFormContent />
        </Suspense>
      </main>

      {/* FOOTER COMPONENT */}
      <ComingSoonFooter />
    </div>
  );
}
