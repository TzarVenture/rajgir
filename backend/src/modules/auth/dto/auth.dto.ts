import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength, ValidateIf } from 'class-validator';

const PASSWORD_RULE = 'Password must be 8 to 72 characters long.';

export class SignupDto {
  @ApiProperty({ example: 'Rahul', maxLength: 64 })
  @ValidateIf((o: SignupDto) => !o.name)
  @IsString()
  @Length(1, 64, { message: 'Enter your first name (up to 64 characters).' })
  firstName: string;

  @ApiProperty({ example: 'Verma', maxLength: 64 })
  @ValidateIf((o: SignupDto) => !o.name)
  @IsString()
  @Length(1, 64, { message: 'Enter your last name (up to 64 characters).' })
  lastName: string;

  /**
   * Deprecated: single full name from older clients, split on the server (first word / the rest).
   * Ignored when firstName and lastName are sent. Kept so a client mid-deploy keeps working.
   */
  @ApiPropertyOptional({ deprecated: true, example: 'Rahul Verma' })
  @IsOptional()
  @IsString()
  @Length(2, 128, { message: 'Enter your full name.' })
  name?: string;

  @ApiProperty({ example: 'rahul@example.com' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(128)
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @MaxLength(20)
  mobile: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: PASSWORD_RULE })
  @MaxLength(72, { message: PASSWORD_RULE })
  password: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email address or 10-digit mobile number', example: 'rahul@example.com' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  identifier: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  refreshToken: string;
}

export class EmailDto {
  @ApiProperty({ example: 'rahul@example.com' })
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(128)
  email: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'token_hash from the email link' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  tokenHash: string;

  @ApiProperty({ enum: ['signup', 'email'] })
  @IsIn(['signup', 'email'])
  type: 'signup' | 'email';
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'token_hash from the reset-password email link' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  tokenHash: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: PASSWORD_RULE })
  @MaxLength(72, { message: PASSWORD_RULE })
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password (re-authentication is required to change it)' })
  @IsString()
  @IsNotEmpty({ message: 'Enter your current password.' })
  @MaxLength(72)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: PASSWORD_RULE })
  @MaxLength(72, { message: PASSWORD_RULE })
  newPassword: string;
}

export class DeleteAccountDto {
  @ApiPropertyOptional({ description: 'Current password confirmation' })
  @IsOptional()
  @IsString()
  password?: string;
}
