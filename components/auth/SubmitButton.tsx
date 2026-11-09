"use client";

import { useFormStatus } from "react-dom";
import { primaryButtonClass } from "@/components/auth/ui";

export default function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? (pendingLabel ?? "Please wait...") : label}
    </button>
  );
}
