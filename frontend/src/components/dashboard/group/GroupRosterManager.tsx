"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  LuCheck,
  LuDownload,
  LuFileSpreadsheet,
  LuPlus,
  LuSend,
  LuShieldAlert,
  LuUpload,
  LuUsers,
} from "react-icons/lu";
import {
  addManagedRunnerAction,
  bulkAddManagedRunnersAction,
  submitQuotaAppealAction,
} from "@/app/actions/groupOps";
import type { ApiGroupDashboard, ApiManagedRunner, ApiManagedRunnerInput } from "@/lib/api";
import { Badge, Button, Field, Modal, Notice, Select, TextInput, Textarea } from "@/components/ui";

const DISTANCES = ["42.2 KM", "21.1 KM", "10 KM", "5 KM", "3 KM"];
const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const SOURCE_LABELS: Record<ApiManagedRunner["registrationSource"], string> = {
  SELF_REGISTERED: "Self Registered",
  SCHOOL_REGISTERED: "School Registered",
  CORPORATE_REGISTERED: "Corporate Registered",
  TEAM_REGISTERED: "Team Registered",
};

const EMPTY_FORM: ApiManagedRunnerInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  categoryDistance: "5 KM",
  dateOfBirth: "",
  gender: "Male",
  bloodGroup: "O+",
  tshirtSize: "M",
  emergencyName: "",
  emergencyRelation: "Parent / Guardian",
  emergencyPhone: "",
  city: "Rajgir",
  state: "Bihar",
  pincode: "803116",
};

function normalizeDateString(raw: unknown): string {
  if (typeof raw === "number") {
    // Excel serial date
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (parsed) {
      const m = String(parsed.m).padStart(2, "0");
      const d = String(parsed.d).padStart(2, "0");
      return `${parsed.y}-${m}-${d}`;
    }
  }
  return String(raw ?? "").trim();
}

