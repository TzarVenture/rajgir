import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService, normalizeEmail, normalizeMobile, toPublicUser } from '../users/users.service';
import type { ChangePasswordDto, DeleteAccountDto, LoginDto, ResetPasswordDto, SignupDto, VerifyEmailDto } from './dto/auth.dto';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds when the access token expires. */
  expiresAt: number;
}

const GENERIC_LOGIN_ERROR = 'Incorrect email/mobile or password.';
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

  private async loadOrCreateUser(authUser: SupabaseAuthUser) {
    const email = normalizeEmail(authUser.email ?? '');
    const found = await this.prisma.user.findFirst({
      where: { OR: [{ supabaseAuthId: authUser.id }, { email }] },
    });
    return found ?? this.users.createFromAuthUser(authUser);
  }

  async signup(dto: SignupDto) {
    const email = normalizeEmail(dto.email);
    const mobile = normalizeMobile(dto.mobile);
    if (!mobile) throw new BadRequestException('Enter a valid 10-digit mobile number.');

    const [byEmail, byPhone] = await Promise.all([this.users.findByEmail(email), this.users.findByPhone(mobile)]);
    if (byEmail) throw new ConflictException('An account with this email already exists. Try signing in instead.');
    if (byPhone) throw new ConflictException('This mobile number is already linked to another account.');

    const { data, error } = await this.supabase.anon.auth.signUp({
      email,
      password: dto.password,
      options: {
        data: { full_name: dto.name.trim(), phone: mobile },
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
        fullName: dto.name,
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
      if (!byPhone) throw new UnauthorizedException(GENERIC_LOGIN_ERROR);
      email = byPhone.email;
    }

    const { data, error } = await this.supabase.anon.auth.signInWithPassword({ email, password: dto.password });

    if (error || !data.session || !data.user) {
      if (error?.code === 'email_not_confirmed') {
        throw new ForbiddenException({ code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email to continue.', email });
      }
      throw new UnauthorizedException(GENERIC_LOGIN_ERROR);
    }

    const dbUser = await this.loadOrCreateUser(data.user);
    if (dbUser.status === 'SUSPENDED') {
      throw new ForbiddenException({ code: 'ACCOUNT_SUSPENDED', message: 'This account is suspended. Please contact support.' });
    }

    return { session: toSession(data.session), user: toPublicUser(dbUser, Boolean(data.user.email_confirmed_at)) };
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabase.anon.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) throw new UnauthorizedException('Your session has expired. Please sign in again.');
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

    const dbUser = await this.loadOrCreateUser(data.user);
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
    if (dto.currentPassword) {
      const { error: verifyErr } = await this.supabase.anon.auth.signInWithPassword({
        email: user.email,
        password: dto.currentPassword,
      });
      if (verifyErr) {
        throw new BadRequestException('Current password is incorrect.');
      }
    }

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
}
