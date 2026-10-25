import { NavList } from '@beautinique/frontend-app-shell';
import { BrandLogo } from '@beautinique/frontend-icons';

import { FOOTER_NAV } from '../nav';

/** The customer app's footer: who we are, that this is a demo, and the pages everyone may need. */
export function SiteFooter() {
  return (
    <footer className="surface-inverse">
      <div className="container-page grid gap-6 py-10 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          {/* one colour: the theme's rose is not made for the inverse surface */}
          <BrandLogo size={36} monochrome label="Beautinique" className="block" />
          <p className="mt-3 max-w-prose text-sm">
            Beautinique is a portfolio project, not a real store: nothing here can be bought, and
            the brand is made up.
          </p>
          <p className="mt-4 text-sm">© {new Date().getFullYear()} Beautinique</p>
        </div>
        {/* -ml-3: the links' own padding, so their text lines up with the text above */}
        <NavList
          items={FOOTER_NAV}
          label="Footer"
          className="-ml-3"
          linkClassName="text-sm underline"
        />
      </div>
    </footer>
  );
}
