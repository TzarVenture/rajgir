import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { RegisterTeamDto } from './dto/register-team.dto';
import { RegisterCorporateDto } from './dto/register-corporate.dto';
import { RegisterSchoolDto } from './dto/register-school.dto';
import { RegisterSponsorDto } from './dto/register-sponsor.dto';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { RegisterTourismDto } from './dto/register-tourism.dto';

@ApiTags('Registrations & Onboarding')
@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('team')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a Team Captain & generate team code' })
  registerTeam(@Body() dto: RegisterTeamDto) {
    return this.registrationsService.registerTeam(dto);
  }

  @Post('corporate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a Corporate Company onboarding proposal' })
  registerCorporate(@Body() dto: RegisterCorporateDto) {
    return this.registrationsService.registerCorporate(dto);
  }

  @Post('school')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a School/College group onboarding application' })
  registerSchool(@Body() dto: RegisterSchoolDto) {
    return this.registrationsService.registerSchool(dto);
  }

  @Post('sponsor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an official Sponsor partnership proposal' })
  registerSponsor(@Body() dto: RegisterSponsorDto) {
    return this.registrationsService.registerSponsor(dto);
  }

  @Post('vendor')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply for an Expo Village or Food Fest stall' })
  registerVendor(@Body() dto: RegisterVendorDto) {
    return this.registrationsService.registerVendor(dto);
  }

  @Post('tourism')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'List hotel accommodation or transit packages for runners' })
  registerTourism(@Body() dto: RegisterTourismDto) {
    return this.registrationsService.registerTourism(dto);
  }
}

