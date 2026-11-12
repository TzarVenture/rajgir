"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppUser } from "@/lib/auth/session";
import { submitTeamRegistration } from "@/app/actions/registerGroup";
import {
  FaUsers,
  FaCheckCircle,
  FaCopy,
  FaArrowRight,
  FaShieldAlt,
  FaLock,
  FaSpinner,
} from "react-icons/fa";

interface TeamRegisterFormProps {
  user: AppUser;
}

export default function TeamRegisterForm({ user }: TeamRegisterFormProps) {
  const [formData, setFormData] = useState({
    teamName: "",
    clubAffiliation: "",
    city: "",
    estimatedMembers: 10,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ teamJoinCode: string; teamName: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.teamName.trim()) {
      setError("Please enter your team or club name.");
      return;
    }
    if (!formData.city.trim()) {
      setError("Please enter the city your team is based in.");
      return;
    }
    if (formData.estimatedMembers < 2) {
      setError("A team must have at least 2 members.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitTeamRegistration({
        userId: user.id,
        teamName: formData.teamName.trim(),
        clubAffiliation: formData.clubAffiliation.trim() || undefined,
        city: formData.city.trim(),
        estimatedMembers: Number(formData.estimatedMembers),
        notes: formData.notes.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to register team. Please try again.");
      }

      setSuccessData({
        teamJoinCode: res.data?.teamJoinCode || "ACTIVE",
        teamName: formData.teamName,
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while creating your team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (successData?.teamJoinCode) {
      navigator.clipboard.writeText(successData.teamJoinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (successData) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 rounded-2xl bg-[#0f0c09] border border-emerald-500/30 shadow-2xl text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl">
          <FaCheckCircle />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 rounded-full">
          Team Registered & Activated
        </span>

        <h2 className="text-2xl font-black uppercase text-white font-graduate mt-3 mb-2">
          {successData.teamName}
        </h2>
        <p className="text-sm text-neutral-300 max-w-md mx-auto mb-6">
          Congratulations, Captain! Your team is officially created. Share your unique Team Join Code with your members so they can join your squad.
        </p>

        {/* Team Join Code Box */}
        <div className="p-5 rounded-xl bg-black/60 border border-[#cca043]/30 mb-6 flex flex-col items-center justify-center gap-3">
          <p className="text-xs uppercase tracking-wider text-neutral-400 font-bold">Your Official Team Code</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black font-graduate text-[#cca043] tracking-widest">
              {successData.teamJoinCode}
            </span>
            <button
              onClick={copyCode}
              type="button"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#cca043] transition-colors"
              title="Copy Team Code"
            >
              <FaCopy />
            </button>
          </div>
          {copied && <span className="text-xs text-emerald-400 font-bold">Copied to clipboard!</span>}
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-gradient-to-r from-[#cca043] to-[#b3852b] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all"
        >
          <span>Enter Team Captain Dashboard</span>
          <FaArrowRight className="text-xs" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Verified Captain Identity (Pre-filled & Locked) */}
      <div className="p-5 rounded-xl bg-[#0f0c09] border border-white/10 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <FaShieldAlt className="text-[#cca043] text-sm" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Team Captain Identity (Verified)
            </h3>
          </div>
          <span className="text-[10px] text-neutral-400 flex items-center gap-1">
            <FaLock className="text-[9px]" /> Locked to your account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Captain Name</p>
            <p className="text-sm font-semibold text-white">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Email</p>
            <p className="text-sm font-semibold text-neutral-300 truncate">{user.email}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Mobile Phone</p>
            <p className="text-sm font-semibold text-neutral-300">{user.phone || "—"}</p>
          </div>
        </div>
      </div>

      {/* Team Details */}
      <div className="p-6 rounded-xl bg-[#0f0c09] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <FaUsers className="text-[#cca043] text-sm" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Team & Squad Information
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Team / Club Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              placeholder="e.g. Patna Striders Running Club"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                City / Base <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Patna, Nalanda, Gaya"
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                Estimated Squad Size (min 2) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={2}
                max={500}
                required
                value={formData.estimatedMembers}
                onChange={(e) => setFormData({ ...formData, estimatedMembers: parseInt(e.target.value) || 2 })}
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Club / Association Affiliation (Optional)
            </label>
            <input
              type="text"
              value={formData.clubAffiliation}
              onChange={(e) => setFormData({ ...formData, clubAffiliation: e.target.value })}
              placeholder="e.g. Bihar Athletics Association, Indian Running Community"
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Target Distances / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Running 21.1K and 10K categories. Aiming for team podium."
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/15 text-white placeholder-neutral-500 text-sm focus:border-[#cca043] focus:ring-1 focus:ring-[#cca043] outline-none transition"
            />
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
              <span>Registering Team...</span>
            </>
          ) : (
            <>
              <span>Create Team & Generate Join Code</span>
              <FaArrowRight className="text-xs" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

