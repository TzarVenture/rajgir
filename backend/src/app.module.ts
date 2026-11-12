import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { RunnersModule } from './modules/runners/runners.module';
import { VolunteersModule } from './modules/volunteers/volunteers.module';
import { InfluencersModule } from './modules/influencers/influencers.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    RegistrationsModule,
    RunnersModule,
    VolunteersModule,
    InfluencersModule,
    AdminModule,
  ],
})
export class AppModule {}

