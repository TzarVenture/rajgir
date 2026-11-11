import { Controller, Post, Body, Get, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RunnersService } from './runners.service';
import { CreateRunnerDto } from './dto/create-runner.dto';

@ApiTags('Runners')
@Controller('runners')
export class RunnersController {
  constructor(private readonly runnersService: RunnersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new marathon runner' })
  @ApiResponse({ status: 201, description: 'Runner registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation or duplicate error' })
  registerRunner(@Body() dto: CreateRunnerDto) {
    return this.runnersService.registerRunner(dto);
  }

  @Get(':registrationNumber')
  @ApiOperation({ summary: 'Get registration details by Registration Number' })
  getRegistration(@Param('registrationNumber') registrationNumber: string) {
    return this.runnersService.getRegistrationByNumber(registrationNumber);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered runners (Admin / Operations)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listRunners(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.runnersService.listRunners(Number(limit), Number(offset));
  }
}
