import { IsNotEmpty, IsString, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterSchoolDto {
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

  @ApiProperty({ example: 50, maximum: 50 })
  @IsNumber()
  @Min(5)
  @Max(50, { message: 'Initial contingent is capped at 50 students. Submit an appeal to Admin from your dashboard for 50+.' })
  estimatedStudents: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  parentalConsentAgreed: boolean;
}

