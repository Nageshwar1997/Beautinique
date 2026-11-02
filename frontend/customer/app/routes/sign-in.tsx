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

import type { Route } from './+types/sign-in';

export const meta: Route.MetaFunction = () => [
  { title: 'Sign in | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

/** Sign in, then back to the page that sent the person here (`next`). */
export default function SignIn() {
  const [search] = useSearchParams();
  const next = search.get(NEXT_PARAM);
  return (
    <RedirectIfSignedIn>
      <AuthLayout
        title="Sign in"
        description="Welcome back to Beautinique."
        footer={
          <>
            New to Beautinique?{' '}
            <TextLink to={authHref(AUTH_PATHS.signUp, next)}>Create an account</TextLink>
          </>
        }
      >
        <SignInForm />
      </AuthLayout>
    </RedirectIfSignedIn>
  );
}
