import {
  AUTH_PATHS,
  authHref,
  AuthLayout,
  NEXT_PARAM,
  RedirectIfSignedIn,
  SignInForm,
  TextLink,
} from '@beautinique/frontend-auth-ui';
import { useSearchParams } from 'react-router';

import { pageTitle } from '../nav';

/**
 * Sign in (the team only: no sign-up here), then back to the page that sent the person here
 * (`next`). A first sign-in sets up the authenticator app, which this app needs (ARCHITECTURE §7.1).
 */
export function SignInPage() {
  const [search] = useSearchParams();
  const next = search.get(NEXT_PARAM);
  return (
    <RedirectIfSignedIn>
      <title>{pageTitle('Sign in')}</title>
      <AuthLayout
        title="Sign in"
        description="Beautinique Master, for the owners and their team."
        footer={
          <>
            Invited to the team?{' '}
            <TextLink to={authHref(AUTH_PATHS.invitation, next)}>Accept your invitation</TextLink>
          </>
        }
      >
        <SignInForm />
      </AuthLayout>
    </RedirectIfSignedIn>
  );
}
