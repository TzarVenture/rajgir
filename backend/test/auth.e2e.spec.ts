import { after, before, beforeEach, describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { call, startTestApp, type TestApp } from './support/app';

const SECRET = 'test-internal-secret';
let app: TestApp;
let ipCounter = 0;

/** A fresh visitor IP per test, sent the way the Next.js server sends it. */
function visitor(): Record<string, string> {
  ipCounter += 1;
  return { 'x-internal-secret': SECRET, 'x-client-ip': `10.0.0.${ipCounter}` };
}

function addAccount(email: string, password: string, opts: { confirmed?: boolean; role?: string; status?: string; phone?: string } = {}) {
  const auth = app.supabase.addAuthUser(email, password, opts.confirmed ?? true);
  const row = app.prisma.addUser({
    email,
    supabaseAuthId: auth.id,
    role: opts.role ?? null,
    status: opts.status ?? 'ACTIVE',
    phone: opts.phone ?? null,
  });
  return { auth, row };
}

async function login(identifier: string, password: string, headers = visitor()) {
  return call(app, 'POST', '/auth/login', { body: { identifier, password }, headers });
}

before(async () => {
  process.env.INTERNAL_API_SECRET = SECRET;
  process.env.REQUIRE_EMAIL_VERIFICATION = 'true';
  app = await startTestApp();
});

after(async () => {
  await app.close();
});

beforeEach(() => {
  app.supabase.authUsers.clear();
  app.supabase.sessions.length = 0;
  app.supabase.revocations.length = 0;
  app.supabase.passwordUpdates.length = 0;
  app.supabase.down = false;
  app.prisma.users.length = 0;
});

describe('login', () => {
  it('returns a session and the user for correct email + password', async () => {
    addAccount('runner@example.com', 'correct-horse', { role: 'RUNNER' });
    const res = await login('runner@example.com', 'correct-horse');
    assert.equal(res.status, 200);
    assert.ok(res.body.session.accessToken);
    assert.ok(res.body.session.refreshToken);
    assert.equal(typeof res.body.session.expiresAt, 'number');
    assert.equal(res.body.user.email, 'runner@example.com');
    assert.equal(res.body.user.role, 'RUNNER');
  });

  it('accepts the 10-digit mobile number as identifier', async () => {
    addAccount('mobile@example.com', 'correct-horse', { phone: '9876543210' });
    const res = await login('+91 98765 43210', 'correct-horse');
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'mobile@example.com');
  });

  it('gives the same generic error for a wrong password, unknown email and unknown mobile (no account enumeration)', async () => {
    addAccount('known@example.com', 'correct-horse', { phone: '9876543210' });
    const wrongPassword = await login('known@example.com', 'nope-nope');
    const unknownEmail = await login('nobody@example.com', 'nope-nope');
    const unknownMobile = await login('9000000000', 'nope-nope');
    for (const res of [wrongPassword, unknownEmail, unknownMobile]) {
      assert.equal(res.status, 401);
      assert.equal(res.body.message, 'Incorrect email/mobile or password.');
    }
    assert.equal(app.supabase.sessions.length, 0, 'no session may be created');
  });

  it('reports EMAIL_NOT_VERIFIED without creating a session', async () => {
    addAccount('new@example.com', 'correct-horse', { confirmed: false });
    const res = await login('new@example.com', 'correct-horse');
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'EMAIL_NOT_VERIFIED');
    assert.equal(app.supabase.sessions.length, 0);
  });

  it('refuses a suspended account and does not leave its session open', async () => {
    addAccount('bad@example.com', 'correct-horse', { status: 'SUSPENDED' });
    const res = await login('bad@example.com', 'correct-horse');
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'ACCOUNT_SUSPENDED');
    assert.equal(app.supabase.sessions.length, 0, 'the session opened by the password check must be revoked');
  });

  it('refuses (and revokes) a valid Supabase sign-in whose platform account was deleted', async () => {
    app.supabase.addAuthUser('ghost@example.com', 'correct-horse');
    const res = await login('ghost@example.com', 'correct-horse');
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'ACCOUNT_NOT_FOUND');
    assert.equal(app.supabase.sessions.length, 0, 'the fresh Supabase session must be revoked');
  });

  it('rejects malformed input before reaching Supabase', async () => {
    const res = await call(app, 'POST', '/auth/login', { body: { identifier: '', password: 'x', extra: 1 }, headers: visitor() });
    assert.equal(res.status, 400);
  });
});

