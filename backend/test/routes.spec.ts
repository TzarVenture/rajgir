import 'reflect-metadata';
import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { readdirSync } from 'fs';
import { join } from 'path';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../src/common/decorators/public.decorator';

/**
 * Inventory of every route that works WITHOUT a session. Authentication is global and deny-by-default,
 * so this list is the complete public surface of the API. A route appearing here unexpectedly (or a
 * public one becoming protected and breaking sign-in) fails this test.
 */
const EXPECTED_PUBLIC = [
  'GET /auth/config',
  'GET /health',
  'POST /auth/forgot-password',
  'POST /auth/login',
  'POST /auth/refresh',
  'POST /auth/resend-verification',
  'POST /auth/reset-password',
  'POST /auth/signup',
  'POST /auth/verify-email',
];

/** Every controller class compiled under src/modules. Discovered from disk so new controllers are covered automatically. */
function loadControllers(): Function[] {
  const modulesDir = join(__dirname, '..', 'src', 'modules');
  const controllers: Function[] = [];
  for (const dir of readdirSync(modulesDir)) {
    for (const file of readdirSync(join(modulesDir, dir))) {
      if (!file.endsWith('.controller.js')) continue;
      const exported = require(join(modulesDir, dir, file));
      for (const value of Object.values(exported)) {
        if (typeof value === 'function' && Reflect.hasMetadata(PATH_METADATA, value)) controllers.push(value as Function);
      }
    }
  }
  return controllers;
}

function routes() {
  const out: { route: string; isPublic: boolean }[] = [];
  for (const controller of loadControllers()) {
    const base = String(Reflect.getMetadata(PATH_METADATA, controller)).replace(/^\/|\/$/g, '');
    const classPublic = Boolean(Reflect.getMetadata(IS_PUBLIC_KEY, controller));
    for (const name of Object.getOwnPropertyNames(controller.prototype)) {
      const handler = controller.prototype[name];
      if (name === 'constructor' || typeof handler !== 'function' || !Reflect.hasMetadata(METHOD_METADATA, handler)) continue;
      const method = RequestMethod[Reflect.getMetadata(METHOD_METADATA, handler)];
      const path = String(Reflect.getMetadata(PATH_METADATA, handler)).replace(/^\/|\/$/g, '');
      const route = `${method} /${[base, path].filter(Boolean).join('/')}`;
      out.push({ route, isPublic: classPublic || Boolean(Reflect.getMetadata(IS_PUBLIC_KEY, handler)) });
    }
  }
  return out;
}

describe('route exposure', () => {
  it('only the expected routes are public', () => {
    const actual = routes().filter((r) => r.isPublic).map((r) => r.route).sort();
    assert.deepEqual(actual, [...EXPECTED_PUBLIC].sort());
  });

  it('discovers the protected surface too (sanity check that controllers were loaded)', () => {
    const protectedRoutes = routes().filter((r) => !r.isPublic).map((r) => r.route);
    for (const route of ['GET /auth/me', 'POST /auth/logout', 'POST /runners/register', 'GET /admin/overview', 'GET /registrations/me']) {
      assert.ok(protectedRoutes.includes(route), `${route} must require a session`);
    }
  });

  it('the removed staged sign-up endpoints do not exist', () => {
    const all = routes().map((r) => r.route);
    assert.ok(!all.some((r) => r.includes('with-account')), 'no *-with-account routes');
    assert.ok(!all.includes('POST /auth/check-availability'));
  });
});
