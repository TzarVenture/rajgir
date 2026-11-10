"use client";

import React, { useState, useMemo } from "react";
import {
  LuCrown as Crown,
  LuShield as Shield,
  LuShieldAlert as ShieldAlert,
  LuUsers as Users,
  LuFlag as Flag,
  LuPackageCheck as PackageCheck,
  LuTrash2 as Trash2,
  LuPencil as Edit3,
  LuPlus as Plus,
  LuSearch as Search,
  LuFilter as Filter,
  LuCircleCheck as CheckCircle2,
  LuCircleX as XCircle,
  LuLock as Lock,
  LuMenu as Menu,
  LuX as X,
  LuChevronDown as ChevronDown,
  LuCalendar as Calendar,
  LuMapPin as MapPin,
  LuActivity as Activity,
  LuAward as Award,
  LuTriangleAlert as AlertTriangle,
  LuDollarSign as DollarSign,
  LuTrendingUp as TrendingUp,
} from "react-icons/lu";

// ==========================================
// 1. TYPES & DATA CONTRACTS
// ==========================================

export type AdminRolePersona = "SuperAdmin" | "RegularAdmin";

export type MarathonRole =
  | "Guest"
  | "Runner"
  | "Volunteer"
  | "Influencer"
  | "Team Captain"
  | "Corporate Company"
  | "Sponsor"
  | "Tourism Partner"
  | "Super Admin"
  | "Admin"
  | "School"
  | "Media Press"
  | "Organizer"
  | "Vendor";

export const ALL_ROLES: MarathonRole[] = [
  "Guest",
  "Runner",
  "Volunteer",
  "Influencer",
  "Team Captain",
  "Corporate Company",
  "Sponsor",
  "Tourism Partner",
  "Super Admin",
  "Admin",
  "School",
  "Media Press",
  "Organizer",
  "Vendor",
];

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: MarathonRole;
  status: "Active" | "Pending Review" | "Verified" | "Suspended";
  joinedDate: string;
  notes: string;
}

export interface RaceEvent {
  id: string;
  title: string;
  distance: string;
  date: string;
  time: string;
  fee: number;
  capacity: number;
  registeredCount: number;
  elevation: string;
  status: "Open" | "Filling Fast" | "Closed";
}

export interface LogisticsTask {
  id: string;
  title: string;
  zone: string;
  category: "Hydration" | "Medical" | "Timing & Mats" | "Merchandise" | "Sanitation";
  priority: "Critical" | "High" | "Medium";
  status: "Operational" | "In Transit" | "Pending Setup" | "Completed";
  assignedTeam: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Admin";
  department: string;
  assignedPermissions: string[];
  lastActive: string;
  createdAt: string;
}

// ==========================================
// 2. SEED REALISTIC MOCK DATA
// ==========================================

const INITIAL_USERS: SystemUser[] = [
  {
    id: "USR-001",
    name: "Vikramaditya Rathore",
    email: "vikram.super@rajgirmarathon.com",
    phone: "+91 98100 11223",
    role: "Super Admin",
    status: "Active",
    joinedDate: "2026-01-10",
    notes: "Chief Race Director & Platform Root Owner",
  },
  {
    id: "USR-002",
    name: "Dr. Ananya Sharma",
    email: "ananya.ops@rajgirmarathon.com",
    phone: "+91 98200 44556",
    role: "Admin",
    status: "Active",
    joinedDate: "2026-02-15",
    notes: "Operations Head - Course Marshals & Medical",
  },
  {
    id: "USR-003",
    name: "Rahul Verma",
    email: "rahul.verma@delhirunners.in",
    phone: "+91 97110 33445",
    role: "Runner",
    status: "Verified",
    joinedDate: "2026-03-01",
    notes: "Bib #4208 - Full Marathon Elite Batch",
  },
  {
    id: "USR-004",
    name: "Pooja Deshmukh",
    email: "pooja.volunteer@gmail.com",
    phone: "+91 96500 88776",
    role: "Volunteer",
    status: "Active",
    joinedDate: "2026-03-05",
    notes: "Water Station #4 Lead (Vishwa Shanti Stupa)",
  },
  {
    id: "USR-005",
    name: "Kabir Lifestyle Vlogs",
    email: "kabir.collab@agencymedia.com",
    phone: "+91 99990 12345",
    role: "Influencer",
    status: "Active",
    joinedDate: "2026-03-10",
    notes: "350K Instagram Travel Influencer - 3 Reels deliverable",
  },
  {
    id: "USR-006",
    name: "Col. Rajesh Nair",
    email: "rnair@biharrunnersclub.org",
    phone: "+91 94330 66554",
    role: "Team Captain",
    status: "Verified",
    joinedDate: "2026-02-28",
    notes: "Patna Striders Club - 45 Runners Contingent",
  },
  {
    id: "USR-007",
    name: "Tata Steel CSR Foundation",
    email: "marathon.csr@tatasteel.com",
    phone: "+91 65722 00112",
    role: "Corporate Company",
    status: "Verified",
    joinedDate: "2026-02-20",
    notes: "Corporate 10K Cup - 120 Employee passes",
  },
  {
    id: "USR-008",
    name: "Amrit Mineral Waters Ltd",
    email: "sponsorship@amritwater.in",
    phone: "+91 11450 77889",
    role: "Sponsor",
    status: "Active",
    joinedDate: "2026-01-25",
    notes: "Hydration Partner - ₹15 Lakhs financial sponsorship",
  },
  {
    id: "USR-009",
    name: "Bihar State Tourism Corp (BSTDC)",
    email: "heritage.run@bstdc.gov.in",
    phone: "+91 61222 33441",
    role: "Tourism Partner",
    status: "Verified",
    joinedDate: "2026-01-15",
    notes: "Official Eco-Tourism & Nalanda Heritage Circuit Lead",
  },
  {
    id: "USR-010",
    name: "St. Xavier's High School Rajgir",
    email: "sports@stxaviersrajgir.edu.in",
    phone: "+91 61122 55667",
    role: "School",
    status: "Pending Review",
    joinedDate: "2026-03-12",
    notes: "Junior 3K Heritage Dash - 180 Students enrolled",
  },
  {
    id: "USR-011",
    name: "Doordarshan Sports & ANI Media",
    email: "press.desk@ddsports.gov.in",
    phone: "+91 11233 88990",
    role: "Media Press",
    status: "Active",
    joinedDate: "2026-02-18",
    notes: "Live broadcast OB Van & Drone permits issued",
  },
  {
    id: "USR-012",
    name: "District Athletics Association",
    email: "athletics.nalanda@gmail.com",
    phone: "+91 94310 99887",
    role: "Organizer",
    status: "Verified",
    joinedDate: "2026-01-05",
    notes: "Course certified by Athletics Federation of India",
  },
  {
    id: "USR-013",
    name: "Magadh Organic Food Stalls",
    email: "magadh.organics@biharmarket.in",
    phone: "+91 93340 77665",
    role: "Vendor",
    status: "Pending Review",
    joinedDate: "2026-03-15",
    notes: "Expo Stall #12 - Sattu drinks & Millets Recovery Bar",
  },
  {
    id: "USR-014",
    name: "Sunita Sundaram (Visitor)",
    email: "sunita.visitor@outlook.com",
    phone: "+91 98110 55443",
    role: "Guest",
    status: "Active",
    joinedDate: "2026-03-18",
    notes: "Newsletter subscriber looking for Cheering Zone map",
  },
];

