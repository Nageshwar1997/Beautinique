import { cx } from './cx';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  /**
   * What screen readers hear (a `status`). Leave it out when the spinner sits in something that
   * says so already (a Button with `loading` is `aria-busy`): it is then hidden from them.
   */
  label?: string;
  className?: string;
}

const SIZE: Readonly<Record<SpinnerSize, string>> = {
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
  lg: 'size-8 border-[3px]',
};

/**
 * A spinning ring in the current text colour. With reduced motion it stands still (styles
 * base.css), so its `label` is what tells the person something is going on.
 */
export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  const ring = (
    <span
      aria-hidden="true"
      className={cx(
        'inline-block shrink-0 animate-spin rounded-full border-current border-t-transparent',
        SIZE[size],
        label === undefined && className,
      )}
    />
  );
  if (label === undefined) return ring;
  return (
    <span role="status" className={cx('inline-flex items-center', className)}>
      {ring}
      <span className="sr-only">{label}</span>
    </span>
  );
}
