"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LuClipboardPlus, LuRefreshCw, LuSiren } from "react-icons/lu";
import { reportIncident, type IncidentInput } from "@/app/actions/dashboard";
import { Badge, Button, Field, Modal, Notice, Select, TextInput, Textarea, type BadgeTone } from "@/components/ui";
import type { ApiIncident } from "@/lib/api";
import { formatDateTime } from "@/lib/event";

const TYPES: { value: IncidentInput["type"]; label: string }[] = [
  { value: "MEDICAL", label: "Medical" },
  { value: "HYDRATION", label: "Hydration / supplies" },
  { value: "COURSE_HAZARD", label: "Course hazard" },
  { value: "CROWD", label: "Crowd / spectators" },
  { value: "SECURITY", label: "Security" },
  { value: "LOST_PERSON", label: "Lost person / property" },
  { value: "OTHER", label: "Other" },
];

const SEVERITY_TONE: Record<string, BadgeTone> = { LOW: "neutral", MEDIUM: "info", HIGH: "warning", CRITICAL: "error" };
const STATUS_TONE: Record<string, BadgeTone> = { OPEN: "warning", ACKNOWLEDGED: "info", RESOLVED: "success" };
const REFRESH_MS = 20_000;

/** Incidents at my station, refreshed every 20 s while the tab is visible, plus a report form. */
export function IncidentLog({ incidents, station }: { incidents: ApiIncident[]; station: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<IncidentInput>({ type: "MEDICAL", severity: "MEDIUM", description: "", location: station ?? "", runnerBib: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        setRefreshedAt(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" }));
      }
    };
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await reportIncident(form);
      if (!res.success) {
        setError(res.error ?? "Could not log the incident.");
        setErrors(res.fieldErrors ?? {});
        return;
      }
      setOpen(false);
      setForm({ type: "MEDICAL", severity: "MEDIUM", description: "", location: station ?? "", runnerBib: "" });
      setErrors({});
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs text-charcoal-500" aria-live="polite">
          <LuRefreshCw className="h-3.5 w-3.5" aria-hidden />
          Live: updates every 20 s{refreshedAt ? ` (last ${refreshedAt})` : ""}
        </p>
        <Button size="md" icon={LuClipboardPlus} onClick={() => setOpen(true)}>
          Report incident
        </Button>
      </div>

      {incidents.length ? (
        <ol className="space-y-2">
          {incidents.map((i) => (
            <li key={i.id} className={`rounded-card border p-3 text-sm ${i.isSos && i.status !== "RESOLVED" ? "border-[#FCA5A5] bg-[#FEF2F2]" : "border-charcoal-200 bg-white"}`}>
              <div className="flex flex-wrap items-center gap-2">
                {i.isSos ? (
                  <Badge tone="error">
                    <LuSiren className="h-3 w-3" aria-hidden /> SOS
                  </Badge>
                ) : null}
                <Badge tone={SEVERITY_TONE[i.severity] ?? "neutral"}>{i.severity}</Badge>
                <Badge tone="neutral">{TYPES.find((t) => t.value === i.type)?.label ?? i.type}</Badge>
                <Badge tone={STATUS_TONE[i.status] ?? "neutral"}>{i.status.toLowerCase()}</Badge>
                <span className="ml-auto text-xs text-charcoal-500">{formatDateTime(i.createdAt)}</span>
              </div>
              <p className="mt-2 break-words text-charcoal-800">{i.description}</p>
              <p className="mt-1 text-xs text-charcoal-500">
                {i.location}
                {i.runnerBib ? ` | Bib ${i.runnerBib}` : ""}
                {i.resolutionNote ? ` | Race control: ${i.resolutionNote}` : ""}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-card border border-dashed border-charcoal-300 bg-surface-soft p-4 text-center text-sm text-charcoal-500">
          No incidents logged at your station.
        </p>
      )}

      <Modal
        open={open}
        onClose={() => !pending && setOpen(false)}
        title="Report an incident"
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" form="incident-form" size="md" loading={pending}>
              Log incident
            </Button>
          </div>
        }
      >
        <form id="incident-form" onSubmit={submit} className="space-y-4" noValidate>
          <Notice tone="warning">Life-threatening? Close this and press SOS, then call 108.</Notice>
          {error ? <Notice tone="error">{error}</Notice> : null}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="inc-type" required>
              <Select id="inc-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as IncidentInput["type"] })}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Severity" htmlFor="inc-sev" required>
              <Select id="inc-sev" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as IncidentInput["severity"] })}>
                <option value="LOW">Low: note for the record</option>
                <option value="MEDIUM">Medium: needs attention</option>
                <option value="HIGH">High: needs help soon</option>
                <option value="CRITICAL">Critical: needs help now</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Location" htmlFor="inc-loc" error={errors.location}>
              <TextInput id="inc-loc" value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={128} />
            </Field>
            <Field label="Runner bib (if any)" htmlFor="inc-bib" error={errors.runnerBib}>
              <TextInput id="inc-bib" value={form.runnerBib ?? ""} onChange={(e) => setForm({ ...form, runnerBib: e.target.value.toUpperCase().slice(0, 16) })} />
            </Field>
          </div>
          <Field label="What happened?" htmlFor="inc-desc" required error={errors.description}>
            <Textarea id="inc-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1000} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
