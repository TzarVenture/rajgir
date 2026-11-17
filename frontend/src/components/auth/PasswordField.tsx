"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FieldLabel, FieldMessage, inputClass } from "@/components/auth/ui";

/** Password input with a show/hide toggle. Never receives a default value. */
export default function PasswordField({
  label,
  name,
  autoComplete,
  placeholder,
  error,
  hint,
}: {
  label: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  error?: string;
  hint?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const messageId = `${name}-message`;

  return (
    <div className="block text-left">
      <label htmlFor={name}>
        <FieldLabel>{label}</FieldLabel>
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#6B7280] hover:text-[#111827]"
        >
          {visible ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}
