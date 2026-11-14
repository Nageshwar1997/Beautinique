// A pretend gateway and identity for the Staff pages: /iam/me with the chosen roles' access, the
// roles, grants and invitations as lists that answer their filters and cursor pages, and the
// changes, each remembered so a test can check what was sent.
import { sessionHintCookieName } from '@beautinique/shared-contracts';

export const BASE_URL = 'https://bq.example/api/v1';
export const ME = '6730a2b4000000000000ffff';
const id = (n: number) => `6730a2b4000000000000${n.toString(16).padStart(4, '0')}`;

export type Who = 'master' | 'officer' | 'auditor' | 'head';

const ACCESS: Record<Who, { role: string; name: string; permissions: string[] }> = {
  master: {
    role: 'master.master',
    name: 'Master',
    permissions: [
      'iam.app.sign_in',
      'iam.grant.manage',
      'iam.grant.read',
      'iam.role.manage',
      'iam.totp.reset',
      'iam.totp.reset_master',
    ],
  },
  officer: {
    role: 'master.security_officer',
    name: 'Security Officer (CERT-In contact)',
    permissions: ['iam.app.sign_in', 'iam.grant.read', 'iam.session.revoke', 'iam.totp.reset'],
  },
  auditor: {
    role: 'master.internal_auditor',
    name: 'Internal Auditor',
    permissions: ['iam.app.sign_in', 'iam.grant.read'],
  },
  head: {
    role: 'master.head_of_operations',
    name: 'Head of Operations',
    permissions: ['iam.app.sign_in'],
  },
};

const role = (
  key: string,
  name: string,
  scopeTypes: string[],
  extra: Partial<{
    appointedBy: string[];
    permissions: string[];
    system: boolean;
    main: boolean;
  }> = {},
) => ({
  key,
  app: key.split('.')[0],
  name,
  main: extra.main ?? false,
  scopeTypes,
  permissions: ['iam.app.sign_in', ...(extra.permissions ?? [])],
  appointedBy: extra.appointedBy ?? ['master.master'],
  mfaRequired: true,
  signUp: false,
  maxHolders: null,
  system: extra.system ?? true,
  retired: false,
});

export const ROLES = [
  role('master.master', 'Master', ['global'], {
    appointedBy: [],
    main: true,
    permissions: [
      'iam.grant.read',
      'iam.grant.manage',
      'iam.role.manage',
      'iam.totp.reset',
      'iam.totp.reset_master',
    ],
  }),
  role('admin.state_admin', 'State Admin', ['state'], {
    main: true,
    permissions: ['iam.grant.read', 'iam.grant.manage'],
  }),
  role('admin.category_manager', 'Category Manager', ['category']),
  role('admin.fraud_risk', 'Fraud & Risk Analyst', ['global']),
  role('admin.c_night_desk', 'Night Desk', ['global'], { system: false }),
];

export interface Sent {
  method: string;
  path: string;
  body: unknown;
}

const grant = (
  n: number,
  email: string,
  roleKey: string,
  scope = { type: 'global', ids: [] as string[] },
) => ({
  grantId: id(100 + n),
  userId: id(n),
  email,
  role: roleKey,
  app: roleKey.split('.')[0],
  scope,
  validFrom: null,
  validTo: null,
  grantedBy: ME,
  via: 'appointed',
  active: true,
  createdAt: '2026-11-13T05:00:00.000Z',
  endedAt: null,
});

