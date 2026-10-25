import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const publicDir = join(import.meta.dirname, '..', 'public');
const PNG_SIGNATURE = '89504e470d0a1a0a';

describe('favicon', () => {
  it('favicon.ico holds 16, 32 and 48 px PNG images (browsers and tools that ask for it)', () => {
    const ico = readFileSync(join(publicDir, 'favicon.ico'));
    // ICONDIR: reserved 0, type 1 (icon), image count
    expect([ico.readUInt16LE(0), ico.readUInt16LE(2)]).toEqual([0, 1]);
    const count = ico.readUInt16LE(4);
    const sizes: number[] = [];
    for (let index = 0; index < count; index += 1) {
      const entry = 6 + 16 * index;
      const [width, height] = [ico[entry], ico[entry + 1]];
      expect(width, `entry ${String(index)}`).toBe(height);
      const length = ico.readUInt32LE(entry + 8);
      const offset = ico.readUInt32LE(entry + 12);
      expect(offset + length).toBeLessThanOrEqual(ico.length);
      expect(ico.subarray(offset, offset + 8).toString('hex')).toBe(PNG_SIGNATURE);
      // the PNG's own size (IHDR) matches the entry
      expect(ico.readUInt32BE(offset + 16)).toBe(width);
      sizes.push(width ?? 0);
    }
    expect(sizes).toEqual([16, 32, 48]);
  });

  it('the SVG favicon is still there for browsers that read it', () => {
    expect(readFileSync(join(publicDir, 'favicon.svg'), 'utf8')).toContain('<svg');
  });
});

/** A PNG's width and height from its IHDR chunk. */
function pngSize(file: string): [number, number] {
  const png = readFileSync(join(publicDir, file));
  expect(png.subarray(0, 8).toString('hex'), file).toBe(PNG_SIGNATURE);
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

describe('install (web app manifest)', () => {
  interface ManifestIcon {
    src: string;
    sizes: string;
    type: string;
    purpose: string;
  }
  const manifest = JSON.parse(readFileSync(join(publicDir, 'manifest.webmanifest'), 'utf8')) as {
    name: string;
    short_name: string;
    start_url: string;
    display: string;
    icons: ManifestIcon[];
  };

  it('names the app and opens the store standalone', () => {
    expect(manifest.name).toBe('Beautinique');
    expect(manifest.short_name).toBe('Beautinique');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
  });

  it('every icon is a PNG of the size it claims', () => {
    for (const icon of manifest.icons) {
      expect(icon.type, icon.src).toBe('image/png');
      const [width, height] = pngSize(icon.src.replace(/^\//, ''));
      expect(`${String(width)}x${String(height)}`, icon.src).toBe(icon.sizes);
    }
  });

  it('has 192 and 512 px icons for any use and as maskable (Android crops those to a shape)', () => {
    const have = manifest.icons.map((icon) => `${icon.purpose} ${icon.sizes}`);
    for (const purpose of ['any', 'maskable']) {
      for (const size of ['192x192', '512x512']) expect(have).toContain(`${purpose} ${size}`);
    }
  });

  it('iOS gets its own 180 px touch icon', () => {
    expect(pngSize('apple-touch-icon.png')).toEqual([180, 180]);
  });
});
