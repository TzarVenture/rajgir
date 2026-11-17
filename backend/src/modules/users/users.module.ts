import { Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

/** Global so SupabaseAuthGuard (which needs UsersService) can be used by any module's controllers. */
@Global()
@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseAuthGuard],
  exports: [UsersService, SupabaseAuthGuard],
})
export class UsersModule {}
