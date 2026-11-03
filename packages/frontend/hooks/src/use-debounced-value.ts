import { useEffect, useState } from 'react';

/**
 * `value`, but only once it has stopped changing for `delay` ms: a search box's text for the
 * request, without a request per keystroke.
 *
 * ```tsx
 * const [text, setText] = useState('');
 * const query = useDebouncedValue(text.trim(), 300);
 * ```
 *
 * - The first render returns `value` itself (nothing to wait for yet).
 * - Each new `value` restarts the wait; a wait still running when the component unmounts is
 *   dropped. A new `delay` applies from the next change.
 * - For a callback instead of a value (with `flush` and `cancel`), use useDebounce.
 *
 * @param delay - ms. @default 500
 */
export const useDebouncedValue = <T>(value: T, delay = 500): T => {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    if (Object.is(value, settled)) return undefined;
    const timer = setTimeout(() => {
      setSettled(value);
    }, delay);
    return () => {
      clearTimeout(timer);
    };
  }, [value, settled, delay]);

  return settled;
};
