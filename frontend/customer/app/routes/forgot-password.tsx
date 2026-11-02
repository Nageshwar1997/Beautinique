import {
  AUTH_PATHS,
  authHref,
  AuthLayout,
  ForgotPasswordForm,
  NEXT_PARAM,
  TextLink,
} from '@beautinique/frontend-auth-ui';
import { useSearchParams } from 'react-router';

import type { Route } from './+types/forgot-password';

export const meta: Route.MetaFunction = () => [
  { title: 'Set a new password | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

/**
 * A forgotten password, or the first one of an account made another way: the emailed code and a
 * new password. Open signed in too (a password change, ARCHITECTURE §9.2).
 */
export default function ForgotPassword() {
  const [search] = useSearchParams();
  return (
    <AuthLayout
      title="Set a new password"
      description="We will email you a code. Then choose a new password."
      footer={
        <>
          Remembered it?{' '}
          <TextLink to={authHref(AUTH_PATHS.signIn, search.get(NEXT_PARAM))}>Sign in</TextLink>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
