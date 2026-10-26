import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { BrandLogo, BrandMark } from '../src/index';

afterEach(cleanup);

const svgOf = (element: React.ReactElement) => {
  const { container } = render(element);
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('no <svg> rendered');
  return svg;
};
const fills = (svg: SVGSVGElement) =>
  [...svg.querySelectorAll('path')].map((path) => path.getAttribute('fill'));
const viewBoxRatio = (svg: SVGSVGElement) => {
  const [, , width = 0, height = 1] = (svg.getAttribute('viewBox') ?? '').split(' ').map(Number);
  return width / height;
};

describe('BrandMark', () => {
  it('is decorative by default: text height, ink in the text colour, rose from the theme', () => {
    const svg = svgOf(<BrandMark />);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
    expect(svg.getAttribute('viewBox')).toBe('0 0 513.7 574.4');
    expect(svg.getAttribute('height')).toBe('1em');
    // a CSS length keeps the shape through calc()
    expect(svg.getAttribute('width')).toBe('calc(1em * 0.8943)');
    expect(fills(svg)).toEqual(['currentColor', 'var(--brand, #d6336c)']);
    for (const path of svg.querySelectorAll('path')) {
      expect(path.getAttribute('fill-rule')).toBe('evenodd');
      expect(path.getAttribute('d')).toMatch(/^M[\d. MLCZ-]+$/);
    }
  });

  it('a number size is the height in pixels; the width follows the shape', () => {
    const svg = svgOf(<BrandMark size={40} />);
    expect(svg.getAttribute('height')).toBe('40');
    expect(svg.getAttribute('width')).toBe('35.77');
  });

  it('with a label it is a named image; a blank label names nothing', () => {
    const svg = svgOf(<BrandMark label="Beautinique" />);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Beautinique');
    expect(svgOf(<BrandMark label=" " />).getAttribute('aria-hidden')).toBe('true');
  });

  it('monochrome draws everything in the text colour', () => {
    expect(fills(svgOf(<BrandMark monochrome />))).toEqual(['currentColor', 'currentColor']);
  });

  it('passes other SVG props through but keeps its own viewBox and width', () => {
    const svg = svgOf(
      <BrandMark
        size={20}
        className="text-foreground"
        data-testid="mark"
        {...{ viewBox: '0 0 1 1', width: 999 }}
      />,
    );
    expect(svg.getAttribute('class')).toBe('text-foreground');
    expect(svg.getAttribute('data-testid')).toBe('mark');
    expect(svg.getAttribute('viewBox')).toBe('0 0 513.7 574.4');
    expect(svg.getAttribute('width')).toBe('17.89');
  });
});

describe('BrandLogo', () => {
  it('is horizontal by default: the mark, then the name scaled beside it', () => {
    const svg = svgOf(<BrandLogo size={40} />);
    expect(svg.getAttribute('viewBox')).toBe('0 0 1794.21 574.4');
    expect(svg.getAttribute('height')).toBe('40');
    expect(Number(svg.getAttribute('width'))).toBeCloseTo(40 * viewBoxRatio(svg), 1);
    // mark (2 layers) + name (2 layers), the name moved and scaled
    expect(fills(svg)).toEqual([
      'currentColor',
      'var(--brand, #d6336c)',
      'currentColor',
      'var(--brand, #d6336c)',
    ]);
    expect(svg.querySelector('g')?.getAttribute('transform')).toBe(
      'translate(559.65 160.83) scale(1.2341)',
    );
  });

  it('stacked puts the mark centred above the name, as in the master', () => {
    const svg = svgOf(<BrandLogo layout="stacked" label="Beautinique" />);
    expect(svg.getAttribute('viewBox')).toBe('0 0 1000.4 792.2');
    expect(svg.getAttribute('role')).toBe('img');
    expect([...svg.querySelectorAll('g')].map((g) => g.getAttribute('transform'))).toEqual([
      'translate(243.35 0)',
      'translate(0 587.4)',
    ]);
  });

  it('monochrome works for the whole logo', () => {
    expect(new Set(fills(svgOf(<BrandLogo monochrome />)))).toEqual(new Set(['currentColor']));
  });
});
