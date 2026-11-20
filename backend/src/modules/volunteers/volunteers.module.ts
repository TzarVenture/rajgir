import { Module } from '@nestjs/common';
import { IncidentsController, VolunteersController } from './volunteers.controller';
import { VolunteersService } from './volunteers.service';

@Module({
  controllers: [VolunteersController, IncidentsController],
  providers: [VolunteersService],
  exports: [VolunteersService],
})
export class VolunteersModule {}
