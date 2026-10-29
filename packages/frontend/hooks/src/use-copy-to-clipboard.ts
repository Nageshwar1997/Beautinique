import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCopyToClipboardOptions {
  /** How long `copied` stays true after a copy (for a "Copied" label), ms. @default 2000 */
  resetAfterMs?: number;
}

export interface CopyToClipboard {
  /** Puts `text` on the clipboard; true when it got there. */
  copy: (text: string) => Promise<boolean>;
  /** A copy worked in the last `resetAfterMs` */
  copied: boolean;
}

/**
 * Copies text to the clipboard (the recovery codes, a link), with a short-lived `copied` for the
 * button's label.
 *
 * ```tsx
 * const { copy, copied } = useCopyToClipboard();
 * <Button onClick={() => void copy(codes.join('\n'))}>{copied ? 'Copied' : 'Copy codes'}</Button>
 * ```
 *
 * - Uses the Clipboard API, which browsers allow only on https (and localhost) and from a user
 *   action such as a click. Where it is missing or refused, `copy` answers false and `copied`
 *   stays false: show the text for copying by hand.
 * - Another copy restarts the `copied` time; nothing runs after the component unmounts.
 */
export const useCopyToClipboard = ({
  resetAfterMs = 2000,
}: UseCopyToClipboardOptions = {}): CopyToClipboard => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      let ok: boolean;
      // missing outside https (and localhost), whatever the types say
      const clipboard =
        typeof navigator === 'undefined'
          ? undefined
          : (navigator as Partial<Pick<Navigator, 'clipboard'>>).clipboard;
      try {
        if (typeof clipboard?.writeText === 'function') {
          await clipboard.writeText(text);
          ok = true;
        } else {
          ok = false;
        }
      } catch {
        ok = false;
      }
      if (!mounted.current) return ok;
      clearTimeout(timer.current);
      setCopied(ok);
      if (ok) {
        timer.current = setTimeout(() => {
          setCopied(false);
        }, resetAfterMs);
      }
      return ok;
    },
    [resetAfterMs],
  );

  return { copy, copied };
};
