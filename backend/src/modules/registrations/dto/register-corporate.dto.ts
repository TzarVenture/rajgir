import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCorporateDto {
  @ApiProperty({ example: 'usr-uuid-here' })
  @IsString()
  @IsNotEmpty()
  userId: string;

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

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(5)
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

