import { ACCOUNT_PATHS, AuthenticatorSetup } from '@beautinique/frontend-auth-ui';
import { useNavigate } from 'react-router';

import type { Route } from './+types/account-authenticator';

export const meta: Route.MetaFunction = () => [
  { title: 'Set up the authenticator app | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

/** Setting up the authenticator (or a new phone), then back to the security page. */
export default function AccountAuthenticator() {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="font-display text-3xl font-medium">Authenticator app</h1>
      <AuthenticatorSetup onDone={() => void navigate(ACCOUNT_PATHS.security)} />
    </>
  );
}
