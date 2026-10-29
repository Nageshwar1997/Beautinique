import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';

export interface OutsideClickOptions {
  /** Turn the listener off (e.g. while a popup is closed). @default true */
  enabled?: boolean;
  /**
   * Elements that count as inside although they are not inside the element in the DOM, mostly a popup
   * rendered with `createPortal()` into `document.body`. A press on one of them (or on anything in it)
   * is not "outside". Refs that are not attached (popup closed) are skipped. The list is read when the
   * press happens, so a new array on every render is fine.
   */
  ignore?: readonly RefObject<Element | null>[];
  /**
   * Called when focus moves to an element outside (Tab, a script), for popups that should also close
   * on keyboard focus-out. Without it focus is not watched at all. Focus leaving the window is not
   * reported. A press on a focusable element outside calls `callback` (the press) and then this (the
   * focus), so pass an idempotent function such as the one that closes.
   */
  onFocusOutside?: (event: FocusEvent) => void;
}

/**
 * Calls `callback` when the user presses down (mouse, touch or pen) anywhere outside the element
 * the returned ref is attached to.
 *
 * - Listens for `pointerdown` on `document` in the capture phase, so an inner `stopPropagation()`
 *   cannot hide the press.
 * - "Inside" is decided from the path the event took (`event.composedPath()`), not from
 *   `element.contains(event.target)`. The path is fixed when the event is dispatched, so it stays
 *   right when the pressed node is removed by another listener first, and it sees through open shadow
 *   roots (where `target` is retargeted to the shadow host).
 * - A popup portalled out of the element is not inside it in the DOM: list its ref in `ignore`.
 * - The listener is added once and only re-added when `enabled` (or whether `onFocusOutside` is given)
 *   changes: the latest `callback`, `ignore` and `onFocusOutside` are used, so passing new ones on every
 *   render costs nothing.
 *
 * @param callback - Called with the `pointerdown` event.
 * @param options - `enabled` (default `true`) switches the listener off, `ignore` lists portalled
 * popups, `onFocusOutside` adds focus moving outside.
 */
export const useOutsideClick = <T extends HTMLElement>(
  callback: (event: PointerEvent) => void,
  { enabled = true, ignore, onFocusOutside }: OutsideClickOptions = {},
): RefObject<T | null> => {
  const ref = useRef<T | null>(null);
  const callbackRef = useRef(callback);
  const ignoreRef = useRef(ignore);
  const onFocusOutsideRef = useRef(onFocusOutside);
  const watchesFocus = onFocusOutside !== undefined;

  // Updated as soon as a render commits, so the listeners below never need them as dependencies.
  useLayoutEffect(() => {
    callbackRef.current = callback;
    ignoreRef.current = ignore;
    onFocusOutsideRef.current = onFocusOutside;
  });

  useEffect(() => {
    if (!enabled) return;

    const isOutside = (event: Event) => {
      const element = ref.current;

      if (!element) return false;

      const path = event.composedPath();

      return !(
        path.includes(element) ||
        (ignoreRef.current ?? []).some(({ current }) => current !== null && path.includes(current))
      );
    };

    const handlePress = (event: PointerEvent) => {
      if (isOutside(event)) callbackRef.current(event);
    };

    const handleFocus = (event: FocusEvent) => {
      if (isOutside(event)) onFocusOutsideRef.current?.(event);
    };

    document.addEventListener('pointerdown', handlePress, true);

    if (watchesFocus) document.addEventListener('focusin', handleFocus, true);

    return () => {
      document.removeEventListener('pointerdown', handlePress, true);

      if (watchesFocus) document.removeEventListener('focusin', handleFocus, true);
    };
  }, [enabled, watchesFocus]);

  return ref;
};
