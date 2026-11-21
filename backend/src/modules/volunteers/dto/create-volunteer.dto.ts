import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SignupAccountDto } from '../../runners/dto/create-runner.dto';

export class CreateVolunteerDto {
  // Name, email and mobile are not accepted here: they come from the signed-in account (users table).

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

export class RegisterVolunteerWithAccountDto {
  @ApiProperty({ type: () => SignupAccountDto })
  @ValidateNested()
  @Type(() => SignupAccountDto)
  account: SignupAccountDto;

  @ApiProperty({ type: () => CreateVolunteerDto })
  @ValidateNested()
  @Type(() => CreateVolunteerDto)
  registration: CreateVolunteerDto;
}

