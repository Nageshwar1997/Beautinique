import {
  AUTH_PATHS,
  authHref,
  AuthLayout,
  NEXT_PARAM,
  RedirectIfSignedIn,
  SocialSignUpFinish,
  TextLink,
} from '@beautinique/frontend-auth-ui';
import { useSearchParams } from 'react-router';

import type { Route } from './+types/sign-up-finish';

export const meta: Route.MetaFunction = () => [
  { title: 'Finish signing up | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

/**
 * A new account from Google, LinkedIn or GitHub (ARCHITECTURE §7.1): the consent every customer
 * sign-up asks (terms, privacy, 18 or older), then signed in.
 */
export default function SignUpFinish() {
  const [search] = useSearchParams();
  const next = search.get(NEXT_PARAM);
  return (
    <RedirectIfSignedIn>
      <AuthLayout
        title="Finish signing up"
        description="One more step to create your Beautinique account."
        footer={
          <>
            Want to use your email instead?{' '}
            <TextLink to={authHref(AUTH_PATHS.signUp, next)}>Create an account</TextLink>
          </>
        }
      >
        <SocialSignUpFinish />
      </AuthLayout>
    </RedirectIfSignedIn>
  );
}
