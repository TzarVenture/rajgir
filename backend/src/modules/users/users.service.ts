import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AccountStatus, Prisma, Role, User } from '@prisma/client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
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
  firstName: string;
  lastName: string;
  /** Derived from firstName + lastName (not stored). */
  fullName: string;
  email: string;
  phone: string | null;
  role: Role | null;
  status: User['status'];
  emailVerified: boolean;
}

/** Identity fields every role profile is read together with. Name, email and mobile live only on User. */
export interface UserIdentity {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
}

/** Display name derived from the stored name parts. */
export function displayName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return [user.firstName, user.lastName].map((part) => part?.trim()).filter(Boolean).join(' ');
}

export function identityOf(user: Pick<User, 'firstName' | 'lastName' | 'email' | 'phone'>): UserIdentity {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: displayName(user),
    email: user.email ?? '',
    phone: user.phone,
  };
}

/** Prisma select for the identity columns, for `include: { user: { select: IDENTITY_SELECT } }`. */
export const IDENTITY_SELECT = { firstName: true, lastName: true, email: true, phone: true } satisfies Prisma.UserSelect;

type IdentityRow = Prisma.UserGetPayload<{ select: typeof IDENTITY_SELECT }>;

/**
 * Flattens a profile row read with its user into one response object (profile fields + identity),
 * so API consumers keep receiving firstName / lastName / fullName / email / phone next to the profile.
 */
export function withIdentity<T extends { user: IdentityRow }>(row: T): Omit<T, 'user'> & UserIdentity {
  const { user, ...rest } = row;
  return { ...rest, ...identityOf(user) };
}

