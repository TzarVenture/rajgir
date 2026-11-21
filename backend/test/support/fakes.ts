import { randomUUID } from 'crypto';

/**
 * In-memory stand-ins for Supabase Auth and Prisma, so the auth stack (controllers, global guards,
 * validation, services) can be tested over real HTTP without touching any real project or database.
 * They implement only what the auth code paths call.
 */

interface FakeAuthUser {
  id: string;
  email: string;
  password: string;
  email_confirmed_at: string | null;
}

interface FakeSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

const ok = <T>(data: T) => ({ data, error: null });
const fail = (code: string, message = code, status = 400) => ({ data: { user: null, session: null }, error: { code, message, status } });
/** What supabase-js returns when Supabase cannot be reached. */
const unreachable = () => ({ data: { user: null, session: null }, error: { name: 'AuthRetryableFetchError', message: 'fetch failed', status: 0 } });

export class FakeSupabase {
  readonly authUsers = new Map<string, FakeAuthUser>();
  readonly sessions: FakeSession[] = [];
  readonly revocations: { accessToken: string; scope: string }[] = [];
  readonly passwordUpdates: { userId: string; password: string }[] = [];
  /** Simulate a Supabase outage (network error) for sign-in, token checks and refresh. */
  down = false;

  addAuthUser(email: string, password: string, confirmed = true): FakeAuthUser {
    const user = { id: randomUUID(), email, password, email_confirmed_at: confirmed ? new Date().toISOString() : null };
    this.authUsers.set(user.id, user);
    return user;
  }

  /** Open a session for a user (what a successful sign-in does). */
  issueSession(userId: string) {
    const session = { userId, accessToken: `at-${randomUUID()}`, refreshToken: `rt-${randomUUID()}` };
    this.sessions.push(session);
    return {
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    };
  }

  isActive(accessToken: string): boolean {
    return this.sessions.some((s) => s.accessToken === accessToken);
  }

  private publicUser(user: FakeAuthUser) {
    return { id: user.id, email: user.email, email_confirmed_at: user.email_confirmed_at, identities: [{}] };
  }

  private userForToken(accessToken: string): FakeAuthUser | undefined {
    const session = this.sessions.find((s) => s.accessToken === accessToken);
    return session ? this.authUsers.get(session.userId) : undefined;
  }

  readonly anon = {
    auth: {
      getUser: async (accessToken: string) => {
        if (this.down) return unreachable();
        const user = this.userForToken(accessToken);
        return user ? ok({ user: this.publicUser(user) }) : fail('bad_jwt', 'invalid JWT', 401);
      },
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        if (this.down) return unreachable();
        const user = [...this.authUsers.values()].find((u) => u.email === email);
        if (!user || user.password !== password) return fail('invalid_credentials');
        if (!user.email_confirmed_at) return fail('email_not_confirmed');
        return ok({ user: this.publicUser(user), session: this.issueSession(user.id) });
      },
      refreshSession: async ({ refresh_token }: { refresh_token: string }) => {
        if (this.down) return unreachable();
        const index = this.sessions.findIndex((s) => s.refreshToken === refresh_token);
        if (index < 0) return fail('refresh_token_not_found', 'Invalid Refresh Token', 400);
        const [old] = this.sessions.splice(index, 1);
        return ok({ session: this.issueSession(old.userId), user: this.publicUser(this.authUsers.get(old.userId)!) });
      },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        if ([...this.authUsers.values()].some((u) => u.email === email)) {
          return ok({ user: { id: randomUUID(), email, identities: [] }, session: null });
        }
        const user = this.addAuthUser(email, password, false);
        return ok({ user: this.publicUser(user), session: null });
      },
      resend: async () => ok({}),
      resetPasswordForEmail: async () => ok({}),
      verifyOtp: async () => fail('otp_expired'),
    },
  };

  readonly admin = { auth: { admin: { deleteUser: async (id: string) => (this.authUsers.delete(id), ok({})) } } };

  userClient(accessToken: string) {
    return {
      auth: {
        updateUser: async ({ password }: { password: string }) => {
          const user = this.userForToken(accessToken);
          if (!user) return fail('session_not_found');
          user.password = password;
          this.passwordUpdates.push({ userId: user.id, password });
          return ok({ user: this.publicUser(user) });
        },
      },
    };
  }

  async revokeSession(accessToken: string, scope: 'local' | 'others' | 'global' = 'local'): Promise<boolean> {
    this.revocations.push({ accessToken, scope });
    const owner = this.sessions.find((s) => s.accessToken === accessToken)?.userId;
    if (!owner) return false;
    for (let i = this.sessions.length - 1; i >= 0; i--) {
      const s = this.sessions[i];
      if (s.userId !== owner) continue;
      const isThis = s.accessToken === accessToken;
      if (scope === 'global' || (scope === 'local' && isThis) || (scope === 'others' && !isThis)) this.sessions.splice(i, 1);
    }
    return true;
  }
}

export interface FakeUserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string | null;
  status: string;
  supabaseAuthId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function matches(row: FakeUserRow, where: Record<string, unknown>): boolean {
  if (Array.isArray(where.OR)) return (where.OR as Record<string, unknown>[]).some((w) => matches(row, w));
  return Object.entries(where).every(([key, value]) => (row as unknown as Record<string, unknown>)[key] === value);
}

/** Just enough of PrismaClient for UsersService / AuthService / guards. */
export class FakePrisma {
  readonly users: FakeUserRow[] = [];

  addUser(partial: Partial<FakeUserRow> & { email: string }): FakeUserRow {
    const row: FakeUserRow = {
      id: randomUUID(),
      firstName: 'Test',
      lastName: 'User',
      phone: null,
      role: null,
      status: 'PENDING_ONBOARDING',
      supabaseAuthId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...partial,
    };
    this.users.push(row);
    return row;
  }

  readonly user = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => this.users.find((u) => matches(u, where)) ?? null,
    findFirst: async ({ where }: { where: Record<string, unknown> }) => this.users.find((u) => matches(u, where)) ?? null,
    update: async ({ where, data }: { where: Record<string, unknown>; data: Partial<FakeUserRow> }) => {
      const row = this.users.find((u) => matches(u, where));
      if (!row) throw new Error('not found');
      Object.assign(row, data);
      return row;
    },
    create: async ({ data }: { data: Partial<FakeUserRow> & { email: string } }) => this.addUser(data),
  };

  async $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T> {
    return fn(this);
  }
}
