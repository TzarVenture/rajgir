import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { RegistrationsService } from './registrations.service';
import { RegisterTeamDto } from './dto/register-team.dto';
import { RegisterCorporateDto } from './dto/register-corporate.dto';
import { RegisterSchoolDto } from './dto/register-school.dto';
import { RegisterSponsorDto } from './dto/register-sponsor.dto';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { RegisterTourismDto } from './dto/register-tourism.dto';

@ApiTags('Registrations')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'My registration (if any) and its status' })
  mine(@CurrentUser() auth: AuthContext) {
    return this.registrationsService.getMine(auth.dbUser.id);
  }

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw my registration while it is still pending review' })
  withdraw(@CurrentUser() auth: AuthContext) {
    return this.registrationsService.withdrawMine(auth.dbUser.id);
  }

  @Post('team')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register as a Team Captain and generate a team code' })
  registerTeam(@CurrentUser() auth: AuthContext, @Body() dto: RegisterTeamDto) {
    return this.registrationsService.registerTeam(auth.dbUser.id, dto);
  }

  @Post('corporate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a company onboarding application' })
  registerCorporate(@CurrentUser() auth: AuthContext, @Body() dto: RegisterCorporateDto) {
    return this.registrationsService.registerCorporate(auth.dbUser.id, dto);
  }

  @Post('school')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a school or college application' })
  registerSchool(@CurrentUser() auth: AuthContext, @Body() dto: RegisterSchoolDto) {
    return this.registrationsService.registerSchool(auth.dbUser.id, dto);
  }

  @Post('sponsor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a sponsorship proposal' })
  registerSponsor(@CurrentUser() auth: AuthContext, @Body() dto: RegisterSponsorDto) {
    return this.registrationsService.registerSponsor(auth.dbUser.id, dto);
  }

  @Post('vendor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply for an expo or food stall' })
  registerVendor(@CurrentUser() auth: AuthContext, @Body() dto: RegisterVendorDto) {
    return this.registrationsService.registerVendor(auth.dbUser.id, dto);
  }

  @Post('tourism')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'List hotel or transport services for visiting runners' })
  registerTourism(@CurrentUser() auth: AuthContext, @Body() dto: RegisterTourismDto) {
    return this.registrationsService.registerTourism(auth.dbUser.id, dto);
  }
}
