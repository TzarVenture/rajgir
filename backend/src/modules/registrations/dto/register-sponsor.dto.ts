import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterSponsorDto {
  @ApiProperty({ example: 'usr-uuid-here' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Amrit Mineral Waters Ltd' })
  @IsString()
  @IsNotEmpty()
  brandName: string;

  @ApiProperty({ example: 'Beverages & Nutrition' })
  @IsString()
  @IsNotEmpty()
  industry: string;

  @ApiProperty({ example: 'Official Hydration Partner' })
  @IsString()
  @IsNotEmpty()
  tierInterest: string;

  @ApiProperty({ example: '₹10 Lakhs - ₹25 Lakhs' })
  @IsString()
  @IsNotEmpty()
  budgetBand: string;

  @ApiProperty({ example: 'https://amritwaters.in', required: false })
  @IsOptional()
  @IsString()
  brandWebsite?: string;

  @ApiProperty({ example: 'Branding across all 15 hydration stations and recovery zone', required: false })
  @IsOptional()
  @IsString()
  proposalDeliverables?: string;
}

