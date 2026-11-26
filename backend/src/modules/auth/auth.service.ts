import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService, isTransientAuthError } from '../supabase/supabase.service';
import { UsersService, cleanNamePart, normalizeEmail, normalizeMobile, toPublicUser } from '../users/users.service';
import { Role } from '@prisma/client';
import type { AdminSetupDto, ChangePasswordDto, DeleteAccountDto, LoginDto, ResetPasswordDto, SignupDto, VerifyEmailDto } from './dto/auth.dto';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds when the access token expires. */
  expiresAt: number;
}

const GENERIC_LOGIN_ERROR = 'Incorrect email/mobile or password.';
const AUTH_UNAVAILABLE = { code: 'AUTH_UNAVAILABLE', message: 'Sign-in service is temporarily unavailable. Please try again in a moment.' };
const LINK_ERROR = 'This link is invalid or has expired. Please request a new one.';

function toSession(session: Session): SessionTokens {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? Math.floor(Date.now() / 1000) + session.expires_in,
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get frontendUrl(): string {
    return (this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000').replace(/\/$/, '');
  }

  /**
   * The platform user for a just-verified Supabase identity. Never creates one (only sign-up does):
   * if the row was removed, the new Supabase session is revoked and the request is refused.
   */
  private async requireUser(authUser: SupabaseAuthUser, accessToken: string) {
    const dbUser = await this.users.findForAuthUser(authUser);
    if (!dbUser) {
      await this.supabase.revokeSession(accessToken, 'local').catch(() => undefined);
      throw new UnauthorizedException({ code: 'ACCOUNT_NOT_FOUND', message: 'Account no longer exists' });
    }
    return dbUser;
  }

  async signup(dto: SignupDto) {
    const email = normalizeEmail(dto.email);
    const mobile = normalizeMobile(dto.mobile);
    if (!mobile) throw new BadRequestException('Enter a valid 10-digit mobile number.');
    // Older clients send one `name`: split it as first word / rest.
    const legacy = dto.firstName || dto.lastName ? null : cleanNamePart(dto.name ?? '');
    const firstName = cleanNamePart(dto.firstName ?? (legacy ? legacy.split(' ')[0] : ''));
    const lastName = cleanNamePart(dto.lastName ?? (legacy ? legacy.split(' ').slice(1).join(' ') : ''));
    if (!firstName || !lastName) throw new BadRequestException('Enter your first and last name.');
    if (firstName.length > 64 || lastName.length > 64) throw new BadRequestException('Names can be at most 64 characters.');

    const [byEmail, byPhone] = await Promise.all([this.users.findByEmail(email), this.users.findByPhone(mobile)]);
    if (byEmail) throw new ConflictException('An account with this email already exists. Try signing in instead.');
    if (byPhone) throw new ConflictException('This mobile number is already linked to another account.');

    const { data, error } = await this.supabase.anon.auth.signUp({
      email,
      password: dto.password,
      options: {
        data: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, phone: mobile },
        emailRedirectTo: `${this.frontendUrl}/auth/callback`,
      },
    });

    if (error) {
      if (error.code === 'weak_password') throw new BadRequestException(error.message);
      if (error.code === 'email_address_invalid') {
        throw new BadRequestException('Enter a valid email address that can receive mail.');
      }
      if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
        throw new HttpException('Too many emails were requested. Please wait a few minutes and try again.', HttpStatus.TOO_MANY_REQUESTS);
      }
      this.logger.warn(`signUp failed: ${error.code ?? error.message}`);
      throw new BadRequestException('We could not create your account. Please check your details and try again.');
    }

    // Supabase hides duplicates by returning a user with no identities.
    if (!data.user || data.user.identities?.length === 0) {
      throw new ConflictException('An account with this email already exists. Try signing in instead.');
    }

    let dbUser;
    try {
      dbUser = await this.users.createForSignup({
        email,
        phone: mobile,
        firstName,
        lastName,
        supabaseAuthId: data.user.id,
      });
    } catch (err) {
      await this.supabase.admin.auth.admin.deleteUser(data.user.id).catch(() => undefined);
      throw err;
    }

    const verified = Boolean(data.user.email_confirmed_at);
    return {
      needsVerification: !data.session,
      email,
      session: data.session ? toSession(data.session) : null,
      user: toPublicUser(dbUser, verified),
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.trim();
    let email: string;

    if (identifier.includes('@')) {
      email = normalizeEmail(identifier);
    } else {
      const mobile = normalizeMobile(identifier);
      const byPhone = mobile ? await this.users.findByPhone(mobile) : null;
      if (!byPhone || !byPhone.email) throw new UnauthorizedException(GENERIC_LOGIN_ERROR);
      email = byPhone.email;
    }

    const { data, error } = await this.supabase.anon.auth.signInWithPassword({ email, password: dto.password });

    if (isTransientAuthError(error)) throw new ServiceUnavailableException(AUTH_UNAVAILABLE);
    if (error || !data.session || !data.user) {
      if (error?.code === 'email_not_confirmed') {
        throw new ForbiddenException({ code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email to continue.', email });
      }
      throw new UnauthorizedException(GENERIC_LOGIN_ERROR);
    }

    const dbUser = await this.requireUser(data.user, data.session.access_token);
    if (dbUser.status === 'SUSPENDED') {
      await this.supabase.revokeSession(data.session.access_token, 'local').catch(() => undefined);
      throw new ForbiddenException({ code: 'ACCOUNT_SUSPENDED', message: 'This account is suspended. Please contact support.' });
    }

    return { session: toSession(data.session), user: toPublicUser(dbUser, Boolean(data.user.email_confirmed_at)) };
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabase.anon.auth.refreshSession({ refresh_token: refreshToken });
    if (isTransientAuthError(error)) {
      // Keep the session: the frontend only clears its cookie on 401.
      throw new ServiceUnavailableException(AUTH_UNAVAILABLE);
    }
    if (error || !data.session) {
      throw new UnauthorizedException({ code: 'SESSION_EXPIRED', message: 'Your session has expired. Please sign in again.' });
    }
    return { session: toSession(data.session) };
  }

  async logout(accessToken: string) {
    await this.supabase.revokeSession(accessToken, 'local');
    return { success: true };
  }

  async resendVerification(rawEmail: string) {
    const email = normalizeEmail(rawEmail);
    const { error } = await this.supabase.anon.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${this.frontendUrl}/auth/callback` },
    });
    if (error) {
      if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
        throw new HttpException('Please wait a minute before requesting another email.', HttpStatus.TOO_MANY_REQUESTS);
      }
      this.logger.warn(`resend failed: ${error.code ?? error.message}`);
    }
    // Same answer whether or not the account exists.
    return { success: true };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const { data, error } = await this.supabase.anon.auth.verifyOtp({ token_hash: dto.tokenHash, type: dto.type });
    if (error || !data.session || !data.user) throw new BadRequestException(LINK_ERROR);

    const dbUser = await this.requireUser(data.user, data.session.access_token);
    return { session: toSession(data.session), user: toPublicUser(dbUser, Boolean(data.user.email_confirmed_at)) };
  }

  async forgotPassword(rawEmail: string) {
    const email = normalizeEmail(rawEmail);
    const { error } = await this.supabase.anon.auth.resetPasswordForEmail(email, {
      redirectTo: `${this.frontendUrl}/auth/callback`,
    });
    if (error) {
      if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
        throw new HttpException('Please wait a minute before requesting another email.', HttpStatus.TOO_MANY_REQUESTS);
      }
      this.logger.warn(`forgotPassword failed: ${error.code ?? error.message}`);
    }
    // Always the same answer so nobody can discover which emails have accounts.
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { data, error } = await this.supabase.anon.auth.verifyOtp({ token_hash: dto.tokenHash, type: 'recovery' });
    if (error || !data.user || !data.session) throw new BadRequestException(LINK_ERROR);

    // Update the password as the user themselves (works without the service-role key).
    const { error: updateError } = await this.supabase.userClient(data.session.access_token).auth.updateUser({
      password: dto.password,
    });
    if (updateError) {
      if (updateError.code === 'weak_password' || updateError.code === 'same_password') {
        throw new BadRequestException(updateError.message);
      }
      this.logger.error(`resetPassword update failed: ${updateError.code ?? updateError.message}`);
      throw new BadRequestException('We could not update your password. Please try again.');
    }

    // Sign out everywhere so an old (possibly stolen) session cannot keep access.
    await this.supabase.revokeSession(data.session.access_token, 'global');
    return { success: true };
  }

  async changePassword(
    user: { id: string; email: string; supabaseAuthId: string | null },
    accessToken: string,
    dto: ChangePasswordDto,
  ) {
    // Re-authenticate: a stolen or unattended session alone must not be enough to take over the account.
    const { data: verified, error: verifyErr } = await this.supabase.anon.auth.signInWithPassword({
      email: user.email,
      password: dto.currentPassword,
    });
    if (isTransientAuthError(verifyErr)) throw new ServiceUnavailableException(AUTH_UNAVAILABLE);
    if (verifyErr || !verified.session) {
      throw new BadRequestException({ code: 'INVALID_CURRENT_PASSWORD', message: 'Current password is incorrect.' });
    }
    // The check above opened a session of its own; close it straight away.
    await this.supabase.revokeSession(verified.session.access_token, 'local');

    const { error: updateError } = await this.supabase.userClient(accessToken).auth.updateUser({
      password: dto.newPassword,
    });
    if (updateError) {
      if (updateError.code === 'weak_password' || updateError.code === 'same_password') {
        throw new BadRequestException(updateError.message);
      }
      this.logger.error(`changePassword update failed: ${updateError.code ?? updateError.message}`);
      throw new BadRequestException('We could not update your password. Please try again.');
    }

    // Sign out every other device; the session that made the change stays signed in.
    await this.supabase.revokeSession(accessToken, 'others');
    return { success: true };
  }

  async deleteAccount(userId: string, supabaseAuthId: string | null) {
    await this.prisma.$transaction(async (tx) => {
      // Delete runner race results and registration
      const runner = await tx.runnerRegistration.findUnique({ where: { userId } });
      if (runner) {
        await tx.raceResult.deleteMany({ where: { registrationId: runner.id } });
        await tx.runnerRegistration.delete({ where: { userId } });
      }
      // Delete volunteer records if any
      const vol = await tx.volunteer.findUnique({ where: { userId } });
      if (vol) {
        await tx.volunteerAttendance.deleteMany({ where: { volunteerId: vol.id } });
        await tx.incident.deleteMany({ where: { volunteerId: vol.id } });
        await tx.volunteer.delete({ where: { userId } });
      }
      // Delete other role profiles
      await tx.influencer.deleteMany({ where: { userId } });
      await tx.teamProfile.deleteMany({ where: { userId } });
      await tx.corporateProfile.deleteMany({ where: { userId } });
      await tx.schoolProfile.deleteMany({ where: { userId } });
      await tx.sponsorProfile.deleteMany({ where: { userId } });
      await tx.vendorProfile.deleteMany({ where: { userId } });
      await tx.tourismProfile.deleteMany({ where: { userId } });
      await tx.adminProfile.deleteMany({ where: { userId } });
      await tx.superAdminProfile.deleteMany({ where: { userId } });
      // Delete user
      await tx.user.delete({ where: { id: userId } });
    });

    if (supabaseAuthId) {
      await this.supabase.admin.auth.admin.deleteUser(supabaseAuthId).catch((err) => {
        this.logger.warn(`Could not delete Supabase auth user ${supabaseAuthId}: ${err?.message}`);
      });
    }

    this.logger.log(`User ${userId} deleted their account`);
    return { success: true };
  }

  /**
   * Env-gated admin registration for testing/bootstrap.
   * Requires ADMIN_SETUP_KEY in backend .env; fails closed when unset or mismatched.
   */
  async adminSetup(dto: AdminSetupDto) {
    const expected = process.env.ADMIN_SETUP_KEY?.trim();
    if (!expected || dto.setupKey.trim() !== expected) {
      throw new ForbiddenException('Invalid or disabled admin setup key.');
    }

    const { user, session } = await this.users.createAccountAndRoleProfile(
      {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        mobile: dto.mobile,
        password: dto.password,
        role: Role.ORGANIZER,
      },
      async (tx, createdUser) =>
        tx.adminProfile.create({
          data: { userId: createdUser.id },
        }),
    );

    this.logger.log(`Admin account created via /admin-setup: ${user.email}`);
    return {
      needsVerification: !session,
      email: user.email ?? dto.email,
      session,
      user: toPublicUser(user, true),
    };
  }
}
