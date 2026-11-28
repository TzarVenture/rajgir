import { after, before, beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AdminController } from '../src/modules/admin/admin.controller';
import { AdminService, type AdminActor } from '../src/modules/admin/admin.service';
import { call, startTestApp, type TestApp } from './support/app';

/**
 * Admin API, part 1: the HTTP layer (global auth + role guards, validation pipe, DTOs, id pipes)
 * through the real controller, with AdminService replaced by a recorder.
 * Part 2: AdminService rules against a small in-memory Prisma stand-in.
 */

const ID = '3f1c2b9e-6a4d-4f7e-9b1a-2c3d4e5f6a7b';
const calls: Array<{ method: string; args: unknown[] }> = [];
/** Records calls to AdminService's own methods only (a catch-all proxy would also answer `then`). */
const recorder = Object.fromEntries(
  Object.getOwnPropertyNames(AdminService.prototype)
    .filter((name) => name !== 'constructor')
    .map((method) => [
      method,
      async (...args: unknown[]) => {
        calls.push({ method, args });
        return { ok: true };
      },
    ]),
);

let app: TestApp;
const tokens: Record<string, string> = {};

async function signIn(email: string, role: string | null) {
  const auth = app.supabase.addAuthUser(email, 'correct-horse');
  const row = app.prisma.addUser({ email, supabaseAuthId: auth.id, role, status: 'ACTIVE', phone: null });
  const res = await call(app, 'POST', '/auth/login', { body: { identifier: email, password: 'correct-horse' } });
  assert.equal(res.status, 200, `login ${email}`);
  return { token: res.body.session.accessToken as string, id: row.id };
}

before(async () => {
  app = await startTestApp({ controllers: [AdminController], providers: [{ provide: AdminService, useValue: recorder }] });
  tokens.staff = (await signIn('staff@example.com', 'ORGANIZER')).token;
  tokens.runner = (await signIn('runner@example.com', 'RUNNER')).token;
});

after(async () => {
  await app.close();
});

beforeEach(() => {
  calls.length = 0;
});

const staff = (method: string, path: string, body?: unknown) => call(app, method, path, { token: tokens.staff, body });

describe('admin API access', () => {
  it('requires a session', async () => {
    assert.equal((await call(app, 'GET', '/admin/overview')).status, 401);
  });

  it('refuses non-staff accounts on every admin route', async () => {
    for (const [method, path] of [
      ['GET', '/admin/overview'],
      ['GET', '/admin/users'],
      ['PATCH', `/admin/users/${ID}/status`],
      ['POST', '/admin/events'],
      ['POST', '/admin/settings'],
    ]) {
      const res = await call(app, method, path, { token: tokens.runner, body: method === 'GET' ? undefined : {} });
      assert.equal(res.status, 403, `${method} ${path}`);
    }
    assert.equal(calls.length, 0);
  });

  it('lets staff read', async () => {
    assert.equal((await staff('GET', '/admin/overview')).status, 200);
    assert.equal(calls[0].method, 'getPlatformOverview');
  });
});

describe('admin API validation', () => {
  it('rejects ids that are not UUIDs before touching the database', async () => {
    assert.equal((await staff('PATCH', '/admin/users/not-an-id/status', { status: 'SUSPENDED' })).status, 400);
    assert.equal((await staff('PATCH', '/admin/payments/123/status', { status: 'CAPTURED' })).status, 400);
    assert.equal(calls.length, 0);
  });

  it('rejects unknown review types and decisions', async () => {
    assert.equal((await staff('POST', `/admin/applications/hacker/${ID}/review`, { decision: 'approve' })).status, 400);
    assert.equal((await staff('POST', `/admin/applications/vendor/${ID}/review`, { decision: 'maybe' })).status, 400);
    assert.equal((await staff('POST', `/admin/quota-appeals/vendor/${ID}/review`, { decision: 'approve' })).status, 400);
    assert.equal(calls.length, 0);
  });

  it('passes the acting admin to the service', async () => {
    const res = await staff('PATCH', `/admin/users/${ID}/status`, { status: 'SUSPENDED' });
    assert.equal(res.status, 200);
    const [userId, status, actor] = calls[0].args as [string, string, AdminActor];
    assert.equal(userId, ID);
    assert.equal(status, 'SUSPENDED');
    assert.equal(actor.email, 'staff@example.com');
    assert.equal(actor.role, 'ORGANIZER');
  });

  it('user status must be ACTIVE or SUSPENDED', async () => {
    assert.equal((await staff('PATCH', `/admin/users/${ID}/status`, { status: 'SUPER_ADMIN' })).status, 400);
  });

  it('quota appeals cannot be approved at 50 or below', async () => {
    assert.equal((await staff('POST', `/admin/quota-appeals/team/${ID}/review`, { decision: 'approve', approvedQuota: 50 })).status, 400);
    assert.equal((await staff('POST', `/admin/quota-appeals/team/${ID}/review`, { decision: 'approve', approvedQuota: 80 })).status, 200);
  });

  const event = { distance: '21.1 KM', title: 'Half Marathon', fee: 1400, minAge: 18, startTime: '05:30', cutoffMinutes: 210, capacity: 2500, isTimed: true, isActive: true };

  it('race categories need every field, in range (missing fields used to crash with 500)', async () => {
    assert.equal((await staff('POST', '/admin/events', { distance: '5 KM' })).status, 400);
    assert.equal((await staff('POST', '/admin/events', { ...event, fee: -1 })).status, 400);
    assert.equal((await staff('POST', '/admin/events', { ...event, startTime: '25:00' })).status, 400);
    assert.equal(calls.length, 0);
    assert.equal((await staff('POST', '/admin/events', event)).status, 200);
    assert.deepEqual((calls[0].args[0] as typeof event).fee, 1400);
  });

  it('unknown fields are refused instead of reaching the database', async () => {
    assert.equal((await staff('POST', '/admin/events', { ...event, id: ID, createdAt: '2020-01-01' })).status, 400);
    assert.equal((await staff('POST', '/admin/settings', { key: 'race_date', value: 'x', updatedAt: 'now' })).status, 400);
  });

  it('cms slugs and setting keys must be well-formed', async () => {
    assert.equal((await staff('POST', '/admin/cms', { slug: 'Bad Slug!', title: 't', section: 'HOMEPAGE', content: 'c', isPublished: true })).status, 400);
    assert.equal((await staff('POST', '/admin/settings', { key: 'Race Date', value: 'x' })).status, 400);
    assert.equal((await staff('POST', '/admin/cms', { slug: 'ok-slug', title: 't', section: 'HOMEPAGE', content: 'c', isPublished: true })).status, 200);
  });

  it('media links must be http(s) URLs', async () => {
    assert.equal((await staff('POST', '/admin/media', { title: 'x', category: 'PHOTO', url: 'javascript:alert(1)' })).status, 400);
    assert.equal((await staff('POST', '/admin/media', { title: 'x', category: 'PHOTO', url: 'https://example.com/a.jpg' })).status, 201);
  });

  it('list limits are bounded', async () => {
    assert.equal((await staff('GET', '/admin/users?limit=100000')).status, 400);
    assert.equal((await staff('GET', '/admin/users?limit=20')).status, 200);
    assert.equal(calls[0].args[0], 20);
  });
});

