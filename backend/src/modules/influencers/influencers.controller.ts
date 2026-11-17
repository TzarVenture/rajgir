import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { Roles, RolesGuard } from '../../common/guards/roles.guard';
import { InfluencersService } from './influencers.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';

@ApiTags('Influencers')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Controller('influencers')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

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
