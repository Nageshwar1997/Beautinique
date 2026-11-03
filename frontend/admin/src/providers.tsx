import { ApiProvider, createApiClient, createQueryClient } from '@beautinique/frontend-api-client';
import { IdleNotice, SessionProvider, StepUpProvider } from '@beautinique/frontend-auth-ui';
import { type ReactNode, useState } from 'react';

/**
 * The app's API client, Query cache, session, step-up dialog and idle sign-out (ARCHITECTURE §9.2),
 * inside the router (the dialogs link to the security page). The session asks /iam/me only with
 * identity's hint cookie.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => createApiClient({ app: 'admin' }));
  const [queryClient] = useState(createQueryClient);
  return (
    <ApiProvider client={client} queryClient={queryClient}>
      <SessionProvider>
        {/* answers STEP_UP_REQUIRED for every call (the authenticator code again) */}
        <StepUpProvider>{children}</StepUpProvider>
        {/* 28 idle minutes: "Are you still there?"; 30: signed out (an internal app) */}
        <IdleNotice />
      </SessionProvider>
    </ApiProvider>
  );
}
