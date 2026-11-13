import { SectionLayout } from '@beautinique/frontend-app-shell';
import { RequirePermission } from '@beautinique/frontend-authz';
import { Link, Outlet } from 'react-router';

import { pageTitle } from '../nav';

/** The Staff section's pages (DESIGN §10: a sidebar). */
export const STAFF_NAV = [
  { label: 'People', to: '/staff', end: true },
  { label: 'Invitations', to: '/staff/invitations' },
  { label: 'Roles', to: '/staff/roles' },
] as const;

/** The page for someone signed in whose roles do not open it (a typed link, an old bookmark). */
export function NotForYourRole() {
  return (
    <section className="container-page space-y-3 py-12">
      <title>{pageTitle('Not for your role')}</title>
      <h1 className="font-display text-3xl font-medium">Not for your role</h1>
      <p className="text-foreground-muted">
        Your roles in the Master app do not include this page. Ask a Master if you need it.
      </p>
      <Link to="/" className="text-brand-text font-medium underline underline-offset-4">
        Go to the home page
      </Link>
    </section>
  );
}

/**
 * The Staff section: only for those who read grants (Master, Security Officer, Internal Auditor);
 * what each may change is decided per button, and again by the server.
 */
export function StaffLayout() {
  return (
    <RequirePermission permission="iam.grant.read" denied={<NotForYourRole />}>
      <SectionLayout title="Staff" items={STAFF_NAV}>
        <Outlet />
      </SectionLayout>
    </RequirePermission>
  );
}
