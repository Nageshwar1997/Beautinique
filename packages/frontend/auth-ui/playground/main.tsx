// Playground: the auth screens against a pretend identity, inside the shell (theme switcher for
// light and dark). `npm run playground --workspace @beautinique/frontend-auth-ui`,
// http://localhost:5186.
import './playground.css';

import {
  ApiProvider,
  createApiClient,
  createQueryClient,
  queryKey,
} from '@beautinique/frontend-api-client';
import { AppFrame, NavList, THEME_SCRIPT, ThemeSwitcher } from '@beautinique/frontend-app-shell';
import { Radio, RadioGroup, Toaster } from '@beautinique/frontend-components';
import { getMe } from '@beautinique/shared-contracts';
import { type ReactNode, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate } from 'react-router';

import {
  ACCOUNT_PATHS,
  AccountMenu,
  AuthenticatorSetup,
  AuthLayout,
  ForgotPasswordForm,
  InvitationForm,
  MyDevices,
  RedirectIfSignedIn,
  RequireSignIn,
  SecuritySettings,
  SessionProvider,
  SignInForm,
  SignUpForm,
  StepUpProvider,
  TextLink,
  useSession,
} from '../src/index';
import {
  failure,
  fakeIdentity,
  GOOD_CODE,
  passwordKept,
  RECOVERY_CODES,
  totpNext,
} from '../test/fake-identity';

const identity = fakeIdentity('customer');
const pause = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
// a real server takes a moment: the busy buttons show
const slowFetch: typeof identity.fetch = async (input, init) => {
  await pause(500);
  return identity.fetch(input, init);
};
const client = createApiClient({
  app: 'customer',
  baseUrl: `${window.location.origin}/api/v1`,
  fetch: slowFetch,
});
const queryClient = createQueryClient();

const SCENARIOS = {
  plain: 'Password only: signed in',
  totp: 'The account has an authenticator',
  wrong: 'Wrong email or password',
  existing: 'Sign-up: the email has an account',
  down: 'The server does not answer (/iam/me 503): an account page says so',
} as const;
type Scenario = keyof typeof SCENARIOS;

function choose(scenario: Scenario) {
  identity.off('POST /auth/login');
  identity.off('POST /auth/otp/:id/verify');
  identity.off('GET /iam/me');
  if (scenario === 'wrong') {
    identity.on('POST /auth/login', () =>
      failure(401, 'INVALID_CREDENTIALS', 'The email or password is not right.'),
    );
  }
  if (scenario === 'totp') identity.on('POST /auth/login', totpNext);
  if (scenario === 'existing') identity.on('POST /auth/otp/:id/verify', passwordKept);
  if (scenario === 'down') {
    identity.on('GET /iam/me', () =>
      failure(503, 'SERVICE_UNAVAILABLE', 'Sign-in is not available right now.'),
    );
    // the session forgets what it knew and asks again (two more tries), as an app opening while
    // the server restarts
    void queryClient.resetQueries({ queryKey: queryKey(getMe) });
  }
}

function Scenarios() {
  const [scenario, setScenario] = useState<Scenario>('plain');
  return (
    <RadioGroup
      label="The pretend identity answers"
      value={scenario}
      onChange={(value) => {
        setScenario(value as Scenario);
        choose(value as Scenario);
      }}
    >
      {Object.entries(SCENARIOS).map(([value, label]) => (
        <Radio key={value} value={value}>
          {label}
        </Radio>
      ))}
    </RadioGroup>
  );
}

function Home() {
  const { state } = useSession();
  return (
    <div className="container-page space-y-6 py-8">
      <h1 className="font-display text-3xl font-medium">Auth UI</h1>
      <p>
        Session: <strong>{state.status}</strong>
        {state.status === 'signed-in' && ` (${state.user.email})`}. Every code works; choose below
        what the pretend identity answers. To confirm it’s you (step-up): {GOOD_CODE}, or the
        recovery code {RECOVERY_CODES[0]}.
      </p>
      <Scenarios />
    </div>
  );
}

function Shell() {
  return (
    <AppFrame
      header={
        <header className="border-border border-b">
          <div className="container-page flex min-h-16 items-center gap-3">
            <span className="font-display text-brand-gradient mr-auto text-2xl font-medium">
              Auth UI
            </span>
            <NavList
              label="Pages"
              className="hidden md:block"
              items={[
                { to: '/', label: 'Home', end: true },
                { to: '/sign-up', label: 'Sign up' },
                { to: '/invitation', label: 'Invitation' },
                { to: ACCOUNT_PATHS.security, label: 'Security' },
                { to: ACCOUNT_PATHS.devices, label: 'My Devices' },
              ]}
            />
            <AccountMenu links={ACCOUNT_LINKS} />
            <ThemeSwitcher />
          </div>
        </header>
      }
    >
      <StepUpProvider>
        <Outlet />
      </StepUpProvider>
      <Toaster />
    </AppFrame>
  );
}

const ACCOUNT_LINKS = [
  { href: ACCOUNT_PATHS.security, label: 'Security' },
  { href: ACCOUNT_PATHS.devices, label: 'My Devices' },
];

/** An account page as an app lays it out: signed in only, its heading, the account's nav. */
function AccountPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <RequireSignIn>
      <div className="container-page max-w-3xl space-y-6 py-8">
        <h1 className="font-display text-3xl font-medium">{title}</h1>
        {children}
      </div>
    </RequireSignIn>
  );
}

function SetupPage() {
  const navigate = useNavigate();
  return (
    <AccountPage title="Authenticator app">
      <AuthenticatorSetup onDone={() => void navigate(ACCOUNT_PATHS.security)} />
    </AccountPage>
  );
}

const router = createBrowserRouter([
  {
    Component: Shell,
    children: [
      { path: '/', Component: Home },
      {
        path: '/sign-in',
        element: (
          <RedirectIfSignedIn>
            <AuthLayout
              title="Sign in"
              footer={
                <>
                  New to Beautinique? <TextLink to="/sign-up">Create an account</TextLink>
                </>
              }
            >
              <SignInForm />
            </AuthLayout>
          </RedirectIfSignedIn>
        ),
      },
      {
        path: '/sign-up',
        element: (
          <RedirectIfSignedIn>
            <AuthLayout
              title="Create an account"
              footer={
                <>
                  Have an account? <TextLink to="/sign-in">Sign in</TextLink>
                </>
              }
            >
              <SignUpForm />
            </AuthLayout>
          </RedirectIfSignedIn>
        ),
      },
      {
        path: '/forgot-password',
        element: (
          <AuthLayout title="Set a new password">
            <ForgotPasswordForm />
          </AuthLayout>
        ),
      },
      {
        path: '/invitation',
        element: (
          <AuthLayout title="Accept an invitation">
            <InvitationForm />
          </AuthLayout>
        ),
      },
      {
        path: ACCOUNT_PATHS.security,
        element: (
          <AccountPage title="Security">
            <SecuritySettings />
          </AccountPage>
        ),
      },
      { path: ACCOUNT_PATHS.authenticator, Component: SetupPage },
      {
        path: ACCOUNT_PATHS.devices,
        element: (
          <AccountPage title="My Devices">
            <MyDevices />
          </AccountPage>
        ),
      },
      { path: '/terms', element: <p className="container-page py-8">Terms (dummy)</p> },
      { path: '/privacy', element: <p className="container-page py-8">Privacy (dummy)</p> },
    ],
  },
]);

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
