import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';

@ApiTags('Volunteers')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

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
}
