"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { LuActivity, LuArrowRight, LuBriefcase, LuCircleCheck, LuHandHeart, LuMessageSquare } from "react-icons/lu";
import { Breadcrumb, Button, Card, ChoiceChip, Field, Notice, PageHero, Textarea, TextInput } from "@/components/ui";

const roleOptions = [
  { id: "runner", label: "Runner", icon: LuActivity },
  { id: "volunteer", label: "Volunteer", icon: LuHandHeart },
  { id: "sponsor", label: "Sponsor / Partner", icon: LuBriefcase },
  { id: "general", label: "General Enquiry", icon: LuMessageSquare },
];

const roleHeadings: Record<string, string> = {
  runner: "Become a runner",
  volunteer: "Become a volunteer",
  sponsor: "Become a sponsor",
  general: "General enquiry",
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

  const errInvalid = (k: string) => Boolean(touched[k] && errors[k]);

  return (
    <Card className="mx-auto w-full max-w-[680px]">
      <div className="mb-5 border-b border-charcoal-200 pb-4 text-left">
        <p className="text-xs font-semibold text-charcoal-500">Connect with us</p>
        <h2 className="mt-0.5 font-barlow text-2xl font-bold uppercase text-charcoal-900">
          {roleHeadings[activeRole] || "Become a runner"}
        </h2>
        <p className="mt-1 text-sm text-charcoal-500">
          Please select your category and fill in the required fields below.
        </p>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
            <LuCircleCheck className="h-8 w-8" aria-hidden />
          </span>
          <h3 className="font-barlow text-3xl font-bold uppercase text-charcoal-900">Message received</h3>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-charcoal-600">
            Thank you, <strong className="text-charcoal-900">{formData.name}</strong>! Your enquiry regarding{" "}
            <strong className="text-charcoal-900">{roleOptions.find((r) => r.id === activeRole)?.label}</strong> has been
            delivered. Our team will get back to you at <strong className="text-charcoal-900">{formData.email}</strong>.
          </p>
          <Button type="button" variant="secondary" onClick={handleReset} className="mt-6">
            Send another message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <p id="contact-role-label" className="mb-1.5 text-sm font-semibold text-charcoal-800">
              I am contacting as <span aria-hidden className="text-brand-red">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-labelledby="contact-role-label">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                return (
                  <ChoiceChip
                    key={role.id}
                    selected={activeRole === role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="h-auto min-h-[44px] flex-col gap-1 px-2 py-2.5 text-center text-xs"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="leading-tight">{role.label}</span>
                  </ChoiceChip>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="contact-name" required>
              <TextInput
                id="contact-name"
                type="text"
                name="name"
                required
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
              />
            </Field>

            <Field label="Email address" htmlFor="contact-email" required error={errInvalid("email") ? errors.email : undefined}>
              <TextInput
                id="contact-email"
                type="email"
                name="email"
                required
                maxLength={80}
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                aria-invalid={errInvalid("email") || undefined}
                aria-describedby={errInvalid("email") ? "contact-email-message" : undefined}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Phone number"
              htmlFor="contact-phone"
              required
              error={errInvalid("phone") ? errors.phone : undefined}
              className={activeRole === "general" ? "sm:col-span-2" : "sm:col-span-1"}
            >
              <TextInput
                id="contact-phone"
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
                placeholder="10-digit mobile number"
                aria-invalid={errInvalid("phone") || undefined}
                aria-describedby={errInvalid("phone") ? "contact-phone-message" : undefined}
              />
            </Field>

            {(activeRole === "runner" || activeRole === "volunteer") && (
              <Field label="Location" htmlFor="contact-location" required className="sm:col-span-1">
                <TextInput
                  id="contact-location"
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City or town"
                />
              </Field>
            )}

            {activeRole === "sponsor" && (
              <Field label="Organization / brand name" htmlFor="contact-organization" required className="sm:col-span-1">
                <TextInput
                  id="contact-organization"
                  type="text"
                  name="organization"
                  required
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Organization or brand"
                />
              </Field>
            )}
          </div>

          {activeRole === "volunteer" && (
            <Field label="Profession / occupation" htmlFor="contact-profession">
              <TextInput
                id="contact-profession"
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                placeholder="Profession"
              />
            </Field>
          )}

          {activeRole === "sponsor" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Designation / role" htmlFor="contact-designation">
                <TextInput
                  id="contact-designation"
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Designation"
                />
              </Field>
              <Field label="Budget" htmlFor="contact-budget">
                <TextInput
                  id="contact-budget"
                  type="text"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="Budget"
                />
              </Field>
            </div>
          )}

          {activeRole === "runner" && (
            <div>
              <p className="mb-1.5 text-sm font-semibold text-charcoal-800">Preferred distance</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Preferred distance">
                {["42.2 KM", "21.1 KM", "10 KM", "5 KM", "3 KM"].map((dist) => (
                  <ChoiceChip
                    key={dist}
                    selected={formData.preferredDistance === dist}
                    onClick={() => setFormData((p) => ({ ...p, preferredDistance: dist }))}
                  >
                    {dist}
                  </ChoiceChip>
                ))}
              </div>
            </div>
          )}

          <Field label="Message" htmlFor="contact-message" required>
            <Textarea
              id="contact-message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              placeholder="How can we help?"
            />
          </Field>

          {submitError && (
            <div className="flex items-start gap-2">
              <Notice tone="error" className="flex-1">
                {submitError}
              </Notice>
              <Button type="button" variant="secondary" size="sm" onClick={() => setSubmitError("")}>
                Dismiss
              </Button>
            </div>
          )}

          <Button type="submit" size="xl" fullWidth loading={isSubmitting} iconRight={LuArrowRight}>
            {isSubmitting ? "Sending message" : "Submit enquiry"}
          </Button>

          <p className="text-center text-xs text-charcoal-500">
            * Fields marked with an asterisk are required. We respect your privacy.
          </p>
        </form>
      )}
    </Card>
  );
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-manrope text-charcoal-900">
      <SiteHeader />
      <main className="flex-1 bg-surface-soft">
        <div className="mx-auto w-full max-w-[824px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
          <PageHero
            title="Contact us"
            subtitle="Have questions about the marathon, volunteer registration, or sponsorship opportunities? Reach out directly to our team. We are here to assist you."
            eyebrow={<span className="text-sm font-semibold text-charcoal-500">Rajgir, Bihar, India | 2027</span>}
          />
          <Suspense fallback={<p className="py-8 text-sm text-charcoal-500">Loading form...</p>}>
            <ContactFormContent />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
