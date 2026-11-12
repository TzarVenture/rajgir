import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTourismDto {
  @ApiProperty({ example: 'usr-uuid-here' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Rajgir Heritage Resort & Spa' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: 'Hotel / Resort' })
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiProperty({ example: 'Near Hot Water Springs, Kund Market, Rajgir' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '1.2 KM', required: false })
  @IsOptional()
  @IsString()
  distanceFromStartLine?: string;

  @ApiProperty({ example: '45 Deluxe Rooms' })
  @IsString()
  @IsNotEmpty()
  inventoryCapacity: string;

  @ApiProperty({ example: '20% Flat Discount for Verified Bib Holders', required: false })
  @IsOptional()
  @IsString()
  discountOffering?: string;
}

