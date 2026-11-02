import {
  AUTH_PATHS,
  authHref,
  AuthLayout,
  NEXT_PARAM,
  RedirectIfSignedIn,
  SignUpForm,
  TextLink,
} from '@beautinique/frontend-auth-ui';
import { useSearchParams } from 'react-router';

import type { Route } from './+types/sign-up';

export const meta: Route.MetaFunction = () => [
  { title: 'Create an account | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

/** A new account: the email, the consent (terms, privacy, 18 or older), the emailed code, a password. */
export default function SignUp() {
  const [search] = useSearchParams();
  const next = search.get(NEXT_PARAM);
  return (
    <RedirectIfSignedIn>
      <AuthLayout
        title="Create an account"
        description="Shop beauty you can trust. We will email you a code to confirm your email."
        footer={
          <>
            Have an account? <TextLink to={authHref(AUTH_PATHS.signIn, next)}>Sign in</TextLink>
          </>
        }
      >
        <SignUpForm />
      </AuthLayout>
    </RedirectIfSignedIn>
  );
}
