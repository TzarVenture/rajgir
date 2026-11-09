import type { RoleId } from "@/lib/roles";

/**
 * In-memory mock user store. Replace with Prisma + Supabase Auth.
 * Kept on globalThis so it survives dev hot reloads. It resets on server restart.
 */

export type RoleStatus = "active" | "pending";

export interface UserRole {
  role: RoleId;
  status: RoleStatus;
  onboarded: boolean;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  verified: boolean;
  twoFactor: boolean;
  roles: UserRole[];
  profile: Partial<Record<RoleId, Record<string, string>>>;
}

interface MockDb {
  users: MockUser[];
}

const globalForDb = globalThis as typeof globalThis & { rajgirMockDb?: MockDb };

function seed(): MockUser[] {
  return [
    {
      id: "u-runner",
      name: "Demo Runner",
      email: "runner@rajgir.test",
      mobile: "9000000001",
      password: "Demo@1234",
      verified: true,
      twoFactor: false,
      roles: [{ role: "runner", status: "active", onboarded: true }],
      profile: {},
    },
    {
      id: "u-sponsor",
      name: "Demo Sponsor",
      email: "sponsor@rajgir.test",
      mobile: "9000000002",
      password: "Demo@1234",
      verified: true,
      twoFactor: false,
      roles: [{ role: "sponsor", status: "pending", onboarded: true }],
      profile: { sponsor: { companyName: "Demo Sponsor Pvt Ltd", gstNumber: "DEMO-GST" } },
    },
    {
      id: "u-volunteer",
      name: "Demo Volunteer",
      email: "volunteer@rajgir.test",
      mobile: "9000000003",
      password: "Demo@1234",
      verified: true,
      twoFactor: false,
      roles: [{ role: "volunteer", status: "pending", onboarded: true }],
      profile: {
        volunteer: { preferredRole: "Water station", availability: "Weekend mornings" },
      },
    },
    {
      id: "u-organizer",
      name: "Demo Organizer",
      email: "organizer@rajgir.test",
      mobile: "9000000004",
      password: "Demo@1234",
      verified: true,
      twoFactor: true,
      roles: [{ role: "organizer", status: "active", onboarded: true }],
      profile: {},
    },
    {
      id: "u-admin",
      name: "Demo Super Admin",
      email: "admin@rajgir.test",
      mobile: "9000000005",
      password: "Demo@1234",
      verified: true,
      twoFactor: true,
      roles: [{ role: "super_admin", status: "active", onboarded: true }],
      profile: {},
    },
  ];
}

function db(): MockDb {
  if (!globalForDb.rajgirMockDb) {
    globalForDb.rajgirMockDb = { users: seed() };
  }
  return globalForDb.rajgirMockDb;
}

export function findUserById(id: string): MockUser | undefined {
  return db().users.find((user) => user.id === id);
}

/** Looks up by email when the input contains "@", otherwise by mobile digits. */
export function findUserByLogin(login: string): MockUser | undefined {
  const value = login.trim().toLowerCase();
  if (value.includes("@")) {
    return db().users.find((user) => user.email.toLowerCase() === value);
  }
  const mobile = value.replace(/\D/g, "");
  return db().users.find((user) => user.mobile === mobile);
}

export function createUser(input: {
  name: string;
  email: string;
  mobile: string;
  password: string;
}): MockUser {
  const user: MockUser = {
    id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name,
    email: input.email.toLowerCase(),
    mobile: input.mobile.replace(/\D/g, ""),
    password: input.password,
    verified: false,
    twoFactor: false,
    roles: [],
    profile: {},
  };
  db().users.push(user);
  return user;
}

export function updateUser(id: string, patch: Partial<MockUser>): MockUser | undefined {
  const user = findUserById(id);
  if (!user) return undefined;
  Object.assign(user, patch);
  return user;
}

export function listPendingRoles(): { user: MockUser; role: RoleId }[] {
  return db().users.flatMap((user) =>
    user.roles
      .filter((entry) => entry.status === "pending")
      .map((entry) => ({ user, role: entry.role }))
  );
}
