"use client";

import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import {
  adminCreateMediaAction,
  adminCreateNotificationAction,
  adminCreateSupportAction,
  adminToggleMediaAction,
  adminUpdateSupportAction,
  adminUpsertCmsAction,
} from "@/app/actions/adminOps";
import type { ApiCmsBlock, ApiMediaAsset, ApiNotificationCampaign, ApiSupportTicket } from "@/lib/api";
import { Badge, Button, Checkbox, ChoiceChip, Field, Modal, Notice, Select, TextInput, Textarea } from "@/components/ui";
import { AdminTable, EmptyRow, FormActions, Panel, StatusBadge, Toolbar, formatDateTime, matches, td, useAdminAction } from "@/components/admin/shared";

/** Said plainly on pages whose records are not yet wired to the public site or a delivery service. */
function RecordsOnly({ children }: { children: React.ReactNode }) {
  return <Notice tone="info">{children}</Notice>;
}

// ------------------------------------------------------------------------------------------------
// Media
// ------------------------------------------------------------------------------------------------

const MEDIA_CATEGORIES = ["PHOTO", "VIDEO", "PRESS_RELEASE", "LOGO", "DOCUMENT"];
const EMPTY_MEDIA = { title: "", category: "PHOTO", url: "", caption: "" };

export function MediaSection({ media }: { media: ApiMediaAsset[] }) {
  const { run, pending } = useAdminAction();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_MEDIA);
  const [search, setSearch] = useState("");
  const rows = media.filter((m) => matches(search, m.title, m.category, m.caption, m.url));

  return (
    <div className="space-y-4">
      <RecordsOnly>Media assets are kept here for the team. They are not shown on the public website yet.</RecordsOnly>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search title, category, caption...">
        <Button
          type="button"
          size="sm"
          variant="primary"
          icon={LuPlus}
          onClick={() => {
            setForm(EMPTY_MEDIA);
            setOpen(true);
          }}
        >
          Add media
        </Button>
      </Toolbar>
      <AdminTable columns={["Title", "Category", "Link", "Visibility", "Added", "Actions"]} isEmpty={rows.length === 0} empty="No media assets yet." caption="Media assets">
        {rows.map((m) => (
          <tr key={m.id}>
            <td className={td}>
              <p className="font-semibold text-charcoal-900">{m.title}</p>
              {m.caption ? <p className="text-xs text-charcoal-500">{m.caption}</p> : null}
            </td>
            <td className={td}>
              <Badge tone="neutral">{m.category.replace(/_/g, " ").toLowerCase()}</Badge>
            </td>
            <td className={`${td} max-w-xs`}>
              <a href={m.url} target="_blank" rel="noopener noreferrer nofollow" className="block truncate font-mono text-xs text-brand-red hover:underline">
                {m.url}
              </a>
            </td>
            <td className={td}>
              <StatusBadge status={m.isPublished ? "PUBLISHED" : "DRAFT"} label={m.isPublished ? "Published" : "Hidden"} />
            </td>
            <td className={`${td} text-xs text-charcoal-600`}>{formatDateTime(m.createdAt)}</td>
            <td className={td}>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => run(() => adminToggleMediaAction(m.id, !m.isPublished), m.isPublished ? `"${m.title}" hidden.` : `"${m.title}" published.`)}
              >
                {m.isPublished ? "Hide" : "Publish"}
              </Button>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal open={open} onClose={() => setOpen(false)} title="Add media">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => adminCreateMediaAction({ title: form.title.trim(), category: form.category, url: form.url.trim(), caption: form.caption.trim() || undefined }),
              "Media added.",
              () => setOpen(false),
            );
          }}
          className="space-y-3"
        >
          <Field htmlFor="md-title" label="Title" required>
            <TextInput id="md-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={160} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field htmlFor="md-cat" label="Category" required>
              <Select id="md-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {MEDIA_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, " ").toLowerCase()}
                  </option>
                ))}
              </Select>
            </Field>
            <Field htmlFor="md-url" label="Link (https://...)" required>
              <TextInput id="md-url" type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required pattern="https?://.+" />
            </Field>
          </div>
          <Field htmlFor="md-caption" label="Caption">
            <TextInput id="md-caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} maxLength={300} />
          </Field>
          <FormActions onCancel={() => setOpen(false)} submitLabel="Add media" pending={pending} />
        </form>
      </Modal>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// CMS
