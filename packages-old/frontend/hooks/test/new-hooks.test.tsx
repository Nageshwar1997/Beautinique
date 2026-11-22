// useMediaQuery, useDebouncedValue, useCountdown and useCopyToClipboard (jsdom, fake timers).
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCopyToClipboard } from '../src/use-copy-to-clipboard';
import { useCountdown } from '../src/use-countdown';
import { useDebouncedValue } from '../src/use-debounced-value';
import { useMediaQuery } from '../src/use-media-query';

describe('useMediaQuery', () => {
  const matching = new Map<string, boolean>();
  const listeners = new Map<string, Set<() => void>>();

  beforeEach(() => {
    matching.clear();
    listeners.clear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        media: query,
        get matches() {
          return matching.get(query) ?? false;
        },
        addEventListener: (_type: string, listener: () => void) => {
          const set = listeners.get(query) ?? new Set<() => void>();
          set.add(listener);
          listeners.set(query, set);
        },
        removeEventListener: (_type: string, listener: () => void) => {
          listeners.get(query)?.delete(listener);
        },
      }),
    });
  });

  const flip = (query: string, value: boolean) => {
    matching.set(query, value);
    act(() => {
      for (const listener of listeners.get(query) ?? []) listener();
    });
  };

  it('has the right value at once, follows changes, and stops listening when unmounted', () => {
    const query = '(prefers-reduced-motion: reduce)';
    matching.set(query, true);
    const { result, unmount } = renderHook(() => useMediaQuery(query));
    expect(result.current).toBe(true);
    flip(query, false);
    expect(result.current).toBe(false);
    unmount();
    expect(listeners.get(query)?.size).toBe(0);
  });

  it('answers for a new query straight away', () => {
    matching.set('(min-width: 1px)', true);
    const { result, rerender } = renderHook(({ query }) => useMediaQuery(query), {
      initialProps: { query: '(min-width: 99999px)' },
    });
    expect(result.current).toBe(false);
    rerender({ query: '(min-width: 1px)' });
    expect(result.current).toBe(true);
  });

  it('renders the server value on the server, and hydrates without a mismatch', () => {
    const query = '(max-width: 600px)';
    matching.set(query, true);
    const Probe = () =>
      createElement('span', null, String(useMediaQuery(query, { serverValue: true })));
    const html = renderToString(createElement(Probe));
    expect(html).toContain('true');
    const container = document.createElement('div');
    container.innerHTML = html;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    act(() => {
      hydrateRoot(container, createElement(Probe));
    });
    expect(errors).not.toHaveBeenCalled();
    errors.mockRestore();
  });
});

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('gives the value once it has stopped changing for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'l' },
    });
    expect(result.current).toBe('l');
    rerender({ value: 'li' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: 'lip' });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('l');
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('lip');
  });

  it('drops a wait still running when the component unmounts', () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 1 },
    });
    rerender({ value: 2 });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-30T10:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts the whole seconds down to 0 (from an ISO string, as the API sends it), then stops', () => {
    const { result } = renderHook(() => useCountdown('2026-10-30T10:00:02.500Z'));
    expect(result.current).toBe(3);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(2);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('takes a Date or ms, says 0 for a moment gone, and null for none or an unreadable one', () => {
    expect(
      renderHook(() => useCountdown(new Date('2026-10-30T10:00:10.000Z'))).result.current,
    ).toBe(10);
    expect(renderHook(() => useCountdown(Date.now() + 1)).result.current).toBe(1);
    expect(renderHook(() => useCountdown(Date.now() - 5000)).result.current).toBe(0);
    expect(renderHook(() => useCountdown(null)).result.current).toBeNull();
    expect(renderHook(() => useCountdown(undefined)).result.current).toBeNull();
    expect(renderHook(() => useCountdown('not a date')).result.current).toBeNull();
  });

  it('follows the clock: after a sleep it shows the right value at the next tick', () => {
    const until = Date.now() + 60_000;
    const { result } = renderHook(() => useCountdown(until));
    expect(result.current).toBe(60);
    // the browser held the tab's timers for 20 s, then ran the one that was due
    vi.setSystemTime(Date.now() + 20_000);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(39);
  });

  it('starts again for a new moment, and stops ticking when unmounted', () => {
    const { result, rerender, unmount } = renderHook(({ until }) => useCountdown(until), {
      initialProps: { until: Date.now() + 5000 },
    });
    expect(result.current).toBe(5);
    rerender({ until: Date.now() + 30_000 });
    expect(result.current).toBe(30);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('is null on the server and while hydrating, so server and browser pages match', () => {
    const Probe = () => createElement('span', null, String(useCountdown(Date.now() + 9000)));
    const html = renderToString(createElement(Probe));
    expect(html).toContain('null');
    const container = document.createElement('div');
    container.innerHTML = html;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    act(() => {
      hydrateRoot(container, createElement(Probe));
    });
    expect(errors).not.toHaveBeenCalled();
    expect(container.textContent).toBe('9');
    errors.mockRestore();
  });
});

describe('useCopyToClipboard', () => {
  const writeText = vi.fn<(text: string) => Promise<void>>();

  beforeEach(() => {
    vi.useFakeTimers();
    writeText.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('copies, says so for a while, and a new copy restarts that while', async () => {
    const { result } = renderHook(() => useCopyToClipboard({ resetAfterMs: 1000 }));
    let ok = false;
    await act(async () => {
      ok = await result.current.copy('ABCD-EFGH');
    });
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith('ABCD-EFGH');
    expect(result.current.copied).toBe(true);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    await act(async () => {
      await result.current.copy('again');
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.copied).toBe(true);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.copied).toBe(false);
  });

  it('answers false when the browser refuses or has no clipboard (outside https)', async () => {
    writeText.mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    const { result } = renderHook(() => useCopyToClipboard());
    let ok = true;
    await act(async () => {
      ok = await result.current.copy('x');
    });
    expect(ok).toBe(false);
    expect(result.current.copied).toBe(false);

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    await act(async () => {
      ok = await result.current.copy('x');
    });
    expect(ok).toBe(false);
  });

  it('does nothing after the component unmounts', async () => {
    let finish: () => void = () => undefined;
    writeText.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const { result, unmount } = renderHook(() => useCopyToClipboard());
    const pending = result.current.copy('late');
    unmount();
    finish();
    expect(await pending).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
