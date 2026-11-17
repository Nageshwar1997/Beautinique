import type { ReactNode } from 'react';

import { BaseIcon, type IconProps } from '../base-icon';
import { MARK, WORDMARK } from './paths';

/** The rose layer: the theme's brand colour, or the logo's own rose where no theme is loaded. */
const ROSE = 'var(--brand, #d6336c)';

/** Horizontal lockup: the name is 0.44 of the mark's height, 0.08 of it away, centred on the mark. */
const NAME_HEIGHT = 0.44;
const NAME_GAP = 0.08;
/** Stacked lockup, as in the master: the mark centred above the name, 13 master pixels apart. */
const STACK_GAP = 13;

export interface BrandProps extends Omit<IconProps, 'width' | 'height'> {
  /** Height: a number is pixels, a string any CSS length. The width follows the logo's shape. Default `1em`. */
  size?: number | string;
  /**
   * The name for screen readers, e.g. "Beautinique". Leave it out inside a link or next to text
   * that already names it (the logo is then decorative).
   */
  label?: string;
  /** Everything in the text colour (`currentColor`), no rose: for print, stamps or busy backgrounds. */
  monochrome?: boolean;
}

export interface BrandLogoProps extends BrandProps {
  /** `horizontal` (default): mark, then the name, for headers. `stacked`: the mark above the name. */
  layout?: 'horizontal' | 'stacked';
}

interface Part {
  readonly width: number;
  readonly height: number;
  readonly ink: string;
  readonly rose: string;
}

function Layers({ part, monochrome }: { part: Part; monochrome: boolean }) {
  return (
    <>
      <path d={part.ink} fill="currentColor" fillRule="evenodd" />
      <path d={part.rose} fill={monochrome ? 'currentColor' : ROSE} fillRule="evenodd" />
    </>
  );
}

const round = (value: number) => Math.round(value * 100) / 100;

/** The `<svg>` of a logo part: `size` is its height, the width keeps the shape. */
function BrandSvg({
  size = '1em',
  width,
  height,
  children,
  ...rest
}: Omit<BrandProps, 'monochrome'> & { width: number; height: number; children: ReactNode }) {
  const ratio = width / height;
  return (
    <BaseIcon
      {...rest}
      size={size}
      width={typeof size === 'number' ? round(size * ratio) : `calc(${size} * ${ratio.toFixed(4)})`}
      viewBox={`0 0 ${String(round(width))} ${String(round(height))}`}
    >
      {children}
    </BaseIcon>
  );
}

/**
 * The Beautinique mark alone: the "B" with a woman's profile, in the text colour with rose hair and
 * petals. For small spaces (app icons, avatars, a collapsed sidebar); use `BrandLogo` where the
 * name fits.
 */
export function BrandMark({ monochrome = false, ...rest }: BrandProps) {
  return (
    <BrandSvg {...rest} width={MARK.width} height={MARK.height}>
      <Layers part={MARK} monochrome={monochrome} />
    </BrandSvg>
  );
}

/** The Beautinique logo: the mark with the name, side by side (headers) or stacked. */
export function BrandLogo({ layout = 'horizontal', monochrome = false, ...rest }: BrandLogoProps) {
  if (layout === 'stacked') {
    const markX = (WORDMARK.width - MARK.width) / 2;
    const nameY = MARK.height + STACK_GAP;
    return (
      <BrandSvg {...rest} width={WORDMARK.width} height={nameY + WORDMARK.height}>
        <g transform={`translate(${String(round(markX))} 0)`}>
          <Layers part={MARK} monochrome={monochrome} />
        </g>
        <g transform={`translate(0 ${String(round(nameY))})`}>
          <Layers part={WORDMARK} monochrome={monochrome} />
        </g>
      </BrandSvg>
    );
  }
  const scale = (MARK.height * NAME_HEIGHT) / WORDMARK.height;
  const nameX = MARK.width + MARK.height * NAME_GAP;
  const nameY = (MARK.height - WORDMARK.height * scale) / 2;
  return (
    <BrandSvg {...rest} width={nameX + WORDMARK.width * scale} height={MARK.height}>
      <Layers part={MARK} monochrome={monochrome} />
      <g
        transform={`translate(${String(round(nameX))} ${String(round(nameY))}) scale(${scale.toFixed(4)})`}
      >
        <Layers part={WORDMARK} monochrome={monochrome} />
      </g>
    </BrandSvg>
  );
}
