"use client";

import { useState, useTransition } from "react";
import { LuCheck, LuCircleAlert, LuSend, LuTicket } from "react-icons/lu";
import {
  submitSupportTicket,
  type SupportTicketInput,
  type SupportTicketResponse,
} from "@/app/actions/dashboard";
import { Button, Field, Notice, Select, TextInput, Textarea } from "@/components/ui";
import { SUPPORT_TOPICS } from "@/lib/supportData";

export interface SupportRunnerContext {
  athleteName: string;
  email: string;
  phone?: string;
  registrationNumber?: string;
  distance?: string;
  roleLabel?: string;
}

export function SupportTicketForm({
  context,
  topics = SUPPORT_TOPICS,
  onSuccess,
  compact = false,
}: {
  context: SupportRunnerContext;
  topics?: readonly { id: string; label: string }[];
  onSuccess?: (ticket: SupportTicketResponse) => void;
  compact?: boolean;
}) {
  const [topic, setTopic] = useState<SupportTicketInput["topic"]>(
    (topics[0]?.id as SupportTicketInput["topic"]) ?? "OTHER"
  );
  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [ticketResult, setTicketResult] = useState<SupportTicketResponse | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    startTransition(async () => {
      const res = await submitSupportTicket({
        topic,
        priority,
        subject,
        message,
        registrationNumber: context.registrationNumber,
        athleteName: context.athleteName,
        email: context.email,
        phone: context.phone,
      });

      if (!res.success || !res.data) {
        setError(res.error ?? "Failed to submit support ticket. Please try again.");
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }

      setTicketResult(res.data);
      onSuccess?.(res.data);
    });
  }

  function resetForm() {
    setTicketResult(null);
    setSubject("");
    setMessage("");
    setError("");
    setFieldErrors({});
  }

  if (ticketResult) {
    return (
      <div className="rounded-card border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <LuCheck className="h-8 w-8" aria-hidden />
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-mono text-xs font-bold text-emerald-800">
            <LuTicket className="h-3.5 w-3.5" aria-hidden />
            Ticket #{ticketResult.ticketId}
          </span>
          <h3 className="mt-2 font-barlow text-xl font-bold text-charcoal-900">
            Support Inquiry Submitted
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
            Your inquiry has been routed directly to race control. We have attached your registration record (<strong>{context.registrationNumber || "Athlete"}</strong>) for immediate lookup.
          </p>
        </div>

        <div className="rounded-card border border-emerald-200/80 bg-white p-3.5 text-xs text-charcoal-700 max-w-sm mx-auto text-left space-y-1.5">
          <p className="flex justify-between">
            <span className="text-charcoal-500">Expected Resolution:</span>
            <span className="font-semibold text-emerald-800">{ticketResult.expectedResolution}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-charcoal-500">Updates Sent To:</span>
            <span className="font-semibold text-charcoal-800 truncate max-w-[180px]">{context.email}</span>
          </p>
        </div>

        <div className="pt-2">
          <Button variant="secondary" size="md" onClick={resetForm}>
            Submit Another Query
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Notice tone="error" title="Please check your ticket entry">
          {error}
        </Notice>
      )}

      {/* Auto-Tagged Athlete Context Summary */}
      <div className="rounded-card border border-charcoal-200 bg-surface-soft p-3 text-xs text-charcoal-600 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-semibold text-charcoal-900">{context.athleteName}</span>
          {context.registrationNumber && (
            <span className="ml-2 font-mono text-charcoal-500">({context.registrationNumber})</span>
          )}
        </div>
        <div className="text-charcoal-500">
          {context.roleLabel
            ? context.roleLabel
            : context.distance
              ? `${context.distance} Category`
              : "Verified Participant"}
        </div>
      </div>

      <div className={compact ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        <Field label="Inquiry Topic" error={fieldErrors.topic} required>
          <Select
            value={topic}
            onChange={(e) => setTopic(e.target.value as SupportTicketInput["topic"])}
            disabled={pending}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Priority Level">
          <div className="flex rounded-btn border border-charcoal-300 bg-white p-0.5 min-h-[44px]">
            <button
              type="button"
              className={`flex-1 rounded-[6px] text-xs font-semibold transition-colors ${
                priority === "NORMAL"
                  ? "bg-charcoal-100 text-charcoal-900"
                  : "text-charcoal-600 hover:text-charcoal-900"
              }`}
              onClick={() => setPriority("NORMAL")}
              disabled={pending}
            >
              Normal
            </button>
            <button
              type="button"
              className={`flex-1 rounded-[6px] text-xs font-semibold transition-colors ${
                priority === "URGENT"
                  ? "bg-red-50 text-brand-red font-bold"
                  : "text-charcoal-600 hover:text-brand-red"
              }`}
              onClick={() => setPriority("URGENT")}
              disabled={pending}
            >
              Urgent (Race Week)
            </button>
          </div>
        </Field>
      </div>

      <Field
        label="Subject"
        hint="Brief summary of your question"
        error={fieldErrors.subject}
        required
      >
        <TextInput
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Can someone else collect my bib with proxy letter?"
          maxLength={100}
          disabled={pending}
          required
        />
      </Field>

      <Field
        label="Message & Details"
        hint="Provide any specific details to assist our race directors"
        error={fieldErrors.message}
        required
      >
        <Textarea
          rows={compact ? 4 : 5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe your query in detail..."
          maxLength={1500}
          disabled={pending}
          required
        />
      </Field>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-charcoal-500">
          {priority === "URGENT" ? (
            <span className="text-brand-red font-medium flex items-center gap-1">
              <LuCircleAlert className="h-3.5 w-3.5" aria-hidden />
              Priority dispatch: 2-4 hr target response
            </span>
          ) : (
            "Standard helpdesk reply within 24 hours"
          )}
        </p>

        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={LuSend}
          loading={pending}
          disabled={pending || !subject.trim() || message.trim().length < 10}
        >
          Submit Ticket
        </Button>
      </div>
    </form>
  );
}
