"use client";

import { useState } from "react";
import {
  LuCheck,
  LuCircleAlert,
  LuCircleCheck,
  LuClock,
  LuExternalLink,
  LuLink,
  LuSend,
  LuSparkles,
} from "react-icons/lu";
import { Badge, Button, Field, Modal, Notice, TextInput } from "@/components/ui";
import { type CreatorDeliverable } from "@/lib/influencerDashboard";

export function DeliverablesManager({
  initialDeliverables,
  creatorHandle,
}: {
  initialDeliverables: CreatorDeliverable[];
  creatorHandle: string;
}) {
  const [deliverables, setDeliverables] = useState<CreatorDeliverable[]>(initialDeliverables);
  const [activeItem, setActiveItem] = useState<CreatorDeliverable | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const completedCount = deliverables.filter((d) => d.status === "COMPLETED").length;
  const inReviewCount = deliverables.filter((d) => d.status === "IN_REVIEW").length;
  const progressPercent = Math.round((completedCount / deliverables.length) * 100);

  function handleOpenModal(item: CreatorDeliverable) {
    setActiveItem(item);
    setUrlInput(item.submittedUrl || "");
    setUrlError("");
  }

  function handleSaveUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!urlInput.trim()) {
      setUrlError("Please enter a valid public content URL.");
      return;
    }
    if (!urlInput.startsWith("http://") && !urlInput.startsWith("https://")) {
      setUrlError("URL must begin with https:// or http://");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      if (activeItem) {
        setDeliverables((prev) =>
          prev.map((d) =>
            d.id === activeItem.id
              ? { ...d, submittedUrl: urlInput.trim(), status: "IN_REVIEW" }
              : d
          )
        );
      }
      setSubmitting(false);
      setActiveItem(null);
    }, 400);
  }

  function copyHashtag(tag: string) {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  }

  return (
    <div className="space-y-6">
      {/* Progress & Milestone Summary Card */}
      <div className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Deliverables Progress
            </span>
            <h2 className="font-barlow text-2xl font-bold text-charcoal-900">
              {completedCount} of {deliverables.length} Deliverables Completed
            </h2>
            <p className="mt-0.5 text-xs text-charcoal-600">
              Submit your published social links below. Our PR team clears each item within 24 hours.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-charcoal-100 px-3 py-1 text-xs font-semibold text-charcoal-700">
              {inReviewCount} In Review
            </span>
            <span className="rounded-full bg-brand-red-light px-3 py-1 font-mono text-xs font-bold text-brand-red-dark">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-charcoal-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-brand-red h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent || (inReviewCount ? 25 : 5)}%` }}
          />
        </div>
      </div>

      {/* Deliverable Items List */}
      <div className="space-y-4">
        {deliverables.map((item, index) => {
          const isDone = item.status === "COMPLETED";
          const isReview = item.status === "IN_REVIEW";

          return (
            <div
              key={item.id}
              className="rounded-card border border-charcoal-200 bg-white p-5 shadow-2xs hover:border-charcoal-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-charcoal-500">
                      MILESTONE 0{index + 1}
                    </span>
                    <span className="rounded-full bg-surface-soft border border-charcoal-200 px-2.5 py-0.5 text-[11px] font-semibold text-charcoal-700">
                      {item.platform}
                    </span>
                    <span className="text-xs text-charcoal-400">•</span>
                    <span className="text-xs font-semibold text-charcoal-600 flex items-center gap-1">
                      <LuClock className="h-3.5 w-3.5 text-brand-red" />
                      {item.window}
                    </span>
                  </div>

                  <h3 className="font-barlow text-lg sm:text-xl font-bold text-charcoal-900">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
                  {isDone ? (
                    <Badge tone="success">
                      <LuCircleCheck className="h-3.5 w-3.5" /> Approved
                    </Badge>
                  ) : isReview ? (
                    <Badge tone="warning">
                      <LuClock className="h-3.5 w-3.5" /> In PR Review
                    </Badge>
                  ) : (
                    <Badge tone="neutral">Pending Publication</Badge>
                  )}
                </div>
              </div>

              {/* Submitted URL & Actions */}
              <div className="pt-3 border-t border-charcoal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Suggested Hashtags */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-charcoal-400 font-medium">Tags:</span>
                  {item.suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => copyHashtag(tag)}
                      title="Click to copy hashtag"
                      className="rounded bg-surface-soft border border-charcoal-200 px-2 py-0.5 font-mono text-[11px] font-semibold text-charcoal-700 hover:border-brand-red hover:text-brand-red transition-colors"
                    >
                      {copiedTag === tag ? "Copied!" : tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {item.submittedUrl ? (
                    <a
                      href={item.submittedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-red hover:underline"
                    >
                      <span>View Submitted Post</span>
                      <LuExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}

                  <Button
                    type="button"
                    variant={item.submittedUrl ? "secondary" : "primary"}
                    size="sm"
                    icon={item.submittedUrl ? LuLink : LuSend}
                    onClick={() => handleOpenModal(item)}
                  >
                    {item.submittedUrl ? "Update Link" : "Submit Post Link"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {activeItem ? (
        <Modal
          open={Boolean(activeItem)}
          onClose={() => setActiveItem(null)}
          title={`Submit Link: ${activeItem.title}`}
        >
          <form onSubmit={handleSaveUrl} className="space-y-4">
            <p className="text-xs text-charcoal-600">
              Paste the public link to your published Instagram Reel, YouTube Video, or Strava activity for PR verification.
            </p>
            {urlError ? <Notice tone="error">{urlError}</Notice> : null}

            <div className="rounded-card border border-charcoal-200 bg-surface-soft p-3 text-xs text-charcoal-600 space-y-1">
              <p className="font-semibold text-charcoal-900">Mandatory Inclusion Guidelines:</p>
              <ul className="list-disc list-inside space-y-0.5 text-charcoal-600">
                <li>Include #RajgirMarathon2027 and tag @rajgirmarathon</li>
                <li>Make sure post visibility is set to Public</li>
                <li>Tag paid partnership disclosure if applicable</li>
              </ul>
            </div>

            <Field
              label="Public Content URL"
              hint="e.g. https://www.instagram.com/reel/C-xyz123/"
              required
            >
              <TextInput
                type="url"
                placeholder="https://..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
                autoFocus
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setActiveItem(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={LuSend}
                loading={submitting}
                disabled={submitting || !urlInput.trim()}
              >
                Send for Review
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
