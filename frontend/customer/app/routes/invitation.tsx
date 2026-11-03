import { AuthLayout, InvitationForm } from '@beautinique/frontend-auth-ui';

import type { Route } from './+types/invitation';

export const meta: Route.MetaFunction = () => [
  { title: 'Accept an invitation | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

/** Accepting an invitation to a role here (a Beauty Pro Buyer, given by a State Admin). */
export default function Invitation() {
  return (
    <AuthLayout
      title="Accept an invitation"
      description="Use the email address the invitation was sent to. We will email you a code."
    >
      <InvitationForm />
    </AuthLayout>
  );
}
