// Admin endpoints for the mock API (see mock-api.mjs), with small in-memory fixtures.
// Like the real API, every admin route is staff-only (ORGANIZER / SUPER_ADMIN) and answers 403 otherwise.
const today = new Date().toISOString();
const lastWeek = new Date(Date.now() - 7 * 86_400_000).toISOString();
const contact = (fullName, email) => ({ firstName: fullName.split(" ")[0], lastName: fullName.split(" ")[1] ?? "", fullName, email, phone: "9876500000" });

export function adminFixtures() {
  return {
    overview: {
      totalRunners: 2,
      kitsCollectedCount: 1,
      totalVolunteers: 1,
      totalInfluencers: 1,
      totalGroups: 2,
      openIncidentsCount: 1,
      pendingApprovalsCount: 3,
      pendingQuotaAppealsCount: 2,
      totalRevenue: 3200,
      categoryBreakdown: [
        { distance: "21.1 KM", count: 1 },
        { distance: "10 KM", count: 1 },
      ],
      tshirtBreakdown: [
        { size: "M", count: 1 },
        { size: "L", count: 1 },
      ],
    },
    runners: [
      { id: "r1", registrationNumber: "RJG-2027-21K-1001", fullName: "Meera Runner", firstName: "Meera", lastName: "Runner", email: "meera@example.com", phone: "9000000001", distance: "21.1 KM", tshirtSize: "M", bibNumber: null, kitCollectedAt: null, kitCollectedBy: null, createdAt: today, netAmount: 1800, runningClub: null, selectedAddons: [{ id: "hoodie", title: "Hoodie", price: 400 }], discountAmount: 0 },
      { id: "r2", registrationNumber: "RJG-2027-10K-1002", fullName: "Arjun Runner", firstName: "Arjun", lastName: "Runner", email: "arjun@example.com", phone: "9000000002", distance: "10 KM", tshirtSize: "L", bibNumber: "10001", kitCollectedAt: lastWeek, kitCollectedBy: "SELF", createdAt: lastWeek, netAmount: 1400, runningClub: "Patna Striders", selectedAddons: [], discountAmount: 100 },
    ],
    volunteers: [
      { id: "v1", fullName: "Vikas Helper", email: "vikas@example.com", phone: "9000000003", status: "pending", rolePreference: "Water Stations", assignedRole: null, assignedStation: null, assignedSector: null, supervisorName: null, supervisorPhone: null },
    ],
    influencers: [{ id: "i1", fullName: "Nisha Creator", email: "nisha@example.com", primaryPlatform: "Instagram", followerCount: "25K", status: "pending", stageName: "RunWithNisha", profileUrl: "https://instagram.com/runwithnisha" }],
    incidents: [
      { id: "in1", type: "MEDICAL", severity: "CRITICAL", isSos: true, location: "KM 12 water station", runnerBib: "21004", description: "Runner collapsed near the water table.", status: "OPEN", acknowledgedAt: null, resolvedAt: null, resolutionNote: null, createdAt: today, volunteerId: "v1", volunteer: { fullName: "Vikas Helper", phone: "9000000003", assignedStation: "KM 12" } },
      { id: "in2", type: "COURSE_HAZARD", severity: "LOW", isSos: false, location: "KM 3", runnerBib: null, description: "Loose cone moved back.", status: "RESOLVED", acknowledgedAt: lastWeek, resolvedAt: lastWeek, resolutionNote: "Fixed", createdAt: lastWeek, volunteerId: null, volunteer: null },
    ],
    appeals: [
      { type: "team", id: "t1", organizationName: "Patna Striders Club", contact: contact("Tara Captain", "tara@example.com"), currentQuota: 50, requestedQuota: 80, reason: "Club members", status: "PENDING", submittedAt: today },
      { type: "school", id: "s1", organizationName: "Nalanda Public School", contact: contact("Sunil Teacher", "sunil@example.com"), currentQuota: 50, requestedQuota: 120, reason: null, status: "PENDING", submittedAt: today },
    ],
    applications: {
      corporates: [{ id: "c1", status: "pending", companyName: "Bihar Steel Ltd", estimatedPasses: 40, submittedAt: today, contact: contact("Kiran Manager", "kiran@example.com") }],
      schools: [{ id: "s1", status: "pending", schoolName: "Nalanda Public School", estimatedStudents: 120, submittedAt: today, contact: contact("Sunil Teacher", "sunil@example.com") }],
      sponsors: [{ id: "sp1", status: "approved", brandName: "HydraFuel", tierInterest: "Hydration", submittedAt: lastWeek, contact: contact("Sara Brand", "sara@example.com") }],
      vendors: [{ id: "vd1", status: "pending", businessName: "Litti Corner", stallCategory: "Food & Refreshments", submittedAt: today, contact: contact("Lalit Vendor", "lalit@example.com") }],
      tourism: [
        { id: "tr1", status: "pending", businessName: "Rajgir Residency", serviceType: "Hotel / Resort", location: "Rajgir", submittedAt: today, contact: contact("Hari Hotel", "hari@example.com") },
        { id: "tr2", status: "pending", businessName: "Gaya Cabs", serviceType: "Cab / Shuttle Fleet", location: "Gaya", submittedAt: today, contact: contact("Gopal Cab", "gopal@example.com") },
      ],
    },
    users: [
      { id: "u-staff", firstName: "Ravi", lastName: "Staff", email: "staff@example.com", phone: "9876543211", role: "ORGANIZER", status: "ACTIVE", registrationSource: "SELF_REGISTERED", createdAt: lastWeek },
      { id: "u-runner", firstName: "Meera", lastName: "Runner", email: "meera@example.com", phone: "9000000001", role: "RUNNER", status: "ACTIVE", registrationSource: "SELF_REGISTERED", createdAt: today },
    ],
    events: [{ id: "e1", distance: "21.1 KM", title: "Half Marathon", fee: 1400, minAge: 18, startTime: "05:30", cutoffMinutes: 210, capacity: 2500, isTimed: true, isActive: true }],
    payments: [{ id: "p1", registrationNumber: "RJG-2027-10K-1002", payerName: "Arjun Runner", payerEmail: "arjun@example.com", distance: "10 KM", amount: 1400, gstAmount: 0, method: "UPI", referenceCode: "UTR123", status: "CAPTURED", notes: null, createdAt: lastWeek }],
    media: [{ id: "m1", title: "Course map", category: "PHOTO", url: "https://example.com/map.jpg", caption: null, isPublished: true, createdAt: lastWeek }],
    cms: [{ id: "cb1", slug: "hero-announcement", title: "Homepage hero", section: "HOMEPAGE", content: "Registrations open", isPublished: true, updatedByEmail: "staff@example.com", updatedAt: lastWeek }],
    notifications: [{ id: "n1", title: "Kit pickup reminder", channel: "EMAIL", audience: "ALL_RUNNERS", message: "Collect your kit", recipientCount: 2, status: "DRAFT", createdByEmail: "staff@example.com", sentAt: null, createdAt: lastWeek }],
    support: [{ id: "tk1", ticketNumber: "TKT-000001", requesterName: "Meera Runner", requesterEmail: "meera@example.com", category: "PAYMENT", subject: "Receipt missing", message: "Please resend", priority: "NORMAL", status: "OPEN", assignedTo: null, resolutionNote: null, createdAt: today }],
    permissions: [{ id: "ap1", userId: "u-staff", designation: "Race Director", department: null, isActive: true, canManageRunners: true, canAllotBibs: true, canManageVolunteers: false, canManageInfluencers: false, canManageGroups: false, canManagePartners: true, canManageIncidents: true, user: { id: "u-staff", firstName: "Ravi", lastName: "Staff", email: "staff@example.com", phone: "9876543211", role: "ORGANIZER", status: "ACTIVE" } }],
    auditLogs: [{ id: "al1", actorEmail: "staff@example.com", actorRole: "ORGANIZER", action: "UPDATE_SETTING", targetType: "SETTING", targetId: "race_date", summary: "Set race_date = 2027-11-21", createdAt: lastWeek }],
    settings: [{ key: "race_date", value: "2027-11-21", category: "EVENT", description: "Race day", updatedAt: lastWeek }],
  };
}