/** Collapses inner whitespace and trims a name part. */
export function cleanNamePart(value: string): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
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
    ...identityOf(user),
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabase: SupabaseService,
  ) {}

  /**
   * Atomically create the user account and their role profile in a single database transaction.
   * Supabase auth is created first; if the database transaction fails, Supabase auth is rolled back.
   * If the user never submits their final registration wizard, ZERO database rows are created.
   */
  async createAccountAndRoleProfile<T>(
    account: { email: string; mobile: string; firstName: string; lastName: string; password?: string; role?: Role },
    createProfileFn: (tx: Prisma.TransactionClient, user: User) => Promise<T>,
  ): Promise<{ user: User; profile: T; session: { accessToken: string; refreshToken: string; expiresAt: number } | null }> {
    const email = normalizeEmail(account.email);
    const mobile = normalizeMobile(account.mobile);
    if (!mobile) throw new BadRequestException('Enter a valid 10-digit mobile number.');
    const firstName = cleanNamePart(account.firstName);
    const lastName = cleanNamePart(account.lastName);
    if (!firstName || !lastName) throw new BadRequestException('Enter your first and last name.');

    const [byEmail, byPhone] = await Promise.all([this.findByEmail(email), this.findByPhone(mobile)]);
    if (byEmail) throw new ConflictException('An account with this email already exists. Try signing in instead.');
    if (byPhone) throw new ConflictException('This mobile number is already linked to another account.');

    let supabaseAuthId = '';
    let session = null;

    if (account.password) {
      const { data, error } = await this.supabase.anon.auth.signUp({
        email,
        password: account.password,
        options: {
          data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, phone: mobile },
        },
      });

      if (error) {
        if (error.code === 'weak_password') throw new BadRequestException(error.message);
        throw new BadRequestException('We could not create your account. Please check your details.');
      }

      if (!data.user || data.user.identities?.length === 0) {
        throw new ConflictException('An account with this email already exists. Try signing in instead.');
      }

      supabaseAuthId = data.user.id;
      if (data.session) {
        session = {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at ?? Math.floor(Date.now() / 1000) + data.session.expires_in,
        };
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            firstName,
            lastName,
            email,
            phone: mobile,
            supabaseAuthId,
            role: account.role || null,
            status: 'ACTIVE',
          },
        });

        const profile = await createProfileFn(tx, user);
        return { user, profile };
      });

      return { ...result, session };
    } catch (err) {
      if (supabaseAuthId) {
        await this.supabase.admin.auth.admin.deleteUser(supabaseAuthId).catch(() => undefined);
      }
      throw err;
    }
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  /**
   * The platform user behind a verified Supabase identity, or null.
   *
   * Never creates a row: the only place a user row is created is sign-up. If the row was deleted
   * (account removed), a still-valid Supabase token must NOT bring the account back.
   *
   * Matching by email is kept for rows created before supabase_auth_id was recorded; such a row is
   * linked on first sight, but only to an identity that has proven it owns the email
   * (email_confirmed_at set). A row already linked to a different Supabase identity never matches.
   */
  async findForAuthUser(authUser: SupabaseAuthUser): Promise<User | null> {
    const email = authUser.email_confirmed_at ? normalizeEmail(authUser.email ?? '') : '';
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ supabaseAuthId: authUser.id }, ...(email ? [{ email }] : [])] },
    });
    if (!user) return null;
    if (user.supabaseAuthId === authUser.id) return user;
    if (user.supabaseAuthId) return null; // email matches but belongs to another identity
    return this.prisma.user.update({ where: { id: user.id }, data: { supabaseAuthId: authUser.id } });
  }

  /** Create the user row during sign-up (after duplicate checks). */
  async createForSignup(input: { email: string; phone: string; firstName: string; lastName: string; supabaseAuthId: string }) {
    try {
      return await this.prisma.user.create({
        data: {
          firstName: cleanNamePart(input.firstName),
          lastName: cleanNamePart(input.lastName),
          email: normalizeEmail(input.email),
          phone: input.phone,
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

  async getUserById(id: string, client: Prisma.TransactionClient = this.prisma) {
    const user = await client.user.findUnique({ where: { id }, include: PROFILE_INCLUDE });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Which registration (if any) this account has submitted.
   * The role is only ever set by submitting a registration, so the profile tables are the source of truth.
   *
   * `user` carries the identity, which is stored only on the users table. The same identity fields are
   * also merged into `profile` so existing readers of profile.fullName / firstName / email keep working.
   */
  async getRegistration(
    userId: string,
  ): Promise<{ role: Role; status: string; profile: Record<string, unknown>; user: UserIdentity } | null> {
    const user = await this.getUserById(userId);
    const identity = identityOf(user);
    for (const [role, key] of Object.entries(PROFILE_FOR_ROLE) as [Role, ProfileKey][]) {
      const profile = user[key] as Record<string, unknown> | null;
      if (profile) {
        const profileStatus = (profile.status ?? profile.paymentStatus ?? "submitted") as string;
        return { role, status: String(profileStatus), profile: { ...profile, ...identity }, user: identity };
      }
    }
    return null;
  }

  /**
   * Creates a role profile for the signed-in user and elevates their role/status, atomically.
   *
   * In one transaction: re-check eligibility (one registration per account, not staff, not suspended),
   * create the child profile via `create` (which must use the given tx and `userId`), then set
   * users.role / users.status. Any failure rolls everything back, so there is never a profile without
   * the matching role, or a role without its profile. A concurrent duplicate submit fails on the
   * unique user_id and surfaces as Prisma P2002 to the caller.
   */
  async createRoleProfile<T>(
    userId: string,
    role: Role,
    status: AccountStatus,
    create: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<{ profile: T; user: User }> {
    return this.prisma.$transaction(async (tx) => {
      await this.assertCanRegister(userId, role, tx);
      const profile = await create(tx);
      const user = await tx.user.update({ where: { id: userId }, data: { role, status } });
      return { profile, user };
    });
  }

  /**
   * Update the account's own identity (name, mobile). The only place these are written after sign-up.
   * A mobile already used by another account is rejected.
   */
  async updateIdentity(
    userId: string,
    input: { firstName?: string; lastName?: string; phone?: string },
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<User> {
    const data: Prisma.UserUpdateInput = {};
    if (input.firstName !== undefined) data.firstName = cleanNamePart(input.firstName);
    if (input.lastName !== undefined) data.lastName = cleanNamePart(input.lastName);
    if (input.phone !== undefined) {
      const phone = normalizeMobile(input.phone);
      if (!phone) throw new BadRequestException('Enter a valid 10-digit mobile number.');
      data.phone = phone;
    }
    try {
      return await client.user.update({ where: { id: userId }, data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('This mobile number is already linked to another account.');
      }
      throw err;
    }
  }

  /**
   * One registration per account. Called inside createRoleProfile's transaction.
   * Returns the user when they are free to register as `role`.
   */
  async assertCanRegister(userId: string, role: Role, client: Prisma.TransactionClient = this.prisma): Promise<User> {
    const user = await this.getUserById(userId, client);

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
