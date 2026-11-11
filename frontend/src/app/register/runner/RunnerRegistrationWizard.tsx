"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaCheckCircle,
  FaRunning,
  FaUser,
  FaHeartbeat,
  FaMapMarkerAlt,
  FaFileContract,
  FaArrowLeft,
  FaArrowRight,
  FaExclamationTriangle,
  FaTshirt,
  FaPlus,
  FaCheck,
  FaCalendarAlt,
} from "react-icons/fa";
import { raceCategories, availableAddons } from "@/lib/schemas/runnerRegistration";
import BibPreview from "./BibPreview";
import TShirtSizeModal from "./TShirtSizeModal";
import OrderSummaryCard from "./OrderSummaryCard";
import { submitRunnerRegistration } from "@/app/actions/registerRunner";

const STEPS = [
  { id: 1, label: "Race Category", icon: FaRunning },
  { id: 2, label: "Runner & Bib", icon: FaUser },
  { id: 3, label: "Emergency & Health", icon: FaHeartbeat },
  { id: 4, label: "Logistics & Add-ons", icon: FaMapMarkerAlt },
  { id: 5, label: "Waiver & Review", icon: FaFileContract },
];

export default function RunnerRegistrationWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male" as "Male" | "Female" | "Other",
    bibName: "",
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
    waiverAgreed: true,
  });

  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Auto-calculate age on race day (Nov 2027)
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const raceDate = new Date("2027-11-21");
    let age = raceDate.getFullYear() - dob.getFullYear();
    const m = raceDate.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && raceDate.getDate() < dob.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const calculatedAge = calculateAge(formData.dateOfBirth);
  const currentCategory = raceCategories.find((c) => c.distance === selectedDistance) || raceCategories[0];

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
    }

    if (step === 2) {
      if (!formData.firstName.trim()) errors.firstName = "First name is required.";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
      if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = "Enter a valid email address.";
      }
      if (!formData.phone || formData.phone.length !== 10) {
        errors.phone = "Enter a valid 10-digit mobile number.";
      }
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
      } else if (formData.emergencyPhone === formData.phone) {
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
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        ageOnRaceDay: calculatedAge,
        gender: formData.gender,
        bibName: formData.bibName || formData.firstName,
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* 1. TOP STEPPER PROGRESS BAR */}
      <div className="mb-8">
        <div className="hidden sm:grid grid-cols-5 relative items-start">
          {/* Background Track - perfectly bounded between Step 1 center (10%) and Step 5 center (90%) */}
          <div
            className="absolute top-5 h-0.5 bg-white/10 -translate-y-1/2 z-0"
            style={{ left: "10%", right: "10%" }}
          />

          {/* Active Progress Fill */}
          <div
            className="absolute top-5 h-0.5 -translate-y-1/2 z-0 overflow-hidden pointer-events-none"
            style={{ left: "10%", right: "10%" }}
          >
            <div
              className="h-full bg-[#cca043] transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`relative z-10 flex flex-col items-center cursor-pointer group px-1 text-center ${
                  step.id < currentStep ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200 border-2 ${
                    isCompleted
                      ? "bg-[#cca043] text-black border-[#cca043]"
                      : isCurrent
                      ? "bg-black text-[#cca043] border-[#cca043] scale-110"
                      : "bg-[#14100c] text-white/50 border-white/20"
                  }`}
                >
                  {isCompleted ? <FaCheck className="text-xs" /> : <Icon />}
                </div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider mt-2 transition-colors text-center ${
                    isCurrent ? "text-[#cca043]" : isCompleted ? "text-white" : "text-white/40"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Step Indicator */}
        <div className="sm:hidden flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#cca043] text-black font-black text-xs flex items-center justify-center">
              {currentStep}
            </span>
            <span className="text-xs font-bold uppercase text-white tracking-wider">
              {STEPS[currentStep - 1].label}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>
      </div>

      {/* GLOBAL ERROR BANNER */}
      {globalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn">
          <FaExclamationTriangle className="text-red-400 text-lg shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN LAYOUT: FORM WIZARD (LEFT) + STICKY ORDER SUMMARY (RIGHT) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        {/* LEFT COLUMN: ACTIVE STEP FORM */}
        <div className="md:col-span-7 lg:col-span-8 w-full bg-[#0d0906] border border-[#cca043]/30 rounded-2xl p-5 sm:p-7 lg:p-8 text-left">
          
          {/* Mobile-only Quick Summary Banner */}
          <div className="md:hidden mb-5 p-3 rounded-xl bg-[#cca043]/10 border border-[#cca043]/30 flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#cca043] block">
                Selected: {selectedDistance} ({currentCategory.title})
              </span>
              <span className="text-sm font-black text-white font-graduate">
                Total: ₹{Math.max(0, grossAmount - discountAmount).toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-300 bg-black/40 px-2 py-1 rounded">
              Step {currentStep}/5
            </span>
          </div>
          
          {/* STEP 1: CATEGORY SELECTION */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#cca043]">
                  Step 1 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-graduate mt-1">
                  Choose Your Race Category
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Select your preferred challenge. All timed categories include official RFID bib chips and verified e-certificates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {raceCategories.map((cat) => {
                  const isSelected = selectedDistance === cat.distance;
                  return (
                    <div
                      key={cat.distance}
                      onClick={() => setSelectedDistance(cat.distance)}
                      className={`relative rounded-xl border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? "border-[#cca043] bg-[#cca043]/10 ring-1 ring-[#cca043]"
                          : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-[#cca043] text-black"
                                : "bg-white/10 text-neutral-300"
                            }`}
                          >
                            {cat.badge}
                          </span>
                          <span className="text-xs font-mono font-bold text-neutral-400">
                            Min Age: {cat.minAge}y
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mb-1">
                          <h3 className="text-2xl font-black text-white font-graduate">
                            {cat.distance}
                          </h3>
                          <span className="text-lg font-mono font-bold text-[#cca043]">
                            ₹{cat.fee.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-neutral-300 mb-3">{cat.title}</p>

                        <div className="border-t border-white/10 pt-3 space-y-1 text-[11px] text-neutral-400">
                          {cat.inclusions.slice(0, 3).map((inc, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <FaCheckCircle className="text-[10px] text-[#cca043] shrink-0" />
                              <span className="truncate">{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                        <span className="text-neutral-500">Cutoff: {cat.cutoff}</span>
                        <span className={isSelected ? "text-[#cca043]" : "text-white/60"}>
                          {isSelected ? "Selected ✓" : "Select Category →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: RUNNER DETAILS & BIB CUSTOMIZATION */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#cca043]">
                  Step 2 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-graduate mt-1">
                  Participant & Bib Personalization
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Your custom name will be printed directly onto your official race bib timing chip.
                </p>
              </div>

              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (!formData.bibName) {
                        setFormData((prev) => ({
                          ...prev,
                          bibName: e.target.value.toUpperCase().slice(0, 16),
                        }));
                      }
                    }}
                    placeholder="Enter first name"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.firstName && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.lastName && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="runner@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.email && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Mobile Number (+91) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData((p) => ({ ...p, phone: num }));
                    }}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.phone && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* DOB & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none [color-scheme:dark]"
                  />
                  {formData.dateOfBirth && (
                    <p className="text-[10.5px] text-[#cca043] mt-1">
                      Age on Race Day (Nov 2027): <strong>{calculatedAge} Years</strong> (Min: {currentCategory.minAge}y)
                    </p>
                  )}
                  {fieldErrors.dateOfBirth && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Male", "Female", "Other"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, gender: g as "Male" | "Female" | "Other" }))}
                        className={`py-2.5 px-2 rounded-lg border text-xs font-bold uppercase transition-all ${
                          formData.gender === g
                            ? "bg-[#cca043] text-black border-[#cca043]"
                            : "bg-white/5 border-white/15 text-neutral-300 hover:bg-white/10"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bib Customization + Live Bib Card Component */}
              <div className="border-t border-white/10 pt-5">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                          Name on Race Bib <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {formData.bibName.length}/16 Max
                        </span>
                      </div>
                      <input
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
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm uppercase font-mono font-bold outline-none"
                      />
                      {fieldErrors.bibName && (
                        <p className="text-[10px] text-red-400 mt-1">{fieldErrors.bibName}</p>
                      )}
                    </div>

                    {/* Blood Group & T-Shirt Size */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                          Blood Group <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 rounded-lg bg-neutral-900 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                        >
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                            <option key={bg} value={bg}>
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                            T-Shirt Size <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setSizeModalOpen(true)}
                            className="text-[10px] text-[#cca043] hover:underline font-bold"
                          >
                            Size Chart
                          </button>
                        </div>
                        <select
                          name="tshirtSize"
                          value={formData.tshirtSize}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2.5 rounded-lg bg-neutral-900 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none font-bold"
                        >
                          {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((sz) => (
                            <option key={sz} value={sz}>
                              Size {sz}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Bib Graphic Preview */}
                  <div className="lg:col-span-5 flex justify-center">
                    <BibPreview bibName={formData.bibName} distance={selectedDistance} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EMERGENCY & HEALTH */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#cca043]">
                  Step 3 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-graduate mt-1">
                  Emergency Contact & Medical Information
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Required by race medical marshals for emergency assistance on the course.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Emergency Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    required
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    placeholder="Contact person"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.emergencyName && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.emergencyName}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-neutral-900 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  >
                    {["Parent", "Spouse", "Sibling", "Relative", "Friend", "Coach", "Other"].map(
                      (rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Emergency Mobile (+91) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    required
                    maxLength={10}
                    value={formData.emergencyPhone}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData((p) => ({ ...p, emergencyPhone: num }));
                    }}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.emergencyPhone && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.emergencyPhone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Medical Notes, Drug Allergies, or Pre-existing Conditions (Optional)
                </label>
                <textarea
                  name="medicalNotes"
                  rows={3}
                  value={formData.medicalNotes}
                  onChange={handleInputChange}
                  placeholder="e.g. Asthma, Penicillin allergy, Hypertension, etc. Leave blank if none."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: LOGISTICS & ADD-ONS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#cca043]">
                  Step 4 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-graduate mt-1">
                  Location & Optional Event Add-ons
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Kit collection details and optional athlete shuttles or souvenir merchandise.
                </p>
              </div>

              {/* Address details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Patna, Nalanda, Delhi"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.city && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Bihar"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.state && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => {
                      const pin = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setFormData((p) => ({ ...p, pincode: pin }));
                    }}
                    placeholder="6-digit pincode"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                  />
                  {fieldErrors.pincode && (
                    <p className="text-[10px] text-red-400 mt-1">{fieldErrors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Running Club Optional */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-300 mb-1">
                  Running Club / Corporate Team (Optional)
                </label>
                <input
                  type="text"
                  name="runningClub"
                  value={formData.runningClub}
                  onChange={handleInputChange}
                  placeholder="e.g. Patna Striders, Bihar Police, TCS FitClub"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/15 focus:border-[#cca043] text-white text-xs sm:text-sm outline-none"
                />
              </div>

              {/* Event Add-ons */}
              <div className="border-t border-white/10 pt-5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#cca043] block mb-3">
                  Enhance Your Marathon Experience (Optional Add-ons)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {availableAddons.map((addon) => {
                    const isChecked = formData.selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isChecked
                            ? "bg-[#cca043]/15 border-[#cca043]"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white">{addon.title}</h4>
                          <p className="text-[11px] text-neutral-400 leading-snug">
                            {addon.description}
                          </p>
                          <span className="text-xs font-mono font-bold text-[#cca043] block mt-1">
                            +₹{addon.price}
                          </span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-all ${
                            isChecked
                              ? "bg-[#cca043] border-[#cca043] text-black"
                              : "border-white/30 bg-black/40"
                          }`}
                        >
                          {isChecked && <FaCheck className="text-[10px]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: WAIVER & FINAL REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#cca043]">
                  Step 5 of 5
                </span>
                <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-graduate mt-1">
                  Waiver, Declaration & Final Review
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Please review your registration details and agree to the event liability disclaimer.
                </p>
              </div>

              {/* Review Card */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 text-xs space-y-3">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Runner:</span>
                  <span className="font-bold text-white">
                    {formData.firstName} {formData.lastName} ({formData.gender}, {calculatedAge}y)
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Category:</span>
                  <span className="font-bold text-[#cca043]">
                    {currentCategory.distance} ({currentCategory.title})
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Name on Bib:</span>
                  <span className="font-mono font-bold text-white">{formData.bibName}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Contact:</span>
                  <span className="text-neutral-300">
                    {formData.email} • +91 {formData.phone}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Emergency:</span>
                  <span className="text-neutral-300">
                    {formData.emergencyName} ({formData.emergencyRelation}) • +91 {formData.emergencyPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Apparel Size:</span>
                  <span className="font-bold text-white">Size {formData.tshirtSize} (Dry-Fit)</span>
                </div>
              </div>

              {/* Event Liability Waiver */}
              <div className="p-4 rounded-xl border border-white/15 bg-white/[0.02] text-neutral-300 text-[11px] leading-relaxed max-h-40 overflow-y-auto space-y-2 select-none">
                <p className="font-bold text-white uppercase">Participant Declaration & Assumption of Risk:</p>
                <p>
                  1. I declare that I am physically fit and have sufficiently trained for participating in the Rajgir Marathon 2027.
                </p>
                <p>
                  2. I understand that running long distances involves inherent risk of physical injury. I hereby release the event organizers, sponsors, volunteers, and the State of Bihar from any claims resulting from my participation.
                </p>
                <p>
                  3. I authorize the medical team to administer emergency treatment if required.
                </p>
                <p>
                  4. I agree that the registration fee is non-transferable and non-refundable.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  name="waiverAgreed"
                  checked={formData.waiverAgreed}
                  onChange={(e) => setFormData((p) => ({ ...p, waiverAgreed: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 accent-[#cca043] rounded"
                />
                <span className="text-xs text-neutral-200 font-medium">
                  I have read, understood, and accept the event rules, terms & conditions, and medical liability waiver. <span className="text-red-500">*</span>
                </span>
              </label>
              {fieldErrors.waiverAgreed && (
                <p className="text-[10px] text-red-400 mt-1">{fieldErrors.waiverAgreed}</p>
              )}
            </div>
          )}

          {/* PREVIOUS / NEXT STEP BUTTONS */}
          <div className="mt-8 pt-5 border-t border-white/10 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <FaArrowLeft className="text-xs" />
                <span>Previous Step</span>
              </button>
            ) : (
              <Link
                href="/"
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                ← Back to Home
              </Link>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d49a37] via-[#e0a845] to-[#cca043] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : currentStep < 5 ? (
                <>
                  <span>Next: {STEPS[currentStep]?.label || "Next"}</span>
                  <FaArrowRight className="text-xs" />
                </>
              ) : (
                <>
                  <span>Confirm & Register</span>
                  <FaCheckCircle />
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY PANEL */}
        <aside className="md:col-span-5 lg:col-span-4 w-full md:sticky md:top-24 z-20">
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

      {/* SIZING CHART MODAL */}
      <TShirtSizeModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
        selectedSize={formData.tshirtSize}
        onSelectSize={(size) => setFormData((p) => ({ ...p, tshirtSize: size }))}
      />
    </div>
  );
}

