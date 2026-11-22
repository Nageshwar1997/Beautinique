import { useSession } from '@beautinique/frontend-auth-ui';
import { type Guarded, useVisible } from '@beautinique/frontend-authz';
import { Link } from 'react-router';

import { pageTitle } from '../nav';

interface Section extends Guarded {
  title: string;
  to: string;
  text: string;
}

/** The app's sections, each for those whose roles open it; more join as they are built. */
const SECTIONS: readonly Section[] = [
  {
    title: 'People',
    to: '/staff',
    text: 'Who holds which role where; give a role or end one.',
    permission: 'iam.grant.read',
  },
  {
    title: 'Invitations',
    to: '/staff/invitations',
    text: 'Invite someone to a role, and take back one not accepted yet.',
    permission: 'iam.grant.read',
  },
  {
    title: 'Roles',
    to: '/staff/roles',
    text: 'Every role of every app, and the sub-roles Master makes.',
    permission: 'iam.grant.read',
  },
];

/**
 * The first page after sign-in (the routes guard it): who is signed in, and the sections their
 * roles open (DESIGN §10; the Staff pages, TASKS T3.7). Someone whose roles open none yet is told
 * so, plainly.
 */
export function HomePage() {
  const { state } = useSession();
  const email = state.status === 'signed-in' ? state.user.email : '';
  const sections = useVisible(SECTIONS);
  return (
    <section aria-labelledby="home-title" className="container-page space-y-6 py-8 sm:py-12">
      <title>{pageTitle('Home')}</title>
      <div className="space-y-1">
        <h1 id="home-title" className="font-display text-3xl font-medium">
          Beautinique Master
        </h1>
        <p className="text-foreground-muted">Signed in as {email}</p>
      </div>
      {sections.length === 0 ? (
        <div className="border-border rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="font-medium">There is nothing to manage here for your role yet.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <li key={section.to}>
              <Link
                to={section.to}
                className="border-border hover:border-brand bg-surface block h-full rounded-xl border p-5"
              >
                <h2 className="font-display text-xl font-medium">{section.title}</h2>
                <p className="text-foreground-muted mt-1 text-sm">{section.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