const INITIAL_RACES: RaceEvent[] = [
  {
    id: "RACE-42K",
    title: "Heritage Full Marathon",
    distance: "42.195 KM",
    date: "2027-02-14",
    time: "05:00 AM",
    fee: 2200,
    capacity: 1500,
    registeredCount: 1140,
    elevation: "Moderate (+240m)",
    status: "Filling Fast",
  },
  {
    id: "RACE-21K",
    title: "Vishwa Shanti Half Marathon",
    distance: "21.097 KM",
    date: "2027-02-14",
    time: "06:00 AM",
    fee: 1600,
    capacity: 3500,
    registeredCount: 3280,
    elevation: "Gentle (+110m)",
    status: "Filling Fast",
  },
  {
    id: "RACE-10K",
    title: "Rajgir Hill Challenge",
    distance: "10.0 KM",
    date: "2027-02-14",
    time: "06:45 AM",
    fee: 1100,
    capacity: 2500,
    registeredCount: 2500,
    elevation: "Rolling (+75m)",
    status: "Closed",
  },
  {
    id: "RACE-5K",
    title: "Green Rajgir Heritage Run",
    distance: "5.0 KM",
    date: "2027-02-14",
    time: "07:30 AM",
    fee: 650,
    capacity: 4000,
    registeredCount: 1920,
    elevation: "Flat Scenic",
    status: "Open",
  },
  {
    id: "RACE-RELAY",
    title: "Corporate 10K Relay Cup",
    distance: "10.0 KM (4x2.5K)",
    date: "2027-02-13",
    time: "04:30 PM",
    fee: 5000,
    capacity: 200,
    registeredCount: 145,
    elevation: "Flat City Loop",
    status: "Open",
  },
];

const INITIAL_LOGISTICS: LogisticsTask[] = [
  {
    id: "LOG-01",
    title: "Deploy RFID Split Timing Mats at KM 21.1",
    zone: "Cyclopean Wall Checkpoint",
    category: "Timing & Mats",
    priority: "Critical",
    status: "Operational",
    assignedTeam: "Timing Technicians Unit A",
  },
  {
    id: "LOG-02",
    title: "Stock 15,000 Electrolyte Sachets & Energy Gels",
    zone: "Hydration Points 1 through 8",
    category: "Hydration",
    priority: "High",
    status: "In Transit",
    assignedTeam: "Amrit Logistics Team",
  },
  {
    id: "LOG-03",
    title: "Station Cardiac Ambulances & First Aid Doctors",
    zone: "Venuvana Finish Arena",
    category: "Medical",
    priority: "Critical",
    status: "Operational",
    assignedTeam: "AIIMS Patna Emergency Unit",
  },
  {
    id: "LOG-04",
    title: "Inspection of Heavy Heritage Finisher Medals (7,500 units)",
    zone: "Central Warehouse Nalanda",
    category: "Merchandise",
    priority: "Medium",
    status: "Completed",
    assignedTeam: "Medal Distribution Volunteers",
  },
  {
    id: "LOG-05",
    title: "Deploy 40 Bio-Toilets & Eco-Waste Bins",
    zone: "Starting Line & Grid Entrance",
    category: "Sanitation",
    priority: "High",
    status: "Pending Setup",
    assignedTeam: "Nagar Parishad Sanitation Crew",
  },
];

