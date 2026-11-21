import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/guards/roles.guard';
import { RunnersService } from './runners.service';
import { CreateRunnerDto, RegisterRunnerWithAccountDto } from './dto/create-runner.dto';
import { AllotBibDto, KitCollectedDto, UpdateMedicalDto, UpdateRunnerProfileDto, UpsertResultDto } from './dto/runner-ops.dto';

@ApiTags('Runners')
@ApiBearerAuth()
@Controller('runners')
export class RunnersController {
  constructor(private readonly runnersService: RunnersService) {}

  @Public()
  @Post('register-with-account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Atomically create account and register as a runner' })
  registerWithAccount(@Body() dto: RegisterRunnerWithAccountDto) {
    return this.runnersService.registerRunnerWithAccount(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register the signed-in user as a runner' })
  registerRunner(@CurrentUser() auth: AuthContext, @Body() dto: CreateRunnerDto) {
    return this.runnersService.registerRunner(auth.dbUser.id, dto);
  }

  // Declared before ":registrationNumber" so "me" is not treated as a registration number.
  @Get('me')
  @ApiOperation({ summary: 'My runner registration, bib, kit status and result' })
  getMine(@CurrentUser() auth: AuthContext) {
    return this.runnersService.getMine(auth.dbUser.id);
  }

  @Patch('me/medical')
  @ApiOperation({ summary: 'Update my emergency contact and medical details' })
  updateMedical(@CurrentUser() auth: AuthContext, @Body() dto: UpdateMedicalDto) {
    return this.runnersService.updateMedical(auth.dbUser.id, dto);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update my athlete profile information' })
  updateProfile(@CurrentUser() auth: AuthContext, @Body() dto: UpdateRunnerProfileDto) {
    return this.runnersService.updateProfile(auth.dbUser.id, dto);
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

  @Patch(':registrationNumber/bib')
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Allot bib number and start wave (staff only)' })
  allotBib(@Param('registrationNumber') registrationNumber: string, @Body() dto: AllotBibDto) {
    return this.runnersService.allotBib(registrationNumber, dto);
  }

  @Post(':registrationNumber/kit-collected')
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark race kit as collected at the expo (staff only)' })
  markKitCollected(@Param('registrationNumber') registrationNumber: string, @Body() dto: KitCollectedDto) {
    return this.runnersService.markKitCollected(registrationNumber, dto);
  }

  @Put(':registrationNumber/result')
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Publish or correct a timed result with checkpoint splits (staff / timing import)' })
  upsertResult(@Param('registrationNumber') registrationNumber: string, @Body() dto: UpsertResultDto) {
    return this.runnersService.upsertResult(registrationNumber, dto);
  }
}
