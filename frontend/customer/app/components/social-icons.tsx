import type { ProviderIcons } from '@beautinique/frontend-auth-ui';
import { IconGithub, IconGoogle, IconLinkedin } from '@beautinique/frontend-icons';

/**
 * The providers' marks on "Continue with …" (T3.1 PR 4): Google and LinkedIn in their own colours
 * (their brand guidelines), GitHub's in the text colour. Licenses: the icons package's LICENSES.md.
 */
export const SOCIAL_ICONS: ProviderIcons = {
  google: <IconGoogle size={20} />,
  linkedin: <IconLinkedin size={20} />,
  github: <IconGithub size={20} />,
};
