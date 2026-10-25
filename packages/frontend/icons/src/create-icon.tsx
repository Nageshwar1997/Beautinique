import type { ReactElement } from 'react';

import { BaseIcon, type IconProps } from './base-icon';

/** An icon component, e.g. `IconSun`: `<IconSun />`, `<IconSun size={20} label="Light theme" />`. */
export type Icon = ((props: IconProps) => ReactElement) & { displayName: string };

/**
 * Makes an icon component from its shapes. The shapes are one React element made once when the
 * file loads, not on every render. Icon files call this as `/* @__PURE__ *\/ createIcon(...)`, so a
 * bundler drops every icon an app does not import.
 */
export function createIcon(name: string, shapes: ReactElement, viewBox = '0 0 24 24'): Icon {
  const icon = (props: IconProps) => (
    <BaseIcon {...props} viewBox={viewBox}>
      {shapes}
    </BaseIcon>
  );
  icon.displayName = name;
  return icon;
}
