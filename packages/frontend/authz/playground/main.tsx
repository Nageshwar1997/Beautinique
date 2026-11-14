// Playground: what each Master-app role sees, against a pretend identity whose GET /iam/me answers
// the chosen role's access. `npm run playground --workspace @beautinique/frontend-authz`,
// http://localhost:5187.
import './playground.css';

import {
  ApiProvider,
  createApiClient,
  createQueryClient,
  queryKey,
} from '@beautinique/frontend-api-client';
import { AppFrame, NavList, THEME_SCRIPT, ThemeSwitcher } from '@beautinique/frontend-app-shell';
import { SessionProvider, useSession } from '@beautinique/frontend-auth-ui';
import { Button, Radio, RadioGroup } from '@beautinique/frontend-components';
import { getMe, sessionHintCookieName } from '@beautinique/shared-contracts';
import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import {
  type Access,
  Can,
  NO_ACCESS,
  RequirePermission,
  useAccess,
  useVisible,
} from '../src/index';

const ROLES = {
  master: {
    label: 'Master',
    access: {
      roles: [{ role: 'master.master', name: 'Master', scope: { type: 'global', ids: [] } }],
      permissions: [
        'iam.app.sign_in',
        'iam.grant.manage',
        'iam.grant.read',
        'iam.role.manage',
        'iam.totp.reset',
      ],
    },
  },
  officer: {
    label: 'Security Officer',
    access: {
      roles: [
        {
          role: 'master.security_officer',
          name: 'Security Officer (CERT-In contact)',
          scope: { type: 'global', ids: [] },
        },
      ],
      permissions: ['iam.app.sign_in', 'iam.grant.read', 'iam.session.revoke', 'iam.totp.reset'],
    },
  },
  auditor: {
    label: 'Internal Auditor',
    access: {
      roles: [
        {
          role: 'master.internal_auditor',
          name: 'Internal Auditor',
          scope: { type: 'global', ids: [] },
        },
      ],
      permissions: ['iam.app.sign_in', 'iam.grant.read'],
    },
  },
  head: {
    label: 'Head of Operations',
    access: {
      roles: [
        {
          role: 'master.head_of_operations',
          name: 'Head of Operations',
          scope: { type: 'global', ids: [] },
        },
      ],
      permissions: ['iam.app.sign_in'],
    },
  },
  none: { label: 'Identity without access (older)', access: NO_ACCESS },
} satisfies Record<string, { label: string; access: Access }>;
type RoleChoice = keyof typeof ROLES;

let chosen: RoleChoice = 'master';

/** The pretend identity: /iam/me with the chosen role's access; nothing else is asked here. */
const fakeFetch: typeof fetch = (input) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.pathname.endsWith('/iam/me')) {
    const data = {
      user: {
        userId: '6730a2b40000000000000001',
        email: 'asha@beautinique.example',
        ageDeclaredAt: null,
        signUpApp: 'customer',
        providers: ['password'],
        authenticator: true,
        recoveryCodesLeft: 10,
        authenticatorRequiredBy: [],
      },
      session: {
        sessionId: '6730a2b40000000000000002',
        app: 'master',
        expiresAt: '2026-12-31T00:00:00.000Z',
      },
      ...(chosen === 'none' ? {} : { access: ROLES[chosen].access }),
    };
    return Promise.resolve(Response.json({ data }));
  }
  return Promise.resolve(
    Response.json(
      { error: { code: 'NOT_FOUND', message: 'Not here', requestId: 'p' } },
      { status: 404 },
    ),
  );
};

const client = createApiClient({
  app: 'master',
  baseUrl: `${window.location.origin}/api/v1`,
  fetch: fakeFetch,
});
const queryClient = createQueryClient();
// the hint cookie identity sets at sign-in: without it the session asks nothing
document.cookie = `${sessionHintCookieName('master')}=1; Path=/; Secure; SameSite=Lax`;

const NAV = [
  { label: 'Home', to: '/' },
  { label: 'Staff', to: '/staff', permission: 'iam.grant.read' },
  { label: 'Roles', to: '/roles', permission: 'iam.grant.read' },
];

function Playground() {
  const [role, setRole] = useState<RoleChoice>(chosen);
  const { state } = useSession();
  const access = useAccess();
  const nav = useVisible(NAV);
  return (
    <AppFrame
      header={
        <header className="border-border border-b">
          <div className="container-page flex min-h-16 items-center gap-3">
            <span className="font-display mr-auto text-lg font-medium">Authz</span>
            <NavList items={nav} label="Main" />
            <ThemeSwitcher />
          </div>
        </header>
      }
    >
      <div className="container-page space-y-8 py-8">
        <RadioGroup
          label="Signed in as"
          value={role}
          onChange={(value) => {
            chosen = value as RoleChoice;
            setRole(chosen);
            void queryClient.invalidateQueries({ queryKey: queryKey(getMe) });
          }}
        >
          {Object.entries(ROLES).map(([key, { label }]) => (
            <Radio key={key} value={key}>
              {label}
            </Radio>
          ))}
        </RadioGroup>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium">What this role sees</h2>
          <p className="text-foreground-muted text-sm">
            Session: {state.status}; roles:{' '}
            {access.roles.map((held) => held.name).join(', ') || 'none'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Can permission="iam.grant.manage" fallback={<p>No "Invite someone" (reads only).</p>}>
              <Button>Invite someone</Button>
            </Can>
            <Can permission="iam.role.manage">
              <Button variant="outline">New sub-role</Button>
            </Can>
            <Can permission={['iam.totp.reset', 'iam.session.revoke']} match="any">
              <Button variant="outline" tone="error">
                Security actions
              </Button>
            </Can>
          </div>
          <RequirePermission
            permission="iam.grant.read"
            denied={<p className="font-medium">The Staff page: not for your role.</p>}
          >
            <p className="font-medium">The Staff page opens.</p>
          </RequirePermission>
        </section>
      </div>
    </AppFrame>
  );
}

const router = createBrowserRouter([{ path: '*', element: <Playground /> }]);

// what a server-rendered app puts in <head> (ThemeScript)
const themeScript = document.createElement('script');
themeScript.textContent = THEME_SCRIPT;
document.head.prepend(themeScript);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ApiProvider client={client} queryClient={queryClient}>
        <SessionProvider>
          <RouterProvider router={router} />
        </SessionProvider>
      </ApiProvider>
    </StrictMode>,
  );
}
