import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { GLOBAL_GUARDS } from './common/guards/global-guards';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { RunnersModule } from './modules/runners/runners.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';
import { InfluencersModule } from './modules/influencers/influencers.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Default rate limit for every route; auth routes set stricter limits.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    SupabaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    RegistrationsModule,
    RunnersModule,
    VolunteersModule,
    InfluencersModule,
    AdminModule,
  ],
  // Rate limit -> authentication (unless @Public) -> roles, for every route.
  providers: [...GLOBAL_GUARDS],
})
export class AppModule {}