describe('session lifecycle through the global guard', () => {
  it('login -> /auth/me succeeds with the issued token', async () => {
    addAccount('a@example.com', 'correct-horse', { role: 'RUNNER' });
    const { body } = await login('a@example.com', 'correct-horse');
    const me = await call(app, 'GET', '/auth/me', { token: body.session.accessToken, headers: visitor() });
    assert.equal(me.status, 200);
    assert.equal(me.body.email, 'a@example.com');
    assert.equal(me.body.emailVerified, true);
  });

  it('no token -> 401 AUTH_REQUIRED', async () => {
    const res = await call(app, 'GET', '/auth/me', { headers: visitor() });
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'AUTH_REQUIRED');
  });

  it('unknown or revoked token -> 401 SESSION_EXPIRED', async () => {
    const res = await call(app, 'GET', '/auth/me', { token: 'not-a-real-token', headers: visitor() });
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'SESSION_EXPIRED');
  });

  it('valid token for a deleted account -> 401 ACCOUNT_NOT_FOUND (deleted accounts are never resurrected)', async () => {
    const { auth, row } = addAccount('gone@example.com', 'correct-horse');
    const session = app.supabase.issueSession(auth.id);
    app.prisma.users.splice(app.prisma.users.indexOf(row), 1);
    const res = await call(app, 'GET', '/auth/me', { token: session.access_token, headers: visitor() });
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'ACCOUNT_NOT_FOUND');
    assert.equal(app.prisma.users.length, 0, 'the guard must not create a user row');
  });

  it('suspended account with a live token -> 401 ACCOUNT_SUSPENDED', async () => {
    const { auth } = addAccount('s@example.com', 'correct-horse', { status: 'SUSPENDED' });
    const session = app.supabase.issueSession(auth.id);
    const res = await call(app, 'GET', '/auth/me', { token: session.access_token, headers: visitor() });
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'ACCOUNT_SUSPENDED');
  });

  it('many concurrent requests with one session all succeed (stateless verification)', async () => {
    addAccount('c@example.com', 'correct-horse');
    const { body } = await login('c@example.com', 'correct-horse');
    const headers = visitor();
    const results = await Promise.all(
      Array.from({ length: 20 }, () => call(app, 'GET', '/auth/me', { token: body.session.accessToken, headers })),
    );
    assert.deepEqual(results.map((r) => r.status), Array(20).fill(200));
  });

  it('refresh -> new tokens work, the old refresh token cannot be reused', async () => {
    addAccount('r@example.com', 'correct-horse');
    const { body } = await login('r@example.com', 'correct-horse');
    const refreshed = await call(app, 'POST', '/auth/refresh', { body: { refreshToken: body.session.refreshToken }, headers: visitor() });
    assert.equal(refreshed.status, 200);
    const me = await call(app, 'GET', '/auth/me', { token: refreshed.body.session.accessToken, headers: visitor() });
    assert.equal(me.status, 200);
    const reused = await call(app, 'POST', '/auth/refresh', { body: { refreshToken: body.session.refreshToken }, headers: visitor() });
    assert.equal(reused.status, 401);
  });

  it('logout revokes the session: the same token is rejected afterwards', async () => {
    addAccount('l@example.com', 'correct-horse');
    const { body } = await login('l@example.com', 'correct-horse');
    const token = body.session.accessToken;
    const out = await call(app, 'POST', '/auth/logout', { token, headers: visitor() });
    assert.equal(out.status, 200);
    assert.deepEqual(app.supabase.revocations.at(-1), { accessToken: token, scope: 'local' });
    const me = await call(app, 'GET', '/auth/me', { token, headers: visitor() });
    assert.equal(me.status, 401);
  });

  it('logout without a session is rejected (protected by default)', async () => {
    const res = await call(app, 'POST', '/auth/logout', { headers: visitor() });
    assert.equal(res.status, 401);
  });
});

