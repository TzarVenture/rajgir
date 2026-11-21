import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerModule } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import type { AddressInfo } from 'net';
import { configureApp } from '../../src/app.setup';
import { GLOBAL_GUARDS } from '../../src/common/guards/global-guards';
import { Roles } from '../../src/common/guards/roles.guard';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { AuthService } from '../../src/modules/auth/auth.service';
import { SupabaseService } from '../../src/modules/supabase/supabase.service';
import { UsersService } from '../../src/modules/users/users.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { FakePrisma, FakeSupabase } from './fakes';

/** A staff-only and a member-only route, to test authorization through the real guard chain. */
@Controller('probe')
class ProbeController {
  @Get('member')
  member() {
    return { ok: true };
  }

  @Get('staff')
  @Roles(Role.ORGANIZER, Role.SUPER_ADMIN)
  staff() {
    return { ok: true };
  }
}

export interface TestApp {
  url: string;
  supabase: FakeSupabase;
  prisma: FakePrisma;
  close(): Promise<void>;
}

/**
 * Boots the real auth controller, auth/users services, global guards and validation pipe over HTTP,
 * with Supabase and Prisma replaced by in-memory fakes.
 */
export async function startTestApp(): Promise<TestApp> {
  const supabase = new FakeSupabase();
  const prisma = new FakePrisma();

  @Module({
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1000 }])],
    controllers: [AuthController, ProbeController],
    providers: [
      AuthService,
      UsersService,
      { provide: SupabaseService, useValue: supabase },
      { provide: PrismaService, useValue: prisma },
      ...GLOBAL_GUARDS,
    ],
  })
  class TestModule {}

  const app = await NestFactory.create<NestExpressApplication>(TestModule, { logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  const { port } = app.getHttpServer().address() as AddressInfo;

  return { url: `http://127.0.0.1:${port}/api/v1`, supabase, prisma, close: () => app.close() };
}

export async function call(
  app: TestApp,
  method: string,
  path: string,
  options: { token?: string; body?: unknown; headers?: Record<string, string> } = {},
): Promise<{ status: number; body: any }> {
  const res = await fetch(`${app.url}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}
