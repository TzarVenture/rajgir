import { Role } from '@prisma/client';

/** Roles a person may choose for themselves. Staff roles are assigned by admins only. */
export const SELF_SIGNUP_ROLES: Role[] = [
  Role.RUNNER,
  Role.VOLUNTEER,
  Role.INFLUENCER,
  Role.TEAM_CAPTAIN,
  Role.CORPORATE_MANAGER,
  Role.SCHOOL_COORDINATOR,
  Role.SPONSOR,
  Role.VENDOR,
  Role.TOURISM_PARTNER,
];

export const STAFF_ROLES: Role[] = [Role.ORGANIZER, Role.SUPER_ADMIN];
