import { ICON_CREDITS } from '@beautinique/frontend-icons';

const LINK = 'text-brand-text underline underline-offset-4';

/**
 * Every app's "Icon credits" page (DESIGN §11): the credit the icon licenses ask for wherever the
 * icons are shown (CC BY: the set, its author and the license). The app gives it a route and a title.
 */
export function IconCreditsPage() {
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
            <a href={credit.authorUrl} className={LINK}>
              {credit.author}
            </a>
            , licensed under{' '}
            <a href={credit.licenseUrl} className={LINK}>
              {credit.license}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
