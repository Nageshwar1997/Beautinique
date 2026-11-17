import { IconCreditsPage } from '@beautinique/frontend-app-shell';

import type { Route } from './+types/credits';

export const meta: Route.MetaFunction = () => [
  { title: 'Icon credits | Beautinique' },
  { name: 'description', content: 'The icon sets Beautinique uses and their licenses.' },
];

/** The credit the icon licenses ask for (CC BY: name the author and the license, DESIGN §11). */
export default function Credits() {
  return <IconCreditsPage />;
}
