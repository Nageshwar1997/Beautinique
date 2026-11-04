import { isApiError, useApiClient, useApiQuery } from '@beautinique/frontend-api-client';
import {
  type AppId,
  getMe,
  logout,
  queryKey,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import { clearSessionHint, hasSessionHint } from './session-hint';

export type Me = RouteOutput<typeof getMe>;

/**
 * Who is signed in to this app, as /iam/me says (the app keeps none of it in browser storage):
 * - `loading`: not known yet (on the server and until the first answer); show a placeholder.
 * - `signed-out`: no session (no hint cookie, or /iam/me found the session gone); `reason` when
 *   this tab knows why the app ended it (`idle`: 30 minutes without activity, IdleNotice).
 * - `signed-in`: the account and this session.
 * - `unavailable`: /iam/me did not answer (offline, server down); asked again when back online.
 */
export type SessionState =
  | { status: 'loading' }
  | { status: 'signed-out'; reason?: SignedOutReason }
  | { status: 'unavailable' }
  | ({ status: 'signed-in' } & Me);

/** Why the app ended a session itself: `idle` (an internal app, no activity for 30 minutes). */
export type SignedOutReason = 'idle';

export interface Session {
  app: AppId;
  state: SessionState;
  /** After a sign-in (or a new account): reads /iam/me again here and tells the app's other tabs. */
  signedIn: () => Promise<void>;
  /**
   * Signs this session out, forgets what was cached for the person, and tells the other tabs.
   * `reason` stays on the signed-out state, so the sign-in page can say it.
   */
  signOut: (reason?: SignedOutReason) => Promise<void>;
  /**
   * The server ended every session already (a new password, ARCHITECTURE §7.2), or another tab
   * signed out for being idle: forget it here the same way, without asking it to.
   */
  forget: (reason?: SignedOutReason) => void;
}

const SessionContext = createContext<Session | null>(null);

const noSubscription = () => () => undefined;

const ME_KEY = queryKey(getMe);

/**
 * The session of the app's API client (ApiProvider above it): /iam/me only while identity's hint
 * cookie is there, read again when this tab or another one signs in or out.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const { app } = client;
  // bumped when the cookies changed, so the hint (a cookie, which tells nobody) is read again
  const [, setVersion] = useState(0);
  // why this tab ended the session, until the next sign-in
  const [endedBy, setEndedBy] = useState<SignedOutReason | undefined>(undefined);
  const hint = useSyncExternalStore(
    noSubscription,
    () => hasSessionHint(app),
    () => null,
  );
  const me = useApiQuery(getMe, undefined, {
    enabled: hint === true,
    // a missing session is an answer, not a failure to try again
    retry: false,
    staleTime: Infinity,
  });

  useEffect(
    () =>
      client.onSessionChange(() => {
        setVersion((v) => v + 1);
        void queryClient.invalidateQueries({ queryKey: ME_KEY });
      }),
    [client, queryClient],
  );

  const expired =
    isApiError(me.error, 'SESSION_EXPIRED') || isApiError(me.error, 'UNAUTHENTICATED');
  useEffect(() => {
    if (expired) clearSessionHint(app);
  }, [expired, app]);

  const state = useMemo((): SessionState => {
    if (hint === null) return { status: 'loading' };
    if (!hint || expired) {
      return endedBy === undefined
        ? { status: 'signed-out' }
        : { status: 'signed-out', reason: endedBy };
    }
    if (me.data) return { status: 'signed-in', ...me.data };
    if (me.error) return { status: 'unavailable' };
    return { status: 'loading' };
  }, [hint, expired, endedBy, me.data, me.error]);

  const signedIn = useCallback(async () => {
    setEndedBy(undefined);
    setVersion((v) => v + 1);
    client.sessionChanged('signed-in');
    await queryClient.refetchQueries({ queryKey: ME_KEY });
  }, [client, queryClient]);

  const forget = useCallback(
    (reason?: SignedOutReason) => {
      clearSessionHint(app);
      // nothing of the person stays cached in this tab
      queryClient.clear();
      setEndedBy(reason);
      setVersion((v) => v + 1);
      client.sessionChanged('signed-out');
    },
    [client, queryClient, app],
  );

  const signOut = useCallback(
    async (reason?: SignedOutReason) => {
      try {
        await client.call(logout);
      } finally {
        forget(reason);
      }
    },
    [client, forget],
  );

  const session = useMemo(
    () => ({ app, state, signedIn, signOut, forget }),
    [app, state, signedIn, signOut, forget],
  );
  return <SessionContext value={session}>{children}</SessionContext>;
}

/** The session from the nearest SessionProvider. */
export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession needs a SessionProvider above it.');
  return session;
}
