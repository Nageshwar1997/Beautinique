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
