"use client";

import { useMemo, useState } from "react";
import { LuPlus } from "react-icons/lu";
import {
  adminCreatePaymentAction,
  adminSetUserStatusAction,
  adminUpdatePaymentStatusAction,
  adminUpdatePermissionAction,
  adminUpsertEventAction,
  adminUpsertSettingAction,
} from "@/app/actions/adminOps";
import type {
  ApiAdminPermissionProfile,
  ApiAdminUser,
  ApiAuditLog,
  ApiEventCategoryConfig,
  ApiPaymentTransaction,
  ApiPlatformSetting,
} from "@/lib/api";
import { Badge, Button, Checkbox, ChoiceChip, Field, Modal, Notice, Select, TextInput, Textarea } from "@/components/ui";
import { AdminTable, EmptyRow, FormActions, Panel, StatusBadge, Toolbar, formatDateTime, formatINR, matches, td, useAdminAction } from "@/components/admin/shared";

// ------------------------------------------------------------------------------------------------
// Events (race categories)
// ------------------------------------------------------------------------------------------------

type EventForm = { distance: string; title: string; fee: string; minAge: string; startTime: string; cutoffMinutes: string; capacity: string; isTimed: boolean; isActive: boolean };
const EMPTY_EVENT: EventForm = { distance: "", title: "", fee: "", minAge: "", startTime: "06:00", cutoffMinutes: "", capacity: "", isTimed: true, isActive: true };