const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: "ADM-ROOT",
    name: "Vikramaditya Rathore",
    email: "vikram.super@rajgirmarathon.com",
    role: "Super Admin",
    department: "Executive Directorate",
    assignedPermissions: ["ALL_PRIVILEGES", "ADMIN_PROVISIONING", "FINANCIAL_CONTRACTS", "SYSTEM_WIPE"],
    lastActive: "Just now",
    createdAt: "2026-01-01",
  },
  {
    id: "ADM-002",
    name: "Dr. Ananya Sharma",
    email: "ananya.ops@rajgirmarathon.com",
    role: "Admin",
    department: "Race Logistics & Marshals",
    assignedPermissions: ["MANAGE_VOLUNTEERS", "MANAGE_RUNNERS", "VIEW_LOGISTICS"],
    lastActive: "22 mins ago",
    createdAt: "2026-02-15",
  },
  {
    id: "ADM-003",
    name: "Rohan Mukherjee",
    email: "rohan.media@rajgirmarathon.com",
    role: "Admin",
    department: "PR, Influencers & Sponsors",
    assignedPermissions: ["MANAGE_INFLUENCERS", "MANAGE_MEDIA", "VIEW_SPONSORS"],
    lastActive: "2 hours ago",
    createdAt: "2026-02-20",
  },
  {
    id: "ADM-004",
    name: "Deepak Choudhary",
    email: "deepak.timing@rajgirmarathon.com",
    role: "Admin",
    department: "Technical Timing & Bib Allocation",
    assignedPermissions: ["MANAGE_RUNNERS", "ALLOCATE_BIBS", "EDIT_RACES"],
    lastActive: "Yesterday",
    createdAt: "2026-03-01",
  },
];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export default function MasterAdminDashboard() {
  // SIMULATED AUTHENTICATED PERSONA SWITCHER
  const [currentUserRole, setCurrentUserRole] = useState<AdminRolePersona>("SuperAdmin");

  // ACTIVE NAVIGATION TAB
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "races" | "logistics" | "admins">("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // UNIVERSAL STATE STORE
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [races, setRaces] = useState<RaceEvent[]>(INITIAL_RACES);
  const [logistics, setLogistics] = useState<LogisticsTask[]>(INITIAL_LOGISTICS);
  const [admins, setAdmins] = useState<AdminAccount[]>(INITIAL_ADMINS);

  // USER DIRECTORY FILTERS & SEARCH
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("ALL");

  // MODAL STATES
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Runner" as MarathonRole,
    status: "Active" as SystemUser["status"],
    notes: "",
  });

  const [raceModalOpen, setRaceModalOpen] = useState(false);
  const [editingRace, setEditingRace] = useState<RaceEvent | null>(null);
  const [raceFormData, setRaceFormData] = useState({
    title: "",
    distance: "10.0 KM",
    date: "2027-02-14",
    time: "06:00 AM",
    fee: 1000,
    capacity: 2000,
    elevation: "Moderate",
    status: "Open" as RaceEvent["status"],
  });

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminFormData, setAdminFormData] = useState({
    name: "",
    email: "",
    department: "Operations & Registration",
    assignedPermissions: ["MANAGE_RUNNERS", "MANAGE_VOLUNTEERS"],
  });

  // FEEDBACK NOTIFICATIONS
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ==========================================
  // 4. COMPUTED FILTERS & STATS
  // ==========================================

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.notes.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(userSearchQuery.toLowerCase());

      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === "ALL" || u.status === userStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearchQuery, userRoleFilter, userStatusFilter]);

  const stats = useMemo(() => {
    const totalRunners = users.filter((u) => u.role === "Runner").length;
    const totalVolunteers = users.filter((u) => u.role === "Volunteer").length;
    const totalSponsors = users.filter((u) => u.role === "Sponsor" || u.role === "Corporate Company").length;
    const totalRegistrationsCount = races.reduce((sum, r) => sum + r.registeredCount, 0);
    const totalRevenue = races.reduce((sum, r) => sum + r.registeredCount * r.fee, 0);
    const criticalLogistics = logistics.filter((l) => l.priority === "Critical" && l.status !== "Completed").length;

    return {
      totalUsers: users.length,
      totalRunners,
      totalVolunteers,
      totalSponsors,
      totalRegistrationsCount,
      totalRevenue,
      criticalLogistics,
      totalRaces: races.length,
    };
  }, [users, races, logistics]);

  // ==========================================
  // 5. CRUD ACTION HANDLERS
  // ==========================================

  // --- USER CRUD ---
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: "",
      email: "",
      phone: "",
      role: "Runner",
      status: "Active",
      notes: "",
    });
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: SystemUser) => {
    // Permission guard: Regular Admin cannot edit Super Admin or fellow Admins
    if (currentUserRole === "RegularAdmin" && (user.role === "Super Admin" || user.role === "Admin")) {
      showToast("Access Denied: Regular Admins cannot modify administrative accounts.");
      return;
    }

    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      notes: user.notes,
    });
    setUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.email) return;

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: userFormData.name,
                email: userFormData.email,
                phone: userFormData.phone,
                role: userFormData.role,
                status: userFormData.status,
                notes: userFormData.notes,
              }
            : u
        )
      );
      showToast(`User ${userFormData.name} successfully updated.`);
    } else {
      const newUser: SystemUser = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        name: userFormData.name,
        email: userFormData.email,
        phone: userFormData.phone,
        role: userFormData.role,
        status: userFormData.status,
        joinedDate: new Date().toISOString().split("T")[0],
        notes: userFormData.notes || "Registered via Master Admin",
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(`New ${userFormData.role} account created.`);
    }
    setUserModalOpen(false);
  };

  const handleDeleteUser = (user: SystemUser) => {
    // Permission check: Regular Admin cannot delete Admins
    if (currentUserRole === "RegularAdmin" && (user.role === "Super Admin" || user.role === "Admin")) {
      showToast("Access Denied: You do not have privilege to delete administrative accounts.");
      return;
    }

    if (user.role === "Super Admin") {
      showToast("Critical Error: The Root Super Admin account cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(`Permanently delete account for "${user.name}" (${user.role})?`);
    if (!confirmed) return;

    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    showToast(`Account "${user.name}" has been purged from system.`);
  };

  // --- RACE CRUD ---
  const handleOpenAddRace = () => {
    setEditingRace(null);
    setRaceFormData({
      title: "",
      distance: "10.0 KM",
      date: "2027-02-14",
      time: "06:00 AM",
      fee: 1000,
      capacity: 2000,
      elevation: "Moderate",
      status: "Open",
    });
    setRaceModalOpen(true);
  };

  const handleOpenEditRace = (race: RaceEvent) => {
    setEditingRace(race);
    setRaceFormData({
      title: race.title,
      distance: race.distance,
      date: race.date,
      time: race.time,
      fee: race.fee,
      capacity: race.capacity,
      elevation: race.elevation,
      status: race.status,
    });
    setRaceModalOpen(true);
  };

  const handleSaveRace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!raceFormData.title) return;

    if (editingRace) {
      setRaces((prev) =>
        prev.map((r) =>
          r.id === editingRace.id
            ? {
                ...r,
                title: raceFormData.title,
                distance: raceFormData.distance,
                date: raceFormData.date,
                time: raceFormData.time,
                fee: Number(raceFormData.fee),
                capacity: Number(raceFormData.capacity),
                elevation: raceFormData.elevation,
                status: raceFormData.status,
              }
            : r
        )
      );
      showToast(`Race "${raceFormData.title}" updated.`);
    } else {
      const newRace: RaceEvent = {
        id: `RACE-${Date.now().toString().slice(-4)}`,
        title: raceFormData.title,
        distance: raceFormData.distance,
        date: raceFormData.date,
        time: raceFormData.time,
        fee: Number(raceFormData.fee),
        capacity: Number(raceFormData.capacity),
        registeredCount: 0,
        elevation: raceFormData.elevation,
        status: raceFormData.status,
      };
      setRaces((prev) => [...prev, newRace]);
      showToast(`New Race "${raceFormData.title}" launched.`);
    }
    setRaceModalOpen(false);
  };

  const handleDeleteRace = (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete and cancel the race event "${title}"?`)) return;
    setRaces((prev) => prev.filter((r) => r.id !== id));
    showToast(`Race event "${title}" removed.`);
  };

  // --- LOGISTICS TOGGLE & DELETE ---
  const handleToggleLogisticsStatus = (task: LogisticsTask) => {
    const nextStatus: Record<LogisticsTask["status"], LogisticsTask["status"]> = {
      "Pending Setup": "In Transit",
      "In Transit": "Operational",
      "Operational": "Completed",
      "Completed": "Operational",
    };
    setLogistics((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus[task.status] } : t))
    );
    showToast(`Logistics task "${task.title}" status changed to ${nextStatus[task.status]}.`);
  };

  const handleDeleteLogistics = (id: string, title: string) => {
    if (!window.confirm(`Delete logistics task "${title}"?`)) return;
    setLogistics((prev) => prev.filter((t) => t.id !== id));
    showToast(`Logistics record removed.`);
  };

  // --- ADMIN PROVISIONING CRUD (SUPER ADMIN ONLY) ---
  const handleProvisionAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== "SuperAdmin") {
      showToast("Access Denied: Only Super Admin can provision administrative users.");
      return;
    }
    if (!adminFormData.name || !adminFormData.email) return;

    const newAdmin: AdminAccount = {
      id: `ADM-00${admins.length + 1}`,
      name: adminFormData.name,
      email: adminFormData.email,
      role: "Admin",
      department: adminFormData.department,
      assignedPermissions: adminFormData.assignedPermissions,
      lastActive: "Never",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setAdmins((prev) => [...prev, newAdmin]);

    // Also add to global user directory
    const newSystemUser: SystemUser = {
      id: `USR-ADM-${Math.floor(100 + Math.random() * 900)}`,
      name: adminFormData.name,
      email: adminFormData.email,
      phone: "+91 99000 00000",
      role: "Admin",
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0],
      notes: `Staff Admin assigned to ${adminFormData.department}`,
    };
    setUsers((prev) => [newSystemUser, ...prev]);

    setAdminModalOpen(false);
    setAdminFormData({
      name: "",
      email: "",
      department: "Operations & Registration",
      assignedPermissions: ["MANAGE_RUNNERS", "MANAGE_VOLUNTEERS"],
    });
    showToast(`New Admin "${adminFormData.name}" provisioned with active operational privileges.`);
  };

  const handleRevokeAdmin = (admin: AdminAccount) => {
    if (currentUserRole !== "SuperAdmin") {
      showToast("Access Denied: Only the Super Admin can revoke admin credentials.");
      return;
    }
    if (admin.role === "Super Admin") {
      showToast("Hierarchy Protection: You cannot revoke or delete the Root Super Admin.");
      return;
    }

    const firstConfirm = window.confirm(`REVOKE ACCESS: Are you sure you want to permanently delete Admin credentials for "${admin.name}"?`);
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(`DOUBLE CONFIRMATION: This will permanently purge ${admin.name}'s account and invalidate all admin session tokens. Proceed?`);
    if (!secondConfirm) return;

    setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
    setUsers((prev) => prev.filter((u) => u.email !== admin.email));
    showToast(`Admin privileges for "${admin.name}" have been revoked and account purged.`);
  };

  // Helper Badge Color for 14 Roles
  const getRoleBadge = (role: MarathonRole) => {
    switch (role) {
      case "Super Admin":
        return "bg-purple-950/50 text-purple-300 border-purple-500/50";
      case "Admin":
        return "bg-blue-950/50 text-blue-300 border-blue-500/50";
      case "Runner":
        return "bg-emerald-950/50 text-emerald-300 border-emerald-500/50";
      case "Volunteer":
        return "bg-amber-950/50 text-amber-300 border-amber-500/50";
      case "Influencer":
        return "bg-pink-950/50 text-pink-300 border-pink-500/50";
      case "Team Captain":
        return "bg-cyan-950/50 text-cyan-300 border-cyan-500/50";
      case "Corporate Company":
        return "bg-indigo-950/50 text-indigo-300 border-indigo-500/50";
      case "Sponsor":
        return "bg-yellow-950/50 text-yellow-300 border-yellow-500/50";
      case "Tourism Partner":
        return "bg-teal-950/50 text-teal-300 border-teal-500/50";
      case "School":
        return "bg-orange-950/50 text-orange-300 border-orange-500/50";
      case "Media Press":
        return "bg-rose-950/50 text-rose-300 border-rose-500/50";
      case "Organizer":
        return "bg-red-950/50 text-red-300 border-red-500/50";
      case "Vendor":
        return "bg-lime-950/50 text-lime-300 border-lime-500/50";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#080604] text-white flex flex-col font-sans selection:bg-[#991b1b] selection:text-white">
      {/* ========================================================= */}
      {/* 1. TOP PERSONA SIMULATION BANNER                         */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#110d0a] border-b border-[#cca043]/30 px-4 sm:px-6 py-2.5 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#d49a37]">
                LIVE PERSONA SIMULATOR:
              </span>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-1.5 rounded-lg border border-white/10 bg-white/5 text-neutral-300"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Persona Switcher Selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-neutral-400 hidden md:inline">Current Clearance:</span>
            <div className="relative inline-flex items-center">
              <select
                value={currentUserRole}
                onChange={(e) => {
                  const newRole = e.target.value as AdminRolePersona;
                  setCurrentUserRole(newRole);
                  showToast(`Persona switched to ${newRole === "SuperAdmin" ? "👑 Super Admin" : "🛠️ Regular Admin"}`);
                }}
                className={`py-1.5 pl-3 pr-8 rounded-lg text-xs font-black uppercase tracking-wider border cursor-pointer outline-none transition-all ${
                  currentUserRole === "SuperAdmin"
                    ? "bg-purple-950/60 text-purple-200 border-purple-500 shadow-md shadow-purple-950/40"
                    : "bg-blue-950/60 text-blue-200 border-blue-500 shadow-md shadow-blue-950/40"
                }`}
              >
                <option value="SuperAdmin" className="bg-[#14100c] text-purple-300">
                  👑 Logged in as: Super Admin (Root)
                </option>
                <option value="RegularAdmin" className="bg-[#14100c] text-blue-300">
                  🛠️ Logged in as: Regular Admin
                </option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 pointer-events-none text-neutral-400" />
            </div>

            {/* Role Capability Badge */}
            <span
              className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                currentUserRole === "SuperAdmin"
                  ? "bg-purple-900/20 text-purple-300 border-purple-500/30"
                  : "bg-blue-900/20 text-blue-300 border-blue-500/30"
              }`}
            >
              {currentUserRole === "SuperAdmin" ? (
                <>
                  <Crown size={12} className="text-purple-400" /> Full System & Admin Control
                </>
              ) : (
                <>
                  <Shield size={12} className="text-blue-400" /> Operational Rights (Admins Locked)
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#1b1510] border border-[#cca043] text-[#d49a37] px-4 py-3 rounded-xl shadow-2xl text-xs font-bold animate-fadeIn">
          <Activity size={16} className="text-emerald-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT AREA               */}
      {/* ========================================================= */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* SIDEBAR NAVIGATION (Desktop & Mobile Slide-Out) */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0e0b08] border-r border-white/10 p-5 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          {/* Brand Logo & Platform Subtitle */}
          <div className="mb-8 pt-12 md:pt-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#cca043]/30 bg-[#cca043]/10 text-[#d49a37] text-[10px] font-black tracking-widest uppercase mb-1">
              Rajgir Marathon
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Master Admin
            </h2>
            <p className="text-[11px] text-neutral-400">Universal Operational Console</p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#cca043]/20 text-[#d49a37] border border-[#cca043]/50 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity size={16} />
              <span>Overview Insights</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("users");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-[#cca043]/20 text-[#d49a37] border border-[#cca043]/50 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>User Directory</span>
              </div>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-neutral-300">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("races");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "races"
                  ? "bg-[#cca043]/20 text-[#d49a37] border border-[#cca043]/50 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Flag size={16} />
                <span>Races & Events</span>
              </div>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-neutral-300">
                {races.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("logistics");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "logistics"
                  ? "bg-[#cca043]/20 text-[#d49a37] border border-[#cca043]/50 shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <PackageCheck size={16} />
                <span>Logistics & Assets</span>
              </div>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-neutral-300">
                {logistics.length}
              </span>
            </button>

            {/* CONDITIONAL SYSTEM ADMINS TAB (SUPER ADMIN ONLY) */}
            <div className="pt-4 mt-4 border-t border-white/10">
              <span className="text-[10px] font-black uppercase text-neutral-500 tracking-widest px-3 block mb-2">
                Root Security
              </span>
              <button
                onClick={() => {
                  setActiveTab("admins");
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "admins"
                    ? "bg-purple-950/40 text-purple-300 border border-purple-500/50 shadow-sm"
                    : currentUserRole === "SuperAdmin"
                    ? "text-neutral-400 hover:text-purple-300 hover:bg-white/5"
                    : "text-neutral-600 hover:text-neutral-500 hover:bg-transparent cursor-not-allowed opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  {currentUserRole === "SuperAdmin" ? <Crown size={16} className="text-purple-400" /> : <Lock size={16} />}
                  <span>System Admins</span>
                </div>
                {currentUserRole === "SuperAdmin" ? (
                  <span className="text-[10px] bg-purple-900/50 text-purple-200 px-1.5 py-0.5 rounded font-mono">
                    {admins.length}
                  </span>
                ) : (
                  <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold">
                    LOCKED
                  </span>
                )}
              </button>
            </div>
          </nav>
        </aside>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* ======================================================= */}
          {/* TAB 1: OVERVIEW INSIGHTS                                */}
          {/* ======================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-serif">
                  Operations <span className="text-[#d49a37]">Overview</span>
                </h1>
                <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                  Real-time status across race registrations, operational volunteer units, and logistics.
                </p>
              </div>

              {/* STAT METRIC CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#110e0a] border border-[#cca043]/30 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Registrations</span>
                    <Award size={18} className="text-[#d49a37]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {stats.totalRegistrationsCount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp size={12} /> Across {stats.totalRaces} race categories
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#110e0a] border border-[#cca043]/30 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Revenue Collected</span>
                    <DollarSign size={18} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                    ₹{(stats.totalRevenue / 100000).toFixed(2)} L
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Direct entry fees</div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#110e0a] border border-[#cca043]/30 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Active Volunteers</span>
                    <Users size={18} className="text-amber-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {stats.totalVolunteers} Crew Leads
                  </div>
                  <div className="text-[11px] text-amber-400 mt-1">100% stations covered</div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-[#110e0a] border border-[#cca043]/30 shadow-lg">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Critical Logistics</span>
                    <AlertTriangle size={18} className="text-red-400" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {stats.criticalLogistics} Pending
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">Medical & Timing mats</div>
                </div>
              </div>

              {/* 14 ROLES DISTRIBUTION BREAKDOWN */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#110e0a] border border-white/10 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#d49a37] mb-3">
                  User Distribution Across All 14 Marathon Roles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_ROLES.map((role) => {
                    const count = users.filter((u) => u.role === role).length;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setUserRoleFilter(role);
                          setActiveTab("users");
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${getRoleBadge(
                          role
                        )} hover:brightness-125`}
                      >
                        <span>{role}</span>
                        <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RECENT OPERATIONAL HIGHLIGHTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#110e0a] border border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2">
                    <Flag size={14} className="text-[#d49a37]" /> Race Categories Fill Rates
                  </h3>
                  <div className="space-y-3">
                    {races.map((r) => {
                      const pct = Math.round((r.registeredCount / r.capacity) * 100);
                      return (
                        <div key={r.id} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-white">{r.title}</span>
                            <span className="text-neutral-400 font-mono">
                              {r.registeredCount}/{r.capacity} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 100 ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-[#d49a37]"
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#110e0a] border border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300 mb-3 flex items-center gap-2">
                    <PackageCheck size={14} className="text-emerald-400" /> Key Venue Logistics Check
                  </h3>
                  <div className="space-y-2.5">
                    {logistics.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{item.title}</div>
                          <div className="text-[11px] text-neutral-400">{item.zone}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === "Operational"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                              : "bg-amber-950 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 2: UNIVERSAL USER DIRECTORY (ALL 14 ROLES CRUD)     */}
          {/* ======================================================= */}
          {activeTab === "users" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-serif">
                    Universal <span className="text-[#d49a37]">User Directory</span>
                  </h1>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                    Live database management for all 14 marathon participant & stakeholder roles.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddUser}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] text-[#080604] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-950/40 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add New Account</span>
                </button>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="p-3.5 rounded-2xl bg-[#110e0a] border border-white/10 flex flex-col md:flex-row items-center gap-3">
                {/* Search query */}
                <div className="relative flex-1 w-full">
                  <Search size={15} className="absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, bib, or details..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-[#cca043] transition-all"
                  />
                </div>

                {/* Role Filter Selector (ALL 14 ROLES) */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter size={14} className="text-neutral-400" />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="flex-1 md:w-48 py-2 px-3 rounded-xl bg-[#16120e] border border-white/10 text-xs font-bold text-white outline-none cursor-pointer focus:border-[#cca043]"
                  >
                    <option value="ALL">All Roles (14 Distinct)</option>
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="w-full md:w-auto">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="w-full md:w-36 py-2 px-3 rounded-xl bg-[#16120e] border border-white/10 text-xs font-bold text-white outline-none cursor-pointer focus:border-[#cca043]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* USERS MASTER TABLE */}
              <div className="rounded-2xl border border-white/10 bg-[#110e0a] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#18130e] border-b border-white/10 text-[10.5px] font-black uppercase text-neutral-400 tracking-wider">
                      <tr>
                        <th className="py-3 px-4">User & Contact</th>
                        <th className="py-3 px-4">Marathon Role</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Specific Assignment / Notes</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-neutral-500">
                            No records found matching current query or filters.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isAdminAccount = u.role === "Super Admin" || u.role === "Admin";
                          const isActionDisabled = currentUserRole === "RegularAdmin" && isAdminAccount;

                          return (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-bold text-white text-sm">{u.name}</div>
                                <div className="text-neutral-400 text-[11px] font-mono">{u.email}</div>
                                <div className="text-neutral-500 text-[10px]">{u.phone}</div>
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getRoleBadge(
                                    u.role
                                  )}`}
                                >
                                  {u.role}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                                    u.status === "Active" || u.status === "Verified"
                                      ? "text-emerald-400"
                                      : u.status === "Pending Review"
                                      ? "text-amber-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {u.status === "Active" || u.status === "Verified" ? (
                                    <CheckCircle2 size={12} />
                                  ) : (
                                    <XCircle size={12} />
                                  )}
                                  {u.status}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-neutral-300 max-w-xs truncate font-medium">
                                {u.notes}
                              </td>

                              <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                                {u.joinedDate}
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Edit Button */}
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    disabled={isActionDisabled}
                                    title={isActionDisabled ? "Regular Admins cannot edit higher rank accounts" : "Edit user"}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      isActionDisabled
                                        ? "opacity-30 border-white/5 cursor-not-allowed text-neutral-600"
                                        : "border-white/10 hover:border-[#cca043] text-neutral-300 hover:text-[#d49a37] hover:bg-white/5 cursor-pointer"
                                    }`}
                                  >
                                    <Edit3 size={14} />
                                  </button>

                                  {/* Delete Button */}
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={isActionDisabled || u.role === "Super Admin"}
                                    title={
                                      u.role === "Super Admin"
                                        ? "Root Super Admin cannot be deleted"
                                        : isActionDisabled
                                        ? "Regular Admins cannot delete admin accounts"
                                        : "Delete record"
                                    }
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      isActionDisabled || u.role === "Super Admin"
                                        ? "opacity-30 border-white/5 cursor-not-allowed text-neutral-600"
                                        : "border-white/10 hover:border-red-500 text-neutral-300 hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                                    }`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 3: MARATHON RACES & EVENTS MANAGER (FULL CRUD)      */}
          {/* ======================================================= */}
          {activeTab === "races" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-serif">
                    Marathon Races & <span className="text-[#d49a37]">Divisions</span>
                  </h1>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                    Launch new race categories, adjust entry limits, modify pricing, and configure distances.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddRace}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#b47a1f] via-[#d49a37] to-[#e0a845] text-[#080604] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-amber-950/40 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Launch New Race Category</span>
                </button>
              </div>

              {/* RACES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {races.map((race) => {
                  const fillPct = Math.round((race.registeredCount / race.capacity) * 100);

                  return (
                    <div
                      key={race.id}
                      className="p-5 rounded-2xl bg-[#110e0a] border border-[#cca043]/30 shadow-lg relative flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#d49a37] px-2 py-0.5 rounded bg-[#d49a37]/10 border border-[#d49a37]/30">
                            {race.distance}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              race.status === "Open"
                                ? "bg-emerald-950 text-emerald-300"
                                : race.status === "Filling Fast"
                                ? "bg-amber-950 text-amber-300"
                                : "bg-red-950 text-red-300"
                            }`}
                          >
                            {race.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{race.title}</h3>

                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase block">Race Date</span>
                            <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                              <Calendar size={12} className="text-[#d49a37]" /> {race.date}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase block">Registration Fee</span>
                            <span className="font-bold text-emerald-400 font-mono mt-0.5 block">
                              ₹{race.fee.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Registration Progress */}
                        <div className="mt-4 pt-3 border-t border-white/10 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-400 text-[11px]">Slots Taken</span>
                            <span className="font-bold font-mono text-white">
                              {race.registeredCount} / {race.capacity} ({fillPct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#b47a1f] to-[#d49a37]"
                              style={{ width: `${Math.min(fillPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditRace(race)}
                          className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#cca043] text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRace(race.id, race.title)}
                          className="px-3 py-1.5 rounded-lg border border-red-500/30 hover:border-red-500 text-red-300 hover:bg-red-950/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 4: LOGISTICS & ASSETS MANAGER                       */}
          {/* ======================================================= */}
          {activeTab === "logistics" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-serif">
                    Course Logistics & <span className="text-[#d49a37]">Assets</span>
                  </h1>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                    Track hydration stations, RFID timing mats, emergency ambulances, and venue sanitation.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#110e0a] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#18130e] border-b border-white/10 text-[10.5px] font-black uppercase text-neutral-400 tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Task & Asset</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Designated Zone</th>
                        <th className="py-3 px-4">Assigned Team</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status (Click to Advance)</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logistics.map((task) => (
                        <tr key={task.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white text-sm">{task.title}</td>
                          <td className="py-3.5 px-4 text-neutral-300">{task.category}</td>
                          <td className="py-3.5 px-4 text-neutral-400 flex items-center gap-1.5 mt-1">
                            <MapPin size={12} className="text-[#d49a37]" /> {task.zone}
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300">{task.assignedTeam}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                                task.priority === "Critical"
                                  ? "bg-red-950/60 text-red-300 border border-red-500/40"
                                  : task.priority === "High"
                                  ? "bg-amber-950/60 text-amber-300 border border-amber-500/40"
                                  : "bg-blue-950/60 text-blue-300 border border-blue-500/40"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleLogisticsStatus(task)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-white/20 hover:border-[#cca043] bg-white/5 text-white transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              {task.status} ↺
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteLogistics(task.id, task.title)}
                              className="p-1.5 rounded-lg border border-white/10 hover:border-red-500 text-neutral-400 hover:text-red-400 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* TAB 5: SYSTEM ADMIN ACCESS CONTROLLER                   */}
          {/* STRICT HIERARCHICAL RBAC (SUPER ADMIN ONLY)              */}
          {/* ======================================================= */}
          {activeTab === "admins" && (
            <div>
              {currentUserRole === "RegularAdmin" ? (
                /* ---------------------------------------------------- */
                /* ACCESS DENIED SCREEN (REGULAR ADMIN FORBIDDEN)      */
                /* ---------------------------------------------------- */
                <div className="py-16 px-4 flex flex-col items-center justify-center text-center animate-fadeIn">
                  <div className="w-20 h-20 rounded-3xl bg-red-950/40 border-2 border-red-500/60 text-red-400 flex items-center justify-center text-3xl mb-5 shadow-2xl shadow-red-950/60">
                    <ShieldAlert size={40} />
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/40 bg-red-950/20 text-red-400 text-xs font-black uppercase tracking-widest mb-3">
                    <Lock size={12} /> Hierarchy Lock Active
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-serif tracking-tight">
                    Access Denied: Super Admin Clearance Level 1 Required
                  </h2>
                  <p className="text-neutral-400 text-xs sm:text-sm mt-2 max-w-lg leading-relaxed">
                    You are currently viewing this dashboard with the <strong>Regular Admin</strong> persona. In
                    accordance with strict hierarchical RBAC rules, Regular Admins are forbidden from inspecting,
                    provisioning, or deleting administrative credentials.
                  </p>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setCurrentUserRole("SuperAdmin");
                        showToast("Switched persona to 👑 Super Admin");
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 hover:from-purple-700 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-950/60 transition-all cursor-pointer"
                    >
                      <Crown size={15} /> Switch to Super Admin Persona
                    </button>
                    <button
                      onClick={() => setActiveTab("overview")}
                      className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Return to Overview
                    </button>
                  </div>
                </div>
              ) : (
                /* ---------------------------------------------------- */
                /* SUPER ADMIN PANEL: FULL ADMIN PROVISIONING & REVOKE  */
                /* ---------------------------------------------------- */
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-purple-500/40 bg-purple-950/30 text-purple-300 text-[10px] font-black tracking-widest uppercase mb-1">
                        <Crown size={12} /> Root Security Clearance
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-serif">
                        Administrator <span className="text-purple-400">Governance</span>
                      </h1>
                      <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                        Provision operational admin accounts, grant specific sub-permissions, and revoke access.
                      </p>
                    </div>

                    <button
                      onClick={() => setAdminModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Provision New Admin</span>
                    </button>
                  </div>

                  {/* ADMINS TABLE */}
                  <div className="rounded-2xl border border-purple-500/30 bg-[#120d18]/90 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-purple-950/40 border-b border-purple-500/30 text-[10.5px] font-black uppercase text-purple-300 tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Admin Name & Identity</th>
                            <th className="py-3 px-4">Hierarchy Rank</th>
                            <th className="py-3 px-4">Department</th>
                            <th className="py-3 px-4">Assigned Permissions</th>
                            <th className="py-3 px-4">Last Active</th>
                            <th className="py-3 px-4 text-right">Revocation Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-500/10">
                          {admins.map((adm) => (
                            <tr key={adm.id} className="hover:bg-purple-900/10 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                  {adm.role === "Super Admin" && <Crown size={14} className="text-[#d49a37]" />}
                                  {adm.name}
                                </div>
                                <div className="text-neutral-400 font-mono text-[11px]">{adm.email}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                                    adm.role === "Super Admin"
                                      ? "bg-purple-950 text-purple-200 border-purple-400"
                                      : "bg-blue-950 text-blue-200 border-blue-400"
                                  }`}
                                >
                                  {adm.role}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-neutral-300">{adm.department}</td>

                              <td className="py-3.5 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {adm.assignedPermissions.map((perm) => (
                                    <span
                                      key={perm}
                                      className="px-1.5 py-0.5 rounded bg-black/40 text-[9.5px] font-mono text-purple-300 border border-purple-500/20"
                                    >
                                      {perm}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                                {adm.lastActive}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                {adm.role === "Super Admin" ? (
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 italic">
                                    Root Account (Protected)
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleRevokeAdmin(adm)}
                                    className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-950/20 text-red-300 hover:bg-red-900/40 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
                                  >
                                    <Trash2 size={13} /> Revoke Access
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MODALS (CREATE/EDIT USER, CREATE/EDIT RACE, PROVISION)  */}
      {/* ========================================================= */}

      {/* USER MODAL */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-[#cca043]/40 bg-[#120e0a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-lg font-black uppercase text-white font-serif">
                {editingUser ? "Edit User Record" : "Add New Account to Directory"}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. Alok Nath"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="user@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="+91 ..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Marathon Role *</label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as MarathonRole })}
                    className="w-full px-3 py-2 rounded-xl bg-[#1b1510] border border-white/10 text-white outline-none cursor-pointer focus:border-[#cca043]"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Status</label>
                  <select
                    value={userFormData.status}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, status: e.target.value as SystemUser["status"] })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1b1510] border border-white/10 text-white outline-none cursor-pointer focus:border-[#cca043]"
                  >
                    <option value="Active">Active</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-1">
                  Assignment Details / Notes
                </label>
                <textarea
                  rows={2}
                  value={userFormData.notes}
                  onChange={(e) => setUserFormData({ ...userFormData, notes: e.target.value })}
                  placeholder="e.g. Bib allocation, company title, volunteer point"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none resize-none focus:border-[#cca043]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#b47a1f] to-[#d49a37] text-black font-black text-xs uppercase"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RACE MODAL */}
      {raceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-[#cca043]/40 bg-[#120e0a] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-lg font-black uppercase text-white font-serif">
                {editingRace ? "Edit Race Event Details" : "Launch New Race Category"}
              </h3>
              <button
                onClick={() => setRaceModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveRace} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-1">Race Event Title *</label>
                <input
                  type="text"
                  required
                  value={raceFormData.title}
                  onChange={(e) => setRaceFormData({ ...raceFormData, title: e.target.value })}
                  placeholder="e.g. Nalanda Heritage 10K"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Distance *</label>
                  <input
                    type="text"
                    required
                    value={raceFormData.distance}
                    onChange={(e) => setRaceFormData({ ...raceFormData, distance: e.target.value })}
                    placeholder="e.g. 10.0 KM"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={raceFormData.time}
                    onChange={(e) => setRaceFormData({ ...raceFormData, time: e.target.value })}
                    placeholder="06:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Entry Fee (INR) *</label>
                  <input
                    type="number"
                    required
                    value={raceFormData.fee}
                    onChange={(e) => setRaceFormData({ ...raceFormData, fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    required
                    value={raceFormData.capacity}
                    onChange={(e) => setRaceFormData({ ...raceFormData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Elevation Description</label>
                  <input
                    type="text"
                    value={raceFormData.elevation}
                    onChange={(e) => setRaceFormData({ ...raceFormData, elevation: e.target.value })}
                    placeholder="e.g. Rolling Hills"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-[#cca043]"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold uppercase mb-1">Status</label>
                  <select
                    value={raceFormData.status}
                    onChange={(e) =>
                      setRaceFormData({ ...raceFormData, status: e.target.value as RaceEvent["status"] })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#1b1510] border border-white/10 text-white outline-none cursor-pointer focus:border-[#cca043]"
                  >
                    <option value="Open">Open</option>
                    <option value="Filling Fast">Filling Fast</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setRaceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#b47a1f] to-[#d49a37] text-black font-black text-xs uppercase"
                >
                  Save Race
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVISION NEW ADMIN MODAL (SUPER ADMIN ONLY) */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-purple-500/50 bg-[#140e1b] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-purple-500/20 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest block">
                  Security Clearance Level 2
                </span>
                <h3 className="text-lg font-black uppercase text-white font-serif">
                  Provision Operational Admin
                </h3>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProvisionAdmin} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-1">Admin Full Name *</label>
                <input
                  type="text"
                  required
                  value={adminFormData.name}
                  onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })}
                  placeholder="e.g. Shalini Roy"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                  placeholder="shalini@rajgirmarathon.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-1">Assigned Department</label>
                <input
                  type="text"
                  required
                  value={adminFormData.department}
                  onChange={(e) => setAdminFormData({ ...adminFormData, department: e.target.value })}
                  placeholder="e.g. Volunteer Marshals & Bib Distribution"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase mb-1.5">
                  Granted Sub-Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {["MANAGE_RUNNERS", "MANAGE_VOLUNTEERS", "MANAGE_LOGISTICS", "VIEW_FINANCIALS"].map((perm) => {
                    const isChecked = adminFormData.assignedPermissions.includes(perm);
                    return (
                      <label
                        key={perm}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                          isChecked ? "bg-purple-950/40 border-purple-500 text-purple-200" : "bg-white/5 border-white/10 text-neutral-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAdminFormData({
                                ...adminFormData,
                                assignedPermissions: [...adminFormData.assignedPermissions, perm],
                              });
                            } else {
                              setAdminFormData({
                                ...adminFormData,
                                assignedPermissions: adminFormData.assignedPermissions.filter((p) => p !== perm),
                              });
                            }
                          }}
                          className="accent-purple-500"
                        />
                        <span>{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-xs uppercase"
                >
                  Grant Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

