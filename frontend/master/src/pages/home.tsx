import { useSession } from '@beautinique/frontend-auth-ui';

import { pageTitle } from '../nav';

/** What the app will be for (the generator's tagline, MEMORY 2026-11-10: Q-014). */
const TAGLINE = "Beautinique's owners will manage roles, approvals and emergency controls here.";

/**
 * The first page after sign-in (the routes guard it): the app's pages are still to come, so it says
 * what they will be for, and who is signed in. Sign-in came first (owner, 2026-11-13): the first
 * Master sets up the authenticator here (ARCHITECTURE §7.3).
 */
export function HomePage() {
  const { state } = useSession();
  const email = state.status === 'signed-in' ? state.user.email : '';
  return (
    <section aria-labelledby="home-title" className="container-page space-y-6 py-8 sm:py-12">
      <title>{pageTitle('Home')}</title>
      <div className="space-y-1">
        <p className="text-brand-text text-sm font-medium">Coming soon</p>
        <h1 id="home-title" className="font-display text-3xl font-medium">
          Beautinique Master
        </h1>
        <p className="text-foreground-muted">Signed in as {email}</p>
      </div>
      <div className="border-border rounded-xl border border-dashed px-6 py-10 text-center">
        <p className="font-medium">{TAGLINE}</p>
      </div>
    </section>
  );
}
