import { SecuritySettings } from '@beautinique/frontend-auth-ui';

import type { Route } from './+types/account-security';

export const meta: Route.MetaFunction = () => [
  { title: 'Security | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

/** The password and the authenticator app. */
export default function AccountSecurity() {
  return (
    <>
      <h1 className="font-display text-3xl font-medium">Security</h1>
      <SecuritySettings />
    </>
  );
}
