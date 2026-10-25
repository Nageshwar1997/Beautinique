import { ICON_CREDITS } from '@beautinique/frontend-icons';

import type { Route } from './+types/credits';

export const meta: Route.MetaFunction = () => [
  { title: 'Icon credits | Beautinique' },
  { name: 'description', content: 'The icon sets Beautinique uses and their licenses.' },
];

/** The credit the icon licenses ask for (CC BY: name the author and the license, DESIGN §11). */
export default function Credits() {
  return (
    <section aria-labelledby="credits-title" className="container-page py-14">
      <h1 id="credits-title" className="font-display text-3xl font-medium">
        Icon credits
      </h1>
      <p className="text-foreground-muted mt-3 max-w-prose">
        Our icons are copied from these open icon sets. Their shapes are unchanged.
      </p>
      <ul className="mt-6 space-y-3">
        {ICON_CREDITS.map((credit) => (
          <li key={credit.prefix}>
            <span className="font-semibold">{credit.name}</span> by{' '}
            <a href={credit.authorUrl} className="text-brand-text underline underline-offset-4">
              {credit.author}
            </a>
            , licensed under{' '}
            <a href={credit.licenseUrl} className="text-brand-text underline underline-offset-4">
              {credit.license}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
