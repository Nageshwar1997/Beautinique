import {
  AUTH_PATHS,
  authHref,
  AuthLayout,
  ForgotPasswordForm,
  NEXT_PARAM,
  TextLink,
} from '@beautinique/frontend-auth-ui';
import { useSearchParams } from 'react-router';

import { pageTitle } from '../nav';

/**
 * A forgotten password: the emailed code and a new password, which signs every device out. Open
 * signed in too (a password change, ARCHITECTURE §9.2).
 */
export function ForgotPasswordPage() {
  const [search] = useSearchParams();
  return (
    <>
      <title>{pageTitle('Set a new password')}</title>
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
    </>
  );
}
