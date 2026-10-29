import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useDebounce } from '../use-debounce';
import { useDataRouter } from './router-search';
import { useQueryParamsEngine } from './use-query-params-engine';

/** A text this box sent to the URL that has not been seen coming back yet. */
interface SentText {
  /** The param value that was sent (trimmed; `''` when the param was removed). */
  value: string;
  /** The whole query string that was navigated to, so the router can be asked about it. */
  search: string;
  /** `navigate()` has returned. After that the router decides whether it can still arrive. */
  done: boolean;
  /** The router has shown it at some point. React may still be rendering older URLs, so it stays until it is seen. */
  committed: boolean;
}

export interface UseQueryParamInputOptions {
  /** How long to wait after the last keystroke before the URL is updated, in ms. @default 600 */
  delay?: number;
}

/**
 * A text box that is mirrored in a URL query param (a search box and `?search=...`).
 *
 * - Typing shows in the box straight away; the URL is updated `delay` ms after the last keystroke
 *   (trimmed, and the param is removed when the text is empty).
 * - When the URL param changes on its own - another filter resets it, the user presses Back/Forward,
 *   a "Clear" button - the box follows it. The URL update this box made itself coming back does not
 *   touch the box, so whatever the user is still typing (a trailing space, the next letters) stays.
 * - A typed text that is waiting for its debounce is dropped if the box was changed in the meantime
 *   (reset by another filter, or `clear()`), so it cannot put an old search back into the URL.
 * - `flush()` sends the waiting text now (e.g. on Enter); `isPending()` says whether one is waiting.
 * - A text that `useBlocker` holds is still expected (`proceed()` delivers it) and stops being
 *   expected when the blocker is reset; one that was redirected or replaced is never expected.
 *
 * ```tsx
 * const search = useQueryParamInput('search');
 *
 * <input value={search.value} onChange={(event) => search.setValue(event.target.value)} />
 * <button onClick={search.clear}>Clear</button>
 * ```
 *
 * Needs to be rendered inside a React Router (`react-router-dom`) router.
 *
 * @param key - The query param the box is mirrored in.
 */
export const useQueryParamInput = (
  key: string,
  { delay = 600 }: UseQueryParamInputOptions = {},
) => {
  const { queryParams, setParams, removeParams, navigationStateOf } = useQueryParamsEngine();
  const navigationStateOfRef = useRef(navigationStateOf);

  useLayoutEffect(() => {
    navigationStateOfRef.current = navigationStateOf;
  });
  const router = useDataRouter();
  const urlValue = queryParams[key] ?? '';
  // The box never shows leading whitespace (typing removes it), so a URL value that has some is shown without.
  const shownUrlValue = urlValue.trimStart();

  const [value, setInputValue] = useState(shownUrlValue);

  // What the box shows, updated the moment it changes (not when React gets round to rendering it).
  const valueRef = useRef(shownUrlValue);
  // The texts this box sent to the URL that have not come back yet (oldest first).
  const inFlightRef = useRef<SentText[]>([]);
  // The URL value this box has already looked at.
  const seenUrlValueRef = useRef(urlValue);

  // The URL param changed. A value the box sent itself is just an update coming back - and an older
  // one can come back after a newer one was sent, which is why every unconfirmed send is remembered,
  // not only the last. Anything else was changed by something else: follow it.
  //
  // This lives in refs and a layout effect, not in state updated while rendering: the router renders
  // its URL changes as low priority transitions, and typing is an urgent update that can interrupt
  // one. State set during such a render is replayed on top of the urgent updates, and the pieces of
  // it (what was seen, what is in flight) can end up out of step with each other.
  useLayoutEffect(() => {
    if (urlValue === seenUrlValueRef.current) return;
    seenUrlValueRef.current = urlValue;

    const echo = inFlightRef.current.findIndex((sent) => sent.value === urlValue);

    if (echo >= 0) {
      // this send has landed, and so have the ones before it (the router may skip an update that a newer one replaced)
      inFlightRef.current = inFlightRef.current.slice(echo + 1);
      return;
    }

    inFlightRef.current = [];
    valueRef.current = shownUrlValue;
    setInputValue(shownUrlValue);
  }, [urlValue, shownUrlValue]);

  // A text that will never arrive - held by useBlocker and then dropped (`reset()`), redirected,
  // replaced by another navigation - must stop being an echo the moment the router says so, before
  // any URL can commit: or a later URL that happens to have the same text would be taken for it and
  // the box would not follow that URL. While `navigate()` has not returned yet it is still on its
  // way; after that the router decides.
  //
  // A text the router has *shown* is different: on a heavy page React renders the router's URLs late,
  // one after the other, so an older URL can be rendered long after the router moved on. That is still
  // the echo of what was sent, so once committed it stays until it is seen (or a newer one is).
  const forgetWhatWillNotArrive = useCallback(() => {
    inFlightRef.current = inFlightRef.current.filter((sent) => {
      const state = navigationStateOfRef.current(sent.search);

      if (state === 'committed') sent.committed = true;

      return sent.committed || !sent.done || state !== 'lost';
    });
  }, []);

  useEffect(() => {
    if (!router) return;

    return router.subscribe(forgetWhatWillNotArrive);
  }, [router, forgetWhatWillNotArrive]);

  const { trigger, cancel, flush, isPending } = useDebounce({
    callback: (typed: string) => {
      // The box was changed since this text was typed (the URL changed under it and the box followed,
      // or clear()): it is stale.
      if (typed !== valueRef.current) return;

      const trimmed = typed.trim();
      const result = trimmed ? setParams({ [key]: trimmed }) : removeParams([key]);

      // The URL already had this text: nothing was sent, so nothing will come back.
      if (!result.sent) return;

      const sent: SentText = {
        value: trimmed,
        search: result.search,
        done: false,
        committed: false,
      };
      inFlightRef.current = [...inFlightRef.current, sent];

      // With a data router `navigate()` returns a promise. When it has returned the router knows
      // whether the update can still arrive (committed, held, still loading) or not (replaced by a
      // newer navigation, redirected, failed): what will not arrive must not be remembered.
      void result.done?.then(() => {
        sent.done = true;
        forgetWhatWillNotArrive();
      });
    },
    delay,
  });

  /** Shows `next` in the box right away (leading whitespace removed) and writes it to the URL after the delay. */
  const setValue = useCallback(
    (next: string) => {
      const typed = next.trimStart();
      valueRef.current = typed;
      setInputValue(typed);
      trigger(typed);
    },
    [trigger],
  );

  /** Empties the box right away and drops any typed text still waiting for its debounce. It does not touch the URL. */
  const clear = useCallback(() => {
    cancel();
    // (`cancel()` already drops the waiting text; this keeps `valueRef` equal to what the box shows, always)
    valueRef.current = '';
    setInputValue('');
    // the URL is expected to end up empty (a "Clear" button next to it); a send still on its way is no longer expected
    inFlightRef.current = [{ value: '', search: '', done: false, committed: false }];
  }, [cancel]);

  return useMemo(
    () => ({ value, setValue, clear, flush, isPending }),
    [value, setValue, clear, flush, isPending],
  );
};
