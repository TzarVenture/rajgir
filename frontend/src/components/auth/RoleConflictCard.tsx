import React from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { FaShieldAlt, FaExclamationTriangle, FaArrowRight, FaSignOutAlt } from "react-icons/fa";
import { AppUser } from "@/lib/auth/session";

interface RoleConflictCardProps {
  user: AppUser;
  targetRoleLabel: string;
}

export default function RoleConflictCard({ user, targetRoleLabel }: RoleConflictCardProps) {
  const currentRoleLabel = user.role
    ? user.role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "Registered Member";

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-2xl bg-[#0f0c09] border border-amber-500/30 shadow-2xl text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />

      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl">
        <FaExclamationTriangle />
      </div>

      <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full mb-3">
        Single Role Policy Enforced
      </span>

      <h2 className="text-2xl font-black uppercase text-white font-graduate mb-3">
        Account Already Assigned
      </h2>

      <p className="text-sm text-neutral-300 leading-relaxed mb-6">
        You are currently signed in as <span className="text-white font-bold">{user.name}</span> (<span className="text-white/70">{user.email}</span>), which is already registered with the permanent role of:
      </p>

      <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-6 flex items-center justify-between">
        <div className="text-left">
          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Your Active Role</p>
          <p className="text-base font-extrabold text-[#cca043]">{currentRoleLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Requested Registration</p>
          <p className="text-base font-extrabold text-neutral-400 line-through">{targetRoleLabel}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200/90 text-left flex items-start gap-3 mb-8">
        <FaShieldAlt className="text-amber-400 text-base shrink-0 mt-0.5" />
        <p>
          To maintain strict operational integrity for the Rajgir Marathon, each phone/email identity is limited to one permanent platform role. You cannot register as a {targetRoleLabel} using this account.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="w-full sm:w-auto py-3 px-6 rounded-full bg-gradient-to-r from-[#cca043] to-[#b3852b] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
        >
          <span>Go to {currentRoleLabel} Dashboard</span>
          <FaArrowRight className="text-xs" />
        </Link>

        <form action={logout} className="w-full sm:w-auto">
          <button
            type="submit"
            className="w-full sm:w-auto py-3 px-6 rounded-full border border-white/20 bg-white/5 text-white/80 hover:text-white hover:border-white/40 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FaSignOutAlt className="text-xs" />
            <span>Sign Out & Use Another Account</span>
          </button>
        </form>
      </div>
    </div>
  );
}

