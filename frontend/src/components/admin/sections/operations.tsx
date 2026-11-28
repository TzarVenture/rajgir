"use client";

import { useMemo, useState } from "react";
import { adminApproveVolunteerAction, adminAssignVolunteerAction, adminUpdateIncidentAction } from "@/app/actions/adminOps";
import type { ApiIncident, ApiVolunteer } from "@/lib/api";
import { Badge, Button, ChoiceChip, Field, Modal, TextInput, Textarea } from "@/components/ui";
import { AdminTable, EmptyRow, FormActions, Panel, StatusBadge, Toolbar, formatDateTime, matches, td, useAdminAction } from "@/components/admin/shared";

type AdminIncident = ApiIncident & {
  volunteer?: { fullName?: string; phone?: string | null; assignedStation?: string | null } | null;
};

/** Live race control: incidents and SOS alerts, unresolved SOS first (order comes from the API). */
export function LiveRaceSection({ incidents }: { incidents: AdminIncident[] }) {
  const { run, pending } = useAdminAction();
  const [showResolved, setShowResolved] = useState(false);
  const [resolveTarget, setResolveTarget] = useState<AdminIncident | null>(null);
  const [note, setNote] = useState("");

  const open = incidents.filter((i) => i.status !== "RESOLVED");
  const shown = showResolved ? incidents : open;
  const openSos = open.filter((i) => i.isSos).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={openSos ? "error" : "success"}>{openSos} open SOS</Badge>
        <Badge tone={open.length ? "warning" : "success"}>{open.length} open incidents</Badge>
        <ChoiceChip selected={showResolved} onClick={() => setShowResolved((v) => !v)}>
          {showResolved ? "Hide resolved" : "Show resolved too"}
        </ChoiceChip>
      </div>

      <Panel title={`Incidents and SOS alerts (${shown.length})`}>
        {shown.length === 0 ? (
          <EmptyRow>{showResolved ? "No incidents reported." : "No open incidents."}</EmptyRow>
        ) : (
          <ul className="divide-y divide-charcoal-100">
            {shown.map((inc) => (
              <li key={inc.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {inc.isSos ? <Badge tone="error">SOS</Badge> : null}
                    <StatusBadge status={inc.status} />
                    <Badge tone={inc.severity === "CRITICAL" || inc.severity === "HIGH" ? "error" : "neutral"}>{inc.severity}</Badge>
                    <span className="font-bold text-charcoal-900">{inc.type.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-1 break-words text-sm text-charcoal-700">{inc.description}</p>
                  <p className="mt-1 text-xs text-charcoal-500">
                    {inc.location}
                    {inc.runnerBib ? ` | Runner bib ${inc.runnerBib}` : ""} | {formatDateTime(inc.createdAt)}
                    {inc.volunteer?.fullName ? ` | Reported by ${inc.volunteer.fullName}${inc.volunteer.phone ? ` (${inc.volunteer.phone})` : ""}` : ""}
                  </p>
                  {inc.resolutionNote ? <p className="mt-1 text-xs italic text-charcoal-600">Resolution: {inc.resolutionNote}</p> : null}
                </div>
                {inc.status !== "RESOLVED" ? (
                  <div className="flex shrink-0 gap-2">
                    {inc.status === "OPEN" ? (
                      <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => run(() => adminUpdateIncidentAction(inc.id, "ACKNOWLEDGED"), "Incident acknowledged.")}>
                        Acknowledge
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      disabled={pending}
                      onClick={() => {
                        setResolveTarget(inc);
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

      <Modal open={Boolean(resolveTarget)} onClose={() => setResolveTarget(null)} title="Resolve incident">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!resolveTarget) return;
            run(() => adminUpdateIncidentAction(resolveTarget.id, "RESOLVED", note.trim() || undefined), "Incident resolved.", () => setResolveTarget(null));
          }}
          className="space-y-4"
        >
          <Field htmlFor="adm-resolution" label="What was done (optional)" hint="Kept with the incident for the race report.">
            <Textarea id="adm-resolution" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
          </Field>
          <FormActions onCancel={() => setResolveTarget(null)} submitLabel="Mark resolved" pending={pending} />
        </form>
      </Modal>
    </div>
  );
}

const EMPTY_ASSIGN = { assignedRole: "", assignedStation: "", assignedSector: "", supervisorName: "", supervisorPhone: "" };

/** Volunteer applications: approve, and assign role, station, sector and supervisor. */
export function VolunteersSection({ volunteers }: { volunteers: ApiVolunteer[] }) {
  const { run, pending } = useAdminAction();
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<ApiVolunteer | null>(null);
  const [form, setForm] = useState(EMPTY_ASSIGN);

  const rows = useMemo(
    () => volunteers.filter((v) => matches(search, v.fullName, v.email, v.phone, v.rolePreference, v.assignedStation, v.assignedSector)),
    [volunteers, search],
  );
  const pendingCount = volunteers.filter((v) => (v.status ?? "pending") === "pending").length;

  const openAssign = (v: ApiVolunteer) => {
    setTarget(v);
    setForm({
      assignedRole: v.assignedRole ?? v.rolePreference ?? "",
      assignedStation: v.assignedStation ?? "",
      assignedSector: v.assignedSector ?? "",
      supervisorName: v.supervisorName ?? "",
      supervisorPhone: v.supervisorPhone ?? "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Badge tone="neutral">{volunteers.length} volunteers</Badge>
        <Badge tone={pendingCount ? "warning" : "success"}>{pendingCount} waiting for approval</Badge>
      </div>
      <Toolbar search={search} onSearch={setSearch} placeholder="Search name, email, role, station..." />
      <AdminTable columns={["Volunteer", "Status", "Preferred role", "Assignment", "Actions"]} isEmpty={rows.length === 0} empty="No volunteers match." caption="Volunteers">
        {rows.map((v) => {
          const status = v.status ?? "pending";
          return (
            <tr key={v.id}>
              <td className={td}>
                <p className="font-semibold text-charcoal-900">{v.fullName}</p>
                <p className="text-xs text-charcoal-500">
                  {v.email} | {v.phone || "-"}
                </p>
              </td>
              <td className={td}>
                <StatusBadge status={status} />
              </td>
              <td className={`${td} text-xs`}>{v.rolePreference}</td>
              <td className={`${td} text-xs`}>
                {v.assignedStation ? (
                  <>
                    <span className="font-semibold text-charcoal-900">{v.assignedStation}</span>
                    {v.assignedSector ? ` | Sector ${v.assignedSector}` : ""}
                    <br />
                    <span className="text-charcoal-500">
                      {v.assignedRole ?? ""}
                      {v.supervisorName ? ` | Supervisor ${v.supervisorName}` : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-charcoal-500">Not assigned</span>
                )}
              </td>
              <td className={td}>
                <div className="flex flex-wrap gap-2">
                  {status === "pending" ? (
                    <Button type="button" size="sm" variant="primary" disabled={pending} onClick={() => run(() => adminApproveVolunteerAction(v.id), `${v.fullName} approved.`)}>
                      Approve
                    </Button>
                  ) : null}
                  <Button type="button" size="sm" variant="secondary" onClick={() => openAssign(v)}>
                    Assign
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      <Modal open={Boolean(target)} onClose={() => setTarget(null)} title={`Assignment for ${target?.fullName ?? ""}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!target) return;
            const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
            run(() => adminAssignVolunteerAction(target.id, payload), `Assignment saved for ${target.fullName}.`, () => setTarget(null));
          }}
          className="space-y-3"
        >
          <p className="text-sm text-charcoal-600">Leave a field empty to clear it.</p>
          <Field htmlFor="va-role" label="Role">
            <TextInput id="va-role" value={form.assignedRole} onChange={(e) => setForm({ ...form, assignedRole: e.target.value })} maxLength={64} />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field htmlFor="va-station" label="Station">
              <TextInput id="va-station" value={form.assignedStation} onChange={(e) => setForm({ ...form, assignedStation: e.target.value })} maxLength={64} />
            </Field>
            <Field htmlFor="va-sector" label="Sector">
              <TextInput id="va-sector" value={form.assignedSector} onChange={(e) => setForm({ ...form, assignedSector: e.target.value })} maxLength={32} />
            </Field>
            <Field htmlFor="va-sup" label="Supervisor name">
              <TextInput id="va-sup" value={form.supervisorName} onChange={(e) => setForm({ ...form, supervisorName: e.target.value })} maxLength={128} />
            </Field>
            <Field htmlFor="va-sup-phone" label="Supervisor mobile" hint="10 digits">
              <TextInput
                id="va-sup-phone"
                type="tel"
                inputMode="numeric"
                value={form.supervisorPhone}
                onChange={(e) => setForm({ ...form, supervisorPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                pattern="\d{10}"
              />
            </Field>
          </div>
          <FormActions onCancel={() => setTarget(null)} pending={pending} />
        </form>
      </Modal>
    </div>
  );
}
