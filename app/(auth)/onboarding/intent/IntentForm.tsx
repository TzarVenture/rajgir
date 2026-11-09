"use client";

import { useActionState } from "react";
import { chooseRoles, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { FormError, cardClass, AuthHeading } from "@/components/auth/ui";

export interface IntentOption {
  id: string;
  intentLabel: string;
  requiresApproval: boolean;
}

export default function IntentForm({ options }: { options: IntentOption[] }) {
  const [state, action] = useActionState<FormState, FormData>(chooseRoles, undefined);

  return (
    <div className={cardClass}>
      <AuthHeading title="What brings you here?" subtitle="Step 3 of 3: pick one or more. You can add more later." />

      <form action={action} className="space-y-3">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm transition hover:border-[#cca043]/60 has-[:checked]:border-[#cca043]"
          >
            <input type="checkbox" name="roles" value={option.id} className="h-4 w-4 accent-[#cca043]" />
            <span className="flex-1">{option.intentLabel}</span>
            {option.requiresApproval ? (
              <span className="text-[10px] uppercase tracking-wider text-white/50">Needs approval</span>
            ) : null}
          </label>
        ))}

        <div className="pt-2">
          <FormError message={state?.error} />
        </div>
        <SubmitButton label="Continue" pendingLabel="Saving..." />
      </form>
    </div>
  );
}
