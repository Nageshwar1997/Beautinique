import { IconCreditsPage } from '@beautinique/frontend-app-shell';

import { pageTitle } from '../nav';

/** The credit the icon licenses ask for (open without signing in). */
export function CreditsPage() {
  return (
    <>
      <title>{pageTitle('Icon credits')}</title>
      <IconCreditsPage />
    </>
  );
}
