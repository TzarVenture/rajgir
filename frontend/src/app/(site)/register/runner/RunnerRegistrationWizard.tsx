"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LuArrowLeft,
  LuArrowRight,
  LuCircleCheck,
  LuClipboardCheck,
  LuHeartPulse,
  LuMapPin,
  LuShirt,
  LuUser,
} from "react-icons/lu";
import { raceCategories, availableAddons } from "@/lib/schemas/runnerRegistration";
import { EVENT, ageOnRaceDay, categoryOps, formatCutoff, formatDate } from "@/lib/event";
import BibPreview from "./BibPreview";
import TShirtSizeModal from "./TShirtSizeModal";
import OrderSummaryCard from "./OrderSummaryCard";
import { submitRunnerRegistration } from "@/app/actions/registerRunner";
import { AppUser } from "@/lib/auth/session";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ChoiceCard,
  ChoiceChip,
  Field,
  FieldMessage,
  Label,
  Notice,
  Select,
  StepProgress,
  TextInput,
  Textarea,
} from "@/components/ui";

const STEPS = [
  { id: 1, label: "Race Category" },
  { id: 2, label: "Runner & Bib" },
  { id: 3, label: "Emergency & Health" },
  { id: 4, label: "Logistics & Add-ons" },
  { id: 5, label: "Waiver & Review" },
];

interface RunnerRegistrationWizardProps {
  user?: AppUser;
}

/** Step heading block: icon tile, title, description. */
function StepHeader({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 border-b border-charcoal-200 pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-red-light text-brand-red">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <h2 className="text-lg font-bold text-charcoal-900">{title}</h2>
        <p className="mt-0.5 text-sm text-charcoal-500">{description}</p>
      </div>
    </div>
  );
}

