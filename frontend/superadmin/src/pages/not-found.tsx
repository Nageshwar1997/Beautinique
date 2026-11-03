import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main id="main" className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">Page not found</h1>
      <p className="text-foreground-muted mt-2">
        <Link to="/" className="text-brand-text underline">
          Go to the home page
        </Link>
      </p>
    </main>
  );
}
