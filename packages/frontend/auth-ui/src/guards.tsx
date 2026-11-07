import { Button, Spinner } from '@beautinique/frontend-components';
import type { ReactNode } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router';

import type { SignInState } from './code-pages';
import { idleSignOutNotice } from './idle-notice';
import { AUTH_PATHS, authHref, NEXT_PARAM, safeNext } from './next';
import { useSession } from './session';

/** What a guard shows while the session is not known yet: a quiet spinner, said to screen readers. */
function Waiting() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <Spinner label="Loading" />
    </div>
  );
}

/**
 * The account could not be read: the server did not answer, its tries included (a restart). The
 * person stays signed in and can ask again (owner's words, 2026-11-07; QA-FE-009).
 */
function AccountUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
      <h1 className="font-display text-2xl font-medium text-balance">
        We could not load your account
      </h1>
      <p role="alert" className="text-foreground-muted text-pretty">
        The server did not answer. Please try again in a moment.
      </p>
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}

/**
 * A page for signed-in people only (account, cart, orders): someone signed out goes to sign-in,
 * which brings them back here (`next`), and says why when the app ended the session itself (30
 * idle minutes). `fallback` while the session is not known yet; when the server did not answer, a
 * note with "Try again".
 */
export function RequireSignIn({
  children,
  fallback = <Waiting />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { app, state, retry } = useSession();
  const location = useLocation();
  if (state.status === 'unavailable') return <AccountUnavailable onRetry={retry} />;
  if (state.status === 'signed-out') {
    const here = `${location.pathname}${location.search}${location.hash}`;
    const notice = state.reason === 'idle' ? idleSignOutNotice(app) : undefined;
    const handed: Partial<SignInState> | undefined = notice === undefined ? undefined : { notice };
    return <Navigate to={authHref(AUTH_PATHS.signIn, here)} replace state={handed} />;
  }
  if (state.status !== 'signed-in') return fallback;
  return children;
}

/**
 * An auth page (sign-in, sign-up): someone signed in already goes straight on to `next` (owner,
 * 2026-11-02). The page itself shows meanwhile, so it is there for SSR and the first paint.
 */
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const { state } = useSession();
  const [search] = useSearchParams();
  if (state.status === 'signed-in') {
    return <Navigate to={safeNext(search.get(NEXT_PARAM))} replace />;
  }
  return children;
}