function ReviewRow({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4 ${last ? "" : "border-b border-charcoal-200"}`}>
      <dt className="text-charcoal-500">{label}</dt>
      <dd className="font-semibold text-charcoal-900 sm:text-right">{children}</dd>
    </div>
  );
}

export default function RunnerRegistrationWizard({ user }: RunnerRegistrationWizardProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Identity is read from the signed-in account; the API binds the registration to it.
  const initialFirstName = user?.firstName?.trim() || "";
  const participantName = user?.name?.trim() || [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const accountEmail = user?.email || "";
  const accountPhone = user?.phone || "";

  // Initial distance from URL query (e.g. ?distance=21.1 or ?distance=42.2)
  const queryDist = searchParams.get("distance") || searchParams.get("dist");
  const initialCategory = (() => {
    if (!queryDist) return raceCategories[1]; // default 21.1 KM
    const matched = raceCategories.find((c) =>
      c.distance.toLowerCase().startsWith(queryDist.toLowerCase())
    );
    return matched || raceCategories[1];
  })();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDistance, setSelectedDistance] = useState(initialCategory.distance);

  // Form State
  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "Male" as "Male" | "Female" | "Other",
    bibName: initialFirstName ? initialFirstName.toUpperCase() : "",
    bloodGroup: "B+" as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-",
    tshirtSize: "L" as "XS" | "S" | "M" | "L" | "XL" | "XXL" | "3XL",
    emergencyName: "",
    emergencyRelation: "Parent",
    emergencyPhone: "",
    medicalNotes: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    runningClub: "",
    selectedAddons: [] as string[],
    couponCode: "",
    estimatedFinishTime: "",
    waiverAgreed: true,
  });

  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Age on race day: same rule as the API (lib/event.ts).
  const calculatedAge = formData.dateOfBirth ? ageOnRaceDay(formData.dateOfBirth) : 0;
  const currentCategory = raceCategories.find((c) => c.distance === selectedDistance) || raceCategories[0];
  const currentOps = categoryOps(currentCategory.distance);

  // Coupon calculations
  const calculateDiscount = (gross: number, code: string): number => {
    if (code === "RAJGIR100") return Math.round(gross * 0.1);
    if (code === "EARLYBIRD") return 200;
    return 0;
  };

  const addonsTotal = formData.selectedAddons.reduce((sum, id) => {
    const item = availableAddons.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const grossAmount = currentCategory.fee + addonsTotal;
  const discountAmount = calculateDiscount(grossAmount, formData.couponCode);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on touch
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const toggleAddon = (addonId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedAddons.includes(addonId);
      const updated = exists
        ? prev.selectedAddons.filter((id) => id !== addonId)
        : [...prev.selectedAddons, addonId];
      return { ...prev, selectedAddons: updated };
    });
  };

  // Validation per step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedDistance) errors.distance = "Please select a category.";
      const eft = formData.estimatedFinishTime.trim();
      if (currentOps.timed && eft) {
        const m = eft.match(/^(\d{1,2}):([0-5]\d)$/);
        const minutes = m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
        if (!m) errors.estimatedFinishTime = "Use H:MM, for example 2:05.";
        else if (minutes > currentOps.cutoffMinutes) {
          errors.estimatedFinishTime = `That is beyond the ${formatCutoff(currentOps.cutoffMinutes)} cut-off.`;
        } else if (minutes < currentOps.distanceKm * 2.5) {
          errors.estimatedFinishTime = "That is faster than the course record pace. Please check.";
        }
      }
    }

    if (step === 2) {
      if (!participantName) errors.identity = "Your account has no name. Please contact the help desk.";
      if (!formData.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required.";
      } else if (calculatedAge < currentCategory.minAge) {
        errors.dateOfBirth = `Minimum age for ${currentCategory.distance} is ${currentCategory.minAge} years (Your age on race day: ${calculatedAge}).`;
      }
      if (!formData.bibName.trim()) {
        errors.bibName = "Name on Bib is required.";
      } else if (formData.bibName.trim().length > 16) {
        errors.bibName = "Bib name cannot exceed 16 characters.";
      }
    }

    if (step === 3) {
      if (!formData.emergencyName.trim()) {
        errors.emergencyName = "Emergency contact name is required.";
      }
      if (!formData.emergencyPhone || formData.emergencyPhone.length !== 10) {
        errors.emergencyPhone = "Enter a valid 10-digit emergency phone number.";
      } else if (formData.emergencyPhone === accountPhone) {
        errors.emergencyPhone = "Emergency phone cannot be the same as your primary number.";
      }
    }

    if (step === 4) {
      if (!formData.city.trim()) errors.city = "City is required.";
      if (!formData.state.trim()) errors.state = "State is required.";
      if (!formData.pincode || formData.pincode.length !== 6) {
        errors.pincode = "Pincode must be 6 digits.";
      }
    }

    if (step === 5) {
      if (!formData.waiverAgreed) {
        errors.waiverAgreed = "You must agree to the event waiver to register.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 120, behavior: "smooth" });
      } else {
        handleSubmitFinal();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleSubmitFinal = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setGlobalError("");

    try {
      const payload = {
        distance: selectedDistance,
        raceTitle: currentCategory.title,
        baseFee: currentCategory.fee,
        dateOfBirth: formData.dateOfBirth,
        ageOnRaceDay: calculatedAge,
        gender: formData.gender,
        bibName: formData.bibName || initialFirstName.toUpperCase().slice(0, 16),
        bloodGroup: formData.bloodGroup,
        tshirtSize: formData.tshirtSize,
        emergencyName: formData.emergencyName,
        emergencyRelation: formData.emergencyRelation,
        emergencyPhone: formData.emergencyPhone,
        medicalNotes: formData.medicalNotes || undefined,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        runningClub: formData.runningClub || undefined,
        selectedAddons: formData.selectedAddons,
        grossAmount,
        discountAmount,
        netAmount: Math.max(1, grossAmount - discountAmount),
        couponCode: formData.couponCode || undefined,
        estimatedFinishTime: currentOps.timed ? formData.estimatedFinishTime.trim() || undefined : undefined,
        waiverAgreed: true,
      };

      const result = await submitRunnerRegistration(payload);

      if (result.success && result.registrationNumber) {
        router.push(`/register/runner/success?reg_no=${result.registrationNumber}`);
      } else {
        setGlobalError(result.error || "Failed to submit registration. Please try again.");
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      }
    } catch {
      setGlobalError("A network error occurred. Please check your connection and retry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Shared accessibility props: ties an input to its inline error text. */
  const a11y = (name: string) => ({
    id: `rr-${name}`,
    "aria-invalid": fieldErrors[name] ? (true as const) : undefined,
    "aria-describedby": fieldErrors[name] ? `rr-${name}-message` : undefined,
  });

  const netPayable = Math.max(0, grossAmount - discountAmount);

  return (
    <div className="w-full">
      {/* Step progress */}
      <Card className="mb-6">
        <StepProgress steps={STEPS.map((s) => s.label)} current={currentStep} />
      </Card>

      {/* Global error banner */}
      {globalError && (
        <Notice tone="error" className="mb-6">
          {globalError}
        </Notice>
      )}

      {/* Two-column layout: active step (left) + sticky order summary (right) */}
      <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        {/* LEFT: active step */}
        <Card className="min-w-0 text-left sm:p-7">
          {/* Mobile-only compact summary */}
          <div className="mb-5 flex items-center justify-between rounded-card border border-charcoal-200 bg-surface-soft p-3 lg:hidden">
            <div>
              <span className="block text-xs font-semibold text-charcoal-500">
                Selected: {selectedDistance} ({currentCategory.title})
              </span>
              <span className="text-sm font-bold text-charcoal-900">Total: ₹{netPayable.toLocaleString()}</span>
            </div>
            <Badge tone="neutral">Step {currentStep}/5</Badge>
          </div>

          {/* STEP 1: CATEGORY SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <StepHeader
                icon={LuUser}
                title="Choose your race category"
                description="Select your preferred challenge. All timed categories include official RFID bib chips and verified e-certificates."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2" role="group" aria-label="Race category">
                {raceCategories.map((cat) => {
                  const isSelected = selectedDistance === cat.distance;
                  return (
                    <ChoiceCard key={cat.distance} selected={isSelected} onClick={() => setSelectedDistance(cat.distance)} className="flex flex-col justify-between">
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <Badge tone={isSelected ? "brand" : "neutral"}>{cat.badge}</Badge>
                          <span className="text-xs font-semibold text-charcoal-500">Min age: {cat.minAge}y</span>
                        </div>

                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-barlow text-[44px] font-bold leading-none text-charcoal-900">{cat.distance}</span>
                          <span className="text-lg font-bold text-charcoal-900">₹{cat.fee.toLocaleString()}</span>
                        </div>
                        <p className="mb-3 mt-1 text-sm font-bold text-charcoal-700">{cat.title}</p>

                        <ul className="space-y-1.5 border-t border-charcoal-200 pt-3 text-sm text-charcoal-600">
                          {cat.inclusions.slice(0, 3).map((inc, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <LuCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#15803D]" aria-hidden />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-charcoal-200 pt-3 text-sm font-semibold">
                        <span className="text-charcoal-500">Cutoff: {cat.cutoff}</span>
                        <span className={isSelected ? "text-brand-red" : "text-charcoal-600"}>
                          {isSelected ? "Selected" : "Select category"}
                        </span>
                      </div>
                    </ChoiceCard>
                  );
                })}
              </div>
              <FieldMessage error={fieldErrors.distance} />

              {currentOps.timed ? (
                <Field
                  label="Expected finish time (optional)"
                  htmlFor="rr-estimatedFinishTime"
                  error={fieldErrors.estimatedFinishTime}
                  hint={`HH:MM, e.g. ${selectedDistance === "42.2 KM" ? "4:30" : selectedDistance === "21.1 KM" ? "2:05" : "0:58"}. Cut-off ${formatCutoff(currentOps.cutoffMinutes)}.`}
                  className="max-w-xs"
                >
                  <TextInput
                    {...a11y("estimatedFinishTime")}
                    name="estimatedFinishTime"
                    inputMode="numeric"
                    placeholder="H:MM"
                    maxLength={5}
                    value={formData.estimatedFinishTime}
                    onChange={handleInputChange}
                  />
                </Field>
              ) : null}
            </div>
          )}

          {/* STEP 2: RUNNER DETAILS & BIB CUSTOMIZATION */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <StepHeader
                icon={LuUser}
                title="Participant and bib personalization"
                description="Your custom name will be printed directly onto your official race bib timing chip."
              />

              {/* Name, email and mobile come from the account (stored once, on the user). */}
              <div className="rounded-card border border-charcoal-200 bg-surface-soft p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-charcoal-900">Participant (your account)</p>
                  <span className="text-xs text-charcoal-500">Registering as yourself</span>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div className="min-w-0">
                    <dt className="text-xs text-charcoal-500">Name</dt>
                    <dd className="truncate font-semibold text-charcoal-900">{participantName || "-"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-charcoal-500">Email</dt>
                    <dd className="break-all font-semibold text-charcoal-900">{accountEmail || "-"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-charcoal-500">Mobile</dt>
                    <dd className="font-semibold text-charcoal-900">{accountPhone ? `+91 ${accountPhone}` : "-"}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-charcoal-500">
                  Your name must match your photo ID; it is checked at bib collection. You can correct your name and mobile later from your runner profile.
                </p>
                {fieldErrors.identity ? <p className="mt-2 text-xs font-medium text-[#DC2626]">{fieldErrors.identity}</p> : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Date of birth"
                  htmlFor="rr-dateOfBirth"
                  required
                  error={fieldErrors.dateOfBirth}
                  hint={
                    formData.dateOfBirth ? (
                      <>
                        Age on race day ({formatDate(EVENT.raceDate)}): <strong>{calculatedAge} years</strong> (min {currentCategory.minAge}y)
                      </>
                    ) : undefined
                  }
                >
                  <TextInput
                    {...a11y("dateOfBirth")}
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </Field>

                <div>
                  <p id="rr-gender-label" className="mb-1.5 text-sm font-semibold text-charcoal-800">
                    Gender <span aria-hidden className="text-brand-red">*</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="rr-gender-label">
                    {["Male", "Female", "Other"].map((g) => (
                      <ChoiceChip
                        key={g}
                        selected={formData.gender === g}
                        onClick={() => setFormData((p) => ({ ...p, gender: g as "Male" | "Female" | "Other" }))}
                        className="h-12 px-2"
                      >
                        {g}
                      </ChoiceChip>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bib customization + live bib */}
              <div className="border-t border-charcoal-200 pt-5">
                <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
                  <div className="space-y-4 lg:col-span-7">
                    <Field
                      label="Name on race bib"
                      htmlFor="rr-bibName"
                      required
                      error={fieldErrors.bibName}
                      hint={`${formData.bibName.length}/16 characters max`}
                    >
                      <TextInput
                        {...a11y("bibName")}
                        type="text"
                        name="bibName"
                        required
                        maxLength={16}
                        value={formData.bibName}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            bibName: e.target.value.toUpperCase().slice(0, 16),
                          }))
                        }
                        placeholder="e.g. RAHUL K"
                        className="font-mono font-bold uppercase"
                      />
                    </Field>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Blood group" htmlFor="rr-bloodGroup" required>
                        <Select id="rr-bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </Select>
                      </Field>

                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor="rr-tshirtSize" required>
                            T-shirt size
                          </Label>
                          <button
                            type="button"
                            onClick={() => setSizeModalOpen(true)}
                            className="mb-1.5 inline-flex min-h-[24px] items-center gap-1 rounded-btn text-sm font-semibold text-brand-red hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
                          >
                            <LuShirt className="h-4 w-4" aria-hidden />
                            Size chart
                          </button>
                        </div>
                        <Select id="rr-tshirtSize" name="tshirtSize" value={formData.tshirtSize} onChange={handleInputChange}>
                          {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((sz) => (
                            <option key={sz} value={sz}>
                              Size {sz}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center lg:col-span-5">
                    <BibPreview bibName={formData.bibName} distance={selectedDistance} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EMERGENCY & HEALTH */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <StepHeader
                icon={LuHeartPulse}
                title="Emergency contact and medical information"
                description="Required by race medical marshals for emergency assistance on the course."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Emergency contact name" htmlFor="rr-emergencyName" required error={fieldErrors.emergencyName}>
                  <TextInput
                    {...a11y("emergencyName")}
                    type="text"
                    name="emergencyName"
                    required
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    placeholder="Contact person"
                  />
                </Field>

                <Field label="Relationship" htmlFor="rr-emergencyRelation" required>
                  <Select id="rr-emergencyRelation" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleInputChange}>
                    {["Parent", "Spouse", "Sibling", "Relative", "Friend", "Coach", "Other"].map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Emergency mobile (+91)" htmlFor="rr-emergencyPhone" required error={fieldErrors.emergencyPhone}>
                  <TextInput
                    {...a11y("emergencyPhone")}
                    type="tel"
                    inputMode="tel"
                    name="emergencyPhone"
                    required
                    maxLength={10}
                    value={formData.emergencyPhone}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData((p) => ({ ...p, emergencyPhone: num }));
                    }}
                    placeholder="10-digit mobile"
                  />
                </Field>
              </div>

              <Field label="Medical notes, drug allergies or pre-existing conditions (optional)" htmlFor="rr-medicalNotes">
                <Textarea
                  id="rr-medicalNotes"
                  name="medicalNotes"
                  rows={3}
                  value={formData.medicalNotes}
                  onChange={handleInputChange}
                  placeholder="e.g. Asthma, Penicillin allergy, Hypertension, etc. Leave blank if none."
                  className="resize-none"
                />
              </Field>
            </div>
          )}

          {/* STEP 4: LOGISTICS & ADD-ONS */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <StepHeader
                icon={LuMapPin}
                title="Location and optional event add-ons"
                description="Kit collection details and optional athlete shuttles or souvenir merchandise."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="City" htmlFor="rr-city" required error={fieldErrors.city}>
                  <TextInput
                    {...a11y("city")}
                    type="text"
                    name="city"
                    required
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Patna, Nalanda, Delhi"
                  />
                </Field>

                <Field label="State" htmlFor="rr-state" required error={fieldErrors.state}>
                  <TextInput
                    {...a11y("state")}
                    type="text"
                    name="state"
                    required
                    autoComplete="address-level1"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Bihar"
                  />
                </Field>

                <Field label="Pincode" htmlFor="rr-pincode" required error={fieldErrors.pincode}>
                  <TextInput
                    {...a11y("pincode")}
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => {
                      const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setFormData((p) => ({ ...p, pincode: pin }));
                    }}
                    placeholder="6-digit pincode"
                  />
                </Field>
              </div>

              <Field label="Running club / corporate team (optional)" htmlFor="rr-runningClub">
                <TextInput
                  id="rr-runningClub"
                  type="text"
                  name="runningClub"
                  value={formData.runningClub}
                  onChange={handleInputChange}
                  placeholder="e.g. Patna Striders, Bihar Police, TCS FitClub"
                />
              </Field>

              <div className="border-t border-charcoal-200 pt-5">
                <p id="rr-addons-label" className="mb-3 text-sm font-bold text-charcoal-900">
                  Enhance your marathon experience (optional add-ons)
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-labelledby="rr-addons-label">
                  {availableAddons.map((addon) => {
                    const isChecked = formData.selectedAddons.includes(addon.id);
                    return (
                      <ChoiceCard key={addon.id} selected={isChecked} onClick={() => toggleAddon(addon.id)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-charcoal-900">{addon.title}</h3>
                            <p className="text-sm leading-snug text-charcoal-600">{addon.description}</p>
                            <span className="mt-1 block text-sm font-bold text-charcoal-900">+₹{addon.price}</span>
                          </div>

                          <span
                            aria-hidden
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${
                              isChecked ? "border-brand-red bg-brand-red text-white" : "border-charcoal-300 bg-white"
                            }`}
                          >
                            {isChecked && <LuCircleCheck className="h-3.5 w-3.5" />}
                          </span>
                        </div>
                      </ChoiceCard>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: WAIVER & FINAL REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <StepHeader
                icon={LuClipboardCheck}
                title="Waiver, declaration and final review"
                description="Please review your registration details and agree to the event liability disclaimer."
              />

              <dl className="rounded-card border border-charcoal-200 bg-surface-soft px-4 text-sm">
                <ReviewRow label="Runner">
                  {participantName} ({formData.gender}, {calculatedAge}y)
                </ReviewRow>
                <ReviewRow label="Category">
                  {currentCategory.distance} ({currentCategory.title})
                </ReviewRow>
                <ReviewRow label="Name on bib">
                  <span className="font-mono">{formData.bibName}</span>
                </ReviewRow>
                <ReviewRow label="Contact">
                  {accountEmail} | +91 {accountPhone}
                </ReviewRow>
                <ReviewRow label="Emergency">
                  {formData.emergencyName} ({formData.emergencyRelation}) | +91 {formData.emergencyPhone}
                </ReviewRow>
                <ReviewRow label="Apparel size" last>
                  Size {formData.tshirtSize} (Dry-Fit)
                </ReviewRow>
              </dl>

              <div
                className="max-h-44 space-y-2 overflow-y-auto rounded-card border border-charcoal-200 bg-white p-4 text-sm leading-relaxed text-charcoal-700"
                tabIndex={0}
                role="region"
                aria-label="Participant declaration and assumption of risk"
              >
                <p className="font-bold text-charcoal-900">Participant declaration and assumption of risk</p>
                <p>1. I declare that I am physically fit and have sufficiently trained for participating in the Rajgir Marathon 2027.</p>
                <p>
                  2. I understand that running long distances involves inherent risk of physical injury. I hereby release the event organizers,
                  sponsors, volunteers, and the State of Bihar from any claims resulting from my participation.
                </p>
                <p>3. I authorize the medical team to administer emergency treatment if required.</p>
                <p>4. I agree that the registration fee is non-transferable and non-refundable.</p>
              </div>

              <div>
                <Checkbox
                  name="waiverAgreed"
                  checked={formData.waiverAgreed}
                  onChange={(e) => setFormData((p) => ({ ...p, waiverAgreed: e.target.checked }))}
                  aria-invalid={fieldErrors.waiverAgreed ? true : undefined}
                  aria-describedby={fieldErrors.waiverAgreed ? "rr-waiverAgreed-message" : undefined}
                >
                  I have read, understood, and accept the event rules, terms and conditions, and medical liability waiver.{" "}
                  <span aria-hidden className="text-brand-red">*</span>
                </Checkbox>
                <FieldMessage id="rr-waiverAgreed-message" error={fieldErrors.waiverAgreed} />
              </div>
            </div>
          )}

          {/* PREVIOUS / NEXT */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-charcoal-200 pt-5">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" size="lg" icon={LuArrowLeft} onClick={handlePrev}>
                Previous step
              </Button>
            ) : (
              <Link href="/" className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-charcoal-600 hover:text-charcoal-900">
                <LuArrowLeft className="h-4 w-4" aria-hidden />
                Back to home
              </Link>
            )}

            <Button
              type="button"
              size="lg"
              onClick={handleNext}
              disabled={isSubmitting}
              loading={isSubmitting}
              iconRight={currentStep < 5 ? LuArrowRight : LuCircleCheck}
            >
              {isSubmitting ? "Registering" : currentStep < 5 ? `Next: ${STEPS[currentStep]?.label || "Next"}` : "Confirm and register"}
            </Button>
          </div>
        </Card>

        {/* RIGHT: sticky order summary (below the form on mobile) */}
        <aside className="w-full lg:sticky lg:top-24">
          <OrderSummaryCard
            categoryTitle={currentCategory.title}
            distance={selectedDistance}
            baseFee={currentCategory.fee}
            selectedAddonIds={formData.selectedAddons}
            onRemoveAddon={toggleAddon}
            couponCode={formData.couponCode}
            onApplyCoupon={(code) => setFormData((p) => ({ ...p, couponCode: code }))}
            onRemoveCoupon={() => setFormData((p) => ({ ...p, couponCode: "" }))}
            discountAmount={discountAmount}
            currentStep={currentStep}
            totalSteps={5}
            onNextStep={handleNext}
            isSubmitting={isSubmitting}
            canProceed={true}
          />
        </aside>
      </div>

      {/* Sizing chart modal */}
      <TShirtSizeModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        selectedSize={formData.tshirtSize}
        onSelectSize={(size) => setFormData((p) => ({ ...p, tshirtSize: size }))}
      />
    </div>
  );
}