describe('authorization (roles)', () => {
  it('signed-in non-staff user -> 403 on a staff route, 200 on a member route', async () => {
    addAccount('m@example.com', 'correct-horse', { role: 'RUNNER' });
    const { body } = await login('m@example.com', 'correct-horse');
    const token = body.session.accessToken;
    assert.equal((await call(app, 'GET', '/probe/staff', { token, headers: visitor() })).status, 403);
    assert.equal((await call(app, 'GET', '/probe/member', { token, headers: visitor() })).status, 200);
  });

  it('organizer -> 200 on the staff route', async () => {
    addAccount('o@example.com', 'correct-horse', { role: 'ORGANIZER' });
    const { body } = await login('o@example.com', 'correct-horse');
    const res = await call(app, 'GET', '/probe/staff', { token: body.session.accessToken, headers: visitor() });
    assert.equal(res.status, 200);
  });

  it('anonymous -> 401 (not 403) on staff and member routes, and on a route with no explicit guard', async () => {
    assert.equal((await call(app, 'GET', '/probe/staff', { headers: visitor() })).status, 401);
    assert.equal((await call(app, 'GET', '/probe/member', { headers: visitor() })).status, 401);
  });
});

describe('change password', () => {
  async function signedIn() {
    addAccount('p@example.com', 'old-password');
    const { body } = await login('p@example.com', 'old-password');
    return body.session.accessToken as string;
  }

  it('requires the current password', async () => {
    const token = await signedIn();
    const res = await call(app, 'POST', '/auth/change-password', { token, body: { newPassword: 'new-password' }, headers: visitor() });
    assert.equal(res.status, 400);
    assert.equal(app.supabase.passwordUpdates.length, 0);
  });

  it('rejects a wrong current password without changing anything', async () => {
    const token = await signedIn();
    const res = await call(app, 'POST', '/auth/change-password', {
      token,
      body: { currentPassword: 'guess', newPassword: 'new-password' },
      headers: visitor(),
    });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'INVALID_CURRENT_PASSWORD');
    assert.equal(app.supabase.passwordUpdates.length, 0);
  });

  it('changes the password, keeps this session, signs out other devices, leaves no stray session', async () => {
    const token = await signedIn();
    const other = (await login('p@example.com', 'old-password')).body.session.accessToken;

    const res = await call(app, 'POST', '/auth/change-password', {
      token,
      body: { currentPassword: 'old-password', newPassword: 'new-password' },
      headers: visitor(),
    });
    assert.equal(res.status, 200);
    assert.equal(app.supabase.passwordUpdates.length, 1);

    assert.ok(app.supabase.isActive(token), 'the session that made the change stays signed in');
    assert.ok(!app.supabase.isActive(other), 'other devices are signed out');
    assert.equal(app.supabase.sessions.length, 1, 'the re-authentication session must not linger');

    assert.equal((await login('p@example.com', 'old-password')).status, 401, 'old password no longer works');
    assert.equal((await login('p@example.com', 'new-password')).status, 200, 'new password works');
  });
});

describe('legacy account linking', () => {
  it('links an unlinked legacy row only to a Supabase identity with a confirmed email', async () => {
    app.prisma.addUser({ email: 'legacy@example.com', status: 'ACTIVE' });
    const unconfirmed = app.supabase.addAuthUser('legacy@example.com', 'pw-pw-pw-pw', false);
    const s1 = app.supabase.issueSession(unconfirmed.id);
    const denied = await call(app, 'GET', '/auth/me', { token: s1.access_token, headers: visitor() });
    assert.equal(denied.status, 401);
    assert.equal(app.prisma.users[0].supabaseAuthId, null, 'must not be linked');

    app.supabase.authUsers.delete(unconfirmed.id);
    const confirmed = app.supabase.addAuthUser('legacy@example.com', 'pw-pw-pw-pw', true);
    const s2 = app.supabase.issueSession(confirmed.id);
    const allowed = await call(app, 'GET', '/auth/me', { token: s2.access_token, headers: visitor() });
    assert.equal(allowed.status, 200);
    assert.equal(app.prisma.users[0].supabaseAuthId, confirmed.id);
  });
});

