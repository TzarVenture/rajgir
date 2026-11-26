import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class AddManagedRunnerDto {
  @ApiProperty({ example: 'Aarav' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  firstName: string;

  @ApiProperty({ example: 'Kumar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lastName: string;

  @ApiPropertyOptional({ example: 'aarav.kumar@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(128)
  email?: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ example: '10 KM' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  categoryDistance: string;

  @ApiProperty({ example: '2006-05-12' })
  @IsString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  gender: string;

  @ApiProperty({ example: 'O+' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  bloodGroup: string;

  @ApiProperty({ example: 'M' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  tshirtSize: string;

  @ApiPropertyOptional({ example: 'AARAV K' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  bibName?: string;

  @ApiProperty({ example: 'Sunita Devi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  emergencyName: string;

  @ApiPropertyOptional({ example: 'Parent / Guardian' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  emergencyRelation?: string;

  @ApiProperty({ example: '9876543211' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  emergencyPhone: string;

  @ApiPropertyOptional({ example: 'None' })
  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @ApiPropertyOptional({ example: 'Rajgir' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  city?: string;

  @ApiPropertyOptional({ example: 'Bihar' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  state?: string;

  @ApiPropertyOptional({ example: '803116' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  pincode?: string;
}

export class BulkAddManagedRunnersDto {
  @ApiProperty({ type: [AddManagedRunnerDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => AddManagedRunnerDto)
  runners: AddManagedRunnerDto[];
}

export class SubmitQuotaAppealDto {
  @ApiProperty({ example: 120 })
  @IsInt()
  @Min(51)
  @Max(5000)
  requestedQuota: number;

  @ApiProperty({ example: 'Our school has 120 high-school students participating in the 5K and 10K.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}

export class UpdateGroupProfileDto {
  @ApiProperty({ example: 'Rahul' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  firstName: string;

  @ApiProperty({ example: 'Verma' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lastName: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Patna Striders' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  organizationName?: string;

  @ApiPropertyOptional({ example: 'Rajgir' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  city?: string;

  @ApiPropertyOptional({ example: 'Notes or CSR focus' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  gstin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  billingAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  teacherInCharge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  teacherDesignation?: string;
}

export class UpdatePartnerProfileDto {
  @ApiProperty({ example: 'Anita' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  firstName: string;

  @ApiProperty({ example: 'Singh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  lastName: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Nalanda Heritage Resort' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  businessName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  brandWebsite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  proposalDeliverables?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  fssaiNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  electricPowerRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  distanceFromStartLine?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  inventoryCapacity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(128)
  discountOffering?: string;
}
