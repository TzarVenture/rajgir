import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class SetRoleDto {
  @ApiProperty({ enum: Role, example: 'RUNNER' })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}

