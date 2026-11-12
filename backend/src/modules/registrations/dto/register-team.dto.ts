import { IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTeamDto {
  @ApiProperty({ example: 'usr-uuid-here' })
  @IsString()
  @IsNotEmpty()
  userId: string;

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

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(2)
  estimatedMembers: number;

  @ApiProperty({ example: 'Participating in 21.1K and 10K categories', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