export function GroupRosterManager({
  initial,
  memberLabel,
  defaultRelation,
}: {
  initial: ApiGroupDashboard;
  memberLabel: string;
  defaultRelation: string;
}) {
  const router = useRouter();
  const [runners, setRunners] = useState<ApiManagedRunner[]>(initial.runners);
  const [quota, setQuota] = useState(initial.quota);

  // Manual Add Modal
  const [manualOpen, setManualOpen] = useState(false);
  const [form, setForm] = useState<ApiManagedRunnerInput>({
    ...EMPTY_FORM,
    emergencyRelation: defaultRelation,
  });
  const [manualError, setManualError] = useState("");
  const [manualPending, startManualTransition] = useTransition();

  // CSV / Excel Import Modal
  const [importOpen, setImportOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<ApiManagedRunnerInput[]>([]);
  const [fileName, setFileName] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [importPending, startImportTransition] = useTransition();

  // Appeal Modal
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealQuota, setAppealQuota] = useState(String(Math.max(100, quota.maxRunnerQuota + 50)));
  const [appealReason, setAppealReason] = useState("");
  const [appealError, setAppealError] = useState("");
  const [appealPending, startAppealTransition] = useTransition();

  const atLimit = quota.used >= quota.maxRunnerQuota;
  const pct = Math.min(100, Math.round((quota.used / Math.max(1, quota.maxRunnerQuota)) * 100));

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError("");
    startManualTransition(async () => {
      const res = await addManagedRunnerAction(form);
      if (!res.success || !res.data) {
        setManualError(res.error ?? "Failed to add runner.");
        return;
      }
      setRunners((prev) => [...res.data!.runners, ...prev]);
      setQuota((q) => ({
        ...q,
        used: q.used + res.data!.count,
        remaining: Math.max(0, q.maxRunnerQuota - (q.used + res.data!.count)),
      }));
      setForm({ ...EMPTY_FORM, emergencyRelation: defaultRelation });
      setManualOpen(false);
      router.refresh();
    });
  };

  const handleDownloadTemplate = () => {
    const sample = [
      {
        firstName: "Aarav",
        lastName: "Kumar",
        email: "",
        phone: "9876543210",
        categoryDistance: "5 KM",
        dateOfBirth: "2008-05-14",
        gender: "Male",
        bloodGroup: "O+",
        tshirtSize: "M",
        emergencyName: "Sunita Devi",
        emergencyRelation: defaultRelation,
        emergencyPhone: "9876543211",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Runners");
    XLSX.writeFile(wb, `rajgir_marathon_${memberLabel.toLowerCase()}_template.xlsx`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    setImportSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

      if (raw.length === 0) {
        setImportError("The uploaded file contains 0 rows.");
        setParsedRows([]);
        return;
      }

      const mapped: ApiManagedRunnerInput[] = raw.map((row) => ({
        firstName: String(row.firstName ?? row["First Name"] ?? row.first_name ?? "").trim(),
        lastName: String(row.lastName ?? row["Last Name"] ?? row.last_name ?? "").trim(),
        email: String(row.email ?? row["Email"] ?? "").trim() || undefined,
        phone: String(row.phone ?? row["Phone"] ?? row["Mobile"] ?? "").trim() || undefined,
        categoryDistance: String(row.categoryDistance ?? row["Distance"] ?? row.distance ?? "5 KM").trim(),
        dateOfBirth: normalizeDateString(row.dateOfBirth ?? row["DOB"] ?? row.dob ?? ""),
        gender: String(row.gender ?? row["Gender"] ?? "Male").trim(),
        bloodGroup: String(row.bloodGroup ?? row["Blood Group"] ?? "O+").trim(),
        tshirtSize: String(row.tshirtSize ?? row["T-Shirt Size"] ?? "M").trim().toUpperCase(),
        emergencyName: String(row.emergencyName ?? row["Emergency Name"] ?? "").trim(),
        emergencyRelation: String(row.emergencyRelation ?? row["Emergency Relation"] ?? defaultRelation).trim(),
        emergencyPhone: String(row.emergencyPhone ?? row["Emergency Phone"] ?? "").trim(),
      }));

      setParsedRows(mapped);
    } catch {
      setImportError("Could not read file. Please upload a valid .xlsx, .xls, or .csv file.");
      setParsedRows([]);
    }
  };

  const handleBulkSubmit = () => {
    setImportError("");
    setImportSuccess("");
    startImportTransition(async () => {
      const res = await bulkAddManagedRunnersAction(parsedRows);
      if (!res.success || !res.data) {
        setImportError(res.error ?? "Bulk upload failed.");
        return;
      }
      setRunners((prev) => [...res.data!.runners, ...prev]);
      setQuota((q) => ({
        ...q,
        used: q.used + res.data!.count,
        remaining: Math.max(0, q.maxRunnerQuota - (q.used + res.data!.count)),
      }));
      setImportSuccess(`Successfully registered ${res.data.count} ${memberLabel.toLowerCase()}(s)!`);
      setParsedRows([]);
      setFileName("");
      router.refresh();
    });
  };

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppealError("");
    const num = Number(appealQuota);
    if (!Number.isFinite(num) || num <= quota.maxRunnerQuota) {
      setAppealError(`Please request more than your current limit (${quota.maxRunnerQuota}).`);
      return;
    }
    startAppealTransition(async () => {
      const res = await submitQuotaAppealAction({ requestedQuota: num, reason: appealReason });
      if (!res.success) {
        setAppealError(res.error ?? "Failed to submit appeal.");
        return;
      }
      setQuota((q) => ({
        ...q,
        appealStatus: "PENDING",
        appealRequestedQuota: num,
        appealReason,
      }));
      setAppealOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Quota Meter & Actions */}
      <section className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <LuUsers className="h-5 w-5 shrink-0 text-brand-red" aria-hidden />
              <h3 className="text-base font-extrabold text-charcoal-900">
                {memberLabel} Runner Quota ({quota.used} / {quota.maxRunnerQuota})
              </h3>
              {quota.appealStatus === "PENDING" && <Badge tone="warning">Appeal Pending ({quota.appealRequestedQuota})</Badge>}
              {quota.appealStatus === "APPROVED" && <Badge tone="success">Quota Upgraded</Badge>}
            </div>
            <p className="text-sm text-charcoal-600">
              Bulk-registered {memberLabel.toLowerCase()}s skip account login and receive instant Bib &amp; QR registration numbers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <Button
              type="button"
              variant="primary"
              icon={LuPlus}
              disabled={atLimit}
              onClick={() => setManualOpen(true)}
            >
              Add {memberLabel}
            </Button>
            <Button
              type="button"
              variant="secondary"
              icon={LuUpload}
              disabled={atLimit}
              onClick={() => setImportOpen(true)}
            >
              Upload CSV / Excel
            </Button>
            <Button type="button" variant="secondary" icon={LuSend} onClick={() => setAppealOpen(true)}>
              Appeal for 50+ Limit
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-charcoal-100">
            <div
              className={`h-full rounded-full transition-all ${atLimit ? "bg-brand-red" : "bg-emerald-600"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-charcoal-500">
            <span>{quota.remaining} slots remaining before Admin appeal required</span>
            <span>{pct}% used</span>
          </div>
        </div>

        {atLimit && (
          <Notice tone="warning" className="mt-4">
            <LuShieldAlert className="mr-1.5 inline h-4 w-4" />
            You have reached your limit of {quota.maxRunnerQuota} runners. Click{" "}
            <strong>Appeal for 50+ Limit</strong> to request additional slots from Admin.
          </Notice>
        )}
      </section>

      {/* Roster List & Table */}
      <section className="rounded-card border border-charcoal-200 bg-white overflow-hidden">
        <div className="border-b border-charcoal-200 px-4 py-4 sm:px-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-charcoal-900">
            Registered {memberLabel}s ({runners.length})
          </h3>
          <Button type="button" variant="secondary" size="sm" icon={LuDownload} onClick={handleDownloadTemplate}>
            Excel Template
          </Button>
        </div>

        {runners.length === 0 ? (
          <div className="p-8 text-center text-sm text-charcoal-500">
            No {memberLabel.toLowerCase()}s added yet. Use <strong>Add {memberLabel}</strong> or{" "}
            <strong>Upload CSV / Excel</strong> to register participants.
          </div>
        ) : (
          <>
            {/* Mobile & small tablet card view */}
            <div className="divide-y divide-charcoal-100 md:hidden">
              {runners.map((r) => (
                <div key={r.id} className="space-y-2 p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-charcoal-900">{r.registrationNumber}</span>
                    <Badge tone="success">{r.paymentStatus ?? "CONFIRMED"}</Badge>
                  </div>
                  <div>
                    <p className="font-bold text-charcoal-900">{r.fullName}</p>
                    <p className="break-all text-xs text-charcoal-500">
                      {r.email || "No email (managed)"} {r.phone ? `• ${r.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-700">
                    <span className="font-semibold">{r.distance}</span>
                    <span>• {r.ageOnRaceDay} yrs</span>
                    <span>• Bib: {r.bibName} ({r.tshirtSize})</span>
                  </div>
                  <div>
                    <Badge tone="neutral">{SOURCE_LABELS[r.registrationSource] ?? r.registrationSource}</Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Laptop & monitor table view */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-charcoal-50 text-xs font-bold uppercase text-charcoal-500">
                  <tr>
                    <th className="px-4 py-3">Reg. Number</th>
                    <th className="px-4 py-3">Participant</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Bib / Tee</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {runners.map((r) => (
                    <tr key={r.id} className="hover:bg-charcoal-50/50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-charcoal-900">{r.registrationNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-charcoal-900">{r.fullName}</p>
                        <p className="text-xs text-charcoal-500">
                          {r.email || "No email (managed)"} {r.phone ? `• ${r.phone}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-medium text-charcoal-700">
                        {r.distance} <span className="text-xs text-charcoal-500">({r.ageOnRaceDay} yrs)</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-charcoal-700">
                        <span className="font-semibold">{r.bibName}</span> • {r.tshirtSize}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="neutral">{SOURCE_LABELS[r.registrationSource] ?? r.registrationSource}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="success">{r.paymentStatus ?? "CONFIRMED"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Modal 1: Manual Add Runner */}
      <Modal open={manualOpen} onClose={() => setManualOpen(false)} title={`Add ${memberLabel} Runner`}>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          {manualError && <Notice tone="error">{manualError}</Notice>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="mr-fn" label="First Name" required>
              <TextInput
                id="mr-fn"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                required
              />
            </Field>
            <Field htmlFor="mr-ln" label="Last Name" required>
              <TextInput
                id="mr-ln"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                required
              />
            </Field>
            <Field htmlFor="mr-email" label="Email (optional for minors)">
              <TextInput
                id="mr-email"
                type="email"
                value={form.email ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field htmlFor="mr-phone" label="Mobile (optional)">
              <TextInput
                id="mr-phone"
                value={form.phone ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit number"
              />
            </Field>
            <Field htmlFor="mr-dist" label="Race Category" required>
              <Select
                id="mr-dist"
                value={form.categoryDistance}
                onChange={(e) => setForm((f) => ({ ...f, categoryDistance: e.target.value }))}
              >
                {DISTANCES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </Field>
            <Field htmlFor="mr-dob" label="Date of Birth" required>
              <TextInput
                id="mr-dob"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
                required
              />
            </Field>
            <Field htmlFor="mr-gen" label="Gender" required>
              <Select id="mr-gen" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </Select>
            </Field>
            <Field htmlFor="mr-bg" label="Blood Group" required>
              <Select
                id="mr-bg"
                value={form.bloodGroup}
                onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
              >
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </Select>
            </Field>
            <Field htmlFor="mr-tee" label="T-Shirt Size" required>
              <Select
                id="mr-tee"
                value={form.tshirtSize}
                onChange={(e) => setForm((f) => ({ ...f, tshirtSize: e.target.value }))}
              >
                {TSHIRT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field htmlFor="mr-en" label="Emergency Contact Name" required>
              <TextInput
                id="mr-en"
                value={form.emergencyName}
                onChange={(e) => setForm((f) => ({ ...f, emergencyName: e.target.value }))}
                required
              />
            </Field>
            <Field htmlFor="mr-ep" label="Emergency Phone" required>
              <TextInput
                id="mr-ep"
                value={form.emergencyPhone}
                onChange={(e) => setForm((f) => ({ ...f, emergencyPhone: e.target.value }))}
                required
              />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setManualOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={manualPending}>
              {manualPending ? "Registering..." : `Register ${memberLabel}`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: CSV / Excel Bulk Import */}
      <Modal open={importOpen} onClose={() => setImportOpen(false)} title={`Bulk Import ${memberLabel}s (CSV / Excel)`}>
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-btn bg-charcoal-50 p-3 text-xs text-charcoal-700">
            <span className="flex items-center gap-2">
              <LuFileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600" />
              Use our template to avoid column mismatches.
            </span>
            <Button type="button" variant="secondary" size="sm" icon={LuDownload} onClick={handleDownloadTemplate}>
              Download Template
            </Button>
          </div>

          {importError && <Notice tone="error">{importError}</Notice>}
          {importSuccess && (
            <Notice tone="success">
              <LuCheck className="mr-1 inline h-4 w-4" /> {importSuccess}
            </Notice>
          )}

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="block w-full rounded-btn border border-charcoal-200 p-2 text-sm text-charcoal-700 file:mr-3 file:rounded-btn file:border-0 file:bg-brand-red-light file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-brand-red-dark"
          />

          {parsedRows.length > 0 && (
            <div className="max-h-56 overflow-x-auto overflow-y-auto rounded-btn border border-charcoal-200">
              <table className="min-w-[460px] w-full text-left text-xs">
                <thead className="bg-charcoal-50 font-bold text-charcoal-600">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Distance</th>
                    <th className="px-3 py-2">DOB</th>
                    <th className="px-3 py-2">Emergency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {parsedRows.map((r, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5">{i + 1}</td>
                      <td className="px-3 py-1.5 font-semibold">{r.firstName} {r.lastName}</td>
                      <td className="px-3 py-1.5">{r.categoryDistance}</td>
                      <td className="px-3 py-1.5">{r.dateOfBirth}</td>
                      <td className="px-3 py-1.5">{r.emergencyName} ({r.emergencyPhone})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <span className="truncate text-xs text-charcoal-500">
              {fileName ? `${fileName} (${parsedRows.length} rows ready)` : "No file selected"}
            </span>
            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setImportOpen(false)}>
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={parsedRows.length === 0 || importPending}
                onClick={handleBulkSubmit}
              >
                {importPending ? "Importing..." : `Import ${parsedRows.length} Runner(s)`}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Quota Appeal (50+ Runners) */}
      <Modal open={appealOpen} onClose={() => setAppealOpen(false)} title="Request Higher Runner Quota (50+)">
        <form onSubmit={handleAppealSubmit} className="space-y-4">
          <p className="text-sm text-charcoal-600">
            Default limit is 50 runners per organization. Submit an appeal to Race Admin for larger contingents.
          </p>
          {appealError && <Notice tone="error">{appealError}</Notice>}
          <Field htmlFor="ap-quota" label="Total Runners Needed" required>
            <TextInput
              id="ap-quota"
              type="number"
              min={quota.maxRunnerQuota + 1}
              max={5000}
              value={appealQuota}
              onChange={(e) => setAppealQuota(e.target.value)}
              required
            />
          </Field>
          <Field htmlFor="ap-reason" label="Reason / Contingent Details" required>
            <Textarea
              id="ap-reason"
              rows={3}
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              placeholder="E.g., Our college has 150 students participating in the 5K and 10K."
              required
            />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setAppealOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={appealPending}>
              {appealPending ? "Submitting..." : "Submit Appeal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
