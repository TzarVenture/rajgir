import type { ReactNode } from "react";

export const cardClass =
  "rounded-2xl border border-[#cca043]/35 bg-[#0f0c09]/95 p-6 sm:p-8 shadow-2xl";

export const inputClass =
  "w-full rounded-lg border border-white/15 bg-black/40 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-[#cca043]";

export const primaryButtonClass =
  "w-full rounded-full bg-[#cca043] py-3 text-sm font-bold uppercase tracking-wide text-black transition hover:bg-[#d49a37] disabled:cursor-not-allowed disabled:opacity-60";

export const headingClass = "font-graduate text-3xl text-white";

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
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/70">
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
    <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
    </p>
  );
}

export function AuthHeading({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="mb-6 text-center">
      <h1 className={headingClass}>{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-white/70">{subtitle}</p> : null}
    </div>
  );
}
