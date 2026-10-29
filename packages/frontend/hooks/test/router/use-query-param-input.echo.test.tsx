import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import type * as RouterSearch from '../../src/router/router-search';
import { useQueryParamInput } from '../../src/router/use-query-param-input';

// A data router commits a URL update some time after `setParams()`: the "echo" of what the box sent
// comes back later, and a newer text may have been sent in between. These tests play the router by
// hand, so the order of events is exact: `urlBecomes()` is the router committing a URL.
const router = vi.hoisted<{
  queryParams: Record<string, string>;
  setParams: Mock;
  removeParams: Mock;
  /** Where the router says each navigation stands (by query string); `null` = no data router. */
  states: Record<string, 'committed' | 'held' | 'coming' | 'lost'>;
  /** Make the updates report that `navigate()` has returned, like a data router does. */
  returnsPromise: boolean;
  /** The listeners of the fake data router, called by a test when "the router updated". */
  listeners: Set<() => void>;
}>(() => ({
  queryParams: {},
  setParams: vi.fn(),
  removeParams: vi.fn(),
  states: {},
  returnsPromise: false,
  listeners: new Set(),
}));

// what the real update functions answer: nothing is sent when the URL already has the value
const searchOf = (params: Record<string, string>) => params.search ?? '';

const answer = (value: string) =>
  searchOf(router.queryParams) === value
    ? { sent: false, search: '', done: null }
    : {
        sent: true,
        search: value ? `search=${value}` : '',
        done: router.returnsPromise ? Promise.resolve() : null,
      };

vi.mock('../../src/router/use-query-params-engine', () => ({
  useQueryParamsEngine: () => ({
    queryParams: router.queryParams,
    setParams: router.setParams,
    removeParams: router.removeParams,
    navigationStateOf: (search: string) =>
      router.returnsPromise ? (router.states[search] ?? 'lost') : null,
  }),
}));

vi.mock('../../src/router/router-search', async (importOriginal) => ({
  ...(await importOriginal<typeof RouterSearch>()),
  useDataRouter: () =>
    router.returnsPromise
      ? {
          subscribe: (listener: () => void) => {
            router.listeners.add(listener);

            return () => {
              router.listeners.delete(listener);
            };
          },
        }
      : null,
}));

/** "The router updated": its subscribers are called, like React Router does on every state change. */
const routerUpdates = () => {
  act(() => {
    for (const listener of router.listeners) listener();
  });
};

const setup = () => {
  const hook = renderHook(() => useQueryParamInput('search'));

  const type = (text: string) => {
    act(() => {
      hook.result.current.setValue(text);
    });
  };

  const waitForDebounce = () => {
    act(() => {
      vi.advanceTimersByTime(600);
    });
  };

  const urlBecomes = (search: string) => {
    router.queryParams = search ? { search } : {};
    hook.rerender();
  };

  return { ...hook, type, waitForDebounce, urlBecomes };
};

