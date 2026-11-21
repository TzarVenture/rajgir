import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';

/** Global so the app-wide SupabaseAuthGuard (which needs UsersService) and every feature module can use it. */
@Global()
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
