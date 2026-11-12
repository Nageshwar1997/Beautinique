// Every app installs on a phone as an app (owner, 2026-11-09): its own web app manifest
// (`display: standalone`, so no browser address bar) and the brand mark as its home-screen icon. The
// tile's colour tells the family at a glance: the store on ivory, the team's apps on ink, the
// partners' apps on rose (DESIGN §11). The icon files of a family are the same in every app; they
// are made once by `npm run icons:install` (scripts/icons/install-icons.ts) into the icons package
// (`brand/install/<family>/`) and copied into each app's `public/`.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { AppId } from '../../../../packages/shared/contracts/src/platform.ts';

export type AppFamily = 'shop' | 'team' | 'partner';

export const APP_FAMILY: Readonly<Record<AppId, AppFamily>> = {
  customer: 'shop',
  admin: 'team',
  superadmin: 'team',
  master: 'team',
  support: 'team',
  finance: 'team',
  growth: 'team',
  logistics: 'team',
  seller: 'partner',
  creator: 'partner',
  delivery: 'partner',
};

/** Under the home-screen icon: whole up to about 13 characters (owner: "BQ" and the app). */
export const APP_SHORT_NAMES: Readonly<Record<AppId, string>> = {
  customer: 'Beautinique',
  admin: 'BQ Admin',
  superadmin: 'BQ SuperAdmin',
  master: 'BQ Master',
  support: 'BQ Support',
  finance: 'BQ Finance',
  growth: 'BQ Growth',
  logistics: 'BQ Logistics',
  seller: 'BQ Seller',
  creator: 'BQ Creator',
  delivery: 'BQ Delivery',
};

// Brand colours for files that cannot read CSS variables: neutral-50, neutral-950 and rose-600.
export const IVORY = '#FDF8F5';
export const INK = '#1C1619';
export const ROSE = '#D6336C';

/** The tile, the mark's ink layer and its rose layer, per family; the splash uses the tile colour. */
export const FAMILY_COLOURS: Readonly<
  Record<AppFamily, { tile: string; ink: string; rose: string }>
> = {
  shop: { tile: IVORY, ink: INK, rose: ROSE },
  // the dark theme's look: the mark light, its hair and petals rose
  team: { tile: INK, ink: IVORY, rose: ROSE },
  // rose would vanish on rose: the whole mark light
  partner: { tile: ROSE, ink: IVORY, rose: IVORY },
};

/**
 * The icon files, under an app's `public/`. `any`: the mark on a rounded tile; `maskable`: a full
 * square, the mark inside the 80% safe circle (Android cuts its own shape); `apple`: a full square
 * (iOS rounds it). `mark` is the mark's height as a part of the side, as the store's first icons.
 */
export const INSTALL_ICONS = [
  { file: 'icons/icon-192.png', size: 192, purpose: 'any', mark: 0.68 },
  { file: 'icons/icon-512.png', size: 512, purpose: 'any', mark: 0.68 },
  { file: 'icons/icon-maskable-192.png', size: 192, purpose: 'maskable', mark: 0.5625 },
  { file: 'icons/icon-maskable-512.png', size: 512, purpose: 'maskable', mark: 0.5625 },
  { file: 'apple-touch-icon.png', size: 180, purpose: 'apple', mark: 0.6667 },
] as const;

/** A rounded tile's corner, as a part of its side. */
export const TILE_RADIUS = 0.22;

const DESCRIPTIONS: Readonly<Record<AppFamily, (title: string) => string>> = {
  shop: () =>
    'Genuine brands, true-to-life shades and clear prices, every product checked in our own warehouse.',
  team: (title) => `${title}, for the Beautinique team.`,
  partner: (title) => `${title}, for Beautinique's partners.`,
};

/** The web app manifest of an app (`public/manifest.webmanifest`); `title` is its APP_TITLES name. */
export function webManifest(app: AppId, title: string): Record<string, unknown> {
  const family = APP_FAMILY[app];
  return {
    id: '/',
    name: title,
    short_name: APP_SHORT_NAMES[app],
    description: DESCRIPTIONS[family](title),
    lang: 'en',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: FAMILY_COLOURS[family].tile,
    theme_color: ROSE,
    icons: INSTALL_ICONS.filter((icon) => icon.purpose !== 'apple').map((icon) => ({
      src: `/${icon.file}`,
      sizes: `${String(icon.size)}x${String(icon.size)}`,
      type: 'image/png',
      purpose: icon.purpose,
    })),
  };
}

/** The head tags every app needs to install (the theme colour is there already). */
export const INSTALL_HEAD_TAGS = [
  '<link rel="manifest" href="/manifest.webmanifest" />',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
] as const;

/** Where a family's icon files are made: the icons package, beside the logo's master image. */
export const familyIconsDir = (iconsPackage: string, family: AppFamily): string =>
  join(iconsPackage, 'brand', 'install', family);

/**
 * The icons package from a repo root: through node_modules (a workspace link, so a throwaway repo
 * with linked node_modules finds it too), else its folder.
 */
export function iconsPackageDir(root: string): string {
  const linked = join(root, 'node_modules', '@beautinique', 'frontend-icons');
  return existsSync(linked) ? linked : join(root, 'packages', 'frontend', 'icons');
}

/** Copies an app's family icons into its `public/`. */
export function copyInstallIcons(iconsPackage: string, appDir: string, app: AppId): void {
  const from = familyIconsDir(iconsPackage, APP_FAMILY[app]);
  for (const { file } of INSTALL_ICONS) {
    const to = join(appDir, 'public', file);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(join(from, file), to);
  }
}
