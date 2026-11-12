import { IsNotEmpty, IsString, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterSchoolDto {
  @ApiProperty({ example: 'usr-uuid-here' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: "St. Xavier's High School Rajgir" })
  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @ApiProperty({ example: 'CBSE' })
  @IsString()
  @IsNotEmpty()
  boardAffiliation: string;

  @ApiProperty({ example: 'Rajgir' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Sister Mary Joseph' })
  @IsString()
  @IsNotEmpty()
  teacherInCharge: string;

  @ApiProperty({ example: 'Sports Director / Principal' })
  @IsString()
  @IsNotEmpty()
  teacherDesignation: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @Min(5)
  estimatedStudents: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  parentalConsentAgreed: boolean;
}

