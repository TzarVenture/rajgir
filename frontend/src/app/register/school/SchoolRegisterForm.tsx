"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AppUser } from "@/lib/auth/session";
import { submitSchoolRegistration } from "@/app/actions/registerGroup";
import {
  FaGraduationCap,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaSpinner,
  FaCheckSquare,
} from "react-icons/fa";

interface SchoolRegisterFormProps {
  user: AppUser;
}

export default function SchoolRegisterForm({ user }: SchoolRegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    schoolName: "",
    boardAffiliation: "CBSE",
    city: "",
    teacherInCharge: user.name || "",
    teacherDesignation: "Sports Director / Physical Education Head",
    estimatedStudents: 50,
    parentalConsentAgreed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.schoolName.trim()) {
      setError("Please provide the institution or school name.");
      return;
    }
    if (!formData.city.trim()) {
      setError("Please provide the city where the school is located.");
      return;
    }
    if (!formData.teacherInCharge.trim()) {
      setError("Please specify the Teacher / Coordinator in charge.");
      return;
    }
    if (formData.estimatedStudents < 5) {
      setError("School contingents require at least 5 participating students.");
      return;
    }
    if (!formData.parentalConsentAgreed) {
      setError("You must confirm that parental and institutional consent will be secured for all minor participants.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSchoolRegistration({
        userId: user.id,
        schoolName: formData.schoolName.trim(),
        boardAffiliation: formData.boardAffiliation.trim(),
        city: formData.city.trim(),
        teacherInCharge: formData.teacherInCharge.trim(),
        teacherDesignation: formData.teacherDesignation.trim(),
        estimatedStudents: Number(formData.estimatedStudents),
        parentalConsentAgreed: formData.parentalConsentAgreed,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to submit institutional registration.");
      }

      router.push("/pending");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during submission.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Coordinator Identity (Pre-filled & Locked) */}
      <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#cca043] text-sm" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Institutional Coordinator Identity (Verified)
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
            <FaLock className="text-[9px]" /> Account Bound
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Coordinator</p>
            <p className="text-sm font-semibold text-white">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Email</p>
            <p className="text-sm font-semibold text-neutral-300 truncate">{user.email}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Contact Phone</p>
            <p className="text-sm font-semibold text-neutral-300">{user.phone || "—"}</p>
          </div>
        </div>
      </div>

      {/* School Information */}
      <div className="p-6 rounded-xl bg-[#0f0c09] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <FaGraduationCap className="text-[#cca043] text-sm" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            School / College Information
          </h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                School / College Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="e.g. St. Xavier's High School / Nalanda College"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Board / University Affiliation <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.boardAffiliation}
                onChange={(e) => setFormData({ ...formData, boardAffiliation: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-[#0d0a07] border border-white/15 text-white text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE / ISC">ICSE / ISC</option>
                <option value="Bihar State Board (BSEB)">Bihar State Board (BSEB)</option>
                <option value="State University / UGC">State University / UGC</option>
                <option value="Autonomous / Other">Autonomous / Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                City / Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Rajgir, Nalanda, Patna"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Estimated Student Contingent (min 5) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={5}
                max={1500}
                required
                value={formData.estimatedStudents}
                onChange={(e) => setFormData({ ...formData, estimatedStudents: parseInt(e.target.value) || 5 })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Teacher / Coordinator in Charge <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.teacherInCharge}
                onChange={(e) => setFormData({ ...formData, teacherInCharge: e.target.value })}
                placeholder="e.g. Anand Kumar"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Teacher Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.teacherDesignation}
                onChange={(e) => setFormData({ ...formData, teacherDesignation: e.target.value })}
                placeholder="e.g. Sports Director / Principal"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>
          </div>

          {/* Parental Consent Checkbox */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.parentalConsentAgreed}
                onChange={(e) => setFormData({ ...formData, parentalConsentAgreed: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-neutral-200 leading-relaxed">
                I hereby declare that this registration is authorized by the school/college administration, and that written parental consent and medical fitness forms will be obtained for all student participants prior to race day.
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#e51b24] via-[#dc2626] to-[#b91c1c] text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-red-950/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin text-sm" />
              <span>Submitting School Registration...</span>
            </>
          ) : (
            <>
              <span>Submit Institutional Contingent</span>
              <FaArrowRight className="text-xs" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

