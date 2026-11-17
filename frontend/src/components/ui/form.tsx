import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

/**
 * Form controls from designn.md section 10: 46-48px height, 8px radius, #D1D5DB border, white background,
 * red border + visible focus ring, inline messages. All controls accept the usual native props, so existing
 * controlled inputs (value / onChange) work unchanged.
 */
export const controlBase =
  "w-full rounded-btn border border-charcoal-300 bg-white px-4 text-sm text-charcoal-900 placeholder:text-charcoal-400 " +
  "outline-none transition-colors focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 " +
  "disabled:cursor-not-allowed disabled:bg-charcoal-100 disabled:text-charcoal-500 aria-[invalid=true]:border-[#DC2626]";

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...props },
  ref
) {
  return <input ref={ref} className={cn(controlBase, "h-12", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select ref={ref} className={cn(controlBase, "h-12 pr-8", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref
) {
  return <textarea ref={ref} className={cn(controlBase, "min-h-[112px] py-3", className)} {...props} />;
});

export function Label({
  htmlFor,
  required,
  children,
  className,
}: {
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-semibold text-charcoal-800", className)}>
      {children}
      {required ? (
        <span aria-hidden className="text-brand-red">
          {" "}
          *
        </span>
      ) : null}
    </label>
  );
}

export function FieldMessage({ id, error, hint }: { id?: string; error?: string; hint?: ReactNode }) {
  if (error) {
    return (
      <p id={id} className="mt-1.5 text-xs font-medium text-[#DC2626]">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={id} className="mt-1.5 text-xs text-charcoal-500">
        {hint}
      </p>
    );
  }
  return null;
}

/** Label + control + hint/error in one block. Pass the same `htmlFor` as the control's id. */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      <FieldMessage id={htmlFor ? `${htmlFor}-message` : undefined} error={error} hint={hint} />
    </div>
  );
}

export function Checkbox({
  children,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { children: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-charcoal-700", className)}>
      <input
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded-[6px] border border-charcoal-300 accent-brand-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
        {...props}
      />
      <span>{children}</span>
    </label>
  );
}

/** Selectable pill-less option (distance, size, slot...). */
export function ChoiceChip({
  selected,
  onClick,
  children,
  disabled,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-1.5 rounded-btn border px-4 text-sm font-semibold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-brand-red bg-brand-red-light text-brand-red-dark"
          : "border-charcoal-300 bg-white text-charcoal-700 hover:border-charcoal-400 hover:bg-charcoal-50",
        className
      )}
    >
      {children}
    </button>
  );
}

/** Larger selectable card (race category, participant type...). */
export function ChoiceCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-card border p-4 text-left transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red",
        selected ? "border-brand-red bg-[#FFF5F5] shadow-[0_2px_8px_rgba(17,24,39,0.05)]" : "border-charcoal-200 bg-white hover:border-charcoal-300",
        className
      )}
    >
      {children}
    </button>
  );
}
