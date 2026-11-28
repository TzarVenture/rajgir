import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Request bodies of the staff-only admin API. Previously these routes took `body: any`, which the
 * global ValidationPipe cannot check: missing fields crashed with 500s and unknown fields reached
 * Prisma. Every field is now declared, typed and bounded.
 */

export const DECISIONS = ['approve', 'reject'] as const;
export type Decision = (typeof DECISIONS)[number];
export const APPLICATION_TYPES = ['corporate', 'school', 'sponsor', 'vendor', 'tourism'] as const;
export type ApplicationType = (typeof APPLICATION_TYPES)[number];
export const APPEAL_TYPES = ['team', 'corporate', 'school'] as const;
export type AppealType = (typeof APPEAL_TYPES)[number];
export const PAYMENT_STATUSES = ['CAPTURED', 'PENDING', 'REFUNDED'] as const;
export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

export class ListQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 500, default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}

export class UserStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED'] })
  @IsIn(['ACTIVE', 'SUSPENDED'])
  status: 'ACTIVE' | 'SUSPENDED';
}

export class DecisionDto {
  @ApiProperty({ enum: DECISIONS })
  @IsIn(DECISIONS)
  decision: Decision;
}

export class QuotaAppealDecisionDto extends DecisionDto {
  @ApiPropertyOptional({ description: 'Approved runner limit (defaults to the requested one); must be over 50', minimum: 51, maximum: 100000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(51)
  @Max(100000)
  approvedQuota?: number;
}

export class UpsertEventCategoryDto {
  @ApiProperty({ example: '21.1 KM' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  distance: string;

  @ApiProperty({ example: 'Half Marathon' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  title: string;

  @ApiProperty({ example: 1400 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  fee: number;

  @ApiProperty({ example: 18 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minAge: number;

  @ApiProperty({ example: '05:30' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Start time must be HH:MM (24-hour).' })
  startTime: string;

  @ApiProperty({ example: 210 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  cutoffMinutes: number;

  @ApiProperty({ example: 2500 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  capacity: number;

  @ApiProperty()
  @IsBoolean()
  isTimed: boolean;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class CreatePaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  registrationNumber?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  payerName: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(160)
  payerEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  distance?: string;

  @ApiProperty({ example: 1400 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100_000_000)
  amount: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100_000_000)
  gstAmount?: number;

  @ApiPropertyOptional({ example: 'UPI' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  referenceCode?: string;

  @ApiPropertyOptional({ enum: PAYMENT_STATUSES })
  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  status?: (typeof PAYMENT_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class PaymentStatusDto {
  @ApiProperty({ enum: PAYMENT_STATUSES })
  @IsIn(PAYMENT_STATUSES)
  status: (typeof PAYMENT_STATUSES)[number];
}

export class CreateMediaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiProperty({ example: 'PHOTO' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  category: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { message: 'Enter a full http(s) link.' })
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class MediaVisibilityDto {
  @ApiProperty()
  @IsBoolean()
  isPublished: boolean;
}

export class UpsertCmsBlockDto {
  @ApiProperty({ example: 'hero-announcement' })
  @Matches(/^[a-z0-9-]{1,80}$/, { message: 'Slug may only contain lowercase letters, numbers and dashes.' })
  slug: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiProperty({ example: 'HOMEPAGE' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  section: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  content: string;

  @ApiProperty()
  @IsBoolean()
  isPublished: boolean;
}

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiProperty({ enum: ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'] })
  @IsIn(['EMAIL', 'SMS', 'WHATSAPP', 'PUSH'])
  channel: string;

  @ApiProperty({ enum: ['ALL_RUNNERS', 'VOLUNTEERS', 'ALL_USERS'] })
  @IsIn(['ALL_RUNNERS', 'VOLUNTEERS', 'ALL_USERS'])
  audience: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  sendNow?: boolean;
}

export class CreateSupportTicketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  requesterName: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(160)
  requesterEmail: string;

  @ApiProperty({ example: 'GENERAL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  category: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message: string;

  @ApiPropertyOptional({ enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsIn(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: string;
}

/** Only the fields sent are changed (previously an absent field wiped the stored value). */
export class UpdateSupportTicketDto {
  @ApiPropertyOptional({ enum: TICKET_STATUSES })
  @IsOptional()
  @IsIn(TICKET_STATUSES)
  status?: (typeof TICKET_STATUSES)[number];

  @ApiPropertyOptional({ description: 'Empty string clears the assignee' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  assignedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolutionNote?: string;
}

export class UpdateAdminPermissionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  designation?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManageRunners?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canAllotBibs?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManageVolunteers?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManageInfluencers?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManageGroups?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManagePartners?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() canManageIncidents?: boolean;
}

export class UpsertSettingDto {
  @ApiProperty({ example: 'race_date' })
  @Matches(/^[a-z0-9_]{1,80}$/, { message: 'Key may only contain lowercase letters, numbers and underscores.' })
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  value: string;

  @ApiPropertyOptional({ example: 'EVENT' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
