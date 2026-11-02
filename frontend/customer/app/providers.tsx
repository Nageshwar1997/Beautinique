import { ApiProvider, createApiClient, createQueryClient } from '@beautinique/frontend-api-client';
import { SessionProvider } from '@beautinique/frontend-auth-ui';
import { type ReactNode, useState } from 'react';

/**
 * The app's API client, Query cache and session (ARCHITECTURE §9.2). Made once per render tree, so
 * on the server every request gets its own (nothing of one visitor reaches another); the session
 * asks /iam/me in the browser only, and only with identity's hint cookie.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => createApiClient({ app: 'customer' }));
  const [queryClient] = useState(createQueryClient);
  return (
    <ApiProvider client={client} queryClient={queryClient}>
      <SessionProvider>{children}</SessionProvider>
    </ApiProvider>
  );
}
