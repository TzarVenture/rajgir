import { Module } from '@nestjs/common';
import { GroupOpsController } from './group-ops.controller';
import { GroupOpsService } from './group-ops.service';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';

@Module({
  controllers: [RegistrationsController, GroupOpsController],
  providers: [RegistrationsService, GroupOpsService],
  exports: [RegistrationsService, GroupOpsService],
})
export class RegistrationsModule {}