export function fakeApi(who: Who = 'master') {
  const sent: Sent[] = [];
  const state = {
    grants: [
      grant(1, 'asha@beautinique.example', 'admin.state_admin', {
        type: 'state',
        ids: ['MH', 'GJ'],
      }),
      grant(1, 'asha@beautinique.example', 'admin.fraud_risk'),
      grant(2, 'ravi@beautinique.example', 'admin.fraud_risk'),
      grant(3, 'mona@beautinique.example', 'master.master'),
    ].map((g, i) => ({ ...g, grantId: id(100 + i) })),
    invitations: [
      {
        invitationId: id(200),
        email: 'neel@beautinique.example',
        role: 'admin.state_admin',
        app: 'admin',
        scope: { type: 'state', ids: ['DL'] },
        validFrom: null,
        validTo: null,
        invitedBy: ME,
        status: 'pending',
        expiresAt: '2026-11-20T05:00:00.000Z',
        createdAt: '2026-11-13T05:00:00.000Z',
      },
      {
        invitationId: id(201),
        email: 'mira@beautinique.example',
        role: 'admin.fraud_risk',
        app: 'admin',
        scope: { type: 'global', ids: [] },
        validFrom: null,
        validTo: null,
        invitedBy: ME,
        status: 'accepted',
        expiresAt: '2026-11-20T05:00:00.000Z',
        createdAt: '2026-11-12T05:00:00.000Z',
      },
    ],
  };
  const access = ACCESS[who];
  document.cookie = `${sessionHintCookieName('master')}=1; Path=/; Secure`;
  const json = (status: number, body: unknown) =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      }),
    );

  // as identity decides it (QA DR-007): with the reset, never one's own, and an account whose
  // role carries the Master reset only by someone who holds it too
  const canResetAuthenticator = (userId: string): boolean => {
    if (!access.permissions.includes('iam.totp.reset') || userId === ME) return false;
    if (access.permissions.includes('iam.totp.reset_master')) return true;
    return !state.grants.some(
      (g) =>
        g.userId === userId &&
        g.active &&
        ROLES.find((r) => r.key === g.role)?.permissions.includes('iam.totp.reset_master') === true,
    );
  };

  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    const path = url.pathname.replace('/api/v1', '');
    const body: unknown = request.method === 'GET' ? null : await request.json().catch(() => null);
    sent.push({ method: request.method, path: `${path}${url.search}`, body });
    const q = url.searchParams;
    if (path === '/iam/me') {
      return json(200, {
        data: {
          user: {
            userId: ME,
            email: 'owner@beautinique.example',
            ageDeclaredAt: null,
            signUpApp: 'customer',
            providers: ['password'],
            authenticator: true,
            recoveryCodesLeft: 10,
            authenticatorRequiredBy: [],
          },
          session: { sessionId: id(9), app: 'master', expiresAt: '2026-12-31T00:00:00.000Z' },
          access: {
            roles: [{ role: access.role, name: access.name, scope: { type: 'global', ids: [] } }],
            permissions: access.permissions,
          },
        },
      });
    }
    if (path === '/iam/roles' && request.method === 'GET') {
      const app = q.get('app');
      return json(200, { data: { roles: ROLES.filter((r) => app === null || r.app === app) } });
    }
    if (path === '/iam/grants' && request.method === 'GET') {
      const items = state.grants.filter(
        (g) =>
          g.active === (q.get('status') !== 'ended') &&
          (q.get('email') === null || g.email === q.get('email')) &&
          (q.get('userId') === null || g.userId === q.get('userId')) &&
          (q.get('app') === null || g.app === q.get('app')) &&
          (q.get('role') === null || g.role === q.get('role')),
      );
      const userId = q.get('userId');
      return json(200, {
        data: {
          items,
          nextCursor: null,
          ...(userId === null ? {} : { canResetAuthenticator: canResetAuthenticator(userId) }),
        },
      });
    }
    if (path === '/iam/invitations' && request.method === 'GET') {
      const items = state.invitations.filter(
        (i) => q.get('status') === null || i.status === q.get('status'),
      );
      return json(200, { data: { items, nextCursor: null } });
    }
    const ended = /^\/iam\/grants\/([0-9a-f]{24})\/end$/.exec(path);
    if (ended) {
      const g = state.grants.find((x) => x.grantId === ended[1]);
      if (!g)
        return json(404, {
          error: { code: 'NOT_FOUND', message: 'Grant not found.', requestId: 'r', details: [] },
        });
      g.active = false;
      return json(200, { data: { grant: { ...g, endedAt: '2026-11-14T05:00:00.000Z' } } });
    }
    const revoked = /^\/iam\/invitations\/([0-9a-f]{24})\/revoke$/.exec(path);
    if (revoked) {
      const i = state.invitations.find((x) => x.invitationId === revoked[1]);
      if (!i)
        return json(404, {
          error: {
            code: 'NOT_FOUND',
            message: 'Invitation not found.',
            requestId: 'r',
            details: [],
          },
        });
      i.status = 'revoked';
      return json(200, { data: { invitation: i } });
    }
    if (path === '/iam/invitations' && request.method === 'POST') {
      const b = body as { email: string; role: string; scope: { type: string; ids: string[] } };
      const made = {
        invitationId: id(250),
        email: b.email,
        role: b.role,
        app: b.role.split('.')[0] ?? '',
        scope: b.scope,
        validFrom: null,
        validTo: null,
        invitedBy: ME,
        status: 'pending',
        expiresAt: '2026-11-21T05:00:00.000Z',
        createdAt: '2026-11-14T05:00:00.000Z',
      };
      state.invitations.unshift(made);
      return json(200, { data: { invitation: made } });
    }
    if (path.endsWith('/authenticator/reset')) {
      // ravi never set one up: nothing to reset
      const none = path.includes(id(2));
      return json(200, { data: { reset: !none, sessionsEnded: none ? 0 : 2 } });
    }
    if (path.endsWith('/sessions/end')) return json(200, { data: { ended: 3 } });
    if (path === '/iam/roles' && request.method === 'POST') {
      const b = body as {
        app: string;
        slug: string;
        name: string;
        scopeTypes: string[];
        permissions: string[];
        appointedBy: string[];
        mfaRequired: boolean;
      };
      return json(200, {
        data: {
          role: {
            ...role(`${b.app}.c_${b.slug}`, b.name, b.scopeTypes, { system: false }),
            permissions: b.permissions,
            appointedBy: b.appointedBy,
            mfaRequired: b.mfaRequired,
          },
        },
      });
    }
    return json(404, {
      error: { code: 'NOT_FOUND', message: 'Not here.', requestId: 'r', details: [] },
    });
  };
  return { fetch, sent, state, paths: () => sent.map((s) => `${s.method} ${s.path}`) };
}
