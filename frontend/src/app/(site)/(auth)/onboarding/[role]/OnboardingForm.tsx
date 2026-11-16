"use client";

import { useActionState } from "react";
import { saveOnboarding, type FormState } from "@/app/actions/auth";
import SubmitButton from "@/components/auth/SubmitButton";
import { Field, FormError, cardClass, AuthHeading } from "@/components/auth/ui";

export interface OnboardingField {
  name: string;
  label: string;
  type?: "text" | "tel" | "url" | "email";
}

export default function OnboardingForm({
  roleId,
  roleLabel,
  fields,
}: {
  roleId: string;
  roleLabel: string;
  fields: OnboardingField[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveOnboarding, undefined);

  return (
    <div className={cardClass}>
      <AuthHeading title={roleLabel} subtitle="Tell us a little about you" />

      <form action={action} className="space-y-4">
        <input type="hidden" name="role" value={roleId} />
        {fields.length === 0 ? (
          <p className="text-sm text-white/70">No extra details needed for this role.</p>
        ) : (
          fields.map((field) => (
            <Field key={field.name} label={field.label} name={field.name} type={field.type ?? "text"} />
          ))
        )}
        <FormError message={state?.error} />
        <SubmitButton label="Save and continue" pendingLabel="Saving..." />
      </form>
    </div>
  );
}
