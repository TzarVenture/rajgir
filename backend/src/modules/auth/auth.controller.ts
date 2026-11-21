import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { requireEmailVerification, toPublicUser } from '../users/users.service';
import { AuthService } from './auth.service';
import { ChangePasswordDto, EmailDto, LoginDto, RefreshDto, ResetPasswordDto, SignupDto, VerifyEmailDto } from './dto/auth.dto';

const perMinute = (limit: number) => ({ default: { limit, ttl: 60_000 } });

/**
 * Authentication endpoints. The global SupabaseAuthGuard protects every route here unless it is
 * marked @Public(): only the steps that happen before a session exists are public.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Public auth settings the UI adapts to' })
  config() {
    return { requireEmailVerification: requireEmailVerification() };
  }

  @Public()
  @Post('signup')
  @Throttle(perMinute(5))
  @ApiOperation({ summary: 'Create an account (email verification is sent)' })
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle(perMinute(10))
  @ApiOperation({ summary: 'Sign in with email or 10-digit mobile + password' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle(perMinute(60))
  @ApiOperation({ summary: 'Exchange a refresh token for a new session' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out and revoke the session' })
  logout(@CurrentUser() auth: AuthContext) {
    return this.auth.logout(auth.accessToken);
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle(perMinute(3))
  @ApiOperation({ summary: 'Resend the email verification link' })
  resend(@Body() dto: EmailDto) {
    return this.auth.resendVerification(dto.email);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle(perMinute(20))
  @ApiOperation({ summary: 'Confirm email using the token from the link; returns a session' })
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(perMinute(3))
  @ApiOperation({ summary: 'Email a password reset link (always replies the same)' })
  forgot(@Body() dto: EmailDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle(perMinute(10))
  @ApiOperation({ summary: 'Set a new password using the token from the reset email' })
  reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current signed-in user' })
  me(@CurrentUser() auth: AuthContext) {
    return toPublicUser(auth.dbUser, Boolean(auth.authUser.email_confirmed_at));
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Throttle(perMinute(5))
  @ApiOperation({ summary: 'Change the password (current password required); signs out other devices' })
  changePassword(@CurrentUser() auth: AuthContext, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(auth.dbUser, auth.accessToken, dto);
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Throttle(perMinute(3))
  @ApiOperation({ summary: 'Delete account and cancel all registrations' })
  deleteAccount(@CurrentUser() auth: AuthContext) {
    return this.auth.deleteAccount(auth.dbUser.id, auth.dbUser.supabaseAuthId);
  }
}
