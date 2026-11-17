"use client";

import { useActionState, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaArrowLeft,
  FaArrowRight,
  FaAward,
  FaBuilding,
  FaBullhorn,
  FaCheckCircle,
  FaGraduationCap,
  FaHandsHelping,
  FaHotel,
  FaRunning,
  FaStore,
  FaUser,
  FaUsers,
  FaHandshake,
} from "react-icons/fa";
import { selectRole, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { FormError, StepIndicator } from "@/components/auth/ui";
import { ACCOUNT_TYPES, type AccountTypeId, type RoleOption, type RoleValue } from "@/lib/auth/roles";

const ROLE_ICONS: Record<RoleOption["icon"], IconType> = {
  runner: FaRunning,
  volunteer: FaHandsHelping,
  influencer: FaBullhorn,
  team: FaUsers,
  corporate: FaBuilding,
  school: FaGraduationCap,
  sponsor: FaAward,
  vendor: FaStore,
  tourism: FaHotel,
};

const TYPE_ICONS: Record<AccountTypeId, IconType> = {
  individual: FaUser,
  group: FaUsers,
  partner: FaHandshake,
};

export default function IntentForm({
  userName,
  currentRole,
  currentTypeId,
  withVerification,
}: {
  userName: string;
  currentRole: string | null;
  currentTypeId: AccountTypeId | null;
  withVerification: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(selectRole, undefined);
  const [typeId, setTypeId] = useState<AccountTypeId | null>(currentTypeId);
  const [role, setRole] = useState<RoleValue | null>((currentRole as RoleValue | null) ?? null);

  const type = ACCOUNT_TYPES.find((t) => t.id === typeId) ?? null;
  const firstName = userName.split(" ")[0];

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl shadow-gray-200/50 sm:p-8">
      <StepIndicator current="role" withVerification={withVerification} />

      {!type ? (
        <section aria-labelledby="type-heading">
          <div className="mb-6 text-center">
            <h1 id="type-heading" className="font-barlow text-3xl font-black uppercase tracking-tight text-[#111827] sm:text-4xl">
              Welcome, {firstName}. What brings you here?
            </h1>
            <p className="mt-1.5 text-sm text-[#4B5563]">Pick the option that fits best. You will choose the details next.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {ACCOUNT_TYPES.map((option) => {
              const Icon = TYPE_ICONS[option.id];
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTypeId(option.id);
                    // Keep a previous choice only if it belongs to the newly opened group.
                    if (!option.roles.some((r) => r.value === role)) setRole(null);
                  }}
                  className="group flex flex-col items-start rounded-xl border border-[#E5E7EB] bg-white p-5 text-left transition hover:border-[#E31B23] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E31B23]"
                >
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[#FEE2E2] text-lg text-[#E31B23]">
                    <Icon />
                  </span>
                  <span className="text-base font-extrabold text-[#111827]">{option.title}</span>
                  <span className="mt-1 text-xs leading-relaxed text-[#4B5563]">{option.description}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#E31B23]">
                    Choose <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <form action={action} aria-labelledby="role-heading">
          <button
            type="button"
            onClick={() => setTypeId(null)}
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#E31B23]"
          >
            <FaArrowLeft className="text-[10px]" /> Back
          </button>

          <div className="mb-5">
            <h1 id="role-heading" className="font-barlow text-3xl font-black uppercase tracking-tight text-[#111827]">
              {type.title}: what will you do?
            </h1>
            <p className="mt-1 text-sm text-[#4B5563]">Select one option, then continue to its registration form.</p>
          </div>

          <fieldset className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <legend className="sr-only">Choose your role</legend>
            {type.roles.map((option) => {
              const Icon = ROLE_ICONS[option.icon];
              const selected = role === option.value;
              return (
                <label
                  key={option.value}
                  className={`relative flex cursor-pointer flex-col rounded-xl border p-5 transition focus-within:outline focus-within:outline-2 focus-within:outline-[#E31B23] ${
                    selected ? "border-[#E31B23] bg-[#FFF5F5] shadow-md" : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selected}
                    onChange={() => setRole(option.value)}
                    className="sr-only"
                  />
                  <span className="mb-3 flex items-center justify-between">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-base ${
                        selected ? "bg-[#E31B23] text-white" : "bg-[#F3F4F6] text-[#E31B23]"
                      }`}
                    >
                      <Icon />
                    </span>
                    {selected ? <FaCheckCircle className="text-lg text-[#E31B23]" aria-hidden /> : null}
                  </span>
                  <span className="text-base font-extrabold text-[#111827]">{option.title}</span>
                  <span className="mt-1 text-xs leading-relaxed text-[#4B5563]">{option.description}</span>
                  <span
                    className={`mt-4 inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      option.approval === "instant" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {option.approval === "instant" ? "Active right away" : "Needs organizer approval"}
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className="mt-6 space-y-3">
            <FormError message={state?.error} />
            <SubmitButton label="Continue to registration" pendingLabel="Saving..." />
            <p className="text-center text-xs text-[#6B7280]">
              You can change this until you submit your registration. After that your account keeps this role.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