export function EventsSection({ events }: { events: ApiEventCategoryConfig[] }) {
  const { run, pending, showError } = useAdminAction();
  const [mode, setMode] = useState<"closed" | "add" | "edit">("closed");
  const [form, setForm] = useState<EventForm>(EMPTY_EVENT);
  const set = (patch: Partial<EventForm>) => setForm((f) => ({ ...f, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const distance = form.distance.trim();
    // Saving is an upsert by distance: adding must never overwrite an existing category.
    if (mode === "add" && events.some((ev) => ev.distance.toLowerCase() === distance.toLowerCase())) {
      showError(`${distance} already exists. Use Edit on that category instead.`);
      return;
    }
    run(
      () =>
        adminUpsertEventAction({
          distance,
          title: form.title.trim(),
          fee: Number(form.fee),
          minAge: Number(form.minAge),
          startTime: form.startTime,
          cutoffMinutes: Number(form.cutoffMinutes),
          capacity: Number(form.capacity),
          isTimed: form.isTimed,
          isActive: form.isActive,
        }),
      `${distance} saved.`,
      () => setMode("closed"),
    );
  };

  return (
    <div className="space-y-4">
      <Toolbar>
        <Button
          type="button"
          size="sm"
          variant="primary"
          icon={LuPlus}
          onClick={() => {
            setForm(EMPTY_EVENT);
            setMode("add");
          }}
        >
          Add category
        </Button>
      </Toolbar>
      <AdminTable columns={["Distance", "Title", "Fee", "Min. age", "Start / cut-off", "Capacity", "Timing", "Status", ""]} isEmpty={events.length === 0} empty="No race categories." caption="Race categories">
        {events.map((ev) => (
          <tr key={ev.id}>
            <td className={`${td} font-bold text-charcoal-900`}>{ev.distance}</td>
            <td className={td}>{ev.title}</td>
            <td className={`${td} font-semibold`}>{formatINR(ev.fee)}</td>
            <td className={td}>{ev.minAge}+</td>
            <td className={`${td} text-xs`}>
              {ev.startTime} / {ev.cutoffMinutes} min
            </td>
            <td className={td}>{ev.capacity}</td>
            <td className={td}>
              <Badge tone={ev.isTimed ? "info" : "neutral"}>{ev.isTimed ? "Timed" : "Not timed"}</Badge>
            </td>
            <td className={td}>
              <StatusBadge status={ev.isActive ? "ACTIVE" : "PAUSED"} label={ev.isActive ? "Open" : "Paused"} />
            </td>
            <td className={td}>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setForm({
                    distance: ev.distance,
                    title: ev.title,
                    fee: String(ev.fee),
                    minAge: String(ev.minAge),
                    startTime: ev.startTime,
                    cutoffMinutes: String(ev.cutoffMinutes),
                    capacity: String(ev.capacity),
                    isTimed: ev.isTimed,
                    isActive: ev.isActive,
                  });
                  setMode("edit");
                }}
              >
                Edit
              </Button>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal open={mode !== "closed"} onClose={() => setMode("closed")} title={mode === "edit" ? `Edit ${form.distance}` : "Add race category"} size="lg">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field htmlFor="ev-dist" label="Distance" required hint={mode === "edit" ? "The distance identifies the category and cannot be changed." : 'For example "21.1 KM".'}>
              <TextInput id="ev-dist" value={form.distance} onChange={(e) => set({ distance: e.target.value })} required readOnly={mode === "edit"} maxLength={32} />
            </Field>
            <Field htmlFor="ev-title" label="Title" required>
              <TextInput id="ev-title" value={form.title} onChange={(e) => set({ title: e.target.value })} required maxLength={80} />
            </Field>
            <Field htmlFor="ev-fee" label="Fee (₹)" required>
              <TextInput id="ev-fee" type="number" min={0} step={1} value={form.fee} onChange={(e) => set({ fee: e.target.value })} required />
            </Field>
            <Field htmlFor="ev-cap" label="Capacity" required>
              <TextInput id="ev-cap" type="number" min={1} step={1} value={form.capacity} onChange={(e) => set({ capacity: e.target.value })} required />
            </Field>
            <Field htmlFor="ev-age" label="Minimum age on race day" required>
              <TextInput id="ev-age" type="number" min={0} max={100} step={1} value={form.minAge} onChange={(e) => set({ minAge: e.target.value })} required />
            </Field>
            <Field htmlFor="ev-start" label="Start time" required>
              <TextInput id="ev-start" type="time" value={form.startTime} onChange={(e) => set({ startTime: e.target.value })} required />
            </Field>
            <Field htmlFor="ev-cut" label="Cut-off (minutes)" required>
              <TextInput id="ev-cut" type="number" min={1} step={1} value={form.cutoffMinutes} onChange={(e) => set({ cutoffMinutes: e.target.value })} required />
            </Field>
          </div>
          <div className="flex flex-wrap gap-6">
            <Checkbox checked={form.isTimed} onChange={(e) => set({ isTimed: e.target.checked })}>
              Chip timed
            </Checkbox>
            <Checkbox checked={form.isActive} onChange={(e) => set({ isActive: e.target.checked })}>
              Open for registration
            </Checkbox>
          </div>
          <FormActions onCancel={() => setMode("closed")} pending={pending} />
        </form>
      </Modal>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Payments ledger
// ------------------------------------------------------------------------------------------------

const METHODS = ["MANUAL", "UPI", "BANK_TRANSFER", "CASH", "CARD", "CHEQUE"];
const EMPTY_PAYMENT = { registrationNumber: "", payerName: "", payerEmail: "", distance: "", amount: "", method: "UPI", referenceCode: "", notes: "" };

export function PaymentsSection({ payments }: { payments: ApiPaymentTransaction[] }) {
  const { run, confirmRun, pending } = useAdminAction();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PAYMENT);
  const [search, setSearch] = useState("");
  const rows = payments.filter((p) => matches(search, p.payerName, p.payerEmail, p.registrationNumber, p.referenceCode, p.status));
  const captured = payments.filter((p) => p.status === "CAPTURED").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <Notice tone="info">
        This is a manual ledger. Changing a status only updates the record here; no money is captured or refunded through a payment gateway.
      </Notice>
      <div className="flex flex-wrap gap-2">
        <Badge tone="neutral">{payments.length} entries</Badge>
        <Badge tone="success">{formatINR(captured)} captured</Badge>
      </div>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search payer, registration no., reference...">
        <Button
          type="button"
          size="sm"
          variant="primary"
          icon={LuPlus}
          onClick={() => {
            setForm(EMPTY_PAYMENT);
            setOpen(true);
          }}
        >
          Record payment
        </Button>
      </Toolbar>
      <AdminTable columns={["Payer", "Registration", "Amount", "Method", "Status", "Recorded", "Actions"]} isEmpty={rows.length === 0} empty="No payment entries yet." caption="Payments">
        {rows.map((p) => (
          <tr key={p.id}>
            <td className={td}>
              <p className="font-semibold text-charcoal-900">{p.payerName}</p>
              <p className="text-xs text-charcoal-500">{p.payerEmail}</p>
            </td>
            <td className={`${td} text-xs`}>
              {p.registrationNumber || "-"}
              {p.distance ? <br /> : null}
              {p.distance}
            </td>
            <td className={`${td} font-bold`}>{formatINR(p.amount)}</td>
            <td className={`${td} text-xs`}>
              {p.method.replace(/_/g, " ").toLowerCase()}
              {p.referenceCode ? <br /> : null}
              {p.referenceCode}
            </td>
            <td className={td}>
              <StatusBadge status={p.status} />
            </td>
            <td className={`${td} text-xs text-charcoal-600`}>{formatDateTime(p.createdAt)}</td>
            <td className={td}>
              <div className="flex flex-wrap gap-2">
                {p.status !== "CAPTURED" && p.status !== "REFUNDED" ? (
                  <Button type="button" size="sm" variant="primary" disabled={pending} onClick={() => run(() => adminUpdatePaymentStatusAction(p.id, "CAPTURED"), "Marked as captured.")}>
                    Mark captured
                  </Button>
                ) : null}
                {p.status === "CAPTURED" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() =>
                      confirmRun(
                        `Mark the ${formatINR(p.amount)} payment from ${p.payerName} as refunded? Make sure the money has actually been returned.`,
                        () => adminUpdatePaymentStatusAction(p.id, "REFUNDED"),
                        "Marked as refunded.",
                      )
                    }
                  >
                    Mark refunded
                  </Button>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal open={open} onClose={() => setOpen(false)} title="Record payment" size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () =>
                adminCreatePaymentAction({
                  registrationNumber: form.registrationNumber.trim() || undefined,
                  payerName: form.payerName.trim(),
                  payerEmail: form.payerEmail.trim(),
                  distance: form.distance.trim() || undefined,
                  amount: Number(form.amount),
                  method: form.method,
                  referenceCode: form.referenceCode.trim() || undefined,
                  notes: form.notes.trim() || undefined,
                }),
              "Payment recorded.",
              () => setOpen(false),
            );
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field htmlFor="py-name" label="Payer name" required>
              <TextInput id="py-name" value={form.payerName} onChange={(e) => setForm({ ...form, payerName: e.target.value })} required maxLength={120} />
            </Field>
            <Field htmlFor="py-email" label="Payer email" required>
              <TextInput id="py-email" type="email" value={form.payerEmail} onChange={(e) => setForm({ ...form, payerEmail: e.target.value })} required maxLength={160} />
            </Field>
            <Field htmlFor="py-reg" label="Registration number">
              <TextInput id="py-reg" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} maxLength={64} />
            </Field>
            <Field htmlFor="py-dist" label="Category">
              <TextInput id="py-dist" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} maxLength={32} placeholder="e.g. 21.1 KM" />
            </Field>
            <Field htmlFor="py-amt" label="Amount (₹)" required>
              <TextInput id="py-amt" type="number" min={1} step={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </Field>
            <Field htmlFor="py-method" label="Method" required>
              <Select id="py-method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, " ").toLowerCase()}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field htmlFor="py-ref" label="Reference (UTR, cheque no., receipt no.)">
            <TextInput id="py-ref" value={form.referenceCode} onChange={(e) => setForm({ ...form, referenceCode: e.target.value })} maxLength={80} />
          </Field>
          <Field htmlFor="py-notes" label="Notes">
            <Textarea id="py-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} />
          </Field>
          <FormActions onCancel={() => setOpen(false)} submitLabel="Record payment" pending={pending} />
        </form>
      </Modal>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Users and roles
// ------------------------------------------------------------------------------------------------

const ROLE_LABEL: Record<string, string> = {
  RUNNER: "Runner",
  VOLUNTEER: "Volunteer",
  INFLUENCER: "Influencer",
  TEAM_CAPTAIN: "Team captain",
  CORPORATE_MANAGER: "Corporate manager",
  SCHOOL_COORDINATOR: "School coordinator",
  SPONSOR: "Sponsor",
  VENDOR: "Vendor",
  TOURISM_PARTNER: "Tourism partner",
  ORGANIZER: "Organizer",
  SUPER_ADMIN: "Super admin",
};
const roleName = (r: string | null) => (r ? (ROLE_LABEL[r] ?? r) : "No role yet");

export function UsersSection({ users, currentUserId }: { users: ApiAdminUser[]; currentUserId: string }) {
  const { confirmRun, pending } = useAdminAction();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const roles = useMemo(() => Array.from(new Set(users.map((u) => u.role ?? "NONE"))).sort(), [users]);
  const rows = users.filter((u) => (role === "ALL" || (u.role ?? "NONE") === role) && matches(search, u.firstName, u.lastName, u.email, u.phone, roleName(u.role)));

  return (
    <div className="space-y-4">
      <Toolbar search={search} onSearch={setSearch} placeholder="Search name, email, mobile...">
        <label className="sr-only" htmlFor="usr-role">
          Filter by role
        </label>
        <Select id="usr-role" value={role} onChange={(e) => setRole(e.target.value)} className="h-9 w-auto">
          <option value="ALL">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r === "NONE" ? "No role yet" : roleName(r)}
            </option>
          ))}
        </Select>
      </Toolbar>
      <AdminTable columns={["User", "Role", "Status", "Joined", "Actions"]} isEmpty={rows.length === 0} empty="No users match." caption="Users">
        {rows.map((u) => {
          const name = `${u.firstName} ${u.lastName}`.trim();
          const next = u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
          const locked = u.role === "SUPER_ADMIN" || u.id === currentUserId;
          return (
            <tr key={u.id}>
              <td className={td}>
                <p className="font-semibold text-charcoal-900">
                  {name}
                  {u.id === currentUserId ? <span className="font-normal text-charcoal-500"> (you)</span> : null}
                </p>
                <p className="text-xs text-charcoal-500">
                  {u.email ?? "-"} | {u.phone || "-"}
                </p>
              </td>
              <td className={td}>
                <Badge tone="neutral">{roleName(u.role)}</Badge>
              </td>
              <td className={td}>
                <StatusBadge status={u.status} />
              </td>
              <td className={`${td} text-xs text-charcoal-600`}>{formatDateTime(u.createdAt)}</td>
              <td className={td}>
                {locked ? null : (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() =>
                      confirmRun(
                        next === "SUSPENDED" ? `Suspend ${name}? They will be signed out and cannot sign in until reactivated.` : `Reactivate ${name}?`,
                        () => adminSetUserStatusAction(u.id, next),
                        next === "SUSPENDED" ? `${name} suspended.` : `${name} reactivated.`,
                      )
                    }
                  >
                    {u.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                  </Button>
                )}
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}

export function RolesSection({ users }: { users: ApiAdminUser[] }) {
  const counts = useMemo(() => {
    const map = new Map<string, { total: number; active: number; pending: number; suspended: number }>();
    for (const u of users) {
      const key = u.role ?? "NONE";
      const c = map.get(key) ?? { total: 0, active: 0, pending: 0, suspended: 0 };
      c.total += 1;
      if (u.status === "ACTIVE") c.active += 1;
      else if (u.status === "SUSPENDED") c.suspended += 1;
      else c.pending += 1;
      map.set(key, c);
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total);
  }, [users]);

  return (
    <AdminTable columns={["Role", "Accounts", "Active", "Pending", "Suspended"]} isEmpty={counts.length === 0} empty="No accounts yet." caption="Accounts by role">
      {counts.map(([role, c]) => (
        <tr key={role}>
          <td className={`${td} font-semibold text-charcoal-900`}>{role === "NONE" ? "No role yet" : roleName(role)}</td>
          <td className={td}>{c.total}</td>
          <td className={td}>{c.active}</td>
          <td className={td}>{c.pending}</td>
          <td className={td}>{c.suspended}</td>
        </tr>
      ))}
    </AdminTable>
  );
}

// ------------------------------------------------------------------------------------------------
// Permissions, audit log, settings
// ------------------------------------------------------------------------------------------------

const PERMISSION_FLAGS = [
  ["canManageRunners", "Runners"],
  ["canAllotBibs", "Bibs"],
  ["canManageVolunteers", "Volunteers"],
  ["canManageInfluencers", "Influencers"],
  ["canManageGroups", "Groups"],
  ["canManagePartners", "Partners"],
  ["canManageIncidents", "Incidents"],
] as const;

export function PermissionsSection({ permissions }: { permissions: ApiAdminPermissionProfile[] }) {
  const { run, pending } = useAdminAction();
  return (
    <div className="space-y-4">
      <Notice tone="warning">
        These flags are recorded per admin but are not enforced yet: every Organizer and Super Admin can currently use the whole console.
      </Notice>
      <AdminTable columns={["Admin", ...PERMISSION_FLAGS.map(([, l]) => l)]} isEmpty={permissions.length === 0} empty="No admin profiles yet." caption="Admin permissions">
        {permissions.map((ap) => (
          <tr key={ap.id}>
            <td className={td}>
              <p className="font-semibold text-charcoal-900">
                {ap.user.firstName} {ap.user.lastName}
              </p>
              <p className="text-xs text-charcoal-500">
                {ap.user.email} | {ap.designation}
              </p>
            </td>
            {PERMISSION_FLAGS.map(([flag, label]) => (
              <td key={flag} className={td}>
                <ChoiceChip
                  selected={ap[flag]}
                  disabled={pending}
                  onClick={() => run(() => adminUpdatePermissionAction(ap.id, { [flag]: !ap[flag] }), `${label} ${ap[flag] ? "turned off" : "turned on"} for ${ap.user.firstName}.`)}
                  className="h-9 px-3 text-xs"
                >
                  {ap[flag] ? "On" : "Off"}
                </ChoiceChip>
              </td>
            ))}
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

export function AuditLogSection({ auditLogs }: { auditLogs: ApiAuditLog[] }) {
  const [search, setSearch] = useState("");
  const rows = auditLogs.filter((l) => matches(search, l.action, l.summary, l.actorEmail, l.targetType));
  return (
    <div className="space-y-4">
      <Toolbar search={search} onSearch={setSearch} placeholder="Search action, person, summary..." />
      <AdminTable columns={["When", "Who", "Action", "What changed"]} isEmpty={rows.length === 0} empty="No audit entries yet." caption="Audit log">
        {rows.map((l) => (
          <tr key={l.id}>
            <td className={`${td} whitespace-nowrap text-xs text-charcoal-600`}>{formatDateTime(l.createdAt)}</td>
            <td className={`${td} text-xs`}>
              {l.actorEmail}
              <br />
              <span className="text-charcoal-500">{roleName(l.actorRole)}</span>
            </td>
            <td className={td}>
              <Badge tone="neutral">{l.action.replace(/_/g, " ").toLowerCase()}</Badge>
            </td>
            <td className={`${td} text-sm text-charcoal-800`}>{l.summary}</td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}

const EMPTY_SETTING = { key: "", value: "", category: "GENERAL", description: "" };

export function SettingsSection({ settings }: { settings: ApiPlatformSetting[] }) {
  const { run, pending, showError } = useAdminAction();
  const [mode, setMode] = useState<"closed" | "add" | "edit">("closed");
  const [form, setForm] = useState(EMPTY_SETTING);

  return (
    <div className="space-y-4">
      <Notice tone="info">Settings are stored here for the team. The website and API do not read them yet, so changing a value has no effect on the site.</Notice>
      <Toolbar>
        <Button
          type="button"
          size="sm"
          variant="primary"
          icon={LuPlus}
          onClick={() => {
            setForm(EMPTY_SETTING);
            setMode("add");
          }}
        >
          Add setting
        </Button>
      </Toolbar>
      <Panel title={`Settings (${settings.length})`}>
        {settings.length === 0 ? (
          <EmptyRow>No settings yet.</EmptyRow>
        ) : (
          <ul className="divide-y divide-charcoal-100">
            {settings.map((st) => (
              <li key={st.key} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold">{st.key}</span>
                    <Badge tone="neutral">{st.category.toLowerCase()}</Badge>
                  </div>
                  <p className="mt-1 break-words text-sm font-semibold text-charcoal-900">{st.value}</p>
                  {st.description ? <p className="text-xs text-charcoal-500">{st.description}</p> : null}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setForm({ key: st.key, value: st.value, category: st.category, description: st.description ?? "" });
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

      <Modal open={mode !== "closed"} onClose={() => setMode("closed")} title={mode === "edit" ? `Edit ${form.key}` : "Add setting"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const key = form.key.trim();
            // Saving is an upsert by key: adding must not overwrite an existing setting.
            if (mode === "add" && settings.some((s) => s.key === key)) {
              showError(`The setting "${key}" already exists. Edit it instead.`);
              return;
            }
            run(() => adminUpsertSettingAction({ ...form, key, value: form.value.trim(), description: form.description.trim() }), `${key} saved.`, () => setMode("closed"));
          }}
          className="space-y-3"
        >
          <Field htmlFor="st-key" label="Key" required hint={mode === "edit" ? "The key cannot be changed." : "Lowercase letters, numbers and underscores."}>
            <TextInput id="st-key" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required readOnly={mode === "edit"} pattern="[a-z0-9_]+" maxLength={80} />
          </Field>
          <Field htmlFor="st-val" label="Value" required>
            <TextInput id="st-val" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required maxLength={500} />
          </Field>
          <Field htmlFor="st-cat" label="Category">
            <TextInput id="st-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })} maxLength={40} />
          </Field>
          <Field htmlFor="st-desc" label="Description">
            <TextInput id="st-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={200} />
          </Field>
          <FormActions onCancel={() => setMode("closed")} pending={pending} />
        </form>
      </Modal>
    </div>
  );
}