// ------------------------------------------------------------------------------------------------

const CMS_SECTIONS = ["HOMEPAGE", "EXPO", "RACE_DAY", "FAQ", "ANNOUNCEMENT", "GENERAL"];
const EMPTY_CMS = { slug: "", title: "", section: "HOMEPAGE", content: "", isPublished: true };

export function CmsSection({ cms }: { cms: ApiCmsBlock[] }) {
  const { run, pending, showError } = useAdminAction();
  const [mode, setMode] = useState<"closed" | "add" | "edit">("closed");
  const [form, setForm] = useState(EMPTY_CMS);
  const sections = Array.from(new Set([...CMS_SECTIONS, ...cms.map((b) => b.section)]));

  return (
    <div className="space-y-4">
      <RecordsOnly>Content blocks are saved here but the public website does not read them yet; site text is still changed in code.</RecordsOnly>
      <Toolbar>
        <Button
          type="button"
          size="sm"
          variant="primary"
          icon={LuPlus}
          onClick={() => {
            setForm(EMPTY_CMS);
            setMode("add");
          }}
        >
          Add content block
        </Button>
      </Toolbar>
      <Panel title={`Content blocks (${cms.length})`}>
        {cms.length === 0 ? (
          <EmptyRow>No content blocks yet.</EmptyRow>
        ) : (
          <ul className="divide-y divide-charcoal-100">
            {cms.map((b) => (
              <li key={b.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-charcoal-900">{b.title}</span>
                    <Badge tone="neutral">{b.section.replace(/_/g, " ").toLowerCase()}</Badge>
                    <StatusBadge status={b.isPublished ? "PUBLISHED" : "DRAFT"} label={b.isPublished ? "Published" : "Draft"} />
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-charcoal-700">{b.content}</p>
                  <p className="mt-1 font-mono text-xs text-charcoal-500">
                    {b.slug} | Updated {formatDateTime(b.updatedAt)}
                    {b.updatedByEmail ? ` by ${b.updatedByEmail}` : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setForm({ slug: b.slug, title: b.title, section: b.section, content: b.content, isPublished: b.isPublished });
                    setMode("edit");
                  }}
                >
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal open={mode !== "closed"} onClose={() => setMode("closed")} title={mode === "edit" ? "Edit content block" : "Add content block"} size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const slug = form.slug.trim().toLowerCase();
            // Saving is an upsert by slug: a new block must not silently overwrite an existing one.
            if (mode === "add" && cms.some((b) => b.slug === slug)) {
              showError(`A block with the slug "${slug}" already exists. Edit that block instead.`);
              return;
            }
            run(() => adminUpsertCmsAction({ ...form, slug, title: form.title.trim(), content: form.content.trim() }), "Content block saved.", () => setMode("closed"));
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field htmlFor="cms-slug" label="Slug" required hint={mode === "edit" ? "The slug identifies the block and cannot be changed." : "Lowercase letters, numbers and dashes."}>
              <TextInput
                id="cms-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                readOnly={mode === "edit"}
                pattern="[a-z0-9-]+"
                maxLength={80}
              />
            </Field>
            <Field htmlFor="cms-section" label="Section" required>
              <Select id="cms-section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                {sections.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ").toLowerCase()}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field htmlFor="cms-title" label="Title" required>
            <TextInput id="cms-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={160} />
          </Field>
          <Field htmlFor="cms-content" label="Content" required>
            <Textarea id="cms-content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={6} />
          </Field>
          <Checkbox checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}>
            Published
          </Checkbox>
          <FormActions onCancel={() => setMode("closed")} pending={pending} />
        </form>
      </Modal>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Notifications
// ------------------------------------------------------------------------------------------------

const CHANNELS = ["EMAIL", "SMS", "WHATSAPP", "PUSH"];
/** Audiences the API can count (anything else is treated as "all users" by the API). */
const AUDIENCES = [
  ["ALL_RUNNERS", "All runners"],
  ["VOLUNTEERS", "All volunteers"],
  ["ALL_USERS", "Everyone with an account"],
] as const;
const EMPTY_CAMPAIGN = { title: "", channel: "EMAIL", audience: "ALL_RUNNERS", message: "", sendNow: false };

export function NotificationsSection({ notifications }: { notifications: ApiNotificationCampaign[] }) {
  const { run, pending } = useAdminAction();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_CAMPAIGN);
  const audienceLabel = (a: string) => AUDIENCES.find(([v]) => v === a)?.[1] ?? a;

  return (
    <div className="space-y-4">
      <RecordsOnly>
        Campaigns are recorded with their recipient count, but no email, SMS, WhatsApp or push service is connected yet, so nothing is delivered.
      </RecordsOnly>
      <Toolbar>
        <Button
          type="button"
          size="sm"
          variant="primary"
          icon={LuPlus}
          onClick={() => {
            setForm(EMPTY_CAMPAIGN);
            setOpen(true);
          }}
        >
          New campaign
        </Button>
      </Toolbar>
      <AdminTable columns={["Campaign", "Channel", "Audience", "Recipients", "Status", "Created"]} isEmpty={notifications.length === 0} empty="No campaigns yet." caption="Notification campaigns">
        {notifications.map((n) => (
          <tr key={n.id}>
            <td className={td}>
              <p className="font-semibold text-charcoal-900">{n.title}</p>
              <p className="line-clamp-2 text-xs text-charcoal-500">{n.message}</p>
            </td>
            <td className={td}>
              <Badge tone="neutral">{n.channel}</Badge>
            </td>
            <td className={`${td} text-xs`}>{audienceLabel(n.audience)}</td>
            <td className={`${td} font-bold`}>{n.recipientCount}</td>
            <td className={td}>
              <StatusBadge status={n.status} />
            </td>
            <td className={`${td} text-xs text-charcoal-600`}>
              {formatDateTime(n.createdAt)}
              {n.createdByEmail ? <br /> : null}
              {n.createdByEmail}
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal open={open} onClose={() => setOpen(false)} title="New notification campaign" size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => adminCreateNotificationAction({ ...form, title: form.title.trim(), message: form.message.trim() }),
              form.sendNow ? "Campaign saved as queued." : "Campaign saved as draft.",
              () => setOpen(false),
            );
          }}
          className="space-y-3"
        >
          <Field htmlFor="nt-title" label="Title" required>
            <TextInput id="nt-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={160} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field htmlFor="nt-channel" label="Channel" required>
              <Select id="nt-channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field htmlFor="nt-aud" label="Audience" required>
              <Select id="nt-aud" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                {AUDIENCES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field htmlFor="nt-msg" label="Message" required>
            <Textarea id="nt-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} maxLength={2000} />
          </Field>
          <Checkbox checked={form.sendNow} onChange={(e) => setForm({ ...form, sendNow: e.target.checked })}>
            Mark as queued (otherwise saved as a draft)
          </Checkbox>
          <FormActions onCancel={() => setOpen(false)} submitLabel="Save campaign" pending={pending} />
        </form>
      </Modal>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Support tickets
// ------------------------------------------------------------------------------------------------

const TICKET_CATEGORIES = ["GENERAL", "REGISTRATION", "PAYMENT", "KIT", "RESULTS", "VOLUNTEER", "PARTNER"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];
const EMPTY_TICKET = { requesterName: "", requesterEmail: "", category: "GENERAL", subject: "", message: "", priority: "NORMAL" };

export function SupportSection({ support }: { support: ApiSupportTicket[] }) {
  const { run, pending } = useAdminAction();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_TICKET);
  const [resolveTarget, setResolveTarget] = useState<ApiSupportTicket | null>(null);
  const [note, setNote] = useState("");
  const [showResolved, setShowResolved] = useState(false);
  const [search, setSearch] = useState("");

  const openCount = support.filter((t) => t.status !== "RESOLVED").length;
  const rows = support.filter(
    (t) => (showResolved || t.status !== "RESOLVED") && matches(search, t.ticketNumber, t.subject, t.requesterName, t.requesterEmail, t.category),
  );

  return (
    <div className="space-y-4">
      <Toolbar search={search} onSearch={setSearch} placeholder="Search ticket, subject, requester...">
        <ChoiceChip selected={showResolved} onClick={() => setShowResolved((v) => !v)}>
          {showResolved ? "Hide resolved" : "Show resolved too"}
        </ChoiceChip>
        <Button
          type="button"
          size="sm"
          variant="primary"
          icon={LuPlus}
          onClick={() => {
            setForm(EMPTY_TICKET);
            setOpen(true);
          }}
        >
          Create ticket
        </Button>
      </Toolbar>
      <Panel title={`Tickets (${openCount} open)`}>
        {rows.length === 0 ? (
          <EmptyRow>{showResolved ? "No tickets yet." : "No open tickets."}</EmptyRow>
        ) : (
          <ul className="divide-y divide-charcoal-100">
            {rows.map((t) => (
              <li key={t.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold">{t.ticketNumber}</span>
                    <StatusBadge status={t.status} />
                    <Badge tone={t.priority === "URGENT" || t.priority === "HIGH" ? "error" : "neutral"}>{t.priority.toLowerCase()}</Badge>
                    <Badge tone="neutral">{t.category.toLowerCase()}</Badge>
                    <span className="font-bold text-charcoal-900">{t.subject}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-line break-words text-sm text-charcoal-700">{t.message}</p>
                  <p className="mt-1 text-xs text-charcoal-500">
                    {t.requesterName} ({t.requesterEmail}) | {formatDateTime(t.createdAt)}
                  </p>
                  {t.resolutionNote ? <p className="mt-1 text-xs italic text-charcoal-600">Resolution: {t.resolutionNote}</p> : null}
                </div>
                {t.status !== "RESOLVED" ? (
                  <div className="flex shrink-0 gap-2">
                    {t.status === "OPEN" ? (
                      <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => run(() => adminUpdateSupportAction(t.id, { status: "IN_PROGRESS" }), `${t.ticketNumber} marked in progress.`)}>
                        Start
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={pending}
                      onClick={() => {
                        setResolveTarget(t);
                        setNote("");
                      }}
                    >
                      Resolve
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Create support ticket" size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(() => adminCreateSupportAction(form), "Ticket created.", () => setOpen(false));
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field htmlFor="tk-name" label="Requester name" required>
              <TextInput id="tk-name" value={form.requesterName} onChange={(e) => setForm({ ...form, requesterName: e.target.value })} required maxLength={120} />
            </Field>
            <Field htmlFor="tk-email" label="Requester email" required>
              <TextInput id="tk-email" type="email" value={form.requesterEmail} onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })} required maxLength={160} />
            </Field>
            <Field htmlFor="tk-cat" label="Category" required>
              <Select id="tk-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {TICKET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toLowerCase()}
                  </option>
                ))}
              </Select>
            </Field>
            <Field htmlFor="tk-pri" label="Priority" required>
              <Select id="tk-pri" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.toLowerCase()}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field htmlFor="tk-sub" label="Subject" required>
            <TextInput id="tk-sub" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required maxLength={200} />
          </Field>
          <Field htmlFor="tk-msg" label="Message" required>
            <Textarea id="tk-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={5} maxLength={4000} />
          </Field>
          <FormActions onCancel={() => setOpen(false)} submitLabel="Create ticket" pending={pending} />
        </form>
      </Modal>

      <Modal open={Boolean(resolveTarget)} onClose={() => setResolveTarget(null)} title={`Resolve ${resolveTarget?.ticketNumber ?? ""}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!resolveTarget) return;
            run(
              () => adminUpdateSupportAction(resolveTarget.id, { status: "RESOLVED", resolutionNote: note.trim() || undefined }),
              `${resolveTarget.ticketNumber} resolved.`,
              () => setResolveTarget(null),
            );
          }}
          className="space-y-3"
        >
          <Field htmlFor="tk-note" label="Resolution note (optional)">
            <Textarea id="tk-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
          </Field>
          <FormActions onCancel={() => setResolveTarget(null)} submitLabel="Mark resolved" pending={pending} />
        </form>
      </Modal>
    </div>
  );
}
