import { NavList } from '@beautinique/frontend-app-shell';

import { FOOTER_NAV } from '../nav';

/** The Master app's footer: whose app this is, and the pages everyone may need. */
export function MasterFooter() {
  return (
    <footer className="border-border border-t">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-6">
        <p className="text-foreground-muted text-sm">
          © {new Date().getFullYear()} Beautinique · Master
        </p>
        {/* -mr-3: the links' own padding, so their text lines up with the page's edge */}
        <NavList
          items={FOOTER_NAV}
          label="Footer"
          className="-mr-3"
          linkClassName="text-sm underline"
        />
      </div>
    </footer>
  );
}
