import { Logger, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { parseTrustProxy } from './common/http/client-ip';

/**
 * HTTP pipeline shared by main.ts and the integration tests, so tests exercise exactly what
 * production runs (prefix, validation, proxy trust).
 */
export function configureApp(app: NestExpressApplication): void {
  // How many reverse proxies sit in front of the API (default 1: Traefik/Dokploy). Express then
  // derives req.ip from the address that proxy saw, not from a client-supplied X-Forwarded-For.
  app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (!process.env.INTERNAL_API_SECRET && process.env.NODE_ENV === 'production') {
    new Logger('Bootstrap').warn(
      'INTERNAL_API_SECRET is not set: rate limits fall back to the proxy-reported IP. ' +
        'Set the same secret on the frontend and backend so limits apply per visitor.',
    );
  }
}
