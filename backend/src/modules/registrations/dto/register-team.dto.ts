import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTeamDto {
  @ApiProperty({ example: 'Patna Striders Running Club' })
  @IsString()
  @IsNotEmpty()
  teamName: string;

  @ApiProperty({ example: 'Bihar Athletics Association', required: false })
  @IsOptional()
  @IsString()
  clubAffiliation?: string;

  @ApiProperty({ example: 'Patna' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 15, maximum: 50 })
  @IsNumber()
  @Min(2)
  @Max(50, { message: 'Initial squad size is capped at 50 members. Submit an appeal to Admin from your dashboard for 50+.' })
  estimatedMembers: number;

  @ApiProperty({ example: 'Participating in 21.1K and 10K categories', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

