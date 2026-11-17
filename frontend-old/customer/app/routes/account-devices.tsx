import { MyDevices } from '@beautinique/frontend-auth-ui';

import type { Route } from './+types/account-devices';

export const meta: Route.MetaFunction = () => [
  { title: 'My Devices | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

/** Where the account is signed in, in every app. */
export default function AccountDevices() {
  return (
    <>
      <h1 className="font-display text-3xl font-medium">My Devices</h1>
      <MyDevices />
    </>
  );
}
