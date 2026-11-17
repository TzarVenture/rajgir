import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLE_LABELS, STAFF_ROLES } from '../../common/constants/roles';

const PROFILE_INCLUDE = {
  runnerRegistration: true,
  volunteer: true,
  influencer: true,
  teamProfile: true,
  corporateProfile: true,
  schoolProfile: true,
  sponsorProfile: true,
  vendorProfile: true,
  tourismProfile: true,
} satisfies Prisma.UserInclude;

type ProfileKey = keyof typeof PROFILE_INCLUDE;

/** Which user relation holds the registration for each role. */
const PROFILE_FOR_ROLE: Record<string, ProfileKey> = {
  RUNNER: "runnerRegistration",
  VOLUNTEER: "volunteer",
  INFLUENCER: "influencer",
  TEAM_CAPTAIN: "teamProfile",
  CORPORATE_MANAGER: "corporateProfile",
  SCHOOL_COORDINATOR: "schoolProfile",
  SPONSOR: "sponsorProfile",
  VENDOR: "vendorProfile",
  TOURISM_PARTNER: "tourismProfile",
};

/** Prisma delegate name for each relation (used when withdrawing). */
const DELEGATE_FOR_KEY: Record<ProfileKey, string> = {
  runnerRegistration: "runnerRegistration",
  volunteer: "volunteer",
  influencer: "influencer",
  teamProfile: "teamProfile",
  corporateProfile: "corporateProfile",
  schoolProfile: "schoolProfile",
  sponsorProfile: "sponsorProfile",
  vendorProfile: "vendorProfile",
  tourismProfile: "tourismProfile",
};

/** Registrations that wait for organizer review and can be withdrawn while pending. */
const WITHDRAWABLE_ROLES: Role[] = [
  Role.VOLUNTEER,
  Role.INFLUENCER,
  Role.CORPORATE_MANAGER,
  Role.SCHOOL_COORDINATOR,
  Role.SPONSOR,
  Role.VENDOR,
  Role.TOURISM_PARTNER,
];

/** Safe user shape returned to the frontend. */
export interface PublicUser {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  role: Role | null;
  status: User['status'];
  emailVerified: boolean;
}

/**
 * Email verification is switched off while REQUIRE_EMAIL_VERIFICATION=false.
 * (Also turn off "Confirm email" in the Supabase dashboard.) Defaults to required.
 */
export function requireEmailVerification(): boolean {
  return (process.env.REQUIRE_EMAIL_VERIFICATION ?? 'true').trim().toLowerCase() !== 'false';
}

export function toPublicUser(user: User, emailVerified: boolean): PublicUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    // When verification is not required, nobody is held back by it.
    emailVerified: emailVerified || !requireEmailVerification(),
  };
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Digits only; accepts +91 / 91 / 0 prefixes. Returns the 10-digit number or null if invalid. */
export function normalizeMobile(input: string): string | null {
  let digits = (input ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^\d{10}$/.test(digits) ? digits : null;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  /** Create the platform user row for a Supabase identity (first sign-in, or accounts created before this flow). */
  async createFromAuthUser(authUser: SupabaseAuthUser): Promise<User> {
    const email = normalizeEmail(authUser.email ?? '');
    const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
    const phone = typeof meta.phone === 'string' ? normalizeMobile(meta.phone) : null;
    const fullName = (typeof meta.full_name === 'string' && meta.full_name.trim()) || email.split('@')[0];

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return existing.supabaseAuthId
        ? existing
        : this.prisma.user.update({ where: { id: existing.id }, data: { supabaseAuthId: authUser.id } });
    }

    try {
      return await this.prisma.user.create({
        data: { email, phone, fullName, supabaseAuthId: authUser.id, status: 'PENDING_ONBOARDING' },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        // Mobile already used by another account: create the row without a mobile.
        return this.prisma.user.create({
          data: { email, phone: null, fullName, supabaseAuthId: authUser.id, status: 'PENDING_ONBOARDING' },
        });
      }
      throw err;
    }
  }

  /** Create the user row during sign-up (after duplicate checks). */
  async createForSignup(input: { email: string; phone: string; fullName: string; supabaseAuthId: string }) {
    try {
      return await this.prisma.user.create({
        data: {
          email: normalizeEmail(input.email),
          phone: input.phone,
          fullName: input.fullName.trim(),
          supabaseAuthId: input.supabaseAuthId,
          status: 'PENDING_ONBOARDING',
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('An account with this email or mobile number already exists.');
      }
      throw err;
    }
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: PROFILE_INCLUDE });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Which registration (if any) this account has submitted.
   * The role is only ever set by submitting a registration, so the profile tables are the source of truth.
   */
  async getRegistration(userId: string): Promise<{ role: Role; status: string; profile: Record<string, unknown> } | null> {
    const user = await this.getUserById(userId);
    for (const [role, key] of Object.entries(PROFILE_FOR_ROLE) as [Role, ProfileKey][]) {
      const profile = user[key] as Record<string, unknown> | null;
      if (profile) {
        const profileStatus = (profile.status ?? profile.paymentStatus ?? "submitted") as string;
        return { role, status: String(profileStatus), profile };
      }
    }
    return null;
  }

  /**
   * One registration per account. Call before creating any registration profile.
   * Returns the user when they are free to register as `role`.
   */
  async assertCanRegister(userId: string, role: Role): Promise<User> {
    const user = await this.getUserById(userId);

    if (STAFF_ROLES.includes(user.role as Role)) {
      throw new ForbiddenException("Staff accounts cannot submit event registrations.");
    }
    if (user.status === "SUSPENDED") {
      throw new ForbiddenException("This account is suspended. Please contact support.");
    }

    for (const [existingRole, key] of Object.entries(PROFILE_FOR_ROLE) as [Role, ProfileKey][]) {
      if (user[key]) {
        throw new ConflictException(
          existingRole === role
            ? "You have already submitted this registration."
            : `This account is already registered as ${ROLE_LABELS[existingRole]}. Each account can hold one registration. Use a different account to register as ${ROLE_LABELS[role]}.`,
        );
      }
    }

    return user;
  }

  /**
   * Withdraw a registration that is still waiting for review so the person can register as something else.
   * Not allowed once it is active (runners are confirmed immediately; contact support for changes).
   */
  async withdrawRegistration(userId: string) {
    const registration = await this.getRegistration(userId);
    if (!registration) throw new NotFoundException("You do not have a registration to withdraw.");

    if (!WITHDRAWABLE_ROLES.includes(registration.role) || registration.status !== "pending") {
      throw new ConflictException(
        "This registration can no longer be withdrawn online. Please contact the organizers for changes.",
      );
    }

    const key = PROFILE_FOR_ROLE[registration.role];
    await this.prisma.$transaction(async (tx) => {
      // Every profile delegate exposes the same deleteMany({ where: { userId } }) shape.
      const delegates = tx as unknown as Record<string, { deleteMany(args: { where: { userId: string } }): Promise<unknown> }>;
      await delegates[DELEGATE_FOR_KEY[key]].deleteMany({ where: { userId } });
      await tx.user.update({ where: { id: userId }, data: { role: null, status: "PENDING_ONBOARDING" } });
    });

    this.logger.log(`User ${userId} withdrew their ${registration.role} registration`);
    return { success: true };
  }
}
