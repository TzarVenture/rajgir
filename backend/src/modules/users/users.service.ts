import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { SELF_SIGNUP_ROLES } from '../../common/constants/roles';

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
   * Save the role the signed-in user chose.
   * Rules: self-signup roles only; one role per account; changeable until a registration is submitted.
   */
  async setOwnRole(userId: string, requestedRole: Role): Promise<User> {
    if (!SELF_SIGNUP_ROLES.includes(requestedRole)) {
      throw new BadRequestException('This role cannot be selected.');
    }

    const user = await this.getUserById(userId);

    if (user.role && user.role !== requestedRole) {
      const hasSubmittedRegistration = Boolean(
        user.runnerRegistration ||
          user.volunteer ||
          user.influencer ||
          user.teamProfile ||
          user.corporateProfile ||
          user.schoolProfile ||
          user.sponsorProfile ||
          user.vendorProfile ||
          user.tourismProfile,
      );
      if (hasSubmittedRegistration) {
        throw new BadRequestException(
          `This account is already registered as ${user.role.replace(/_/g, ' ').toLowerCase()} and cannot be changed. Please use a separate account for a different role.`,
        );
      }
    }

    const updated = await this.prisma.user.update({ where: { id: userId }, data: { role: requestedRole } });
    this.logger.log(`User ${user.email} chose role ${requestedRole}`);
    return updated;
  }
}
