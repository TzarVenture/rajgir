"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  LuActivity,
  LuCheck,
  LuDownload,
  LuFileSpreadsheet,
  LuHouse,
  LuIdCard,
  LuLayoutDashboard,
  LuLogOut,
  LuMenu,
  LuPackageCheck,
  LuSearch,
  LuShieldAlert,
  LuShieldCheck,
  LuSiren,
  LuUpload,
  LuUserRound,
  LuUsers,
  LuWandSparkles,
  LuX,
} from "react-icons/lu";
import { logout } from "@/app/actions/auth";
import {
  adminAllotBibAction,
  adminApproveVolunteerAction,
  adminAssignVolunteerAction,
  adminAutoAllotBibsAction,
  adminBulkAllotBibsAction,
  adminMarkKitCollectedAction,
  adminReviewInfluencerAction,
  adminSetUserStatusAction,
  adminUndoKitCollectedAction,
  adminUpdateIncidentAction,
} from "@/app/actions/adminOps";
import type {
  ApiAdminApplications,
  ApiAdminOverview,
  ApiAdminUser,
  ApiIncident,
  ApiQuotaAppeal,
  ApiRunnerRegistration,
  ApiVolunteer,
} from "@/lib/api";
import { LiveApprovalsClient } from "@/components/admin/LiveApprovalsClient";
import { Badge, Button, Field, Modal, Notice, StatCard, TextInput, buttonClasses } from "@/components/ui";

type TabId = "overview" | "runners" | "approvals" | "volunteers" | "users";

type AdminIncident = ApiIncident & {
  volunteer?: {
    assignedStation: string | null;
    user?: { firstName: string; lastName: string; phone: string | null };
  };
};

type AdminInfluencer = Record<string, unknown> & {
  id: string;
  fullName: string;
  email: string;
  primaryPlatform: string;
  followerCount: string;
  status: string | null;
};