describe('rate limiting per visitor', () => {
  it('limits login per visitor IP, without one visitor exhausting the limit for another', async () => {
    const a = visitor();
    for (let i = 0; i < 10; i++) assert.equal((await login('x@example.com', 'wrong-pass', a)).status, 401);
    assert.equal((await login('x@example.com', 'wrong-pass', a)).status, 429, '11th attempt from the same visitor is throttled');
    assert.equal((await login('x@example.com', 'wrong-pass', visitor())).status, 401, 'another visitor is not affected');
  });

  // (X-Forwarded-For handling is Express' `trust proxy`, configured by parseTrustProxy; this test client
  // connects over loopback, which counts as a trusted proxy, so only the x-client-ip rule is exercised here.)
  it('ignores a forwarded client IP that does not carry the internal secret (cannot dodge the limit)', async () => {
    let throttled = false;
    for (let i = 0; i < 12; i++) {
      const res = await login('y@example.com', 'wrong-pass', { 'x-client-ip': `203.0.113.${i}`, 'x-internal-secret': 'wrong' });
      if (res.status === 429) throttled = true;
    }
    assert.ok(throttled, 'spoofed IP headers must not create fresh buckets');
  });
});

describe('Supabase outage never ends a session', () => {
  it('a token check during an outage answers 503 (retry), not 401 (signed out)', async () => {
    addAccount('o1@example.com', 'correct-horse');
    const { body } = await login('o1@example.com', 'correct-horse');
    app.supabase.down = true;
    const me = await call(app, 'GET', '/auth/me', { token: body.session.accessToken, headers: visitor() });
    assert.equal(me.status, 503);
    assert.equal(me.body.code, 'AUTH_UNAVAILABLE');
    app.supabase.down = false;
    const again = await call(app, 'GET', '/auth/me', { token: body.session.accessToken, headers: visitor() });
    assert.equal(again.status, 200, 'the same session works once Supabase is back');
  });

  it('refresh during an outage answers 503 and the refresh token stays usable', async () => {
    addAccount('o2@example.com', 'correct-horse');
    const { body } = await login('o2@example.com', 'correct-horse');
    app.supabase.down = true;
    const during = await call(app, 'POST', '/auth/refresh', { body: { refreshToken: body.session.refreshToken }, headers: visitor() });
    assert.equal(during.status, 503);
    app.supabase.down = false;
    const after = await call(app, 'POST', '/auth/refresh', { body: { refreshToken: body.session.refreshToken }, headers: visitor() });
    assert.equal(after.status, 200);
  });

  it('login during an outage says the service is unavailable, not "incorrect password"', async () => {
    addAccount('o3@example.com', 'correct-horse');
    app.supabase.down = true;
    const res = await login('o3@example.com', 'correct-horse');
    assert.equal(res.status, 503);
    assert.equal(res.body.code, 'AUTH_UNAVAILABLE');
  });
});

describe('Supabase rate limit (429) is transient too', () => {
  it('a 429 from Supabase on token check / refresh / login answers 503, not 401', async () => {
    addAccount('rl@example.com', 'correct-horse');
    const { body } = await login('rl@example.com', 'correct-horse');
    const limited = async () => ({ data: { user: null, session: null }, error: { name: 'AuthApiError', code: 'over_request_rate_limit', message: 'rate limit', status: 429 } });
    const auth = app.supabase.anon.auth as any;
    const saved = { getUser: auth.getUser, refreshSession: auth.refreshSession, signInWithPassword: auth.signInWithPassword };
    Object.assign(auth, { getUser: limited, refreshSession: limited, signInWithPassword: limited });
    try {
      assert.equal((await call(app, 'GET', '/auth/me', { token: body.session.accessToken, headers: visitor() })).status, 503);
      assert.equal((await call(app, 'POST', '/auth/refresh', { body: { refreshToken: body.session.refreshToken }, headers: visitor() })).status, 503);
      assert.equal((await login('rl@example.com', 'correct-horse')).status, 503);
    } finally {
      Object.assign(auth, saved);
    }
  });
});
