import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRunnerDto {
  @ApiProperty({ example: '21.1 KM' })
  @IsString()
  @IsNotEmpty()
  categoryDistance: string;

  @ApiProperty({ example: 'Rahul' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Kumar' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'rahul.kumar@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '1995-08-15' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: 'B+' })
  @IsString()
  @IsNotEmpty()
  bloodGroup: string;

  @ApiProperty({ example: 'L' })
  @IsString()
  @IsNotEmpty()
  tshirtSize: string;

  @ApiProperty({ example: 'RAHUL K' })
  @IsString()
  @IsNotEmpty()
  bibName: string;

  @ApiProperty({ example: 'Ramesh Kumar' })
  @IsString()
  @IsNotEmpty()
  emergencyName: string;

  @ApiProperty({ example: 'Father' })
  @IsString()
  @IsNotEmpty()
  emergencyRelation: string;

  @ApiProperty({ example: '9876543211' })
  @IsString()
  @IsNotEmpty()
  emergencyPhone: string;

  @ApiPropertyOptional({ example: 'None' })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @ApiProperty({ example: 'Patna' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Bihar' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '800001' })
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @ApiPropertyOptional({ example: 'India', default: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Patna Striders' })
  @IsOptional()
  @IsString()
  runningClub?: string;

  @ApiPropertyOptional({ example: ['medal_engraving', 'breakfast'] })
  @IsOptional()
  @IsArray()
  selectedAddons?: string[];

  @ApiPropertyOptional({ example: 'EARLY2027' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    example: '01:55',
    description: 'Expected finish time HH:MM (timed categories only); used to seed start waves.',
  })
  @IsOptional()
  @Matches(/^\d{1,2}:[0-5]\d$/, { message: 'Expected finish time must look like HH:MM' })
  estimatedFinishTime?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  waiverAgreed: boolean;
}

