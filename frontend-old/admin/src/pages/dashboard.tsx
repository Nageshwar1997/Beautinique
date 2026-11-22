import { useSession } from '@beautinique/frontend-auth-ui';

import { pageTitle } from '../nav';

/** The first page after sign-in. Signed in only (the routes guard it). */
export function DashboardPage() {
  const { state } = useSession();
  const email = state.status === 'signed-in' ? state.user.email : '';
  return (
    <section aria-labelledby="dashboard-title" className="container-page space-y-6 py-8 sm:py-12">
      <title>{pageTitle('Dashboard')}</title>
      <div className="space-y-1">
        <h1 id="dashboard-title" className="font-display text-3xl font-medium">
          Dashboard
        </h1>
        <p className="text-foreground-muted">Signed in as {email}</p>
      </div>
      <div className="border-border rounded-xl border border-dashed px-6 py-10 text-center">
        <p className="font-medium">Nothing needs your attention right now.</p>
      </div>
    </section>
  );
}
