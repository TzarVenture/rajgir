import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { SignupAccountDto } from '../../runners/dto/create-runner.dto';

export class RegisterGroupWithAccountDto<T = any> {
  @ApiProperty({ type: () => SignupAccountDto })
  @ValidateNested()
  @Type(() => SignupAccountDto)
  account: SignupAccountDto;

  registration: T;
}
