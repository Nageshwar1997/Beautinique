// `npm run icons:install`: makes the install icons of the three app families from the brand mark
// (packages/frontend/icons/src/brand/paths.ts) in Chromium (Playwright's, the one the E2E tests use),
// into the icons package's brand/install/<family>/, then gives every app its family's icons and its
// web app manifest (scripts/packages/lib/create/install.ts). Run it again after the logo changes;
// scripts/ci/test/install.test.ts fails while an app's copy differs.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { chromium } from 'playwright';
import { format, resolveConfig } from 'prettier';

import { MARK } from '../../packages/frontend/icons/src/brand/paths.ts';
import { APPS } from '../../packages/shared/contracts/src/platform.ts';
import { APP_TITLES } from '../packages/lib/create/app-templates.ts';
import {
  type AppFamily,
  copyInstallIcons,
  FAMILY_COLOURS,
  familyIconsDir,
  INSTALL_ICONS,
  TILE_RADIUS,
  webManifest,
} from '../packages/lib/create/install.ts';

const root = join(import.meta.dirname, '../..');
const iconsPackage = join(root, 'packages/frontend/icons');
const FAMILIES: AppFamily[] = ['shop', 'team', 'partner'];

/** One icon as SVG: the tile (rounded for `any`), and the mark centred at its part of the side. */
function iconSvg(family: AppFamily, icon: (typeof INSTALL_ICONS)[number]): string {
  const { tile, ink, rose } = FAMILY_COLOURS[family];
  const side = icon.size;
  const scale = (icon.mark * side) / MARK.height;
  const x = (side - MARK.width * scale) / 2;
  const y = (side - MARK.height * scale) / 2;
  const radius = icon.purpose === 'any' ? TILE_RADIUS * side : 0;
  // one colour: one path, so the edges where the two layers meet leave no hairline of the tile
  const layers =
    ink === rose
      ? `<path d="${MARK.ink} ${MARK.rose}" fill="${ink}" fill-rule="evenodd" />`
      : `<path d="${MARK.ink}" fill="${ink}" fill-rule="evenodd" />
    <path d="${MARK.rose}" fill="${rose}" fill-rule="evenodd" />`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${String(side)}" height="${String(side)}" viewBox="0 0 ${String(side)} ${String(side)}">
  <rect width="${String(side)}" height="${String(side)}" rx="${String(radius)}" fill="${tile}" />
  <g transform="translate(${String(x)} ${String(y)}) scale(${String(scale)})">
    ${layers}
  </g>
</svg>`;
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const family of FAMILIES) {
    for (const icon of INSTALL_ICONS) {
      await page.setViewportSize({ width: icon.size, height: icon.size });
      await page.setContent(
        `<!doctype html><html><body style="margin:0;background:transparent">${iconSvg(family, icon)}</body></html>`,
      );
      const png = await page.screenshot({
        omitBackground: true,
        clip: { x: 0, y: 0, width: icon.size, height: icon.size },
      });
      const file = join(familyIconsDir(iconsPackage, family), icon.file);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, png);
    }
    console.log(`made the ${family} icons`);
  }
} finally {
  await browser.close();
}

for (const app of APPS) {
  const appDir = join(root, 'frontend', app);
  if (!existsSync(appDir)) continue;
  copyInstallIcons(iconsPackage, appDir, app);
  const file = join(appDir, 'public', 'manifest.webmanifest');
  const options = { ...(await resolveConfig(file)), filepath: file, parser: 'json' };
  writeFileSync(file, await format(JSON.stringify(webManifest(app, APP_TITLES[app])), options));
  console.log(`${app}: icons and manifest`);
}
