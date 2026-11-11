import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InfluencersService } from './influencers.service';
import { CreateInfluencerDto } from './dto/create-influencer.dto';

@ApiTags('Influencers')
@Controller('influencers')
export class InfluencersController {
  constructor(private readonly influencersService: InfluencersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new influencer / creator' })
  @ApiResponse({ status: 201, description: 'Influencer registered successfully' })
  registerInfluencer(@Body() dto: CreateInfluencerDto) {
    return this.influencersService.registerInfluencer(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered influencers (Admin)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listInfluencers(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.influencersService.listInfluencers(Number(limit), Number(offset));
  }
}

