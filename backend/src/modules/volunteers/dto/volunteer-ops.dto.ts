import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DUTY_STATUSES, INCIDENT_SEVERITIES, INCIDENT_STATUSES, INCIDENT_TYPES } from '../../../common/constants/event';

/** Optional device location attached to check-ins and incidents. */
export class GeoDto {
  @ApiPropertyOptional({ example: 25.0257 })
  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional({ example: 85.4211 })
  @IsOptional()
  @IsLongitude()
  longitude?: number;
}

export class DutyStatusDto {
  @ApiProperty({ example: 'ON_BREAK', enum: DUTY_STATUSES })
  @IsIn(DUTY_STATUSES)
  status: string;
}

export class ChecklistItemDto {
  @ApiProperty({ example: 'hyd-cups-staged' })
  @Matches(/^[a-z0-9-]{1,48}$/, { message: 'Invalid checklist item' })
  itemId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  done: boolean;
}

export class CreateIncidentDto extends GeoDto {
  @ApiProperty({ example: 'MEDICAL', enum: INCIDENT_TYPES })
  @IsIn(INCIDENT_TYPES)
  type: string;

  @ApiProperty({ example: 'HIGH', enum: INCIDENT_SEVERITIES })
  @IsIn(INCIDENT_SEVERITIES)
  severity: string;

  @ApiPropertyOptional({ example: false, description: 'SOS alerts are always stored as CRITICAL' })
  @IsOptional()
  @IsBoolean()
  isSos?: boolean;

  @ApiPropertyOptional({ example: 'Hydration point 4 (KM 10)' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  location?: string;

  @ApiPropertyOptional({ example: '21045' })
  @IsOptional()
  @Matches(/^[A-Z0-9-]{1,16}$/i, { message: 'Bib number may contain letters, digits and dashes' })
  runnerBib?: string;

  @ApiProperty({ example: 'Runner collapsed near the table, conscious, breathing. Medics requested.' })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  description: string;
}

/** Staff: approve a volunteer and/or set their deployment. */
export class AssignVolunteerDto {
  @ApiPropertyOptional({ example: 'Water Stations' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  assignedRole?: string;

  @ApiPropertyOptional({ example: 'Hydration point 4 (KM 10)' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  assignedStation?: string;

  @ApiPropertyOptional({ example: 'Sector C' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  assignedSector?: string;

  @ApiPropertyOptional({ example: 'Priya Singh' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  supervisorName?: string;

  /** 10 digits, or "" to clear it (assignment fields are cleared with an empty string). */
  @ApiPropertyOptional({ example: '9876500000' })
  @IsOptional()
  @Matches(/^(\d{10})?$/, { message: 'Supervisor mobile must be 10 digits' })
  supervisorPhone?: string;

  @ApiPropertyOptional({ example: '2027-11-21T04:00:00+05:30' })
  @IsOptional()
  @IsDateString()
  shiftStart?: string;

  @ApiPropertyOptional({ example: '2027-11-21T11:00:00+05:30' })
  @IsOptional()
  @IsDateString()
  shiftEnd?: string;
}

export class UpdateIncidentDto {
  @ApiProperty({ example: 'ACKNOWLEDGED', enum: INCIDENT_STATUSES })
  @IsIn(INCIDENT_STATUSES)
  status: string;

  @ApiPropertyOptional({ example: 'Medical team 2 attended; runner transferred to finish-line medical tent.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolutionNote?: string;
}
