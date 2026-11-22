import type { DOMAttributes, ReactElement, ReactNode } from 'react';
import {
  Focusable,
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  TooltipTrigger,
} from 'react-aria-components';

export interface TooltipProps {
  /** Short text: a name or a hint, never something the person needs (touch screens never show it). */
  content: ReactNode;
  /** One focusable element that takes a ref and DOM props (a Button, an icon button). */
  children: ReactElement;
  /** @default 'top' */
  placement?: AriaTooltipProps['placement'];
  /** ms before it shows on hover (at once on keyboard focus). @default 600 */
  delay?: number;
}

/**
 * A short label on hover and keyboard focus (React Aria: Escape hides it, it describes its
 * trigger for screen readers, it flips to stay on screen). An icon-only button still needs its
 * own `aria-label`: the tooltip only adds a description.
 *
 * ```tsx
 * <Tooltip content="Copy the codes">
 *   <Button variant="ghost" icon={<IconCopy />} aria-label="Copy" />
 * </Tooltip>
 * ```
 */
export function Tooltip({ content, children, placement = 'top', delay = 600 }: TooltipProps) {
  return (
    <TooltipTrigger delay={delay} closeDelay={150}>
      {/* React Aria types this child as a DOM element; a component that passes its ref and props
          on to one (Button does) works the same (tests check it) */}
      <Focusable>{children as ReactElement<DOMAttributes<HTMLElement>, string>}</Focusable>
      <AriaTooltip
        placement={placement}
        offset={8}
        className="surface-inverse data-entering:animate-fade-in data-exiting:animate-fade-out max-w-64 rounded-lg px-3 py-1.5 text-sm shadow-md"
      >
        {content}
      </AriaTooltip>
    </TooltipTrigger>
  );
}
