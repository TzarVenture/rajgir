import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVolunteerDto {
  @ApiPropertyOptional({ example: 'usr-uuid-here' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: 'Aarav Sharma' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'aarav@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'L' })
  @IsString()
  @IsNotEmpty()
  tShirtSize: string;

  @ApiProperty({ example: 'Sunita Sharma' })
  @IsString()
  @IsNotEmpty()
  emergencyContactName: string;

  @ApiProperty({ example: '9876543211' })
  @IsString()
  @IsNotEmpty()
  emergencyContactPhone: string;

  @ApiPropertyOptional({ example: ['Pre-Event Expo', 'Race Day Morning'] })
  @IsOptional()
  @IsArray()
  availability?: string[];

  @ApiProperty({ example: 'Hydration Station' })
  @IsString()
  @IsNotEmpty()
  rolePreference: string;

  @ApiPropertyOptional({ example: 'Hindi, English' })
  @IsOptional()
  @IsString()
  languagesSpoken?: string;

  @ApiPropertyOptional({ example: 'Vegetarian' })
  @IsOptional()
  @IsString()
  dietaryRestrictions?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  medicalCertification?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  waiverAgreed: boolean;
}

