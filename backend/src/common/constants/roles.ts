import { Role } from '@prisma/client';

export const STAFF_ROLES: Role[] = [Role.ORGANIZER, Role.SUPER_ADMIN];

/** Plain-language names used in messages. */
export const ROLE_LABELS: Record<Role, string> = {
  RUNNER: 'a runner',
  VOLUNTEER: 'a volunteer',
  INFLUENCER: 'an influencer',
  TEAM_CAPTAIN: 'a team captain',
  CORPORATE_MANAGER: 'a company',
  SCHOOL_COORDINATOR: 'a school or college',
  SPONSOR: 'a sponsor',
  VENDOR: 'an expo or food stall',
  TOURISM_PARTNER: 'a hotel or tourism partner',
  ORGANIZER: 'an organizer',
  SUPER_ADMIN: 'an administrator',
};
