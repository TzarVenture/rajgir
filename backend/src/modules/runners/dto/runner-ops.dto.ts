import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BLOOD_GROUPS, RESULT_STATUSES } from '../../../common/constants/event';

/** Runner-editable athlete profile details. */
export class UpdateRunnerProfileDto {
  @ApiProperty({ example: 'Rahul' })
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  firstName: string;

  @ApiProperty({ example: 'Kumar' })
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  lastName: string;

  @ApiProperty({ example: '9876543210' })
  @Matches(/^\d{10}$/, { message: 'Mobile must be 10 digits' })
  phone: string;

  @ApiProperty({ example: 'RAHUL K' })
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  bibName: string;

  @ApiProperty({ example: 'M' })
  @IsIn(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
  tshirtSize: string;

  @ApiProperty({ example: 'Patna' })
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  city: string;

  @ApiProperty({ example: 'Bihar' })
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  state: string;

  @ApiProperty({ example: '800001' })
  @Matches(/^\d{6}$/, { message: 'Pincode must be 6 digits' })
  pincode: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  country?: string;

  @ApiPropertyOptional({ example: 'Patna Striders' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  runningClub?: string;
}

/** Runner-editable medical and emergency details (the dashboard's "Medical & emergency profile"). */
export class UpdateMedicalDto {
  @ApiProperty({ example: 'Ramesh Kumar' })
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  emergencyName: string;

  @ApiProperty({ example: 'Father' })
  @IsString()
  @MinLength(2)
  @MaxLength(32)
  emergencyRelation: string;

  @ApiProperty({ example: '9876543211' })
  @Matches(/^\d{10}$/, { message: 'Emergency mobile must be 10 digits' })
  emergencyPhone: string;

  @ApiProperty({ example: 'B+' })
  @IsIn(BLOOD_GROUPS)
  bloodGroup: string;

  @ApiPropertyOptional({ example: 'Asthma, carries an inhaler' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  medicalNotes?: string;
}

/** Staff: bib number allotment. */
export class AllotBibDto {
  @ApiProperty({ example: '21045' })
  @Matches(/^[A-Z0-9-]{1,12}$/i, { message: 'Bib number may contain letters, digits and dashes (max 12)' })
  bibNumber: string;
}

/** Staff: auto-assign sequential bibs to unassigned runners. */
export class AutoAllotBibsDto {
  @ApiPropertyOptional({ example: '21.1 KM' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  distance?: string;

  @ApiPropertyOptional({ example: 21001 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  startFrom?: number;
}

export class BulkAllotBibItemDto {
  @ApiProperty({ example: 'RJG-2027-211K-5538' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  registrationNumber: string;

  @ApiProperty({ example: '21045' })
  @Matches(/^[A-Z0-9-]{1,12}$/i, { message: 'Bib number may contain letters, digits and dashes (max 12)' })
  bibNumber: string;
}

export class BulkAllotBibsDto {
  @ApiProperty({ type: [BulkAllotBibItemDto] })
  @IsArray()
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => BulkAllotBibItemDto)
  items: BulkAllotBibItemDto[];
}

/** Staff: kit handed over at the expo. */
export class KitCollectedDto {
  @ApiPropertyOptional({ example: 'SELF', description: '"SELF" or the name of the authorised proxy' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  collectedBy?: string;
}

export class SplitDto {
  @ApiProperty({ example: '10K' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  label: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  distanceKm: number;

  @ApiProperty({ example: 3120, description: 'Cumulative chip time in seconds' })
  @IsInt()
  @Min(0)
  elapsedSeconds: number;
}

/** Staff / timing import: publish one runner's result. */
export class UpsertResultDto {
  @ApiProperty({ example: 'FINISHED' })
  @IsIn(RESULT_STATUSES)
  status: string;

  @ApiPropertyOptional({ example: 6420 })
  @IsOptional()
  @IsInt()
  @Min(0)
  gunTimeSeconds?: number;

  @ApiPropertyOptional({ example: 6395 })
  @IsOptional()
  @IsInt()
  @Min(0)
  netTimeSeconds?: number;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) overallRank?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) genderRank?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) categoryRank?: number;

  @ApiPropertyOptional({ example: 'M 30-39' })
  @IsOptional()
  @IsString()
  @MaxLength(24)
  ageCategory?: string;

  @ApiPropertyOptional({ type: [SplitDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => SplitDto)
  splits?: SplitDto[];
}
