import type { ReactNode } from "react";

export const cardClass =
  "rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xl shadow-gray-200/50";

export const inputClass =
  "w-full h-[48px] rounded-lg border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/15";

export const primaryButtonClass =
  "w-full h-[48px] rounded-lg bg-[#E31B23] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#B5121B] disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-red-500/20 active:scale-[0.99]";

export const headingClass = "font-barlow text-3xl sm:text-4xl font-black uppercase text-[#111827] tracking-tight";

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
  inputMode,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url";
  maxLength?: number;
}) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#374151]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        inputMode={inputMode}
        maxLength={maxLength}
        required
        className={inputClass}
      />
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-700">
      {message}
    </div>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="mb-6 text-center">
      <h1 className={headingClass}>{title}</h1>
      {subtitle ? <p className="mt-1.5 text-xs sm:text-sm text-[#4B5563] font-manrope">{subtitle}</p> : null}
    </div>
  );
}
