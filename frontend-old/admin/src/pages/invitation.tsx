import {
  AUTH_PATHS,
  authHref,
  AuthLayout,
  InvitationForm,
  NEXT_PARAM,
  TextLink,
} from '@beautinique/frontend-auth-ui';
import { useSearchParams } from 'react-router';

import { pageTitle } from '../nav';

/**
 * Joining the team: an invitation to an admin role. The emailed code proves the address; a new
 * account chooses its password here, then signs in (and sets up the authenticator).
 */
export function InvitationPage() {
  const [search] = useSearchParams();
  return (
    <>
      <title>{pageTitle('Accept an invitation')}</title>
      <AuthLayout
        title="Accept an invitation"
        description="Use the email address the invitation was sent to. We will email you a code."
        footer={
          <>
            Accepted it already?{' '}
            <TextLink to={authHref(AUTH_PATHS.signIn, search.get(NEXT_PARAM))}>Sign in</TextLink>
          </>
        }
      >
        <InvitationForm />
      </AuthLayout>
    </>
  );
}
