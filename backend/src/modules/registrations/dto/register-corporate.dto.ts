import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCorporateDto {
  @ApiProperty({ example: 'Tata Steel CSR Foundation' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: '10AAACT2727Q1ZB', required: false })
  @IsOptional()
  @IsString()
  gstin?: string;

  @ApiProperty({ example: 'tatasteel.com' })
  @IsString()
  @IsNotEmpty()
  officialEmailDomain: string;

  @ApiProperty({ example: 'Senior HR Manager' })
  @IsString()
  @IsNotEmpty()
  designation: string;

  @ApiProperty({ example: 50, maximum: 50 })
  @IsNumber()
  @Min(5)
  @Max(50, { message: 'Initial delegation is capped at 50 passes. Submit an appeal to Admin from your dashboard for 50+.' })
  estimatedPasses: number;

  @ApiProperty({ example: 'Employee Wellness & Health', required: false })
  @IsOptional()
  @IsString()
  csrFocus?: string;

  @ApiProperty({ example: 'Bistupur, Jamshedpur, Jharkhand', required: false })
  @IsOptional()
  @IsString()
  billingAddress?: string;
}

