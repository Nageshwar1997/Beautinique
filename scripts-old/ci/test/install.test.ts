// Every app installs on a phone as an app, not as a browser shortcut with an address bar (owner,
// 2026-11-09): a web app manifest that opens it standalone, linked from its page head with the iOS
// icon, and its family's icons (DESIGN §11). The list of families, names and icons lives in
// scripts/packages/lib/create/install.ts, which `npm run create:app` uses too.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { APPS } from '../../../packages/shared/contracts/src/platform.ts';
import { APP_KIND, APP_TITLES } from '../../packages/lib/create/app-templates.ts';
import {
  APP_FAMILY,
  APP_SHORT_NAMES,
  type AppFamily,
  familyIconsDir,
  INSTALL_HEAD_TAGS,
  INSTALL_ICONS,
  webManifest,
} from '../../packages/lib/create/install.ts';

const repo = join(import.meta.dirname, '../../..');
const iconsPackage = join(repo, 'packages/frontend/icons');
const PNG_SIGNATURE = '89504e470d0a1a0a';
const FAMILIES: AppFamily[] = ['shop', 'team', 'partner'];

/** The page head an app is served with: its index.html, or the server-rendered root. */
const headOf = (app: (typeof APPS)[number]) =>
  readFileSync(
    join(repo, 'frontend', app, APP_KIND[app] === 'ssr' ? 'app/root.tsx' : 'index.html'),
    'utf8',
  );

describe('the family icons (made by npm run icons:install)', () => {
  for (const family of FAMILIES) {
    it(`${family}: every icon is a PNG of its size`, () => {
      for (const icon of INSTALL_ICONS) {
        const bytes = readFileSync(join(familyIconsDir(iconsPackage, family), icon.file));
        expect(bytes.subarray(0, 8).toString('hex'), icon.file).toBe(PNG_SIGNATURE);
        // IHDR: width and height
        expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], icon.file).toEqual([
          icon.size,
          icon.size,
        ]);
      }
    });
  }

  it('each family looks different (its own tile colour)', () => {
    const icon512 = (family: AppFamily) =>
      readFileSync(join(familyIconsDir(iconsPackage, family), 'icons/icon-512.png')).toString(
        'base64',
      );
    expect(new Set(FAMILIES.map(icon512)).size).toBe(FAMILIES.length);
  });
});

describe('every app installs as an app', () => {
  it('has its own home-screen name that fits under the icon', () => {
    const names = APPS.map((app) => APP_SHORT_NAMES[app]);
    expect(new Set(names).size).toBe(APPS.length);
    for (const name of names) expect(name.length, name).toBeLessThanOrEqual(13);
  });

  for (const app of APPS) {
    describe(app, () => {
      it('has a manifest that opens it standalone, in its family colours', () => {
        const file = join(repo, 'frontend', app, 'public', 'manifest.webmanifest');
        expect(existsSync(file), `frontend/${app}/public/manifest.webmanifest`).toBe(true);
        const manifest = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
        expect(manifest).toEqual(webManifest(app, APP_TITLES[app]));
        expect(manifest.display).toBe('standalone');
      });

      it('links the manifest and the iOS icon in its page head', () => {
        const head = headOf(app);
        for (const tag of INSTALL_HEAD_TAGS) expect(head, tag).toContain(tag);
        expect(head).toContain('<meta name="theme-color" content="#D6336C" />');
      });

      it("carries its family's icons, byte for byte", () => {
        const from = familyIconsDir(iconsPackage, APP_FAMILY[app]);
        for (const icon of INSTALL_ICONS) {
          const file = join(repo, 'frontend', app, 'public', icon.file);
          expect(existsSync(file), `frontend/${app}/public/${icon.file}`).toBe(true);
          expect(readFileSync(file).equals(readFileSync(join(from, icon.file))), icon.file).toBe(
            true,
          );
        }
      });
    });
  }

  it("leaves delivery's manifest to the file, not the PWA plugin (one manifest)", () => {
    const config = readFileSync(join(repo, 'frontend/delivery/vite.config.ts'), 'utf8');
    expect(config).toContain('manifest: false');
  });
});
