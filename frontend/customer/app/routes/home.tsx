import type { Route } from './+types/home';

export const meta: Route.MetaFunction = () => [
  { title: 'Beautinique' },
  {
    name: 'description',
    content: 'Beauty you can trust: genuine brands, real shades, clear prices.',
  },
];

export default function Home() {
  return (
    <main id="main" className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">Beautinique</h1>
      <p className="text-foreground-muted mt-2">The app is ready. Add pages in app/routes.ts.</p>
    </main>
  );
}
