import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children' | 'viewBox'> {
  /** Width and height: a number is pixels, a string any CSS length. Default `1em`: the size of the text around it. */
  size?: number | string;
  /**
   * The icon's name for screen readers. Give it when the icon is the only content of a control or
   * says something on its own; leave it out when text next to it already says it (decorative).
   */
  label?: string;
}

/**
 * The `<svg>` every icon is drawn in: `currentColor` (the text colour), sized by `size`, and either
 * a named image (`label`) or hidden from screen readers.
 */
export function BaseIcon({
  size = '1em',
  label,
  viewBox,
  children,
  ...rest
}: IconProps & { viewBox: string; children: ReactNode }) {
  const named = label !== undefined && label.trim() !== '';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      focusable="false"
      {...(named ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      {...rest}
    >
      {children}
    </svg>
  );
}
