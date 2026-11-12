import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterVendorDto {
  @ApiProperty({ example: 'usr-uuid-here' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Magadh Organic Food & Nutrition' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: 'Food & Refreshments' })
  @IsString()
  @IsNotEmpty()
  stallCategory: string;

  @ApiProperty({ example: 'Standard (3x3m)' })
  @IsString()
  @IsNotEmpty()
  stallSize: string;

  @ApiProperty({ example: '10014022002727', required: false })
  @IsOptional()
  @IsString()
  fssaiNumber?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  electricPowerRequired: boolean;
}