/** GET endpoints the console reads, keyed by path (query strings ignored). */
const READS = {
  "/admin/overview": "overview",
  "/runners": (f) => ({ total: f.runnersTotal ?? f.runners.length, count: f.runners.length, runners: f.runners }),
  "/volunteers": (f) => ({ total: f.volunteers.length, count: f.volunteers.length, volunteers: f.volunteers }),
  "/influencers": (f) => ({ total: f.influencers.length, count: f.influencers.length, influencers: f.influencers }),
  "/incidents": "incidents",
  "/admin/quota-appeals": "appeals",
  "/admin/applications": "applications",
  "/admin/users": "users",
  "/admin/events": "events",
  "/admin/payments": "payments",
  "/admin/media": "media",
  "/admin/cms": "cms",
  "/admin/notifications": "notifications",
  "/admin/support": "support",
  "/admin/permissions": "permissions",
  "/admin/audit-logs": "auditLogs",
  "/admin/settings": "settings",
};

export const ADMIN_READ_PATHS = Object.keys(READS);

/**
 * Route handler for startMockApi({ routes }). `control.failing` is a Set of paths that answer 500,
 * `control.reads` records every admin GET path served.
 */
export function adminRoutes(fixtures, control) {
  return ({ req, path, user, send }) => {
    if (!(path in READS)) return false;
    if (!["ORGANIZER", "SUPER_ADMIN"].includes(user?.role)) {
      send(403, { statusCode: 403, message: "You do not have access to this resource." });
      return true;
    }
    if (req.method !== "GET") return false;
    control.reads.push(path);
    if (control.failing.has(path)) {
      send(500, { statusCode: 500, message: "Internal server error" });
      return true;
    }
    const read = READS[path];
    send(200, typeof read === "function" ? read(fixtures) : fixtures[read]);
    return true;
  };
}
