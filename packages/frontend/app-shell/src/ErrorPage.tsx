import { Link } from 'react-router';

export interface ErrorPageProps {
  /** The page's one `h1`, e.g. "Page not found". */
  title: string;
  message?: string;
  /** Where to go from here; default the home page. */
  action?: { label: string; to: string };
}

/** The content of an error or not-found page, inside the app's frame (it adds no `<main>` of its own). */
export function ErrorPage({
  title,
  message,
  action = { label: 'Go to the home page', to: '/' },
}: ErrorPageProps) {
  return (
    <section className="container-page py-16" aria-labelledby="error-title">
      <h1 id="error-title" className="font-display text-3xl font-medium">
        {title}
      </h1>
      {message !== undefined && <p className="text-foreground-muted mt-3 max-w-prose">{message}</p>}
      <p className="mt-6">
        <Link to={action.to} className="text-brand-text font-medium underline underline-offset-4">
          {action.label}
        </Link>
      </p>
    </section>
  );
}
