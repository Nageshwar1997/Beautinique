import { ErrorPage } from '@beautinique/frontend-app-shell';

import { pageTitle } from '../nav';

/** Any path the app does not have. */
export function NotFoundPage() {
  return (
    <>
      <title>{pageTitle('Page not found')}</title>
      <ErrorPage
        status={404}
        title="Page not found"
        message="We looked everywhere, even under the vanity. The page may have moved, or the link may have a typo."
      />
    </>
  );
}
