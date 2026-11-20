"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuPencil, LuShieldPlus } from "react-icons/lu";
import { updateMedicalProfile, type MedicalProfileInput } from "@/app/actions/dashboard";
import { Button, Field, Modal, Notice, Select, TextInput, Textarea } from "@/components/ui";
import { DetailList } from "@/components/dashboard/DashboardParts";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const RELATIONS = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Relative", "Colleague", "Other"];

/** Medical and emergency details with an in-place edit dialog. Saved values show immediately. */
export function MedicalProfile({
  initial,
  updatedAtLabel,
  readOnly = false,
}: {
  initial: MedicalProfileInput;
  updatedAtLabel: string | null;
  /** Hide the edit button when the update endpoint is unavailable. */
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<MedicalProfileInput>(initial);
  const [draft, setDraft] = useState<MedicalProfileInput>(initial);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(updatedAtLabel);
  const [pending, startTransition] = useTransition();

  const relationOptions = RELATIONS.includes(draft.emergencyRelation) ? RELATIONS : [draft.emergencyRelation, ...RELATIONS];

  function openEditor() {
    setDraft(values);
    setError("");
    setFieldErrors({});
    setOpen(true);
  }

  function update<K extends keyof MedicalProfileInput>(key: K, value: MedicalProfileInput[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await updateMedicalProfile(draft);
      if (!res.success) {
        setError(res.error ?? "We could not save your changes.");
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      setValues({ ...draft, medicalNotes: draft.medicalNotes?.trim() || "" });
      setSavedAt("just now");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <DetailList
        rows={[
          { label: "Blood group", value: <span className="text-brand-red">{values.bloodGroup}</span> },
          { label: "Emergency contact", value: `${values.emergencyName} (${values.emergencyRelation})` },
          { label: "Emergency mobile", value: <span className="font-mono">+91 {values.emergencyPhone}</span> },
          {
            label: "Medical notes",
            value: values.medicalNotes ? (
              <span className="whitespace-pre-line break-words">{values.medicalNotes}</span>
            ) : (
              <span className="font-normal text-charcoal-500">None declared</span>
            ),
          },
        ]}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-charcoal-500" aria-live="polite">
          {savedAt ? `Last updated ${savedAt}.` : "Shared only with race medical staff."}
        </p>
        {readOnly ? (
          <p className="text-xs text-charcoal-500">Editing is temporarily unavailable. Contact the help desk for urgent changes.</p>
        ) : (
          <Button variant="secondary" size="md" icon={LuPencil} onClick={openEditor}>
            Edit details
          </Button>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        title="Medical and emergency profile"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" form="medical-form" size="md" loading={pending} icon={LuShieldPlus}>
              Save changes
            </Button>
          </div>
        }
      >
        <form id="medical-form" onSubmit={save} className="space-y-4" noValidate>
          <p className="text-sm text-charcoal-600">
            The medical team uses these details if you need help on the course. Keep them current up to race morning.
          </p>
          {error ? <Notice tone="error">{error}</Notice> : null}

          <Field label="Emergency contact name" htmlFor="mp-name" required error={fieldErrors.emergencyName}>
            <TextInput
              id="mp-name"
              value={draft.emergencyName}
              onChange={(e) => update("emergencyName", e.target.value)}
              autoComplete="off"
              maxLength={64}
              aria-invalid={Boolean(fieldErrors.emergencyName)}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Relationship" htmlFor="mp-relation" required error={fieldErrors.emergencyRelation}>
              <Select id="mp-relation" value={draft.emergencyRelation} onChange={(e) => update("emergencyRelation", e.target.value)}>
                {relationOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Emergency mobile (+91)" htmlFor="mp-phone" required error={fieldErrors.emergencyPhone}>
              <TextInput
                id="mp-phone"
                type="tel"
                inputMode="numeric"
                value={draft.emergencyPhone}
                onChange={(e) => update("emergencyPhone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                aria-invalid={Boolean(fieldErrors.emergencyPhone)}
              />
            </Field>
          </div>

          <Field label="Blood group" htmlFor="mp-blood" required error={fieldErrors.bloodGroup}>
            <Select
              id="mp-blood"
              value={draft.bloodGroup}
              onChange={(e) => update("bloodGroup", e.target.value as MedicalProfileInput["bloodGroup"])}
            >
              {BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Medical notes, allergies or conditions"
            htmlFor="mp-notes"
            error={fieldErrors.medicalNotes}
            hint={`${(draft.medicalNotes ?? "").length}/500. Include medicines you carry (e.g. inhaler, insulin).`}
          >
            <Textarea
              id="mp-notes"
              value={draft.medicalNotes ?? ""}
              onChange={(e) => update("medicalNotes", e.target.value)}
              maxLength={500}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
