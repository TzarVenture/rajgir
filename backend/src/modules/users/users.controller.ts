import { Controller, Post, Body, Get, Query, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { SetRoleDto } from './dto/set-role.dto';

@ApiTags('Users & Identity')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync or create user identity from Supabase Auth' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  syncUser(@Body() dto: SyncUserDto) {
    return this.usersService.syncUser(dto);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if an email or phone is already registered to a role' })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'phone', required: false, type: String })
  checkUser(
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ) {
    return this.usersService.checkUser(email, phone);
  }

  @Post(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set user participation role intent' })
  setRole(
    @Param('id') id: string,
    @Body() dto: SetRoleDto,
  ) {
    return this.usersService.setRole(id, dto.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}

