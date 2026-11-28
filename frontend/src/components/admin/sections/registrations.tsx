"use client";

import { useMemo, useState } from "react";
import { LuDownload, LuUpload } from "react-icons/lu";
import {
  adminAllotBibAction,
  adminAutoAllotBibsAction,
  adminBulkAllotBibsAction,
  adminMarkKitCollectedAction,
  adminUndoKitCollectedAction,
} from "@/app/actions/adminOps";
import type { ApiRunnerRegistration } from "@/lib/api";
import { Badge, Button, ChoiceChip, Field, Modal, Notice, TextInput } from "@/components/ui";
import { AdminTable, FormActions, Toolbar, formatDateTime, matches, td, useAdminAction } from "@/components/admin/shared";
import { downloadBibTemplate, downloadRunnersWorkbook, readBibRows } from "@/components/admin/exports";
import { registeredToday } from "@/components/admin/sections/overview";

type KitFilter = "all" | "pending" | "collected";

/**
 * Registrations (all), Today's Registrations (created today) and Check-ins (kit pickup focus) share
 * this one table. Bib allotment (single, automatic, bulk upload) and kit pickup live here.
 */
export function RegistrationsSection({
  slug,
  runners,
  total,
}: {
  slug: "registrations" | "todays-registrations" | "check-ins";
  runners: ApiRunnerRegistration[];
  /** All registrations in the database; `runners` holds the most recent ones (capped). */
  total: number;
}) {
  const { run, confirmRun, pending, showError } = useAdminAction();
  const [search, setSearch] = useState("");
  const [kitFilter, setKitFilter] = useState<KitFilter>(slug === "check-ins" ? "pending" : "all");
  const [bibTarget, setBibTarget] = useState<ApiRunnerRegistration | null>(null);
  const [bibInput, setBibInput] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<Array<{ registrationNumber: string; bibNumber: string }>>([]);
  const [bulkFile, setBulkFile] = useState("");

  const base = useMemo(() => (slug === "todays-registrations" ? registeredToday(runners) : runners), [slug, runners]);
  const collected = base.filter((r) => r.kitCollectedAt).length;
  const unassigned = base.filter((r) => !r.bibNumber).length;

  const rows = useMemo(
    () =>
      base.filter((r) => {
        if (kitFilter === "pending" && r.kitCollectedAt) return false;
        if (kitFilter === "collected" && !r.kitCollectedAt) return false;
        return matches(search, r.fullName, r.registrationNumber, r.bibNumber, r.email, r.phone, r.distance);
      }),
    [base, kitFilter, search],
  );

  const autoAllot = () =>
    confirmRun(
      `Give a bib number to all ${unassigned} registrations without one? Each category uses its own number range, in order of registration, skipping numbers already allotted.`,
      async () => {
        const res = await adminAutoAllotBibsAction({});
        return res.success ? { success: true, message: `Allotted ${res.assignedCount ?? 0} bib numbers.` } : res;
      },
      "Bibs allotted.",
    );

  const onBulkFile = async (file: File | undefined) => {
    setBulkRows([]);
    setBulkFile(file?.name ?? "");
    if (!file) return;
    try {
      const parsed = await readBibRows(file);
      setBulkRows(parsed);
      if (parsed.length === 0) showError("No rows found. The sheet needs RegistrationNumber and BibNumber columns.");
    } catch {
      showError("Could not read that file. Upload an .xlsx or .csv file.");
    }
  };

  const submitBulk = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkRows.length === 0) return;
    run(
      async () => {
        const res = await adminBulkAllotBibsAction(bulkRows);
        if (!res.success) return res;
        const skipped = res.skippedCount ? ` ${res.skippedCount} skipped: ${(res.skipped ?? []).slice(0, 3).map((s) => `${s.registrationNumber} (${s.reason})`).join("; ")}${(res.skippedCount ?? 0) > 3 ? "; ..." : ""}` : "";
        return { success: true, message: `Updated ${res.updatedCount ?? 0} bib numbers.${skipped}` };
      },
      "Bibs updated.",
      () => {
        setBulkOpen(false);
        setBulkRows([]);
        setBulkFile("");
      },
    );
  };

  return (
    <div className="space-y-4">
      {total > runners.length ? (
        <Notice tone="warning">
          Showing the latest {runners.length} of {total} registrations. Older registrations are not in this list, its counts or its export yet.
        </Notice>
      ) : null}
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge tone="neutral">{base.length} registrations</Badge>
        <Badge tone={unassigned ? "warning" : "success"}>{unassigned} without bib</Badge>
        <Badge tone="success">{collected} kits collected</Badge>
        <Badge tone={base.length - collected ? "warning" : "success"}>{base.length - collected} kits pending</Badge>
      </div>

      <Toolbar search={search} onSearch={setSearch} placeholder="Search name, registration no., bib, phone...">
        {slug !== "check-ins" ? (
          <>
            <Button type="button" size="sm" variant="primary" disabled={pending || unassigned === 0} onClick={autoAllot}>
              Auto-allot bibs
            </Button>
            <Button type="button" size="sm" variant="secondary" icon={LuUpload} onClick={() => setBulkOpen(true)}>
              Bulk upload bibs
            </Button>
          </>
        ) : null}
        <Button type="button" size="sm" variant="secondary" icon={LuDownload} onClick={() => downloadRunnersWorkbook(rows, "rajgir_marathon_registrations.xlsx")}>
          Export shown (.xlsx)
        </Button>
      </Toolbar>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by kit status">
        {(
          [
            ["all", "All"],
            ["pending", "Kit pending"],
            ["collected", "Kit collected"],
          ] as const
        ).map(([value, label]) => (
          <ChoiceChip key={value} selected={kitFilter === value} onClick={() => setKitFilter(value)}>
            {label}
          </ChoiceChip>
        ))}
      </div>

      <AdminTable
        columns={["Reg. no.", "Runner", "Category", "Bib", "Kit", "Registered", "Actions"]}
        isEmpty={rows.length === 0}
        empty={slug === "todays-registrations" && base.length === 0 ? "No registrations today yet." : "No registrations match."}
        caption="Registrations"
      >
        {rows.map((r) => (
          <tr key={r.id}>
            <td className={`${td} font-mono text-xs font-bold`}>{r.registrationNumber}</td>
            <td className={td}>
              <p className="font-semibold text-charcoal-900">{r.fullName}</p>
              <p className="text-xs text-charcoal-500">
                {r.email} | {r.phone || "-"}
              </p>
            </td>
            <td className={`${td} text-xs`}>
              {r.distance}
              <br />
              <span className="text-charcoal-500">T-shirt {r.tshirtSize}</span>
            </td>
            <td className={td}>{r.bibNumber ? <Badge tone="success">#{r.bibNumber}</Badge> : <Badge tone="warning">Unassigned</Badge>}</td>
            <td className={td}>
              {r.kitCollectedAt ? (
                <Badge tone="success">Collected{r.kitCollectedBy && r.kitCollectedBy !== "SELF" ? ` by ${r.kitCollectedBy}` : ""}</Badge>
              ) : (
                <Badge tone="neutral">Pending</Badge>
              )}
            </td>
            <td className={`${td} text-xs text-charcoal-600`}>{formatDateTime(r.createdAt)}</td>
            <td className={td}>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setBibTarget(r);
                    setBibInput(r.bibNumber ?? "");
                  }}
                >
                  {r.bibNumber ? "Change bib" : "Set bib"}
                </Button>
                {!r.kitCollectedAt ? (
                  <Button type="button" size="sm" variant="primary" disabled={pending} onClick={() => run(() => adminMarkKitCollectedAction(r.registrationNumber, "SELF"), `Kit marked collected for ${r.fullName}.`)}>
                    Kit collected
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => confirmRun(`Undo the kit pickup for ${r.fullName}?`, () => adminUndoKitCollectedAction(r.registrationNumber), `Kit pickup undone for ${r.fullName}.`)}
                  >
                    Undo pickup
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <Modal open={Boolean(bibTarget)} onClose={() => setBibTarget(null)} title={`Bib number for ${bibTarget?.fullName ?? ""}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!bibTarget) return;
            const bib = bibInput.trim();
            run(() => adminAllotBibAction(bibTarget.registrationNumber, bib), `Bib #${bib} allotted to ${bibTarget.fullName}.`, () => setBibTarget(null));
          }}
          className="space-y-4"
        >
          <Field htmlFor="adm-bib" label="Bib number" required hint={bibTarget ? `${bibTarget.registrationNumber} | ${bibTarget.distance}` : undefined}>
            <TextInput id="adm-bib" value={bibInput} onChange={(e) => setBibInput(e.target.value)} required maxLength={12} autoFocus />
          </Field>
          <FormActions onCancel={() => setBibTarget(null)} pending={pending} />
        </form>
      </Modal>

      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk upload bib numbers">
        <form onSubmit={submitBulk} className="space-y-4">
          <p className="text-sm text-charcoal-600">
            Upload an .xlsx or .csv with the columns <strong>RegistrationNumber</strong> and <strong>BibNumber</strong>. Existing bibs for those
            registrations are replaced.
          </p>
          <Button type="button" size="sm" variant="tertiary" icon={LuDownload} onClick={downloadBibTemplate}>
            Download template
          </Button>
          <Field htmlFor="adm-bulk-file" label="Bib sheet" required>
            <input
              id="adm-bulk-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => onBulkFile(e.target.files?.[0])}
              className="block w-full text-sm text-charcoal-700 file:mr-3 file:rounded-btn file:border file:border-charcoal-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold"
            />
          </Field>
          {bulkFile && bulkRows.length > 0 ? (
            <Notice tone="info">
              {bulkFile}: {bulkRows.length} rows ready.
            </Notice>
          ) : null}
          <FormActions
            onCancel={() => setBulkOpen(false)}
            submitLabel={bulkRows.length ? `Upload ${bulkRows.length} bibs` : "Upload bibs"}
            pending={pending}
            disabled={bulkRows.length === 0}
          />
        </form>
      </Modal>
    </div>
  );
}
