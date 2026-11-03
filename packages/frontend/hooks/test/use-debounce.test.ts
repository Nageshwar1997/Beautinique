import { renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from '../src/use-debounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls the callback once, with the given args, after the delay', () => {
    const callback = vi.fn<(value: string, count: number) => void>();
    const { result } = renderHook(() => useDebounce({ callback, delay: 300 }));

    result.current.trigger('a', 1);

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('a', 1);
  });

  it('defaults the delay to 500ms', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce({ callback }));

    result.current.trigger();

    vi.advanceTimersByTime(499);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer on every trigger and only fires the last call', () => {
    const callback = vi.fn<(value: string) => void>();
    const { result } = renderHook(() => useDebounce({ callback, delay: 200 }));

    result.current.trigger('first');
    vi.advanceTimersByTime(150);
    result.current.trigger('second');
    vi.advanceTimersByTime(150);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });

  it('cancel() drops the pending call', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce({ callback, delay: 100 }));

    result.current.trigger();
    result.current.cancel();
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
  });

  it('cancel() with nothing pending is a no-op, and trigger() still works afterwards', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce({ callback, delay: 100 }));

    expect(() => {
      result.current.cancel();
    }).not.toThrow();

    result.current.trigger();
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending call when the component unmounts', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebounce({ callback, delay: 100 }));

    result.current.trigger();
    unmount();
    vi.advanceTimersByTime(1000);

    expect(callback).not.toHaveBeenCalled();
  });

  it('keeps the same trigger/cancel references while callback and delay are unchanged', () => {
    const callback = vi.fn();
    const { result, rerender } = renderHook(() => useDebounce({ callback, delay: 100 }));
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
    expect(result.current.trigger).toBe(first.trigger);
    expect(result.current.cancel).toBe(first.cancel);
  });

  it('uses the new callback for triggers made after the callback changes', () => {
    const oldCallback = vi.fn();
    const newCallback = vi.fn();
    const { result, rerender } = renderHook(
      ({ callback }) => useDebounce({ callback, delay: 100 }),
      { initialProps: { callback: oldCallback } },
    );

    rerender({ callback: newCallback });
    result.current.trigger();
    vi.advanceTimersByTime(100);

    expect(oldCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalledTimes(1);
  });

  describe('latest callback', () => {
    it('runs the callback from the latest render, even when it changed after trigger()', () => {
      const oldCallback = vi.fn();
      const newCallback = vi.fn();
      const { result, rerender } = renderHook(
        ({ callback }) => useDebounce({ callback, delay: 100 }),
        { initialProps: { callback: oldCallback } },
      );

      result.current.trigger('value');
      rerender({ callback: newCallback }); // e.g. the component re-rendered with fresh state
      vi.advanceTimersByTime(100);

      expect(oldCallback).not.toHaveBeenCalled();
      expect(newCallback).toHaveBeenCalledTimes(1);
      expect(newCallback).toHaveBeenCalledWith('value');
    });

    it('gives the callback the state of the render it runs in (no stale closure)', () => {
      const seen: number[] = [];
      const { result, rerender } = renderHook(
        ({ count }) => useDebounce({ callback: () => seen.push(count), delay: 100 }),
        { initialProps: { count: 1 } },
      );

      result.current.trigger();
      rerender({ count: 2 });
      rerender({ count: 3 });
      vi.advanceTimersByTime(100);

      expect(seen).toEqual([3]);
    });

    it('keeps trigger, cancel and the returned object stable when only the callback changes', () => {
      const triggers = new Set<unknown>();
      const cancels = new Set<unknown>();
      const objects = new Set<unknown>();
      const { rerender } = renderHook(() => {
        // a new inline callback on every render, like most call sites
        const debounce = useDebounce({ callback: () => undefined, delay: 100 });
        triggers.add(debounce.trigger);
        cancels.add(debounce.cancel);
        objects.add(debounce);
        return debounce;
      });

      rerender();
      rerender();
      rerender();

      expect(triggers.size).toBe(1);
      expect(cancels.size).toBe(1);
      expect(objects.size).toBe(1);
    });

    it('still cancels the pending call after the callback changed', () => {
      const oldCallback = vi.fn();
      const newCallback = vi.fn();
      const { result, rerender } = renderHook(
        ({ callback }) => useDebounce({ callback, delay: 100 }),
        { initialProps: { callback: oldCallback } },
      );

      result.current.trigger();
      rerender({ callback: newCallback });
      result.current.cancel();
      vi.advanceTimersByTime(1000);

      expect(oldCallback).not.toHaveBeenCalled();
      expect(newCallback).not.toHaveBeenCalled();
    });
  });

  describe('delay', () => {
    it('uses the new delay for triggers made after it changes', () => {
      const callback = vi.fn();
      const { result, rerender } = renderHook(({ delay }) => useDebounce({ callback, delay }), {
        initialProps: { delay: 100 },
      });

      rerender({ delay: 500 });
      result.current.trigger();

      vi.advanceTimersByTime(499);
      expect(callback).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('lets a call that is already pending keep the delay it was scheduled with', () => {
      const callback = vi.fn();
      const { result, rerender } = renderHook(({ delay }) => useDebounce({ callback, delay }), {
        initialProps: { delay: 100 },
      });

      result.current.trigger();
      rerender({ delay: 500 });
      vi.advanceTimersByTime(100);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('gives a new trigger only when the delay changes', () => {
      const callback = vi.fn();
      const { result, rerender } = renderHook(({ delay }) => useDebounce({ callback, delay }), {
        initialProps: { delay: 100 },
      });
      const first = result.current.trigger;

      rerender({ delay: 100 });
      expect(result.current.trigger).toBe(first);

      rerender({ delay: 200 });
      expect(result.current.trigger).not.toBe(first);
    });
  });

  describe('flush()', () => {
    it('runs the pending call now, with its args, and nothing runs again when its time comes', () => {
      const callback = vi.fn<(value: string) => void>();
      const { result } = renderHook(() => useDebounce({ callback, delay: 300 }));

      result.current.trigger('abc');
      result.current.flush();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('abc');

      vi.advanceTimersByTime(1000);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('runs the last call only, when there were several triggers', () => {
      const callback = vi.fn<(value: string) => void>();
      const { result } = renderHook(() => useDebounce({ callback, delay: 300 }));

      result.current.trigger('a');
      result.current.trigger('ab');
      result.current.flush();

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('ab');
    });

    it('does nothing when nothing is pending', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounce({ callback, delay: 300 }));

      result.current.flush();

      expect(callback).not.toHaveBeenCalled();
    });

    it('does nothing after the call has already run', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounce({ callback, delay: 300 }));

      result.current.trigger();
      vi.advanceTimersByTime(300);
      result.current.flush();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('does nothing after cancel()', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounce({ callback, delay: 300 }));

      result.current.trigger();
      result.current.cancel();
      result.current.flush();

      expect(callback).not.toHaveBeenCalled();
    });

    it('runs the callback from the latest render', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { result, rerender } = renderHook(
        ({ callback }) => useDebounce({ callback, delay: 300 }),
        { initialProps: { callback: first } },
      );

      result.current.trigger('x');
      rerender({ callback: second });
      result.current.flush();

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith('x');
    });

    it('lets a new trigger() work afterwards', () => {
      const callback = vi.fn<(value: string) => void>();
      const { result } = renderHook(() => useDebounce({ callback, delay: 300 }));

      result.current.trigger('a');
      result.current.flush();
      result.current.trigger('b');
      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenNthCalledWith(2, 'b');
    });

    it('can trigger again from inside the callback it flushes', () => {
      const calls: string[] = [];
      const { result } = renderHook(() =>
        useDebounce({
          callback: (value: string) => {
            calls.push(value);
            if (value === 'first') result.current.trigger('second');
          },
          delay: 300,
        }),
      );

      result.current.trigger('first');
      result.current.flush();
      vi.advanceTimersByTime(300);

      expect(calls).toEqual(['first', 'second']);
    });
  });

  describe('isPending()', () => {
    it('is true from trigger() until the call runs', () => {
      const { result } = renderHook(() => useDebounce({ callback: vi.fn(), delay: 300 }));

      expect(result.current.isPending()).toBe(false);

      result.current.trigger();
      expect(result.current.isPending()).toBe(true);

      vi.advanceTimersByTime(299);
      expect(result.current.isPending()).toBe(true);

      vi.advanceTimersByTime(1);
      expect(result.current.isPending()).toBe(false);
    });

    it('is false after cancel() and after flush()', () => {
      const { result } = renderHook(() => useDebounce({ callback: vi.fn(), delay: 300 }));

      result.current.trigger();
      result.current.cancel();
      expect(result.current.isPending()).toBe(false);

      result.current.trigger();
      result.current.flush();
      expect(result.current.isPending()).toBe(false);
    });

    it('is false after the component unmounted', () => {
      const { result, unmount } = renderHook(() => useDebounce({ callback: vi.fn(), delay: 300 }));

      result.current.trigger();
      const { isPending } = result.current;
      unmount();

      expect(isPending()).toBe(false);
    });

    it('is true again for a new trigger() made inside the callback', () => {
      const { result } = renderHook(() =>
        useDebounce({
          callback: () => {
            result.current.trigger();
          },
          delay: 300,
        }),
      );

      result.current.trigger();
      vi.advanceTimersByTime(300);

      expect(result.current.isPending()).toBe(true);
    });
  });

  it('keeps the same flush and isPending while callback and delay are unchanged', () => {
    const { result, rerender } = renderHook(
      ({ callback }) => useDebounce({ callback, delay: 300 }),
      { initialProps: { callback: vi.fn() } },
    );
    const { flush, isPending } = result.current;

    rerender({ callback: vi.fn() });

    expect(result.current.flush).toBe(flush);
    expect(result.current.isPending).toBe(isPending);
  });

  describe('after unmount', () => {
    it('ignores a trigger() made after the component unmounted', () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() => useDebounce({ callback, delay: 100 }));
      const { trigger } = result.current; // e.g. kept by an async handler that finishes later

      unmount();
      trigger();
      vi.advanceTimersByTime(1000);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('React StrictMode', () => {
    it('calls the callback exactly once', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounce({ callback, delay: 50 }), {
        wrapper: StrictMode,
      });

      result.current.trigger();
      vi.advanceTimersByTime(50);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('still works after the simulated unmount/remount', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebounce({ callback, delay: 50 }), {
        wrapper: StrictMode,
      });

      result.current.trigger('first');
      result.current.trigger('second');
      vi.advanceTimersByTime(50);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('second');
    });
  });
});
