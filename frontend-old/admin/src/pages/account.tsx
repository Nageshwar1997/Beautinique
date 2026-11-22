import { NavList } from '@beautinique/frontend-app-shell';
import {
  ACCOUNT_PATHS,
  AuthenticatorSetup,
  MyDevices,
  SecuritySettings,
} from '@beautinique/frontend-auth-ui';
import { Navigate, Outlet, useNavigate } from 'react-router';

import { ACCOUNT_NAV, pageTitle } from '../nav';

/** The account pages (ARCHITECTURE §9.2): Security and My Devices, behind the sign-in guard. */
export function AccountLayout() {
  return (
    <div className="container-page max-w-3xl space-y-6 py-8 sm:py-12">
      <NavList items={ACCOUNT_NAV} label="Account" />
      <Outlet />
    </div>
  );
}

/** `/account` itself: the security page, the first of the account's pages. */
export function AccountIndex() {
  return <Navigate to={ACCOUNT_PATHS.security} replace />;
}

/** The password and the authenticator app (this app needs one: identity says why it stays on). */
export function SecurityPage() {
  return (
    <>
      <title>{pageTitle('Security')}</title>
      <h1 className="font-display text-3xl font-medium">Security</h1>
      <SecuritySettings />
    </>
  );
}

/** A new phone for the authenticator (a step-up first), then back to the security page. */
export function AuthenticatorPage() {
  const navigate = useNavigate();
  return (
    <>
      <title>{pageTitle('Set up the authenticator app')}</title>
      <h1 className="font-display text-3xl font-medium">Authenticator app</h1>
      <AuthenticatorSetup onDone={() => void navigate(ACCOUNT_PATHS.security)} />
    </>
  );
}

/** Where the account is signed in, in every app. */
export function DevicesPage() {
  return (
    <>
      <title>{pageTitle('My Devices')}</title>
      <h1 className="font-display text-3xl font-medium">My Devices</h1>
      <MyDevices />
    </>
  );
}
