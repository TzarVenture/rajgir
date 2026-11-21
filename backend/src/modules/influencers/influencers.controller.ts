import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/guards/roles.guard';
import { InfluencersService } from './influencers.service';
import { CreateInfluencerDto, RegisterInfluencerWithAccountDto } from './dto/create-influencer.dto';

@ApiTags('Influencers')
@ApiBearerAuth()
@Controller('influencers')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Public()
  @Post('register-with-account')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Atomically create account and register as an influencer' })
  registerWithAccount(@Body() dto: RegisterInfluencerWithAccountDto) {
    return this.influencersService.registerInfluencerWithAccount(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register the signed-in user as an influencer / creator' })
  registerInfluencer(@CurrentUser() auth: AuthContext, @Body() dto: CreateInfluencerDto) {
    return this.influencersService.registerInfluencer(auth.dbUser.id, dto);
  }

  @Get()
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all influencers (staff only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listInfluencers(@Query('limit') limit = 50, @Query('offset') offset = 0) {
    return this.influencersService.listInfluencers(Number(limit), Number(offset));
  }
}