export function AdminCommandCenterClient({
  currentUser,
  overview,
  runners: initialRunners,
  volunteers: initialVolunteers,
  influencers: initialInfluencers,
  incidents: initialIncidents,
  appeals,
  applications,
  users: initialUsers,
}: {
  currentUser: { name: string; email: string; role: string };
  overview: ApiAdminOverview;
  runners: ApiRunnerRegistration[];
  volunteers: ApiVolunteer[];
  influencers: AdminInfluencer[];
  incidents: AdminIncident[];
  appeals: ApiQuotaAppeal[];
  applications: ApiAdminApplications;
  users: ApiAdminUser[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");
  const [runners, setRunners] = useState(initialRunners);
  const [volunteers, setVolunteers] = useState(initialVolunteers);
  const [influencers, setInfluencers] = useState(initialInfluencers);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [users, setUsers] = useState(initialUsers);

  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  // Allot Bib Modal
  const [bibTarget, setBibTarget] = useState<ApiRunnerRegistration | null>(null);
  const [bibInput, setBibInput] = useState("");
  const [autoBibOpen, setAutoBibOpen] = useState(false);
  const [autoDistance, setAutoDistance] = useState("");
  const [autoStartFrom, setAutoStartFrom] = useState("");
  const [bulkBibOpen, setBulkBibOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState<Array<{ registrationNumber: string; bibNumber: string }>>([]);
  const [bulkFileName, setBulkFileName] = useState("");

  // Assign Volunteer Modal
  const [assignTarget, setAssignTarget] = useState<ApiVolunteer | null>(null);
  const [stationInput, setStationInput] = useState("");
  const [sectorInput, setSectorInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [supName, setSupName] = useState("");
  const [supPhone, setSupPhone] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<
    "ALL" | "RUNNER" | "VOLUNTEER" | "INFLUENCER" | "GROUPS" | "PARTNERS" | "ADMINS"
  >("ALL");

  const q = search.trim().toLowerCase();

  const filteredRunners = useMemo(() => {
    if (!q) return runners;
    return runners.filter((r) =>
      [r.fullName, r.registrationNumber, r.bibNumber ?? "", r.email, r.phone, r.runningClub ?? "", r.distance]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [runners, q]);

  const userGroupMatches = (role: string | null | undefined, filter: typeof userRoleFilter) => {
    if (filter === "ALL") return true;
    if (filter === "RUNNER") return role === "RUNNER";
    if (filter === "VOLUNTEER") return role === "VOLUNTEER";
    if (filter === "INFLUENCER") return role === "INFLUENCER";
    if (filter === "GROUPS") {
      return role === "TEAM_CAPTAIN" || role === "CORPORATE_MANAGER" || role === "SCHOOL_COORDINATOR";
    }
    if (filter === "PARTNERS") {
      return role === "SPONSOR" || role === "VENDOR" || role === "TOURISM_PARTNER";
    }
    if (filter === "ADMINS") {
      return role === "ORGANIZER" || role === "SUPER_ADMIN";
    }
    return true;
  };

  const userFilterTabs: { id: typeof userRoleFilter; label: string; count: number }[] = useMemo(
    () => [
      { id: "ALL", label: "All Users", count: users.length },
      { id: "RUNNER", label: "Runners", count: users.filter((u) => userGroupMatches(u.role, "RUNNER")).length },
      { id: "VOLUNTEER", label: "Volunteers", count: users.filter((u) => userGroupMatches(u.role, "VOLUNTEER")).length },
      { id: "INFLUENCER", label: "Influencers", count: users.filter((u) => userGroupMatches(u.role, "INFLUENCER")).length },
      { id: "GROUPS", label: "Teams & Groups", count: users.filter((u) => userGroupMatches(u.role, "GROUPS")).length },
      { id: "PARTNERS", label: "Partners", count: users.filter((u) => userGroupMatches(u.role, "PARTNERS")).length },
      { id: "ADMINS", label: "Admins", count: users.filter((u) => userGroupMatches(u.role, "ADMINS")).length },
    ],
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!userGroupMatches(u.role, userRoleFilter)) return false;
      if (!q) return true;
      return [u.firstName, u.lastName, u.email ?? "", u.phone ?? "", u.role ?? "", u.registrationSource]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [users, userRoleFilter, q]);

  const exportRunnersExcel = () => {
    const rows = runners.map((r) => ({
      RegistrationNumber: r.registrationNumber,
      BibNumber: r.bibNumber ?? "Unassigned",
      FullName: r.fullName,
      Email: r.email,
      Phone: r.phone,
      Distance: r.distance,
      AgeOnRaceDay: r.ageOnRaceDay,
      Gender: r.gender,
      BloodGroup: r.bloodGroup,
      TShirtSize: r.tshirtSize,
      ClubOrOrganization: r.runningClub ?? "",
      City: r.city,
      EmergencyContact: `${r.emergencyName} (${r.emergencyPhone})`,
      KitCollected: r.kitCollectedAt ? `Yes (${r.kitCollectedBy})` : "Pending",
      PaymentStatus: r.paymentStatus ?? "CONFIRMED",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Runners");
    XLSX.writeFile(wb, "rajgir_marathon_2027_runners.xlsx");
  };

  const exportTshirtExcel = () => {
    const ws = XLSX.utils.json_to_sheet(overview.tshirtBreakdown.map((t) => ({ TShirtSize: t.size, Quantity: t.count })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TShirtInventory");
    XLSX.writeFile(wb, "rajgir_marathon_2027_tshirts.xlsx");
  };

  const handleAllotBib = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bibTarget) return;
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminAllotBibAction(bibTarget.registrationNumber, bibInput.trim());
      if (!res.success) {
        setError(res.error ?? "Failed to allot bib.");
        return;
      }
      setRunners((prev) =>
        prev.map((r) =>
          r.registrationNumber === bibTarget.registrationNumber
            ? { ...r, bibNumber: bibInput.trim() }
            : r
        )
      );
      setFeedback(`Allotted Bib #${bibInput.trim()} to ${bibTarget.fullName}.`);
      setBibTarget(null);
      router.refresh();
    });
  };

  const handleAutoAllotBibs = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFeedback("");
    const startNum = autoStartFrom.trim() ? Number(autoStartFrom.trim()) : undefined;
    if (startNum !== undefined && (!Number.isInteger(startNum) || startNum < 1)) {
      setError("Starting bib number must be a positive whole number.");
      return;
    }
    startTransition(async () => {
      const res = await adminAutoAllotBibsAction({
        distance: autoDistance || undefined,
        startFrom: startNum,
      });
      if (!res.success) {
        setError(res.error ?? "Failed to auto-allot bibs.");
        return;
      }
      const assignedMap = new Map((res.assignments ?? []).map((a) => [a.registrationNumber, a]));
      if (assignedMap.size > 0) {
        setRunners((prev) =>
          prev.map((r) => {
            const hit = assignedMap.get(r.registrationNumber);
            return hit ? { ...r, bibNumber: hit.bibNumber } : r;
          })
        );
      }
      setFeedback(
        res.assignedCount
          ? `Auto-allotted ${res.assignedCount} sequential bib number${res.assignedCount === 1 ? "" : "s"}.`
          : "All matching runners already have bib numbers assigned."
      );
      setAutoBibOpen(false);
      router.refresh();
    });
  };

  const downloadBulkBibTemplate = () => {
    const unassigned = runners.filter((r) => !r.bibNumber);
    const sampleRows = (unassigned.length > 0 ? unassigned : runners.slice(0, 5)).map((r) => ({
      RegistrationNumber: r.registrationNumber,
      RunnerName: r.fullName,
      Distance: r.distance,
      BibNumber: r.bibNumber ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BibAllotment");
    XLSX.writeFile(wb, "rajgir_bib_allotment_template.xlsx");
  };

  const downloadBulkBibSample = () => {
    const sample = [
      {
        RegistrationNumber: "RJG-2027-42K-1001",
        RunnerName: "Aarav Kumar (Example)",
        Distance: "42.2 KM",
        BibNumber: "42001",
      },
      {
        RegistrationNumber: "RJG-2027-211K-1002",
        RunnerName: "Priya Sharma (Example)",
        Distance: "21.1 KM",
        BibNumber: "21001",
      },
      {
        RegistrationNumber: "RJG-2027-10K-1003",
        RunnerName: "Rohan Verma (Example)",
        Distance: "10 KM",
        BibNumber: "10001",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SampleBibs");
    XLSX.writeFile(wb, "rajgir_bib_allotment_sample.xlsx");
  };

  const handleBulkBibFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setBulkFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const parsed: Array<{ registrationNumber: string; bibNumber: string }> = [];
      for (const row of rawRows) {
        const reg = String(row.RegistrationNumber ?? row.registrationNumber ?? row.regNumber ?? "").trim();
        const bib = String(row.BibNumber ?? row.bibNumber ?? row.bib ?? "").trim();
        if (reg && bib) {
          parsed.push({ registrationNumber: reg, bibNumber: bib });
        }
      }
      setBulkRows(parsed);
      if (parsed.length === 0) {
        setError("No valid rows found. Ensure columns RegistrationNumber and BibNumber are present.");
      }
    } catch {
      setError("Could not parse the uploaded file. Please upload a valid .xlsx or .csv file.");
      setBulkRows([]);
    }
  };

  const handleBulkAllotBibs = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkRows.length === 0) return;
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminBulkAllotBibsAction(bulkRows);
      if (!res.success) {
        setError(res.error ?? "Failed to bulk allot bibs.");
        return;
      }
      const updatedMap = new Map((res.assignments ?? []).map((a) => [a.registrationNumber, a]));
      if (updatedMap.size > 0) {
        setRunners((prev) =>
          prev.map((r) => {
            const hit = updatedMap.get(r.registrationNumber);
            return hit ? { ...r, bibNumber: hit.bibNumber } : r;
          })
        );
      }
      const skippedNote =
        res.skippedCount && res.skippedCount > 0
          ? ` (${res.skippedCount} skipped: ${(res.skipped ?? []).slice(0, 2).map((s) => `${s.registrationNumber}: ${s.reason}`).join("; ")})`
          : "";
      setFeedback(`Bulk updated ${res.updatedCount ?? 0} bib assignments.${skippedNote}`);
      setBulkBibOpen(false);
      setBulkRows([]);
      setBulkFileName("");
      router.refresh();
    });
  };

  const handleKitCollected = (r: ApiRunnerRegistration) => {
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminMarkKitCollectedAction(r.registrationNumber, "SELF");
      if (!res.success) {
        setError(res.error ?? "Failed to mark kit collected.");
        return;
      }
      setRunners((prev) =>
        prev.map((item) =>
          item.registrationNumber === r.registrationNumber
            ? { ...item, kitCollectedAt: new Date().toISOString(), kitCollectedBy: "SELF" }
            : item
        )
      );
      setFeedback(`Marked Expo Kit collected for ${r.fullName} (${r.registrationNumber}).`);
      router.refresh();
    });
  };

  const handleUndoKitCollected = (r: ApiRunnerRegistration) => {
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminUndoKitCollectedAction(r.registrationNumber);
      if (!res.success) {
        setError(res.error ?? "Failed to undo kit pickup.");
        return;
      }
      setRunners((prev) =>
        prev.map((item) =>
          item.registrationNumber === r.registrationNumber
            ? { ...item, kitCollectedAt: null, kitCollectedBy: null }
            : item
        )
      );
      setFeedback(`Reverted Expo Kit pickup for ${r.fullName} (${r.registrationNumber}).`);
      router.refresh();
    });
  };

  const handleApproveVolunteer = (v: ApiVolunteer) => {
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminApproveVolunteerAction(v.id);
      if (!res.success) {
        setError(res.error ?? "Failed to approve volunteer.");
        return;
      }
      setVolunteers((prev) => prev.map((item) => (item.id === v.id ? { ...item, status: "approved" } : item)));
      setFeedback(`Approved volunteer ${v.fullName}.`);
      router.refresh();
    });
  };

  const handleAssignVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTarget) return;
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminAssignVolunteerAction(assignTarget.id, {
        assignedRole: roleInput || undefined,
        assignedStation: stationInput || undefined,
        assignedSector: sectorInput || undefined,
        supervisorName: supName || undefined,
        supervisorPhone: supPhone || undefined,
      });
      if (!res.success) {
        setError(res.error ?? "Failed to assign volunteer.");
        return;
      }
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === assignTarget.id
            ? { ...v, assignedRole: roleInput || v.assignedRole, assignedStation: stationInput || v.assignedStation, assignedSector: sectorInput || v.assignedSector }
            : v
        )
      );
      setFeedback(`Updated station assignment for ${assignTarget.fullName}.`);
      setAssignTarget(null);
      router.refresh();
    });
  };

  const handleIncident = (inc: AdminIncident, status: "ACKNOWLEDGED" | "RESOLVED") => {
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminUpdateIncidentAction(inc.id, status);
      if (!res.success) {
        setError(res.error ?? "Failed to update incident.");
        return;
      }
      setIncidents((prev) => prev.map((item) => (item.id === inc.id ? { ...item, status } : item)));
      setFeedback(`Incident marked as ${status}.`);
      router.refresh();
    });
  };

  const handleReviewInfluencer = (inf: AdminInfluencer, decision: "approve" | "reject") => {
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminReviewInfluencerAction(inf.id, decision);
      if (!res.success) {
        setError(res.error ?? "Failed to review influencer.");
        return;
      }
      setInfluencers((prev) =>
        prev.map((item) => (item.id === inf.id ? { ...item, status: decision === "approve" ? "approved" : "rejected" } : item))
      );
      setFeedback(`Influencer ${inf.fullName} ${decision === "approve" ? "approved" : "rejected"}.`);
      router.refresh();
    });
  };

  const handleToggleUserStatus = (u: ApiAdminUser) => {
    const nextStatus = u.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setError("");
    setFeedback("");
    startTransition(async () => {
      const res = await adminSetUserStatusAction(u.id, nextStatus);
      if (!res.success) {
        setError(res.error ?? "Failed to update user.");
        return;
      }
      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, status: nextStatus } : item)));
      setFeedback(`Account ${u.firstName} ${u.lastName} set to ${nextStatus}.`);
      router.refresh();
    });
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileMenuOpen]);

  const tabs: { id: TabId; label: string; badge?: number; icon: typeof LuLayoutDashboard }[] = [
    { id: "overview", label: "Overview & Exports", icon: LuLayoutDashboard },
    { id: "runners", label: "Runners & Kit Ops", badge: runners.length, icon: LuPackageCheck },
    { id: "approvals", label: "Approvals & 50+ Appeals", badge: overview.pendingApprovalsCount + overview.pendingQuotaAppealsCount, icon: LuShieldCheck },
    { id: "volunteers", label: "Volunteers & SOS", badge: overview.openIncidentsCount, icon: LuSiren },
    { id: "users", label: "Users & Access", badge: users.length, icon: LuUsers },
  ];

  const handleSelectTab = (id: TabId) => {
    setTab(id);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderNavItems = () => (
    <nav aria-label="Admin navigation">
      <ul className="space-y-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => handleSelectTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 w-full items-center justify-between gap-2.5 rounded-btn px-3 text-left text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red ${
                  active
                    ? "bg-brand-red-light text-brand-red-dark"
                    : "text-charcoal-700 hover:bg-charcoal-100"
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="truncate">{t.label}</span>
                </span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      active
                        ? "bg-white/80 text-brand-red-dark"
                        : "bg-charcoal-100 text-charcoal-700"
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
        <li>
          <Link
            href="/"
            className="flex min-h-11 w-full items-center gap-3 rounded-btn px-3 text-sm font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            <LuHouse className="h-5 w-5 shrink-0" aria-hidden />
            <span>Marathon Home</span>
          </Link>
        </li>
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface-soft text-charcoal-900">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-charcoal-200 bg-white lg:flex">
        <div className="flex h-[68px] items-center border-b border-charcoal-200 px-5">
          <Link
            href="/"
            className="flex items-center rounded-btn focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className="h-9 w-auto object-contain" />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{renderNavItems()}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full cursor-default bg-charcoal-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-white"
          >
            <div className="flex h-[68px] items-center justify-between border-b border-charcoal-200 px-4">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className="h-9 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-btn text-charcoal-700 hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red"
              >
                <LuX className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{renderNavItems()}</div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-3 border-b border-charcoal-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-btn text-charcoal-700 hover:bg-charcoal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red lg:hidden"
            >
              <LuMenu className="h-5 w-5" aria-hidden />
            </button>
            <div className="lg:hidden">
              <Link href="/" className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/rajgir_new_logo.png" alt="Rajgir Marathon" className="h-8 w-auto object-contain" />
              </Link>
            </div>
            <p className="hidden font-barlow text-xl font-bold text-charcoal-900 lg:block">
              Admin Command Center
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal-100 text-charcoal-600">
                <LuUserRound className="h-5 w-5" aria-hidden />
              </span>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[180px] truncate text-sm font-semibold leading-tight text-charcoal-900">
                  {currentUser.name}
                </p>
                <Badge tone="brand" className="mt-1">
                  {currentUser.role}
                </Badge>
              </div>
            </div>
            <form action={logout}>
              <Button type="submit" variant="secondary" size="sm" icon={LuLogOut}>
                Log out
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] space-y-6 p-4 lg:p-8">
        {error && <Notice tone="error">{error}</Notice>}
        {feedback && <Notice tone="success">{feedback}</Notice>}

        {/* TAB 1: OVERVIEW & EXPORTS */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Registered Runners" value={String(overview.totalRunners)} hint={`${overview.kitsCollectedCount} kits collected`} icon={LuUsers} />
              <StatCard label="Gross / Net Revenue" value={`₹${overview.totalRevenue.toLocaleString("en-IN")}`} hint="Confirmed registrations" icon={LuActivity} />
              <StatCard label="Pending Reviews & Appeals" value={String(overview.pendingApprovalsCount + overview.pendingQuotaAppealsCount)} hint={`${overview.pendingQuotaAppealsCount} quota appeals`} icon={LuShieldCheck} />
              <StatCard label="Open Field SOS / Incidents" value={String(overview.openIncidentsCount)} hint={`${overview.totalVolunteers} total volunteers`} icon={LuSiren} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6">
                <h2 className="mb-4 text-base font-extrabold text-charcoal-900">Runners by Race Category</h2>
                {overview.categoryBreakdown.length === 0 ? (
                  <p className="text-sm text-charcoal-500">No runner registrations yet.</p>
                ) : (
                  <div className="space-y-3">
                    {overview.categoryBreakdown.map((c) => {
                      const pct = overview.totalRunners > 0 ? Math.round((c.count / overview.totalRunners) * 100) : 0;
                      return (
                        <div key={c.distance}>
                          <div className="mb-1 flex justify-between text-xs font-bold text-charcoal-700">
                            <span>{c.distance}</span>
                            <span>{c.count} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-charcoal-100">
                            <div className="h-full rounded-full bg-brand-red" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-card border border-charcoal-200 bg-white p-5 sm:p-6 space-y-4">
                <h2 className="text-base font-extrabold text-charcoal-900">T-Shirt Stock &amp; Operational Exports</h2>
                <div className="flex flex-wrap gap-2">
                  {overview.tshirtBreakdown.length === 0 ? (
                    <span className="text-sm text-charcoal-500">No sizing data yet.</span>
                  ) : (
                    overview.tshirtBreakdown.map((t) => (
                      <Badge key={t.size} tone="neutral">
                        {t.size}: {t.count}
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="button" variant="primary" size="sm" icon={LuDownload} onClick={exportRunnersExcel}>
                    Export Master Runners (.xlsx)
                  </Button>
                  <Button type="button" variant="secondary" size="sm" icon={LuDownload} onClick={exportTshirtExcel}>
                    Export T-Shirt Counts (.xlsx)
                  </Button>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* TAB 2: RUNNERS & KIT OPS */}
        {tab === "runners" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <LuSearch className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-charcoal-400" />
                <TextInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, Reg #, Bib #, phone, email, school..."
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="primary" size="sm" icon={LuWandSparkles} onClick={() => setAutoBibOpen(true)}>
                  Auto-Allot Bibs
                </Button>
                <Button type="button" variant="secondary" size="sm" icon={LuUpload} onClick={() => setBulkBibOpen(true)}>
                  Bulk Import Bibs
                </Button>
                <Button type="button" variant="secondary" size="sm" icon={LuDownload} onClick={exportRunnersExcel}>
                  Export Filtered / All (.xlsx)
                </Button>
              </div>
            </div>

            <div className="rounded-card border border-charcoal-200 bg-white overflow-hidden">
              {filteredRunners.length === 0 ? (
                <div className="p-8 text-center text-sm text-charcoal-500">No matching runners found.</div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="divide-y divide-charcoal-100 md:hidden">
                    {filteredRunners.map((r) => (
                      <div key={r.id} className="space-y-2 p-4 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold">{r.registrationNumber}</span>
                          <Badge tone={r.bibNumber ? "success" : "warning"}>{r.bibNumber ? `Bib #${r.bibNumber}` : "No Bib"}</Badge>
                        </div>
                        <p className="font-bold text-charcoal-900">{r.fullName}</p>
                        <p className="text-xs text-charcoal-500">{r.distance} • {r.tshirtSize} • {r.runningClub || "Individual"}</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button type="button" size="sm" variant="secondary" icon={LuIdCard} onClick={() => { setBibTarget(r); setBibInput(r.bibNumber ?? ""); }}>
                            Allot Bib
                          </Button>
                          {!r.kitCollectedAt ? (
                            <Button type="button" size="sm" variant="primary" icon={LuPackageCheck} disabled={pending} onClick={() => handleKitCollected(r)}>
                              Mark Kit Collected
                            </Button>
                          ) : (
                            <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => handleUndoKitCollected(r)}>
                              Undo Kit
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-charcoal-50 text-xs font-bold uppercase text-charcoal-500">
                        <tr>
                          <th className="px-4 py-3">Reg #</th>
                          <th className="px-4 py-3">Runner</th>
                          <th className="px-4 py-3">Category / Org</th>
                          <th className="px-4 py-3">Bib #</th>
                          <th className="px-4 py-3">Expo Kit</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-charcoal-100">
                        {filteredRunners.map((r) => (
                          <tr key={r.id} className="hover:bg-charcoal-50/50">
                            <td className="px-4 py-3 font-mono text-xs font-bold">{r.registrationNumber}</td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-charcoal-900">{r.fullName}</p>
                              <p className="text-xs text-charcoal-500">{r.email || "Managed"} • {r.phone || "—"}</p>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className="font-bold text-charcoal-800">{r.distance}</span> ({r.tshirtSize})
                              <p className="text-charcoal-500">{r.runningClub || "Individual"}</p>
                            </td>
                            <td className="px-4 py-3">
                              {r.bibNumber ? (
                                <Badge tone="success">#{r.bibNumber}</Badge>
                              ) : (
                                <Badge tone="warning">Unassigned</Badge>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {r.kitCollectedAt ? <Badge tone="success">Collected</Badge> : <Badge tone="neutral">Pending</Badge>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <Button type="button" size="sm" variant="secondary" onClick={() => { setBibTarget(r); setBibInput(r.bibNumber ?? ""); }}>
                                  Bib
                                </Button>
                                {!r.kitCollectedAt ? (
                                  <Button type="button" size="sm" variant="primary" disabled={pending} onClick={() => handleKitCollected(r)}>
                                    Kit Pickup
                                  </Button>
                                ) : (
                                  <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => handleUndoKitCollected(r)}>
                                    Undo Kit
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: APPROVALS & 50+ QUOTA APPEALS */}
        {tab === "approvals" && (
          <div className="space-y-8">
            <LiveApprovalsClient appeals={appeals} applications={applications} />

            {/* Influencers Queue */}
            <section className="rounded-card border border-charcoal-200 bg-white overflow-hidden">
              <div className="border-b border-charcoal-200 px-5 py-4">
                <h2 className="text-lg font-extrabold text-charcoal-900">Influencer / Creator Applications ({influencers.length})</h2>
              </div>
              {influencers.length === 0 ? (
                <div className="p-6 text-sm text-charcoal-500">No influencer applications yet.</div>
              ) : (
                <div className="divide-y divide-charcoal-100">
                  {influencers.map((inf) => (
                    <div key={inf.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-charcoal-900">{inf.fullName}</h3>
                          <Badge tone={inf.status === "approved" ? "success" : inf.status === "rejected" ? "error" : "warning"}>
                            {inf.status ?? "pending"}
                          </Badge>
                        </div>
                        <p className="text-xs text-charcoal-600">{inf.email} • {inf.primaryPlatform} ({inf.followerCount})</p>
                      </div>
                      {(inf.status ?? "pending") === "pending" && (
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="primary" icon={LuCheck} disabled={pending} onClick={() => handleReviewInfluencer(inf, "approve")}>
                            Approve
                          </Button>
                          <Button type="button" size="sm" variant="secondary" icon={LuX} disabled={pending} onClick={() => handleReviewInfluencer(inf, "reject")}>
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 4: VOLUNTEERS & LIVE SOS */}
        {tab === "volunteers" && (
          <div className="space-y-8">
            {/* Priority SOS & Incident Feed */}
            <section className="rounded-card border border-charcoal-200 bg-white overflow-hidden">
              <div className="border-b border-charcoal-200 px-5 py-4 flex items-center gap-2">
                <LuShieldAlert className="h-5 w-5 text-brand-red" />
                <h2 className="text-lg font-extrabold text-charcoal-900">Race Control SOS &amp; Incident Feed ({incidents.length})</h2>
              </div>
              {incidents.length === 0 ? (
                <div className="p-6 text-sm text-charcoal-500">No incidents reported. All clear!</div>
              ) : (
                <div className="divide-y divide-charcoal-100">
                  {incidents.map((inc) => (
                    <div key={inc.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {inc.isSos && <Badge tone="error">SOS ALERT</Badge>}
                          <Badge tone="brand">{inc.type} • {inc.severity}</Badge>
                          <Badge tone={inc.status === "RESOLVED" ? "success" : "warning"}>{inc.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-charcoal-900">{inc.description}</p>
                        <p className="text-xs text-charcoal-500">Location: {inc.location} {inc.runnerBib ? `• Bib #${inc.runnerBib}` : ""}</p>
                      </div>
                      {inc.status !== "RESOLVED" && (
                        <div className="flex flex-wrap gap-2">
                          {inc.status === "OPEN" && (
                            <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => handleIncident(inc, "ACKNOWLEDGED")}>
                              Acknowledge
                            </Button>
                          )}
                          <Button type="button" size="sm" variant="primary" disabled={pending} onClick={() => handleIncident(inc, "RESOLVED")}>
                            Mark Resolved
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Volunteer Deployment Roster */}
            <section className="rounded-card border border-charcoal-200 bg-white overflow-hidden">
              <div className="border-b border-charcoal-200 px-5 py-4">
                <h2 className="text-lg font-extrabold text-charcoal-900">Volunteer Deployment ({volunteers.length})</h2>
              </div>
              {volunteers.length === 0 ? (
                <div className="p-6 text-sm text-charcoal-500">No volunteers registered yet.</div>
              ) : (
                <div className="divide-y divide-charcoal-100">
                  {volunteers.map((v) => (
                    <div key={v.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-charcoal-900">{v.fullName}</h3>
                          <Badge tone={v.status === "approved" ? "success" : "warning"}>{v.status ?? "pending"}</Badge>
                          <Badge tone="neutral">{v.dutyStatus}</Badge>
                        </div>
                        <p className="text-xs text-charcoal-600">
                          {v.email} • Pref: {v.rolePreference} • Station: <strong>{v.assignedStation || "Unassigned"}</strong>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(v.status ?? "pending") === "pending" && (
                          <Button type="button" size="sm" variant="primary" disabled={pending} onClick={() => handleApproveVolunteer(v)}>
                            Approve
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setAssignTarget(v);
                            setRoleInput(v.assignedRole ?? v.rolePreference);
                            setStationInput(v.assignedStation ?? "");
                            setSectorInput(v.assignedSector ?? "");
                            setSupName(v.supervisorName ?? "");
                            setSupPhone(v.supervisorPhone ?? "");
                          }}
                        >
                          Assign Station
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 5: USERS & ACCESS */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {userFilterTabs.map((ft) => {
                const active = userRoleFilter === ft.id;
                return (
                  <button
                    key={ft.id}
                    type="button"
                    onClick={() => setUserRoleFilter(ft.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? "border-brand-red bg-brand-red-light text-brand-red-dark"
                        : "border-charcoal-200 bg-white text-charcoal-700 hover:bg-charcoal-50"
                    }`}
                  >
                    <span>{ft.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                        active ? "bg-white/80 text-brand-red-dark" : "bg-charcoal-100 text-charcoal-700"
                      }`}
                    >
                      {ft.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:max-w-md">
              <LuSearch className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-charcoal-400" />
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter users by name, email, role, source..."
                className="pl-9"
              />
            </div>

            <div className="rounded-card border border-charcoal-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-charcoal-50 text-xs font-bold uppercase text-charcoal-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-charcoal-500">
                          No users found in this category.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-charcoal-900">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-charcoal-500">{u.email || "No email"} • {u.phone || "—"}</p>
                        </td>
                        <td className="px-4 py-3"><Badge tone="neutral">{u.role ?? "NONE"}</Badge></td>
                        <td className="px-4 py-3 text-xs text-charcoal-600">{u.registrationSource}</td>
                        <td className="px-4 py-3">
                          <Badge tone={u.status === "ACTIVE" ? "success" : u.status === "SUSPENDED" ? "error" : "warning"}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {u.role !== "SUPER_ADMIN" && (
                            <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => handleToggleUserStatus(u)}>
                              {u.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Modal: Allot Bib */}
      <Modal open={Boolean(bibTarget)} onClose={() => setBibTarget(null)} title={`Allot Bib — ${bibTarget?.fullName ?? ""}`}>
        <form onSubmit={handleAllotBib} className="space-y-4">
          <Field htmlFor="adm-bib" label="Physical Bib Number" required>
            <TextInput id="adm-bib" value={bibInput} onChange={(e) => setBibInput(e.target.value)} placeholder="e.g. 21045" required />
          </Field>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setBibTarget(null)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={pending}>{pending ? "Saving..." : "Save Bib"}</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Auto-Allot Sequential Bibs */}
      <Modal open={autoBibOpen} onClose={() => setAutoBibOpen(false)} title="Auto-Allot Sequential Bibs">
        <form onSubmit={handleAutoAllotBibs} className="space-y-4">
          <p className="text-xs text-charcoal-600">
            Automatically assigns unique sequential Bib numbers to all <strong>Unassigned</strong> runners. Default ranges:
            42.2 KM (42001+), 21.1 KM (21001+), 10 KM (10001+), 5 KM (5001+), 3 KM (3001+).
          </p>
          <Field htmlFor="auto-dist" label="Race Category">
            <select
              id="auto-dist"
              value={autoDistance}
              onChange={(e) => setAutoDistance(e.target.value)}
              className="w-full rounded-btn border border-charcoal-300 bg-white px-3 py-2 text-sm text-charcoal-900 focus:border-brand-red focus:outline-none"
            >
              <option value="">All Unassigned Categories</option>
              <option value="42.2 KM">42.2 KM (Full Marathon)</option>
              <option value="21.1 KM">21.1 KM (Half Marathon)</option>
              <option value="10 KM">10 KM (Timed Run)</option>
              <option value="5 KM">5 KM (Run)</option>
              <option value="3 KM">3 KM (Fun Run)</option>
            </select>
          </Field>
          <Field htmlFor="auto-start" label="Start From # (optional)">
            <TextInput
              id="auto-start"
              type="number"
              min={1}
              value={autoStartFrom}
              onChange={(e) => setAutoStartFrom(e.target.value)}
              placeholder={autoDistance ? "e.g. 21001" : "Select category to override"}
              disabled={!autoDistance}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => setAutoBibOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Assigning..." : "Auto-Assign Bibs"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Bulk Import Bibs */}
      <Modal open={bulkBibOpen} onClose={() => setBulkBibOpen(false)} title="Bulk Import Bibs (.xlsx / .csv)">
        <form onSubmit={handleBulkAllotBibs} className="space-y-4">
          <div className="flex flex-col gap-3 rounded-btn bg-charcoal-50 p-3 text-xs text-charcoal-700">
            <div className="flex items-start gap-2">
              <LuFileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Use our template or sample example to avoid column mismatches. Required columns:{" "}
                <code className="font-mono font-semibold">RegistrationNumber</code> and{" "}
                <code className="font-mono font-semibold">BibNumber</code>.
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" icon={LuDownload} onClick={downloadBulkBibTemplate}>
                Download Unassigned Template (.xlsx)
              </Button>
              <Button type="button" variant="secondary" size="sm" icon={LuFileSpreadsheet} onClick={downloadBulkBibSample}>
                Download Filled Example (.xlsx)
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-btn border border-charcoal-200">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-charcoal-50 font-bold uppercase text-charcoal-500">
                <tr>
                  <th className="px-2.5 py-1.5">RegistrationNumber</th>
                  <th className="px-2.5 py-1.5">BibNumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 font-mono text-charcoal-700">
                <tr>
                  <td className="px-2.5 py-1.5">RJG-2027-211K-5538</td>
                  <td className="px-2.5 py-1.5 font-semibold">21045</td>
                </tr>
                <tr>
                  <td className="px-2.5 py-1.5">RJG-2027-3K-9828</td>
                  <td className="px-2.5 py-1.5 font-semibold">3012</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Field htmlFor="bulk-bib-file" label="Upload Filled Sheet (.xlsx or .csv)" required>
            <input
              id="bulk-bib-file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleBulkBibFile}
              className="block w-full rounded-btn border border-charcoal-200 p-2 text-sm text-charcoal-700 file:mr-3 file:rounded-btn file:border-0 file:bg-brand-red-light file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-brand-red-dark"
            />
          </Field>
          {bulkFileName && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-charcoal-700">
                Parsed <strong>{bulkRows.length}</strong> valid bib rows from {bulkFileName}.
              </p>
              {bulkRows.length > 0 && (
                <div className="max-h-32 overflow-y-auto rounded-btn border border-charcoal-200 bg-charcoal-50 p-2 text-[11px] font-mono text-charcoal-700">
                  {bulkRows.slice(0, 5).map((r, i) => (
                    <div key={`${r.registrationNumber}-${i}`}>
                      {r.registrationNumber} → Bib #{r.bibNumber}
                    </div>
                  ))}
                  {bulkRows.length > 5 && <div className="text-charcoal-500">...and {bulkRows.length - 5} more rows</div>}
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={() => setBulkBibOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={pending || bulkRows.length === 0}>
              {pending ? "Importing..." : `Apply ${bulkRows.length} Bibs`}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Volunteer Station */}
      <Modal open={Boolean(assignTarget)} onClose={() => setAssignTarget(null)} title={`Assign Station — ${assignTarget?.fullName ?? ""}`}>
        <form onSubmit={handleAssignVolunteer} className="space-y-3">
          <Field htmlFor="av-role" label="Assigned Role">
            <TextInput id="av-role" value={roleInput} onChange={(e) => setRoleInput(e.target.value)} />
          </Field>
          <Field htmlFor="av-stn" label="Station">
            <TextInput id="av-stn" value={stationInput} onChange={(e) => setStationInput(e.target.value)} placeholder="e.g. KM 10 Hydration" />
          </Field>
          <Field htmlFor="av-sec" label="Sector">
            <TextInput id="av-sec" value={sectorInput} onChange={(e) => setSectorInput(e.target.value)} placeholder="e.g. Sector B" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="av-sn" label="Supervisor Name">
              <TextInput id="av-sn" value={supName} onChange={(e) => setSupName(e.target.value)} />
            </Field>
            <Field htmlFor="av-sp" label="Supervisor Phone">
              <TextInput id="av-sp" value={supPhone} onChange={(e) => setSupPhone(e.target.value)} />
            </Field>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAssignTarget(null)}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={pending}>{pending ? "Assigning..." : "Save Assignment"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
