import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { RunnersService } from './runners.service';
import { CreateRunnerDto } from './dto/create-runner.dto';

@ApiTags('Runners')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Controller('runners')
export class RunnersController {
  constructor(private readonly runnersService: RunnersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register the signed-in user as a runner' })
  registerRunner(@CurrentUser() auth: AuthContext, @Body() dto: CreateRunnerDto) {
    return this.runnersService.registerRunner(auth.dbUser.id, dto);
  }

  @Get()
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all registered runners (staff only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listRunners(@Query('limit') limit = 50, @Query('offset') offset = 0) {
    return this.runnersService.listRunners(Number(limit), Number(offset));
  }

  @Get(':registrationNumber')
  @ApiOperation({ summary: 'Get a registration by number (owner or staff)' })
  getRegistration(@CurrentUser() auth: AuthContext, @Param('registrationNumber') registrationNumber: string) {
    return this.runnersService.getRegistrationByNumber(registrationNumber, {
      id: auth.dbUser.id,
      role: auth.dbUser.role,
    });
  }
}
