import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto, RegisterVolunteerWithAccountDto } from './dto/create-volunteer.dto';
import {
  AssignVolunteerDto,
  ChecklistItemDto,
  CreateIncidentDto,
  DutyStatusDto,
  GeoDto,
  UpdateIncidentDto,
} from './dto/volunteer-ops.dto';

@ApiTags('Volunteers')
@ApiBearerAuth()
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Public()
  @Post('register-with-account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Atomically create account and register as a volunteer' })
  registerWithAccount(@Body() dto: RegisterVolunteerWithAccountDto) {
    return this.volunteersService.registerVolunteerWithAccount(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register the signed-in user as a volunteer' })
  registerVolunteer(@CurrentUser() auth: AuthContext, @Body() dto: CreateVolunteerDto) {
    return this.volunteersService.registerVolunteer(auth.dbUser.id, dto);
  }

  @Get()
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all volunteers (staff only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listVolunteers(@Query('limit') limit = 50, @Query('offset') offset = 0) {
    return this.volunteersService.listVolunteers(Number(limit), Number(offset));
  }

  // ----- Signed-in volunteer (declared before ":id" routes) -----

  @Get('me')
  @Roles(Role.VOLUNTEER)
  @ApiOperation({ summary: 'My volunteer record, deployment, attendance and incidents' })
  getMine(@CurrentUser() auth: AuthContext) {
    return this.volunteersService.getMine(auth.dbUser.id);
  }

  @Post('me/check-in')
  @Roles(Role.VOLUNTEER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Check in to my shift' })
  checkIn(@CurrentUser() auth: AuthContext, @Body() geo: GeoDto) {
    return this.volunteersService.checkIn(auth.dbUser.id, geo);
  }

  @Post('me/check-out')
  @Roles(Role.VOLUNTEER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check out of my shift' })
  checkOut(@CurrentUser() auth: AuthContext) {
    return this.volunteersService.checkOut(auth.dbUser.id);
  }

  @Patch('me/status')
  @Roles(Role.VOLUNTEER)
  @ApiOperation({ summary: 'Set on duty / on break while checked in' })
  setStatus(@CurrentUser() auth: AuthContext, @Body() dto: DutyStatusDto) {
    return this.volunteersService.setDutyStatus(auth.dbUser.id, dto);
  }

  @Patch('me/checklist')
  @Roles(Role.VOLUNTEER)
  @ApiOperation({ summary: 'Tick or untick a station checklist item' })
  updateChecklist(@CurrentUser() auth: AuthContext, @Body() dto: ChecklistItemDto) {
    return this.volunteersService.updateChecklist(auth.dbUser.id, dto);
  }

  @Get('me/incidents')
  @Roles(Role.VOLUNTEER)
  @ApiOperation({ summary: 'Incidents I reported or that happened at my station' })
  myIncidents(@CurrentUser() auth: AuthContext) {
    return this.volunteersService.listMyIncidents(auth.dbUser.id);
  }

  @Post('me/incidents')
  @Roles(Role.VOLUNTEER)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Report an incident or raise an SOS alert for race control' })
  createIncident(@CurrentUser() auth: AuthContext, @Body() dto: CreateIncidentDto) {
    return this.volunteersService.createIncident(auth.dbUser.id, dto);
  }

  // ----- Staff -----

  @Post(':id/approve')
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a volunteer application (staff only)' })
  approve(@Param('id', ParseUUIDPipe) id: string) {
    return this.volunteersService.approve(id);
  }

  @Patch(':id/assignment')
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Set station, sector, supervisor and shift (staff only)' })
  assign(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignVolunteerDto) {
    return this.volunteersService.assign(id, dto);
  }
}

/** Race-control incident feed (staff only). */
@ApiTags('Incidents')
@ApiBearerAuth()
@Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Get()
  @ApiOperation({ summary: 'All incidents and SOS alerts, unresolved SOS first' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'] })
  list(@Query('status') status?: string) {
    return this.volunteersService.listIncidents(status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Acknowledge or resolve an incident' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateIncidentDto) {
    return this.volunteersService.updateIncident(id, dto);
  }
}
