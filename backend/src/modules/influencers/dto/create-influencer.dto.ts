import {
  IsString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInfluencerDto {
  // Name, email and mobile are not accepted here: they come from the signed-in account (users table).

  @ApiPropertyOptional({ example: 'The Patna Runner' })
  @IsOptional()
  @IsString()
  stageName?: string;

  @ApiPropertyOptional({ example: 'Patna' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'India', default: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Instagram' })
  @IsString()
  @IsNotEmpty()
  primaryPlatform: string;

  @ApiProperty({ example: 'https://instagram.com/thepatnarunner' })
  @IsString()
  @IsNotEmpty()
  profileUrl: string;

  @ApiProperty({ example: '45K' })
  @IsString()
  @IsNotEmpty()
  followerCount: string;

  @ApiPropertyOptional({ example: '4.8%' })
  @IsOptional()
  @IsString()
  engagementRate?: string;

  @ApiProperty({ example: 'Fitness & Running' })
  @IsString()
  @IsNotEmpty()
  targetNiche: string;

  @ApiProperty({ example: '3 Reels, 5 Stories, Race Day Vlog' })
  @IsString()
  @IsNotEmpty()
  collaborationDeliverables: string;
}