describe('useQueryParamInput: URL updates of its own coming back late', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    router.queryParams = {};
    router.states = {};
    router.returnsPromise = false;
    router.listeners.clear();
    router.setParams
      .mockReset()
      .mockImplementation((params: Record<string, string>) => answer(searchOf(params)));
    router.removeParams.mockReset().mockImplementation(() => answer(''));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('an older update landing after a newer one was sent does not move the box back', () => {
    const { result, type, waitForDebounce, urlBecomes } = setup();

    type('abc');
    waitForDebounce(); // "abc" sent
    type('abcd');
    waitForDebounce(); // "abcd" sent, the router has not committed "abc" yet

    urlBecomes('abc'); // ...and now it does
    expect(result.current.value).toBe('abcd');

    urlBecomes('abcd');
    expect(result.current.value).toBe('abcd');
  });

  it('a text typed while an older update lands is still sent', () => {
    const { result, type, waitForDebounce, urlBecomes } = setup();

    type('abc');
    waitForDebounce(); // "abc" sent
    type('abcd'); // waiting for its debounce
    urlBecomes('abc'); // the echo of "abc" arrives meanwhile
    expect(result.current.value).toBe('abcd');

    waitForDebounce();

    expect(router.setParams).toHaveBeenLastCalledWith({ search: 'abcd' });
  });

  it('an update that never lands (replaced by a newer one) does not confuse the next echo', () => {
    const { result, type, waitForDebounce, urlBecomes } = setup();

    type('abc');
    waitForDebounce();
    type('abcd');
    waitForDebounce();

    urlBecomes('abcd'); // the router skipped "abc"
    expect(result.current.value).toBe('abcd');

    urlBecomes('abc'); // Back: this is not an echo of anything any more, so the box follows it
    expect(result.current.value).toBe('abc');
  });

  it('follows Back to an older value once everything it sent has landed', () => {
    const { result, type, waitForDebounce, urlBecomes } = setup();

    type('abc');
    waitForDebounce();
    urlBecomes('abc');
    type('abcd');
    waitForDebounce();
    urlBecomes('abcd');

    urlBecomes('abc');

    expect(result.current.value).toBe('abc');
  });

  it('follows a URL change that is not one of the texts it sent, even while updates are on their way', () => {
    const { result, type, waitForDebounce, urlBecomes } = setup();

    type('abc');
    waitForDebounce(); // "abc" sent, not landed yet

    urlBecomes('other'); // somebody else changed the param first

    expect(result.current.value).toBe('other');
  });

  it('after something else changed the param, an older text it sent is not treated as an echo any more', () => {
    const { result, type, waitForDebounce, urlBecomes } = setup();

    type('abc');
    waitForDebounce(); // "abc" sent, not landed yet
    urlBecomes('other'); // somebody else changed the param: the box follows

    urlBecomes('abc'); // Back to an entry that has "abc"

    expect(result.current.value).toBe('abc');
  });

  it('what is typed right after clear() survives the URL being cleared together with it', () => {
    router.queryParams = { search: 'lip' };
    const { result, type, urlBecomes } = setup();

    act(() => {
      result.current.clear(); // a "Clear" button: box and URL are both being emptied
    });
    type('x'); // the user starts typing again before the router commits the empty URL
    urlBecomes(''); // the empty URL lands

    expect(result.current.value).toBe('x');
  });

  it('a text it sent that was already in the URL does not hide the next real change', () => {
    router.queryParams = { search: 'lip' };
    const { result, type, waitForDebounce, urlBecomes } = setup();

    type('lip '); // trimmed it is "lip": the URL has it already, so nothing will come back
    waitForDebounce();
    urlBecomes('other');

    expect(result.current.value).toBe('other');
  });

  describe('what the router has shown, and what it will never show', () => {
    // On a heavy page React renders the router's URLs late, one after the other, so an older URL can
    // be rendered long after the router has moved on to newer ones.
    it('an update the router has already shown is still an echo while React renders older URLs', async () => {
      router.returnsPromise = true;
      const { result, type, waitForDebounce, urlBecomes } = setup();

      router.states['search=abc'] = 'committed'; // the router shows it, then navigate() returns
      type('abc');
      waitForDebounce(); // "abc" sent
      routerUpdates(); // the router updated when it committed
      await act(async () => {
        await Promise.resolve(); // its navigate() has returned
      });

      router.states['search=abc'] = 'lost'; // ...and moves on to newer URLs
      routerUpdates();

      type('abcd');
      urlBecomes('abc'); // React gets round to rendering the old URL now

      expect(result.current.value).toBe('abcd');
    });

    it('an update that the router never showed is forgotten when it says it will not come', async () => {
      router.returnsPromise = true;
      const { result, type, waitForDebounce, urlBecomes } = setup();

      type('abc');
      waitForDebounce();
      await act(async () => {
        await Promise.resolve();
      });
      router.states['search=abc'] = 'lost'; // replaced, redirected, or held and reset
      routerUpdates();

      type('abcd');
      urlBecomes('abc');

      expect(result.current.value).toBe('abc'); // somebody else's URL: the box follows it
    });

    it('an update is not forgotten before its navigate() has returned', () => {
      router.returnsPromise = true;
      const { result, type, waitForDebounce, urlBecomes } = setup();

      type('abc');
      waitForDebounce();
      router.states['search=abc'] = 'lost'; // the router has not caught up yet
      routerUpdates();

      type('abcd');
      urlBecomes('abc');

      expect(result.current.value).toBe('abcd');
    });
  });
});
