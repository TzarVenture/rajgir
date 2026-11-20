"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuPhone, LuSiren } from "react-icons/lu";
import { reportIncident } from "@/app/actions/dashboard";
import { Button, ChoiceChip, Field, Modal, Notice, TextInput } from "@/components/ui";
import { formatTime } from "@/lib/event";
import { currentPosition } from "./geo";

const SOS_TYPES = [
  { value: "MEDICAL", label: "Medical" },
  { value: "SECURITY", label: "Security" },
  { value: "LOST_PERSON", label: "Lost child / person" },
  { value: "COURSE_HAZARD", label: "Course hazard" },
] as const;

/**
 * One-tap SOS: logs a CRITICAL alert with location for race control, and always shows the phone numbers,
 * because a logged alert never replaces a call when a life is at risk.
 */
export function SosPanel({
  station,
  raceControlPhone,
  ambulance,
  emergency,
}: {
  station: string | null;
  raceControlPhone: string;
  ambulance: string;
  emergency: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<(typeof SOS_TYPES)[number]["value"]>("MEDICAL");
  const [bib, setBib] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    setError("");
    startTransition(async () => {
      const geo = await currentPosition();
      const res = await reportIncident({
        type,
        severity: "CRITICAL",
        isSos: true,
        location: station ?? undefined,
        runnerBib: bib.trim() || undefined,
        description: note.trim() || `SOS (${SOS_TYPES.find((t) => t.value === type)?.label}) raised from the volunteer dashboard`,
        ...geo,
      });
      if (!res.success) {
        setError(res.error ?? "The alert did not go through. Call race control now.");
        return;
      }
      setSentAt(formatTime(new Date()));
      setOpen(false);
      setBib("");
      setNote("");
      router.refresh();
    });
  }

  const numbers = [
    ...(raceControlPhone ? [{ label: "Race control", number: raceControlPhone }] : []),
    { label: "Ambulance", number: ambulance },
    { label: "Emergency", number: emergency },
  ];

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => {
          setSentAt(null);
          setOpen(true);
        }}
        className="flex w-full items-center justify-center gap-3 rounded-feature bg-brand-red px-6 py-6 text-white shadow-[0_8px_24px_rgba(227,27,35,0.35)] transition-colors hover:bg-brand-red-dark focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
      >
        <LuSiren className="h-8 w-8" aria-hidden />
        <span className="text-left">
          <span className="block font-barlow text-3xl font-bold uppercase leading-none">SOS</span>
          <span className="text-sm font-semibold">Alert race control now</span>
        </span>
      </button>

      {sentAt ? (
        <Notice tone="success" title={`SOS sent at ${sentAt}`}>
          Race control has your alert and location. Stay with the person. If anyone&apos;s life is at risk, also call {ambulance} now.
        </Notice>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {numbers.map((n) => (
          <a
            key={n.label}
            href={`tel:${n.number}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-btn border border-charcoal-300 bg-white px-3 text-sm font-semibold text-charcoal-800 hover:bg-charcoal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
          >
            <LuPhone className="h-4 w-4 text-brand-red" aria-hidden />
            {n.label} {n.number}
          </a>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        title="Send SOS alert"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button size="md" icon={LuSiren} loading={pending} onClick={send}>
              Send SOS
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {error ? <Notice tone="error">{error}</Notice> : null}
          <div>
            <p className="mb-2 text-sm font-semibold text-charcoal-900">What is the emergency?</p>
            <div className="grid grid-cols-2 gap-2">
              {SOS_TYPES.map((t) => (
                <ChoiceChip key={t.value} selected={type === t.value} onClick={() => setType(t.value)}>
                  {t.label}
                </ChoiceChip>
              ))}
            </div>
          </div>
          <Field label="Runner bib (if known)" htmlFor="sos-bib">
            <TextInput id="sos-bib" value={bib} onChange={(e) => setBib(e.target.value.toUpperCase().slice(0, 16))} placeholder="e.g. 21045" />
          </Field>
          <Field label="One line on what is happening (optional)" htmlFor="sos-note">
            <TextInput id="sos-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} placeholder="Runner collapsed, breathing" />
          </Field>
          <p className="text-xs text-charcoal-500">
            Sent with your station ({station ?? "not assigned"}), name, phone and device location if allowed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
