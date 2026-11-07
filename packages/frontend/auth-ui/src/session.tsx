import {
  errorMessage,
  isApiError,
  retryServerTrouble,
  useApiClient,
  useApiQuery,
} from '@beautinique/frontend-api-client';
import { dismissToast, toast } from '@beautinique/frontend-components';
import {
  type AppId,
  getMe,
  logout,
  queryKey,
  type RouteOutput,
  SESSION_POLICIES,
} from '@beautinique/shared-contracts';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
 * - `unavailable`: /iam/me did not answer, two more tries included (offline, a server restarting);
 *   asked again when back online, or with `retry` (RequireSignIn's "Try again", QA-FE-009).
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
   * Signs this session out on the server, then forgets what was cached for the person and tells
   * the other tabs. Rejects, and the person stays signed in here, when the server did not end it
   * (offline, a server error): its cookies, which the page cannot touch, still work (QA-FE-004).
   * `'idle'` is forgotten here at once instead, and the server is asked until it hears it.
   * `reason` stays on the signed-out state, so the sign-in page can say it.
   */
  signOut: (reason?: SignedOutReason) => Promise<void>;
  /**
   * The server ended every session already (a new password, ARCHITECTURE §7.2), or another tab
   * signed out for being idle: forget it here the same way, without asking it to.
   */
  forget: (reason?: SignedOutReason) => void;
  /** Asks /iam/me again now: after `unavailable` (the server did not answer). */
  retry: () => void;
}

const SessionContext = createContext<Session | null>(null);

const noSubscription = () => () => undefined;

const ME_KEY = queryKey(getMe);

/** An idle sign-out the server did not hear yet is sent again this often (QA-FE-004). */
export const SIGN_OUT_RETRY_MS = 30_000;

/** The toast that says a sign-out did not end the session: gone once the session ends here. */
const STILL_SIGNED_IN_TOAST = 'auth-ui:still-signed-in';

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
    // a server that did not answer (a restart) is asked twice more; a missing session (4xx) is an
    // answer, never asked again
    retry: retryServerTrouble,
    staleTime: Infinity,
  });
  const { refetch } = me;
  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);
  // stops sending an idle sign-out again (endOnServer), when one is being sent
  const stopEnding = useRef<(() => void) | null>(null);
  const stopEndingNow = useCallback(() => {
    stopEnding.current?.();
  }, []);
  useEffect(() => stopEndingNow, [stopEndingNow]);

  useEffect(
    () =>
      client.onSessionChange((change) => {
        // signed in again (here or in another tab): an old sign-out sent now would end that session
        if (change === 'signed-in') stopEndingNow();
        setVersion((v) => v + 1);
        void queryClient.invalidateQueries({ queryKey: ME_KEY });
      }),
    [client, queryClient, stopEndingNow],
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

  // the session ended (here, in another tab, on the server): "still signed in" is not true now
  useEffect(() => {
    if (state.status === 'signed-out') dismissToast(STILL_SIGNED_IN_TOAST);
  }, [state.status]);

  const signedIn = useCallback(async () => {
    stopEndingNow();
    setEndedBy(undefined);
    setVersion((v) => v + 1);
    client.sessionChanged('signed-in');
    await queryClient.refetchQueries({ queryKey: ME_KEY });
  }, [client, queryClient, stopEndingNow]);

  const forget = useCallback(
    (reason?: SignedOutReason) => {
      clearSessionHint(app);
      // nothing of the person stays cached in this tab
      queryClient.clear();
      setEndedBy(reason);
      setVersion((v) => v + 1);
      // An idle sign-out reaches the other tabs on IdleNotice's channel only, as one message that
      // carries why: a "signed-out" on the session channel too could reach a tab before it, and
      // that tab would go to sign-in without the note (QA-FE-010).
      if (reason !== 'idle') client.sessionChanged('signed-out');
    },
    [client, queryClient, app],
  );

  /**
   * After an idle sign-out (forgotten here already): POST /auth/logout until the server answers.
   * Offline or a server error, it is sent again when the browser is back online and every
   * SIGN_OUT_RETRY_MS while the tab is open, for as long as the server's own idle limit may keep
   * the session; never once the app is signed in again, as it would end that new session.
   */
  const endOnServer = useCallback(() => {
    stopEndingNow();
    const until = Date.now() + (SESSION_POLICIES[app].idleMs ?? 0);
    let sending = false;
    const stop = () => {
      clearInterval(timer);
      window.removeEventListener('online', send);
      if (stopEnding.current === stop) stopEnding.current = null;
    };
    function send() {
      if (sending) return;
      // a sign-in since (another tab's, a moment ago) sets the hint: the cookies are its now
      if (Date.now() > until || hasSessionHint(app) === true) {
        stop();
        return;
      }
      sending = true;
      client
        .call(logout)
        .then(stop, () => undefined)
        .finally(() => {
          sending = false;
        });
    }
    const timer = setInterval(send, SIGN_OUT_RETRY_MS);
    window.addEventListener('online', send);
    stopEnding.current = stop;
    send();
  }, [app, client, stopEndingNow]);

  const signOut = useCallback(
    async (reason?: SignedOutReason) => {
      if (reason === 'idle') {
        // the sign-in page says why at once, never waiting for the server (QA-FE-010)
        forget('idle');
        endOnServer();
        return;
      }
      // Only the server's answer ends the session: until then its cookies (HttpOnly, out of the
      // page's reach) still work, so the person stays signed in here and can try again (QA-FE-004).
      await client.call(logout);
      forget();
    },
    [client, forget, endOnServer],
  );

  const session = useMemo(
    () => ({ app, state, signedIn, signOut, forget, retry }),
    [app, state, signedIn, signOut, forget, retry],
  );
  return <SessionContext value={session}>{children}</SessionContext>;
}

/** The session from the nearest SessionProvider. */
export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession needs a SessionProvider above it.');
  return session;
}

/**
 * A "Sign out" control's action (the account menu, My Devices, the idle question): `signOut()`
 * with its toasts, resolving to true once signed out. When the server did not end the session,
 * the person is still signed in here and the toast says so, with "Try again" (QA-FE-004).
 */
export function useSignOut(): () => Promise<boolean> {
  const { signOut } = useSession();
  return useCallback(() => {
    const attempt = async (): Promise<boolean> => {
      try {
        await signOut();
        toast({ tone: 'success', title: 'You are signed out.' });
        return true;
      } catch (error) {
        toast({
          id: STILL_SIGNED_IN_TOAST,
          tone: 'error',
          title: 'You are still signed in.',
          description: errorMessage(error),
          action: {
            label: 'Try again',
            onAction: () => {
              void attempt();
            },
          },
        });
        return false;
      }
    };
    return attempt();
  }, [signOut]);
}
