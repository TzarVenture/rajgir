import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { AuthContext, CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService, toPublicUser } from './users.service';
import { SetRoleDto } from './dto/set-role.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('me/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Choose my role (self-signup roles only)' })
  async setMyRole(@CurrentUser() auth: AuthContext, @Body() dto: SetRoleDto) {
    const updated = await this.usersService.setOwnRole(auth.dbUser.id, dto.role);
    return toPublicUser(updated, Boolean(auth.authUser.email_confirmed_at));
  }
}
