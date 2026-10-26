import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import * as api from '../src/index';
import { createIcon, type Icon, ICON_CREDITS, IconMoon, IconSun } from '../src/index';

afterEach(cleanup);

const svgOf = (element: React.ReactElement) => {
  const { container } = render(element);
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('no <svg> rendered');
  return svg;
};

const icons = Object.entries(api).filter(
  (entry): entry is [string, Icon] => entry[0].startsWith('Icon') && typeof entry[1] === 'function',
);

describe('BaseIcon through an icon', () => {
  it('is decorative by default: hidden from screen readers, text size, text colour', () => {
    const svg = svgOf(<IconSun />);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.getAttribute('focusable')).toBe('false');
    expect(svg.getAttribute('width')).toBe('1em');
    expect(svg.getAttribute('height')).toBe('1em');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.innerHTML).toContain('currentColor');
  });

  it('with a label it is a named image', () => {
    const svg = svgOf(<IconMoon label="Dark theme" />);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Dark theme');
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    // a blank label names nothing: still decorative
    expect(svgOf(<IconMoon label="  " />).getAttribute('aria-hidden')).toBe('true');
  });

  it('takes a size and passes other SVG props through, but keeps its own viewBox', () => {
    const svg = svgOf(
      <IconSun size={20} className="text-brand" data-testid="sun" {...{ viewBox: '0 0 1 1' }} />,
    );
    expect(svg.getAttribute('width')).toBe('20');
    expect(svg.getAttribute('class')).toBe('text-brand');
    expect(svg.getAttribute('data-testid')).toBe('sun');
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svgOf(<IconSun size="2rem" />).getAttribute('height')).toBe('2rem');
  });

  it('createIcon makes a named component with its own viewBox', () => {
    const Dot = createIcon('IconDot', <circle cx="8" cy="8" r="4" />, '0 0 16 16');
    expect(Dot.displayName).toBe('IconDot');
    const svg = svgOf(<Dot />);
    expect(svg.getAttribute('viewBox')).toBe('0 0 16 16');
    expect(svg.querySelector('circle')?.getAttribute('r')).toBe('4');
  });
});

describe('the icons', () => {
  it('every icon renders shapes in currentColor and is named after its export', () => {
    expect(icons.length).toBeGreaterThanOrEqual(10);
    for (const [name, Component] of icons) {
      expect(Component.displayName, name).toBe(name);
      const svg = svgOf(<Component />);
      expect(svg.children.length, name).toBeGreaterThan(0);
      expect(svg.innerHTML, name).toContain('currentColor');
      cleanup();
    }
  });

  it('every icon file names its source, and every source set is credited', () => {
    const dir = join(import.meta.dirname, '..', 'src', 'icons');
    const files = readdirSync(dir).filter((file) => file.endsWith('.tsx'));
    expect(files).toHaveLength(icons.length);
    // Markdown wraps lines: compare with single spaces
    const licenses = readFileSync(join(import.meta.dirname, '..', 'LICENSES.md'), 'utf8').replace(
      /\s+/g,
      ' ',
    );
    for (const file of files) {
      const source = readFileSync(join(dir, file), 'utf8');
      const [, prefix, name] = /^\/\/ ([a-z0-9-]+):([a-z0-9-]+):/.exec(source) ?? [];
      expect(prefix, file).toBeDefined();
      expect(
        ICON_CREDITS.map((credit) => credit.prefix),
        file,
      ).toContain(prefix);
      const component = /export const (Icon\w+)/.exec(source)?.[1] ?? '';
      expect(licenses, file).toContain(`\`${component}\` (${String(name)})`);
      expect(source, file).toContain('/* @__PURE__ */ createIcon(');
    }
  });

  it('credits say who made each set and under which license', () => {
    for (const credit of ICON_CREDITS) {
      expect(credit.author.trim()).not.toBe('');
      expect(credit.licenseUrl).toMatch(/^https:\/\//);
      expect(credit.authorUrl).toMatch(/^https:\/\//);
    }
  });
});
