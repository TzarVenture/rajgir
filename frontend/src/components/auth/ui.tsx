import type { ReactNode } from "react";

export const cardClass =
  "rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xl shadow-gray-200/50";

export const inputClass =
  "w-full h-[48px] rounded-lg border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/15 aria-[invalid=true]:border-[#DC2626] aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-[#DC2626]/10";

export const primaryButtonClass =
  "w-full h-[48px] rounded-lg bg-[#E31B23] text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#B5121B] disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-red-500/20 active:scale-[0.99]";

export const secondaryButtonClass =
  "w-full h-[48px] rounded-lg border border-[#D1D5DB] bg-white text-sm font-bold uppercase tracking-wider text-[#374151] transition hover:border-[#9CA3AF] hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60";

export const headingClass = "font-barlow text-3xl sm:text-4xl font-black uppercase text-[#111827] tracking-tight";

export const linkClass = "font-bold text-[#E31B23] hover:underline";

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#374151]">{children}</span>;
}

export function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: ReactNode }) {
  if (error) {
    return (
      <p id={id} className="mt-1.5 text-xs font-medium text-[#DC2626]">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={id} className="mt-1.5 text-xs text-[#6B7280]">
        {hint}
      </p>
    );
  }
  return null;
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  defaultValue,
  inputMode,
  maxLength,
  error,
  hint,
  autoFocus,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url";
  maxLength?: number;
  /** Message shown under the field and announced to screen readers. */
  error?: string;
  hint?: ReactNode;
  autoFocus?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const messageId = `${name}-message`;
  return (
    <label className="block text-left">
      <FieldLabel>{label}</FieldLabel>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        inputMode={inputMode}
        maxLength={maxLength}
        autoFocus={autoFocus}
        onChange={onChange}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={inputClass}
      />
      <FieldMessage id={messageId} error={error} hint={hint} />
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

export function FormNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800">
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

/** Short highlighted note at the top of a form, e.g. which registration the person is working on. */
export function ContextBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs sm:text-sm font-medium text-blue-800">
      {children}
    </div>
  );
}
