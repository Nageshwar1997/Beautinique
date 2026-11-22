const TAGLINE = 'The finance team will run settlements, payouts, invoices and reconciliation here.';

/** The home until the app has pages: its name, that it is coming soon, and what it will be for. */
export function HomePage() {
  return (
    <main id="main" className="container-page flex min-h-dvh flex-col justify-center py-16">
      <p className="text-brand-text text-sm font-medium">Coming soon</p>
      <h1 className="font-display mt-2 text-4xl font-medium">Beautinique Finance</h1>
      <p className="text-foreground-muted mt-3 max-w-prose">{TAGLINE}</p>
    </main>
  );
}
