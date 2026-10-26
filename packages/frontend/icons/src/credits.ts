/** Who made an icon set we copy from, and its license (shown on each app's "Icon credits" page). */
export interface IconCredit {
  /** the Iconify prefix of the set, e.g. `solar` */
  prefix: string;
  name: string;
  author: string;
  authorUrl: string;
  license: string;
  licenseUrl: string;
}

/**
 * Every set the package's icons come from. Copying an icon does not end its license: CC BY needs
 * this credit wherever the icons are shown (DESIGN §11). Add a set here and in LICENSES.md before
 * its first icon (scripts/add-icons.ts refuses otherwise).
 */
export const ICON_CREDITS: readonly IconCredit[] = [
  {
    prefix: 'solar',
    name: 'Solar',
    author: '480 Design',
    authorUrl: 'https://www.figma.com/community/file/1166831539721848736',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
];