// ---------------------------------------------------------------------------------------------
// AdminService rules
// ---------------------------------------------------------------------------------------------

const actor: AdminActor = { id: 'admin-1', email: 'staff@example.com', role: 'ORGANIZER' };
const notFound = () => new Prisma.PrismaClientKnownRequestError('Record not found', { code: 'P2025', clientVersion: 'test' });

function fakePrisma(seed: { users?: any[]; tickets?: any[] } = {}) {
  const audit: any[] = [];
  const users = seed.users ?? [];
  const tickets = seed.tickets ?? [];
  const updates: any[] = [];
  const prisma: any = {
    audit,
    updates,
    auditLog: { create: async ({ data }: any) => (audit.push(data), data) },
    user: {
      findUnique: async ({ where }: any) => users.find((u) => u.id === where.id) ?? null,
      update: async ({ where, data }: any) => {
        const u = users.find((x) => x.id === where.id);
        if (!u) throw notFound();
        Object.assign(u, data);
        return { id: u.id, status: u.status };
      },
    },
    paymentTransaction: { update: async () => Promise.reject(notFound()) },
    supportTicket: {
      update: async ({ where, data }: any) => {
        const t = tickets.find((x) => x.id === where.id);
        if (!t) throw notFound();
        updates.push(data);
        return Object.assign(t, data);
      },
    },
  };
  return prisma;
}

describe('AdminService rules', () => {
  it('an admin cannot suspend their own account', async () => {
    const prisma = fakePrisma({ users: [{ id: 'admin-1', role: 'ORGANIZER', status: 'ACTIVE', firstName: 'A', lastName: 'B', email: 'staff@example.com' }] });
    await assert.rejects(new AdminService(prisma).setUserStatus('admin-1', 'SUSPENDED', actor), ForbiddenException);
  });

  it('a Super Admin cannot be suspended', async () => {
    const prisma = fakePrisma({ users: [{ id: 'sa', role: 'SUPER_ADMIN', status: 'ACTIVE', firstName: 'S', lastName: 'A', email: 'sa@example.com' }] });
    await assert.rejects(new AdminService(prisma).setUserStatus('sa', 'SUSPENDED', actor), BadRequestException);
  });

  it('suspending a user is written to the audit log', async () => {
    const prisma = fakePrisma({ users: [{ id: 'u1', role: 'RUNNER', status: 'ACTIVE', firstName: 'Meera', lastName: 'Runner', email: 'meera@example.com' }] });
    await new AdminService(prisma).setUserStatus('u1', 'SUSPENDED', actor);
    assert.equal(prisma.audit.length, 1);
    assert.equal(prisma.audit[0].action, 'SUSPEND_USER');
    assert.equal(prisma.audit[0].actorEmail, 'staff@example.com');
    assert.match(prisma.audit[0].summary, /Meera Runner/);
  });

  it('a missing record is a 404, not a 500', async () => {
    await assert.rejects(new AdminService(fakePrisma()).updatePaymentStatus('missing', 'REFUNDED', actor), NotFoundException);
    await assert.rejects(new AdminService(fakePrisma()).setUserStatus('missing', 'SUSPENDED', actor), NotFoundException);
  });

  it('updating a ticket changes only the fields sent (assignee and note are kept)', async () => {
    const ticket = { id: 't1', ticketNumber: 'TKT-000001', status: 'OPEN', assignedTo: 'Ravi', resolutionNote: 'call back' };
    const prisma = fakePrisma({ tickets: [ticket] });
    await new AdminService(prisma).updateSupportTicket('t1', { status: 'IN_PROGRESS' }, actor);
    assert.deepEqual(prisma.updates[0], { status: 'IN_PROGRESS' });
    assert.equal(ticket.assignedTo, 'Ravi');
    assert.equal(ticket.resolutionNote, 'call back');
    await assert.rejects(new AdminService(prisma).updateSupportTicket('t1', {}, actor), BadRequestException);
  });
});
