import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';

@ApiTags('Volunteers')
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new volunteer' })
  @ApiResponse({ status: 201, description: 'Volunteer registered successfully' })
  registerVolunteer(@Body() dto: CreateVolunteerDto) {
    return this.volunteersService.registerVolunteer(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered volunteers (Admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listVolunteers(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.volunteersService.listVolunteers(Number(limit), Number(offset));
  }
}

