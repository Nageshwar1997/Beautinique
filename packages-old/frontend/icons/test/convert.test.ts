import { describe, expect, it } from 'vitest';

import { fileNameOf, iconFile, jsxAttributeName, svgBodyToJsx } from '../scripts/convert';

describe('svgBodyToJsx', () => {
  it('writes SVG attributes the React way', () => {
    expect(jsxAttributeName('stroke-width')).toBe('strokeWidth');
    expect(jsxAttributeName('stroke-linecap')).toBe('strokeLinecap');
    expect(jsxAttributeName('fill-rule')).toBe('fillRule');
    expect(jsxAttributeName('xlink:href')).toBe('xlinkHref');
    expect(jsxAttributeName('class')).toBe('className');
    expect(jsxAttributeName('aria-label')).toBe('aria-label');
    expect(jsxAttributeName('data-x')).toBe('data-x');
    expect(jsxAttributeName('d')).toBe('d');
  });

  it('keeps nesting, self-closing tags and values', () => {
    expect(
      svgBodyToJsx(
        '<g fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 2V4"/></g>',
      ),
    ).toBe(
      '<g fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="5" /><path d="M12 2V4" /></g>',
    );
  });

  it('wraps several top-level shapes in a fragment, and only then', () => {
    expect(svgBodyToJsx('<path d="M1 1"/><path d="M2 2"/>')).toBe(
      '<><path d="M1 1" /><path d="M2 2" /></>',
    );
    expect(svgBodyToJsx('<path d="M1 1"/>')).toBe('<path d="M1 1" />');
  });

  it('allows links inside the icon (masks, use)', () => {
    expect(
      svgBodyToJsx(
        '<defs><mask id="m"><path d="M1 1"/></mask></defs><use href="#m" mask="url(#m)"/>',
      ),
    ).toContain('<use href="#m" mask="url(#m)" />');
  });

  it('refuses anything that could carry code or reach outside', () => {
    const bad: [string, string][] = [
      ['<script>alert(1)</script>', 'not allowed'],
      ['<foreignObject><div/></foreignObject>', 'not allowed'],
      ['<path d="M1 1" onclick="x()"/>', 'event handler'],
      ['<path d="M1 1" style="fill:red"/>', 'style attribute'],
      ['<use href="https://x.example/a.svg#i"/>', 'links outside'],
      ['<use xlink:href="javascript:x()"/>', 'links outside'],
      ['<path fill="url(https://x.example/p)" d="M1 1"/>', 'points outside'],
      ['<image href="#a"/>', 'not allowed'],
      ['<g><path d="M1 1"/>', 'never closed'],
      ['<path d="M1 1"/></g>', 'closes nothing'],
      ['<text>Hi</text>', 'no text'],
      ['', 'no shapes'],
      ['<path d="M1 1" bad>', 'Cannot read'],
    ];
    for (const [body, message] of bad) {
      expect(() => svgBodyToJsx(body), body).toThrow(message);
    }
  });
});

describe('iconFile', () => {
  it('writes one pure createIcon call with the source in a comment', () => {
    const source = iconFile({
      id: 'solar:sun-2-linear',
      component: 'IconSun',
      icon: { body: '<circle cx="12" cy="12" r="5"/>' },
      setWidth: 24,
      setHeight: 24,
    });
    expect(source).toMatch(/^\/\/ solar:sun-2-linear: copied from Iconify/);
    expect(source).toContain("import { createIcon } from '../create-icon';");
    expect(source).toContain("export const IconSun = /* @__PURE__ */ createIcon(\n  'IconSun',");
    expect(source).toContain('<circle cx="12" cy="12" r="5" />,\n);');
  });

  it("gives a viewBox only when it is not 24 × 24, from the icon's or the set's size", () => {
    const of = (width?: number, setWidth?: number) =>
      iconFile({
        id: 'x:y',
        component: 'IconY',
        icon: { body: '<path d="M1 1"/>', width, height: width },
        setWidth,
        setHeight: setWidth,
      });
    expect(of(undefined, 24)).not.toContain("'0 0");
    expect(of(32, 24)).toContain(", '0 0 32 32'");
    expect(of(undefined, undefined)).toContain(", '0 0 16 16'");
  });

  it('refuses bad names', () => {
    const icon = { body: '<path d="M1 1"/>' };
    expect(() => iconFile({ id: 'solar:sun', component: 'Sun', icon })).toThrow('Icon<Name>');
    expect(() => iconFile({ id: 'solar sun', component: 'IconSun', icon })).toThrow('Iconify id');
  });

  it('names the file after the component', () => {
    expect(fileNameOf('IconSun')).toBe('sun');
    expect(fileNameOf('IconShieldCheck')).toBe('shield-check');
    expect(fileNameOf('IconTagPrice2')).toBe('tag-price2');
  });
});
