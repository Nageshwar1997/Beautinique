import { Spinner } from '@beautinique/frontend-components';
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
 * A page for signed-in people only (account, cart, orders): someone signed out goes to sign-in,
 * which brings them back here (`next`), and says why when the app ended the session itself (30
 * idle minutes). `fallback` while the session is not known yet.
 */
export function RequireSignIn({
  children,
  fallback = <Waiting />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { app, state } = useSession();
  const location = useLocation();
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
